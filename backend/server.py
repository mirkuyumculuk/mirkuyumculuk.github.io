from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import bcrypt
import jwt
import secrets
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Kimlik doğrulaması gerekli")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Geçersiz token türü")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
        user["id"] = str(user["_id"])
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token süresi doldu")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Geçersiz token")

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: str

class Product(BaseModel):
    id: str
    name: str
    description: str
    price: float
    category: str
    image_url: str
    stock: int
    created_at: str

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: str
    stock: int

class CartItem(BaseModel):
    product_id: str
    quantity: int

class CartItemResponse(BaseModel):
    id: str
    product: Product
    quantity: int

class Order(BaseModel):
    id: str
    user_id: str
    items: List[dict]
    total_amount: float
    status: str
    created_at: str
    payment_session_id: Optional[str] = None

class CheckoutRequest(BaseModel):
    origin_url: str

class Campaign(BaseModel):
    id: str
    title: str
    description: str
    image_url: str
    discount: str
    active: bool

@api_router.post("/auth/register")
async def register(user_data: UserRegister, response: Response):
    email_lower = user_data.email.lower()
    existing = await db.users.find_one({"email": email_lower})
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı")
    
    hashed = hash_password(user_data.password)
    user_doc = {
        "name": user_data.name,
        "email": email_lower,
        "password_hash": hashed,
        "role": "user",
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(user_id, email_lower)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {
        "id": user_id,
        "name": user_data.name,
        "email": email_lower,
        "role": "user",
        "created_at": user_doc["created_at"].isoformat()
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin, request: Request, response: Response):
    email_lower = credentials.email.lower()
    user = await db.users.find_one({"email": email_lower})
    if not user:
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")
    
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email_lower)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {
        "id": user_id,
        "name": user["name"],
        "email": email_lower,
        "role": user["role"],
        "created_at": user["created_at"].isoformat()
    }

