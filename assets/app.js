// ===== SHOP SETTINGS (EDIT ME) =====
const SHOP = {
  storeName: "Handmade Pillow Shop",
  tagline: "Small-batch pillows made by hand",
  contactEmail: "you@example.com", // <-- CHANGE THIS
  currency: "USD",
  shippingFlat: 8.00,    // set 0 if free shipping, or adjust
  taxRate: 0.00          // e.g. 0.0825 for 8.25%
};
// ==================================

const PRODUCTS = window.PRODUCTS || [];
const $ = (id) => document.getElementById(id);

// ----- init header/footer -----
$("storeName").textContent = SHOP.storeName;
$("storeNameFoot").textContent = SHOP.storeName;
$("tagline").textContent = SHOP.tagline;
$("emailPill").textContent = SHOP.contactEmail;
$("emailFoot").textContent = SHOP.contactEmail;
$("year").textContent = new Date().getFullYear();

$("contactBtn").addEventListener("click", () => {
  window.location.href = `mailto:${encodeURIComponent(SHOP.contactEmail)}?subject=${encodeURIComponent("Question about " + SHOP.storeName)}`;
});

// ----- cart drawer -----
const drawer = $("drawer");
const backdrop = $("backdrop");

$("openCartBtn").addEventListener("click", openCart);
$("closeCartBtn").addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);

$("clearBtn").addEventListener("click", () => {
  cart = {};
  saveCart();
  render();
});

function openCart(){
  drawer.classList.add("open");
  backdrop.classList.add("open");
  updateCartUI();
}
function closeCart(){
  drawer.classList.remove("open");
  backdrop.classList.remove("open");
}

// ----- cart state -----
// Stored as an object keyed by cartKey ("productId|Size|Color|Fill")
// Each value: { productId, size, color, fill, unitPrice, qty }
const CART_KEY = "gh_pillow_shop_cart_v2";
let cart = loadCart();

function loadCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
  catch { return {}; }
}
function saveCart(){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}
function cartCount(){
  return Object.values(cart).reduce((a,b)=>a + (b.qty || 0), 0);
}

