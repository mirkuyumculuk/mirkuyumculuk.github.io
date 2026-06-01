# MIR Gold Jewelry E-commerce Website - PRD

## Original Problem Statement
Professional and beautiful jewelry shop website for "MIR" with:
- White and gold luxury theme
- MIR company name at top-mid with shiny golden font
- Categories: 8k, 14k, 21k, 22k gold
- Order section with shopping cart
- Menu button with My Account, Payment Methods
- Campaign section (seasonal offers)
- Professional checkbox labels
- Mobile-responsive heading text
- Contact info in footer: Phone 5549365625, Email info@mirgold.com
- Turkish language content

## User Choices
- Use placeholder images (replaceable)
- Full shopping cart with Stripe payment integration
- Full user authentication (JWT-based with order history)
- Seasonal offers in campaign section
- Turkish language

## Architecture
- **Backend**: FastAPI + MongoDB + JWT auth + Stripe (via emergentintegrations)
- **Frontend**: React 19 + React Router + Tailwind + Shadcn UI
- **Fonts**: Bodoni Moda (logo), Cormorant Garamond (headings), Manrope (body)

## What's Been Implemented (June 1, 2026)
- ✅ MIR shiny gold logo at top-mid header (Bodoni Moda)
- ✅ White/gold luxury theme with proper design system
- ✅ Home page with hero banner, categories grid, campaigns section
- ✅ Product catalog: 8k, 14k, 21k, 22k categories (8 products seeded, 5 in 14k with user's custom images)
- ✅ Product detail pages with quantity selector
- ✅ Shopping cart with add/remove/checkout
- ✅ Stripe payment integration with TRY currency
- ✅ Payment status polling on success page
- ✅ User registration/login with professional checkbox for T&C
- ✅ Order history in Account page
- ✅ Menu sheet (mobile + desktop) with Hesabım, Sipariş Geçmişim, Çıkış Yap
- ✅ Footer with phone (0554 936 56 25) and email (info@mirgold.com)
- ✅ Campaign section with seasonal offers (3 campaigns seeded)
- ✅ Mobile responsive design
- ✅ All Turkish language content
- ✅ Backend tests: 20/20 passing

## Test Credentials
See `/app/memory/test_credentials.md` for admin login.

## Backlog (P1/P2)
- Search functionality
- Product filters (price range, sub-category)
- Wishlist/favorites
- Product reviews
- Multi-image product gallery
- Admin dashboard for product management
- Email notifications for orders
- Address book / shipping management
- Multiple language support (English)
- Coupon/discount codes
- Stock low alerts
- Login brute-force protection
- /api/auth/refresh endpoint implementation

## Next Tasks
- Optional UI polish (animations, micro-interactions)
- Product image optimization
- SEO meta tags
