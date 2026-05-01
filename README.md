# Hannan Stationers
 
Hannan Stationers is our family's local shop in Bhaddar, Gujrat, Punjab, Pakistan selling stationery, grocery, sports and tobacco products. I built this as a real working e-commerce site for the shop. For backend I went with Supabase — it handles database, auth and file storage in one place, solid choice if you want to skip setting up a separate backend.
 
---
 
## Live Demo
 
https://hannan-stationers-la5l.vercel.app
 
---
 
## How It Works
 
Customers browse products by category, add to cart and place a Cash on Delivery order. After an order we contact the customer on WhatsApp to confirm and arrange delivery.
 
Admin logs in through a protected dashboard to manage products, deals, orders and site settings.
 
---
 
## Tech Stack
 
- **Angular 20** — Frontend
- **Tailwind CSS** — Styling
- **Supabase** — Backend, database, auth and file storage
- **Vercel** — Hosting
---
 
## Features
 
**Customer Side**
- Homepage with banner slider and featured products & deals
- Category pages — Stationery, Grocery, Sports, Tobacco
- Cart with quantity controls and COD checkout
- Order confirmation message
**Admin Dashboard**
- Protected login with route guards
- Add, edit and delete products with image upload
- Manage deals and view incoming orders
- Update order status — Pending → Confirmed → Delivered
- Update contact info and social links from settings
---
 
## Database Tables
 
```
stationery    → id, name, description, price, image_url, created_at
grocery       → id, name, description, price, image_url, created_at
sports        → id, name, description, price, image_url, created_at
tobacco       → id, name, description, price, image_url, created_at
deals         → id, name, description, price, image_url, created_at
orders        → id, firstName, lastName, phone, city, address, postal_code, created_at
order_items   → id, order_id, product_id, product_name, price, quantity
settings      → id, key, value
```
 
---
 
## Running Locally
 
You'll need Node.js 18+ and Angular CLI installed.
 
```bash
git clone https://github.com/msalman63/hannan-stationers.git
cd hannan-stationers
npm install
```
 
Copy the example environment file and add your Supabase credentials:
 
```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```
 
```typescript
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL_HERE',
  supabaseKey: 'YOUR_SUPABASE_ANON_KEY_HERE'
};
```
 
```bash
ng serve
```
 
---
 
## Project Structure
 
```
hannan-stationers/
├── public/images/                # Static assets
├── src/app/
│   ├── admin-dashboard/          # Admin panel components
│   ├── auth/login/               # Admin login
│   ├── guards/                   # Route protection
│   ├── interfaces/               # TypeScript interfaces
│   ├── layouts/main-layout/      # Header & footer
│   ├── pages/                    # Customer facing pages
│   └── shared/
│       ├── components/           # Reusable UI components
│       └── services/             # Cart, product, supabase etc.
└── src/environments/
    ├── environment.example.ts    # Safe template — copy this
    └── environment.ts            # Your credentials — gitignored
```
 
---
 
## Screenshots
 
![Homepage](screenshots/homepage.png)
![Products](screenshots/products.png)
![Checkout](screenshots/checkout.png)
![Admin Dashboard](screenshots/dashboard.png)
 
---
 
## Author
 
**Muhammad Salman**
 
[LinkedIn](https://www.linkedin.com/in/muhammadsalman063) · [GitHub](https://github.com/msalman63) · [X](https://x.com/iamsalman063) · [Fiverr](https://www.fiverr.com/users/msalman63)