// ----- helpers -----
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}
function escapeAttr(s){
  return String(s).replace(/"/g, "&quot;");
}
function money(n){
  return new Intl.NumberFormat(undefined, { style:"currency", currency: SHOP.currency }).format(Number(n || 0));
}
function normalize(s){
  return String(s || "").toLowerCase();
}
function isEmailLikely(email){
  // simple check (not perfect) to catch obvious typos
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function getMinPrice(product){
  const sizes = product?.options?.sizes || [];
  const fills = product?.options?.fills || [];
  const minSize = sizes.reduce((min, s) => Math.min(min, s.price), Infinity);
  const minFill = fills.reduce((min, f) => Math.min(min, f.delta), Infinity);
  const base = (isFinite(minSize) ? minSize : 0);
  const delta = (isFinite(minFill) ? minFill : 0);
  return base + delta;
}
function getVariantPrice(product, sizeLabel, fillLabel){
  const size = (product?.options?.sizes || []).find(s => s.label === sizeLabel);
  const fill = (product?.options?.fills || []).find(f => f.label === fillLabel);
  return (size ? size.price : 0) + (fill ? fill.delta : 0);
}
function variantKey(size, color, fill){
  // Used for per-variant buyUrls in products.js
  return `${size}|${color}|${fill}`;
}
function cartKey(productId, size, color, fill){
  return `${productId}|${size}|${color}|${fill}`;
}
function findProduct(productId){
  return PRODUCTS.find(p => p.id === productId) || null;
}

// ----- filters -----
const categories = ["All", ...Array.from(new Set(PRODUCTS.map(p => p.category))).sort()];
$("category").innerHTML = categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");

$("search").addEventListener("input", render);
$("category").addEventListener("change", render);
$("sort").addEventListener("change", render);

// ----- rendering -----
function getFiltered(){
  const q = normalize($("search").value.trim());
  const cat = $("category").value;

  let list = PRODUCTS.filter(p => {
    const hay = [
      p.name, p.category, p.description,
      ...(p.materials || []),
      ...(p.tags || [])
    ].map(normalize).join(" • ");

    const matchesQ = !q || hay.includes(q);
    const matchesCat = (cat === "All") || (p.category === cat);
    return matchesQ && matchesCat;
  });

  const sort = $("sort").value;
  if (sort === "price-asc") list.sort((a,b)=>getMinPrice(a)-getMinPrice(b));
  if (sort === "price-desc") list.sort((a,b)=>getMinPrice(b)-getMinPrice(a));
  if (sort === "name-asc") list.sort((a,b)=>a.name.localeCompare(b.name));

  return list;
}

function render(){
  const list = getFiltered();
  const grid = $("grid");

  if (!list.length){
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1;">
      Nothing matches that search. Try a different keyword.
    </div>`;
    return;
  }

  grid.innerHTML = list.map(p => {
    const sizes = p?.options?.sizes || [];
    const colors = p?.options?.colors || [];
    const fills = p?.options?.fills || [];

    const defaultSize = sizes[0]?.label || "";
    const defaultColor = colors[0] || "";
    const defaultFill = fills[0]?.label || "";

    const defaultPrice = getVariantPrice(p, defaultSize, defaultFill);
    const tags = [];
    if (p.madeToOrder) tags.push(`<span class="smallBadge">Made to order</span>`);

    const hasPhoto = !!p.imageUrl;
    const imgStyle = hasPhoto ? `background-image:url('${escapeAttr(p.imageUrl)}');` : "";

    return `
      <div class="card product" data-product-id="${escapeAttr(p.id)}">
        <div class="img ${hasPhoto ? "hasPhoto" : ""}" style="${imgStyle}">
          <div class="tagRow">
            <span class="tag">${escapeHtml(p.category)}</span>
            ${tags.join("")}
          </div>
          <span class="price" data-price>${money(defaultPrice)}</span>
        </div>

        <div class="body">
          <div>
            <h3>${escapeHtml(p.name)}</h3>
            <p>${escapeHtml(p.description)}</p>
          </div>

          <div class="opts" aria-label="Options">
            <div class="optLine">
              <label for="size-${escapeAttr(p.id)}">Size</label>
              <select id="size-${escapeAttr(p.id)}" data-size>
                ${sizes.map(s => `<option value="${escapeAttr(s.label)}">${escapeHtml(s.label)}</option>`).join("")}
              </select>
            </div>

            <div class="optLine">
              <label for="color-${escapeAttr(p.id)}">Color</label>
              <select id="color-${escapeAttr(p.id)}" data-color>
                ${colors.map(c => `<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`).join("")}
              </select>
            </div>

            <div class="optLine">
              <label for="fill-${escapeAttr(p.id)}">Fill</label>
              <select id="fill-${escapeAttr(p.id)}" data-fill>
                ${fills.map(f => `<option value="${escapeAttr(f.label)}">${escapeHtml(f.label)}</option>`).join("")}
              </select>
            </div>
          </div>

          <details class="details">
            <summary>Details</summary>
            <div class="detailsContent">
              <div><b>Materials:</b> ${(p.materials || []).map(escapeHtml).join(", ") || "—"}</div>
              <div style="margin-top:6px;"><b>Tags:</b> ${(p.tags || []).map(escapeHtml).join(", ") || "—"}</div>
              ${p.madeToOrder ? `<div style="margin-top:6px;"><b>Made-to-order:</b> Allow extra time for stitching.</div>` : ``}
            </div>
          </details>

          <div class="row">
            <button class="btn btnPrimary" data-add>Add to cart</button>
            <a class="btn" data-buy style="display:none" target="_blank" rel="noopener noreferrer">Buy now</a>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // wire up events after render
  document.querySelectorAll(".product").forEach(card => {
    const productId = card.getAttribute("data-product-id");
    const product = findProduct(productId);
    if (!product) return;

    const sizeSel = card.querySelector("[data-size]");
    const colorSel = card.querySelector("[data-color]");
    const fillSel = card.querySelector("[data-fill]");
    const priceEl = card.querySelector("[data-price]");
    const addBtn = card.querySelector("[data-add]");
    const buyA = card.querySelector("[data-buy]");

    function refreshPriceAndBuy(){
      const size = sizeSel.value;
      const color = colorSel.value;
      const fill = fillSel.value;

      const price = getVariantPrice(product, size, fill);
      priceEl.textContent = money(price);

      const vKey = variantKey(size, color, fill);
      const variantBuy = (product.buyUrls && product.buyUrls[vKey]) ? product.buyUrls[vKey] : "";
      const link = variantBuy || product.buyUrl || "";

      if (link){
        buyA.href = link;
        buyA.style.display = "inline-flex";
      } else {
        buyA.href = "#";
        buyA.style.display = "none";
      }
    }

    sizeSel.addEventListener("change", refreshPriceAndBuy);
    colorSel.addEventListener("change", refreshPriceAndBuy);
    fillSel.addEventListener("change", refreshPriceAndBuy);

    addBtn.addEventListener("click", () => {
      const size = sizeSel.value;
      const color = colorSel.value;
      const fill = fillSel.value;
      const unitPrice = getVariantPrice(product, size, fill);

      const key = cartKey(product.id, size, color, fill);
      if (!cart[key]){
        cart[key] = { productId: product.id, size, color, fill, unitPrice, qty: 0 };
      }
      cart[key].qty += 1;

      saveCart();
      openCart();
    });

    refreshPriceAndBuy();
  });
}

// ----- cart UI -----
function calcTotals(){
  const items = Object.entries(cart).map(([key, it]) => {
    const p = findProduct(it.productId);
    const name = p ? p.name : it.productId;
    return { key, ...it, name };
  });

  const subtotal = items.reduce((sum, it) => sum + (it.unitPrice * it.qty), 0);
  const shipping = items.length ? Number(SHOP.shippingFlat || 0) : 0;
  const tax = subtotal * Number(SHOP.taxRate || 0);
  const total = subtotal + shipping + tax;

  return { items, subtotal, shipping, tax, total };
}

function updateCartUI(){
  $("cartCount").textContent = String(cartCount());

  const { items, subtotal, shipping, tax, total } = calcTotals();
  $("subtotal").textContent = money(subtotal);
  $("shipping").textContent = money(shipping);
  $("tax").textContent = money(tax);
  $("total").textContent = money(total);

  const container = $("cartItems");
  if (!items.length){
    container.innerHTML = `<div class="empty">Your cart is empty. Add a pillow you love ✨</div>`;
    $("checkoutHint").textContent = "Add items to cart to checkout.";
    return;
  }

  container.innerHTML = items.map(it => `
    <div class="cartItem">
      <div>
        <b>${escapeHtml(it.name)}</b>
        <small>${escapeHtml(it.size)} • ${escapeHtml(it.color)} • ${escapeHtml(it.fill)}</small>
        <small>${money(it.unitPrice)} each</small>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-end;">
        <div class="qty" aria-label="Quantity controls">
          <button type="button" aria-label="Decrease quantity" data-dec="${escapeAttr(it.key)}">−</button>
          <span>${it.qty}</span>
          <button type="button" aria-label="Increase quantity" data-inc="${escapeAttr(it.key)}">+</button>
        </div>
        <button class="btn" type="button" data-rm="${escapeAttr(it.key)}">Remove</button>
      </div>
    </div>
  `).join("");

  // wire cart buttons
  container.querySelectorAll("[data-dec]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-dec");
      if (!cart[key]) return;
      cart[key].qty -= 1;
      if (cart[key].qty <= 0) delete cart[key];
      saveCart();
    });
  });
  container.querySelectorAll("[data-inc]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-inc");
      if (!cart[key]) return;
      cart[key].qty += 1;
      saveCart();
    });
  });
  container.querySelectorAll("[data-rm]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-rm");
      delete cart[key];
      saveCart();
    });
  });

  $("checkoutHint").textContent = "Checkout opens an email with your order details.";
}

