# Handmade Pillow Shop (GitHub Pages)

This is a simple static storefront for selling handmade pillows.

✅ Product grid + search + category filter + sorting  
✅ Options per pillow (size / color / fill) with dynamic price  
✅ Cart drawer + quantity controls + localStorage persistence  
✅ Checkout via prefilled email (no backend)  
✅ Optional “Buy now” links (Stripe Payment Links, PayPal, Etsy, etc.)  

---

## Quick start (what you need to change)

### 1) Set your email + shop name
Open: **`assets/app.js`** and edit:

- `contactEmail` (required)
- `storeName` and `tagline`
- optional: `shippingFlat`, `taxRate`

### 2) Add / edit your pillows
Open: **`assets/products.js`** and edit the `window.PRODUCTS` list.

Each product supports:
- `sizes` with base price
- `colors`
- `fills` with price delta (like “Cover + Insert”)
- `madeToOrder` badge
- optional payment links:
  - `buyUrl` (one link for the product)
  - `buyUrls` (different link per variant)

Variant buyUrls use this key format:
`"Size|Color|Fill"`

Example:
```js
buyUrls: {
  "18x18|Terracotta|Cover + Insert": "https://buy.stripe.com/xxxx"
}
```

### 3) Add photos (optional but recommended)
Put images in: **`assets/photos/`**

Then set in each product:
```js
imageUrl: "./assets/photos/your-photo.jpg"
```

---

## Publish on GitHub Pages

1. Create a new repository on GitHub (example: `pillow-shop`)
2. Upload these files exactly (keep the folder structure)
3. In the repo, go to **Settings → Pages**
4. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/(root)**
5. Click **Save**

Your site will be available at:
`https://YOUR-USERNAME.github.io/REPO-NAME/`

---

## Tips

- If you change file names, update the `<link>` / `<script>` paths in `index.html`.
- If a user’s device doesn’t support mailto well, they can click **Copy order summary** and paste it into a message.
- You can set `shippingFlat` to 0 for free shipping, or increase for heavier inserts.


---

## Editing products without code

Open `admin.html` (either locally or on your GitHub Pages site) to edit products with a form.

**Workflow:**
1. Open `admin.html`
2. Make changes
3. Click **Download products.js**
4. Upload/replace `assets/products.js` in your GitHub repo
5. (For new photos) upload images to `assets/photos/`

Your editor page URL will be:
`https://YOUR-USERNAME.github.io/YOUR-REPO/admin.html`
