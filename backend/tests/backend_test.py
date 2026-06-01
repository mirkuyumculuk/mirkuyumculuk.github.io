"""Backend API tests for MIR Gold jewelry shop."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://mir-jewelry-shop.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@mirgold.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "MirAdmin2024!")


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def test_user_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    # Register fresh unique user
    email = f"test_{int(time.time())}@mirgold.com"
    r = s.post(f"{API}/auth/register", json={"name": "Test User", "email": email, "password": "Test123!"})
    assert r.status_code == 200, f"register failed: {r.status_code} {r.text}"
    s.email = email
    return s


# ---- Auth ----
class TestAuth:
    def test_admin_login(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        # httpOnly cookie set
        assert "access_token" in r.cookies

    def test_login_invalid(self, session):
        r = session.post(f"{API}/auth/login", json={"email": "bad@x.com", "password": "wrong"})
        assert r.status_code == 401

    def test_me_requires_auth(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_register_and_me(self, test_user_session):
        r = test_user_session.get(f"{API}/auth/me")
        assert r.status_code == 200, r.text
        assert r.json()["email"] == test_user_session.email


# ---- Products / Campaigns ----
class TestProducts:
    def test_list_all_products(self):
        r = requests.get(f"{API}/products")
        assert r.status_code == 200
        prods = r.json()
        assert len(prods) >= 8
        cats = {p["category"] for p in prods}
        assert {"8k", "14k", "21k", "22k"}.issubset(cats)

    @pytest.mark.parametrize("cat", ["8k", "14k", "21k", "22k"])
    def test_filter_by_category(self, cat):
        r = requests.get(f"{API}/products", params={"category": cat})
        assert r.status_code == 200
        prods = r.json()
        assert len(prods) >= 1
        assert all(p["category"] == cat for p in prods)

    def test_get_single_product(self):
        r = requests.get(f"{API}/products/prod-14k-1")
        assert r.status_code == 200
        assert r.json()["category"] == "14k"

    def test_get_unknown_product(self):
        r = requests.get(f"{API}/products/nonexistent")
        assert r.status_code == 404

    def test_campaigns(self):
        r = requests.get(f"{API}/campaigns")
        assert r.status_code == 200
        camps = r.json()
        assert len(camps) >= 1
        assert all(c["active"] for c in camps)


# ---- Cart flow (uses test_user_session) ----
class TestCart:
    def test_add_to_cart(self, test_user_session):
        r = test_user_session.post(f"{API}/cart/add", json={"product_id": "prod-14k-1", "quantity": 2})
        assert r.status_code == 200, r.text

    def test_get_cart_has_item(self, test_user_session):
        r = test_user_session.get(f"{API}/cart")
        assert r.status_code == 200, r.text
        cart = r.json()
        assert len(cart) >= 1
        item = next((c for c in cart if c["product"]["id"] == "prod-14k-1"), None)
        assert item is not None
        assert item["quantity"] >= 2
        # store id for next test
        TestCart._item_id = item["id"]

    def test_add_invalid_product(self, test_user_session):
        r = test_user_session.post(f"{API}/cart/add", json={"product_id": "nope", "quantity": 1})
        assert r.status_code == 404

    def test_remove_from_cart(self, test_user_session):
        r = test_user_session.delete(f"{API}/cart/{TestCart._item_id}")
        assert r.status_code == 200, r.text
        r2 = test_user_session.get(f"{API}/cart")
        assert all(c["id"] != TestCart._item_id for c in r2.json())


# ---- Orders ----
class TestOrders:
    def test_orders_requires_auth(self):
        r = requests.get(f"{API}/orders")
        assert r.status_code == 401

    def test_orders_empty_for_new_user(self, test_user_session):
        r = test_user_session.get(f"{API}/orders")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---- Checkout ----
class TestCheckout:
    def test_checkout_session_requires_cart(self, test_user_session):
        # cart was emptied; should 400
        r = test_user_session.post(f"{API}/checkout/session", json={"origin_url": BASE_URL})
        assert r.status_code == 400

    def test_checkout_session_creates(self, test_user_session):
        # add an item first
        test_user_session.post(f"{API}/cart/add", json={"product_id": "prod-8k-1", "quantity": 1})
        r = test_user_session.post(f"{API}/checkout/session", json={"origin_url": BASE_URL})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "url" in data and "session_id" in data
        assert data["url"].startswith("http")