// ----- checkout (email) -----
function buildOrderText(){
  const { items, subtotal, shipping, tax, total } = calcTotals();

  const name = $("custName").value.trim();
  const email = $("custEmail").value.trim();
  const address = $("custAddress").value.trim();
  const note = $("custNote").value.trim();

  const lines = [
    `Order for ${SHOP.storeName}`,
    ``,
    `Customer: ${name || "(not provided)"}`,
    `Email: ${email || "(not provided)"}`,
    `Address: ${address || "(not provided)"}`,
    `Note: ${note || "(none)"}`,
    ``,
    `Items:`,
    ...items.map(it => `- ${it.qty} × ${it.name} — ${it.size}, ${it.color}, ${it.fill} (${money(it.unitPrice)}) = ${money(it.unitPrice * it.qty)}`),
    ``,
    `Subtotal: ${money(subtotal)}`,
    `Shipping: ${money(shipping)}`,
    `Tax: ${money(tax)}`,
    `Total: ${money(total)}`,
    ``,
    `— Sent from the shop website`
  ];

  return {
    subject: `New order: ${SHOP.storeName}`,
    body: lines.join("\n"),
    buyerEmail: email
  };
}

$("checkoutBtn").addEventListener("click", () => {
  const { items } = calcTotals();
  if (!items.length) return;

  const { subject, body, buyerEmail } = buildOrderText();
  if (buyerEmail && !isEmailLikely(buyerEmail)){
    $("checkoutHint").textContent = "Your email looks off—double-check it (or leave it blank).";
  } else {
    $("checkoutHint").textContent = "";
  }

  const mailto = `mailto:${encodeURIComponent(SHOP.contactEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
});

// Copy order summary as a fallback
$("copyOrderBtn").addEventListener("click", async () => {
  const { items } = calcTotals();
  if (!items.length) return;

  const { subject, body } = buildOrderText();
  const text = `${subject}\n\n${body}`;

  try{
    await navigator.clipboard.writeText(text);
    $("checkoutHint").textContent = "Copied! Paste into an email or message.";
  } catch {
    // fallback for older browsers
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try{
      document.execCommand("copy");
      $("checkoutHint").textContent = "Copied! Paste into an email or message.";
    } catch {
      $("checkoutHint").textContent = "Couldn’t auto-copy. Select and copy from your email checkout.";
    }
    document.body.removeChild(ta);
  }
});

// initial
render();
updateCartUI();