@api_router.post("/auth/logout")
async def logout(response: Response, current_user: dict = Depends(get_current_user)):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Çıkış yapıldı"}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@api_router.get("/products")
async def get_products(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    return product

@api_router.post("/products")
async def create_product(product: ProductCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Yetkiniz yok")
    
    product_doc = {
        "id": str(uuid.uuid4()),
        **product.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.products.insert_one(product_doc)
    return product_doc

@api_router.post("/cart/add")
async def add_to_cart(item: CartItem, current_user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    
    if product["stock"] < item.quantity:
        raise HTTPException(status_code=400, detail="Yeterli stok yok")
    
    cart_item = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "product_id": item.product_id,
        "quantity": item.quantity,
        "added_at": datetime.now(timezone.utc).isoformat()
    }
    
    existing = await db.cart.find_one({"user_id": current_user["id"], "product_id": item.product_id})
    if existing:
        await db.cart.update_one(
            {"user_id": current_user["id"], "product_id": item.product_id},
            {"$inc": {"quantity": item.quantity}}
        )
        return {"message": "Sepet güncellendi"}
    
    await db.cart.insert_one(cart_item)
    return {"message": "Ürün sepete eklendi"}

@api_router.get("/cart")
async def get_cart(current_user: dict = Depends(get_current_user)):
    cart_items = await db.cart.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    
    result = []
    for item in cart_items:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            result.append({
                "id": item["id"],
                "product": product,
                "quantity": item["quantity"]
            })
    
    return result

@api_router.delete("/cart/{item_id}")
async def remove_from_cart(item_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.cart.delete_one({"id": item_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ürün sepette bulunamadı")
    return {"message": "Ürün sepetten silindi"}

@api_router.post("/checkout/session")
async def create_checkout(checkout_req: CheckoutRequest, current_user: dict = Depends(get_current_user)):
    cart_items = await db.cart.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Sepetiniz boş")
    
    total_amount = 0.0
    order_items = []
    
    for item in cart_items:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            total_amount += product["price"] * item["quantity"]
            order_items.append({
                "product_id": product["id"],
                "name": product["name"],
                "price": product["price"],
                "quantity": item["quantity"]
            })
    
    origin_url = checkout_req.origin_url
    success_url = f"{origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/cart"
    
    stripe_checkout = StripeCheckout(
        api_key=os.environ["STRIPE_API_KEY"],
        webhook_url=f"{origin_url}/api/webhook/stripe"
    )
    
    checkout_request = CheckoutSessionRequest(
        amount=total_amount,
        currency="try",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": current_user["id"],
            "user_email": current_user["email"]
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    payment_transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": current_user["id"],
        "amount": total_amount,
        "currency": "try",
        "status": "pending",
        "payment_status": "initiated",
        "items": order_items,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(payment_transaction)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, current_user: dict = Depends(get_current_user)):
    transaction = await db.payment_transactions.find_one({"session_id": session_id, "user_id": current_user["id"]}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Ödeme bulunamadı")
    
    if transaction["payment_status"] == "paid":
        return transaction
    
    stripe_checkout = StripeCheckout(
        api_key=os.environ["STRIPE_API_KEY"],
        webhook_url=""
    )
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    if status.payment_status == "paid" and transaction["payment_status"] != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "status": "completed"}}
        )
        
        order = {
            "id": str(uuid.uuid4()),
            "user_id": current_user["id"],
            "items": transaction["items"],
            "total_amount": transaction["amount"],
            "status": "confirmed",
            "payment_session_id": session_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.orders.insert_one(order)
        
        await db.cart.delete_many({"user_id": current_user["id"]})
        
        transaction["payment_status"] = "paid"
        transaction["status"] = "completed"
    
    return transaction

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    stripe_checkout = StripeCheckout(
        api_key=os.environ["STRIPE_API_KEY"],
        webhook_url=""
    )
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/orders")
async def get_orders(current_user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.get("/campaigns")
async def get_campaigns():
    campaigns = await db.campaigns.find({"active": True}, {"_id": 0}).to_list(100)
    return campaigns

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("id", unique=True)
    await db.products.create_index("category")
    await db.cart.create_index("user_id")
    await db.orders.create_index("user_id")
    await db.payment_transactions.create_index("session_id")
    
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@mirgold.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "MirAdmin2024!")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc)
        })
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logger.info(f"Admin password updated: {admin_email}")
    
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write("## Admin Account\n")
        f.write(f"- Email: {admin_email}\n")
        f.write(f"- Password: {admin_password}\n")
        f.write(f"- Role: admin\n\n")
        f.write("## Auth Endpoints\n")
        f.write("- POST /api/auth/register\n")
        f.write("- POST /api/auth/login\n")
        f.write("- POST /api/auth/logout\n")
        f.write("- GET /api/auth/me\n")
    
    sample_products = [
        {"id": "prod-8k-1", "name": "8 Ayar Altın Kolye", "description": "Zarif 8 ayar altın kolye", "price": 2500.00, "category": "8k", "image_url": "https://images.unsplash.com/photo-1611107683227-e9060eccd846?w=400", "stock": 10, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "prod-8k-2", "name": "8 Ayar Altın Bilezik", "description": "Şık 8 ayar altın bilezik", "price": 3200.00, "category": "8k", "image_url": "https://images.unsplash.com/photo-1611107683227-e9060eccd846?w=400", "stock": 8, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "prod-14k-1", "name": "14 Ayar Altın Kalp Kolye", "description": "Özel tasarım 14 ayar altın kalp desenli kolye", "price": 4500.00, "category": "14k", "image_url": "https://customer-assets.emergentagent.com/job_mir-jewelry-shop/artifacts/zu099bk7_3231.jpg", "stock": 15, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "prod-14k-2", "name": "14 Ayar Altın Bilezik", "description": "Zarif 14 ayar altın bilezik", "price": 3800.00, "category": "14k", "image_url": "https://customer-assets.emergentagent.com/job_mir-jewelry-shop/artifacts/ldhqwu97_1464.jpg", "stock": 12, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "prod-14k-3", "name": "14 Ayar Altın Zincir", "description": "Şık 14 ayar altın zincir kolye", "price": 5200.00, "category": "14k", "image_url": "https://customer-assets.emergentagent.com/job_mir-jewelry-shop/artifacts/4w5ilu8j_1466.jpg", "stock": 10, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "prod-14k-4", "name": "14 Ayar Altın Set", "description": "Premium 14 ayar altın takı seti", "price": 6800.00, "category": "14k", "image_url": "https://customer-assets.emergentagent.com/job_mir-jewelry-shop/artifacts/bnwr6qkx_3223.jpg", "stock": 8, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "prod-14k-5", "name": "14 Ayar Altın Tasarım", "description": "El işçiliği 14 ayar altın özel tasarım", "price": 7500.00, "category": "14k", "image_url": "https://customer-assets.emergentagent.com/job_mir-jewelry-shop/artifacts/n29w1afd_3225.jpg", "stock": 6, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "prod-21k-1", "name": "21 Ayar Altın Set", "description": "Premium 21 ayar altın takı seti", "price": 8500.00, "category": "21k", "image_url": "https://images.unsplash.com/photo-1592317295760-5c1f677dfc78?w=400", "stock": 5, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "prod-21k-2", "name": "21 Ayar Altın Kolye", "description": "Özel tasarım 21 ayar altın kolye", "price": 7200.00, "category": "21k", "image_url": "https://images.unsplash.com/photo-1592317295760-5c1f677dfc78?w=400", "stock": 7, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "prod-22k-1", "name": "22 Ayar Altın Bilezik", "description": "Muhteşem 22 ayar altın bilezik", "price": 9500.00, "category": "22k", "image_url": "https://images.unsplash.com/photo-1617191880362-aac615de3c26?w=400", "stock": 6, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": "prod-22k-2", "name": "22 Ayar Altın Yüzük", "description": "Özel 22 ayar altın yüzük", "price": 8800.00, "category": "22k", "image_url": "https://images.unsplash.com/photo-1617191880362-aac615de3c26?w=400", "stock": 9, "created_at": datetime.now(timezone.utc).isoformat()}
    ]
    
    for product in sample_products:
        existing_product = await db.products.find_one({"id": product["id"]})
        if not existing_product:
            await db.products.insert_one(product)
    
    sample_campaigns = [
        {"id": "camp-1", "title": "Kış Kampanyası", "description": "Tüm ürünlerde %20 indirim", "image_url": "https://images.pexels.com/photos/29371787/pexels-photo-29371787.jpeg?w=600", "discount": "20%", "active": True},
        {"id": "camp-2", "title": "Yeni Koleksiyon", "description": "2024 yeni sezon ürünleri", "image_url": "https://static.prod-images.emergentagent.com/jobs/ca0ba447-1b1a-4344-a291-0dbbc38054da/images/8d20ad915f460a681edb47606f5028fc4cb44cbb11042e03443761bcb07a61c0.png", "discount": "Yeni", "active": True},
        {"id": "camp-3", "title": "Özel Tasarım", "description": "El işçiliği özel tasarım ürünler", "image_url": "https://static.prod-images.emergentagent.com/jobs/ca0ba447-1b1a-4344-a291-0dbbc38054da/images/2a63b09776d4046efb1c66583a9937e241a6927222f0caf5e79dead9285ebc0b.png", "discount": "Özel", "active": True}
    ]
    
    for campaign in sample_campaigns:
        existing_campaign = await db.campaigns.find_one({"id": campaign["id"]})
        if not existing_campaign:
            await db.campaigns.insert_one(campaign)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()