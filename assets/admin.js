/* Product editor for GitHub Pages (no backend).
   - Loads products from assets/products.js (window.PRODUCTS)
   - Saves a draft in localStorage
   - Downloads a new products.js you can upload to GitHub
*/
(function(){
  const DRAFT_KEY = "pillow_shop_products_draft_v1";

  const $ = (id) => document.getElementById(id);
  const listEl = $("productList");
  const editorEl = $("editor");
  const countLabel = $("countLabel");
  const selectedLabel = $("selectedLabel");
  const draftPill = $("draftPill");

  const deepCopy = (x) => JSON.parse(JSON.stringify(x || null));
  const nowStamp = () => new Date().toISOString().replace("T"," ").slice(0,19) + " UTC";

  function slugify(str){
    return String(str || "")
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "new-product";
  }

  function defaultProduct(){
    return {
      id: "new-product",
      name: "New Pillow",
      category: "Throw",
      description: "Describe your pillow here.",
      materials: ["Fabric", "Hidden zipper"],
      tags: ["handmade"],
      imageUrl: "",
      madeToOrder: true,
      options: {
        sizes: [{ label: "18x18", price: 45.00 }],
        colors: ["Natural"],
        fills: [
          { label: "Cover only", delta: 0.00 },
          { label: "Cover + Insert", delta: 12.00 }
        ]
      },
      buyUrl: "",
      buyUrls: {}
    };
  }

  // Load live products from products.js
  const LIVE = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];

  // Load draft if present
  let state = {
    products: deepCopy(LIVE),
    selectedId: LIVE[0]?.id || null,
    draftLoaded: false
  };

  try{
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw){
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.products)){
        state.products = parsed.products;
        state.selectedId = parsed.selectedId || parsed.products[0]?.id || null;
        state.draftLoaded = true;
      }
    }
  } catch {}

  function saveDraft(){
    try{
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        products: state.products,
        selectedId: state.selectedId,
        savedAt: Date.now()
      }));
      draftPill.textContent = "Draft: saved";
    } catch {
      draftPill.textContent = "Draft: not saved";
    }
  }

  function setDirty(){
    draftPill.textContent = "Draft: changed";
    // Small debounce could be used; keep it simple
    saveDraft();
  }

  function getSelectedIndex(){
    return state.products.findIndex(p => p.id === state.selectedId);
  }

  function getSelected(){
    return state.products.find(p => p.id === state.selectedId) || null;
  }

  function ensureUniqueId(baseId, ignoreIndex = -1){
    let id = baseId;
    let n = 2;
    while(state.products.some((p, idx) => idx !== ignoreIndex && p.id === id)){
      id = `${baseId}-${n++}`;
    }
    return id;
  }

  function renderList(){
    countLabel.textContent = `${state.products.length} item(s)`;
    listEl.innerHTML = "";

    state.products.forEach(p => {
      const item = document.createElement("div");
      item.className = "adminItem" + (p.id === state.selectedId ? " active" : "");
      item.addEventListener("click", () => {
        state.selectedId = p.id;
        saveDraft();
        render();
      });

      const thumb = document.createElement("div");
      thumb.className = "adminThumb";
      if (p.imageUrl){
        thumb.style.backgroundImage = `url('${p.imageUrl}')`;
      }

      const meta = document.createElement("div");
      meta.className = "adminItemMeta";

      const title = document.createElement("b");
      title.textContent = p.name || p.id;

      const sub = document.createElement("span");
      sub.textContent = `${p.category || "—"} • ${p.id}`;

      meta.appendChild(title);
      meta.appendChild(sub);

      item.appendChild(thumb);
      item.appendChild(meta);
      listEl.appendChild(item);
    });
  }

  function renderEditor(){
    const p = getSelected();
    if (!p){
      editorEl.innerHTML = `<div class="empty">Select a product to edit.</div>`;
      selectedLabel.textContent = "";
      return;
    }

    selectedLabel.textContent = p.id;

    const safe = (v) => (v === undefined || v === null) ? "" : String(v);

    const materialsText = Array.isArray(p.materials) ? p.materials.join("\n") : "";
    const tagsText = Array.isArray(p.tags) ? p.tags.join("\n") : "";
    const colorsText = Array.isArray(p.options?.colors) ? p.options.colors.join("\n") : "";
    const buyUrlsJson = p.buyUrls ? JSON.stringify(p.buyUrls, null, 2) : "{}";

    // Build HTML
    editorEl.innerHTML = `
      <div class="sectionTitle">
        <b>Basics</b>
        <span>name • category • description</span>
      </div>
      <div class="fieldGrid">
        <div class="field">
          <label>Name</label>
          <input id="name" value="${escapeAttr(safe(p.name))}" />
        </div>
        <div class="field">
          <label>Category</label>
          <input id="category" value="${escapeAttr(safe(p.category))}" placeholder="Throw / Lumbar / Outdoor ..." />
        </div>
        <div class="field" style="grid-column:1/-1;">
          <label>Description</label>
          <textarea id="description" rows="3">${escapeHtml(safe(p.description))}</textarea>
        </div>
      </div>

      <div class="checkRow">
        <input id="madeToOrder" type="checkbox" ${p.madeToOrder ? "checked" : ""} />
        <label for="madeToOrder" style="color:var(--muted); font-size:12px;">Show “Made to order” badge</label>
      </div>

      <div class="hr"></div>

      <div class="sectionTitle">
        <b>Picture</b>
        <span>Upload image to assets/photos/</span>
      </div>

      <div class="previewRow">
        <div class="imgPreview" id="imgPreview"></div>
        <div class="field" style="display:grid; gap:10px;">
          <div>
            <label>Image URL / path</label>
            <input id="imageUrl" value="${escapeAttr(safe(p.imageUrl))}" placeholder="./assets/photos/your-image.jpg" />
          </div>
          <div>
            <label>Pick an image (optional)</label>
            <input id="imageFile" type="file" accept="image/*" />
            <div class="hint">We’ll suggest a filename based on the product ID and set the image path automatically.</div>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
            <button class="btn" id="clearImageBtn" type="button">Clear image</button>
            <button class="btn btnPrimary" id="downloadImageBtn" type="button" style="display:none">Download renamed image</button>
            <span class="adminSmall" id="imageNote"></span>
          </div>
        </div>
      </div>

      <div class="hr"></div>

      <div class="sectionTitle">
        <b>Options</b>
        <span>sizes • colors • fills</span>
      </div>

      <div>
        <div class="sectionTitle"><b>Sizes</b><span>label + base price</span></div>
        <div id="sizes"></div>
        <button class="btn" id="addSizeBtn" type="button">Add size</button>
      </div>

      <div>
        <div class="sectionTitle"><b>Colors</b><span>one per line</span></div>
        <div class="field">
          <textarea id="colors" rows="4" placeholder="Natural\nOat\nCharcoal">${escapeHtml(colorsText)}</textarea>
        </div>
      </div>

      <div>
        <div class="sectionTitle"><b>Fills</b><span>label + price delta</span></div>
        <div id="fills"></div>
        <button class="btn" id="addFillBtn" type="button">Add fill</button>
      </div>

      <div class="hr"></div>

      <div class="sectionTitle">
        <b>Details</b>
        <span>materials • tags</span>
      </div>

      <div class="fieldGrid">
        <div class="field">
          <label>Materials (one per line)</label>
          <textarea id="materials" rows="4" placeholder="Linen\nHidden zipper">${escapeHtml(materialsText)}</textarea>
        </div>
        <div class="field">
          <label>Tags (one per line)</label>
          <textarea id="tags" rows="4" placeholder="neutral\nsofa\ngift">${escapeHtml(tagsText)}</textarea>
        </div>
      </div>

      <div class="hr"></div>

      <div class="sectionTitle">
        <b>Payment links (optional)</b>
        <span>Buy now buttons</span>
      </div>

      <div class="fieldGrid">
        <div class="field">
          <label>Buy URL (one link for the whole product)</label>
          <input id="buyUrl" value="${escapeAttr(safe(p.buyUrl))}" placeholder="https://buy.stripe.com/..." />
        </div>
        <div class="field">
          <label>Product ID (used for cart + images)</label>
          <input id="id" value="${escapeAttr(safe(p.id))}" />
          <div class="hint">Changing an ID can break old cart items. If you rename, it’s usually fine to keep the same ID.</div>
        </div>
        <div class="field" style="grid-column:1/-1;">
          <label>Variant Buy URLs (JSON) — key format is "Size|Color|Fill"</label>
          <textarea id="buyUrls" rows="6" placeholder='{"18x18|Terracotta|Cover + Insert":"https://buy.stripe.com/..."}'>${escapeHtml(buyUrlsJson)}</textarea>
        </div>
      </div>
    `;

    // Preview
    const preview = document.getElementById("imgPreview");
    preview.style.backgroundImage = p.imageUrl ? `url('${p.imageUrl}')` : "";

    // Wire basic fields
    wireText("name", (v) => p.name = v);
    wireText("category", (v) => p.category = v);
    wireTextArea("description", (v) => p.description = v);

    const madeCb = document.getElementById("madeToOrder");
    madeCb.addEventListener("change", () => { p.madeToOrder = !!madeCb.checked; setDirty(); renderList(); });

    // Image URL
    wireText("imageUrl", (v) => {
      p.imageUrl = v.trim();
      preview.style.backgroundImage = p.imageUrl ? `url('${p.imageUrl}')` : "";
      setDirty();
      renderList();
    });

    // Clear image
    document.getElementById("clearImageBtn").addEventListener("click", () => {
      p.imageUrl = "";
      document.getElementById("imageUrl").value = "";
      preview.style.backgroundImage = "";
      setDirty();
      renderList();
    });

    // Image file handling
    const fileInput = document.getElementById("imageFile");
    const downloadImgBtn = document.getElementById("downloadImageBtn");
    const imageNote = document.getElementById("imageNote");

    let pickedFile = null;
    let suggestedName = null;

    fileInput.addEventListener("change", () => {
      if (!fileInput.files || !fileInput.files[0]) return;
      pickedFile = fileInput.files[0];

      const extMatch = (pickedFile.name || "").match(/\.([a-zA-Z0-9]+)$/);
      const ext = (extMatch ? extMatch[1] : "jpg").toLowerCase();
      suggestedName = `${p.id}.${ext}`;

      // Set image URL automatically (expected GitHub Pages path)
      const path = `./assets/photos/${suggestedName}`;
      p.imageUrl = path;
      document.getElementById("imageUrl").value = path;
      preview.style.backgroundImage = `url('${URL.createObjectURL(pickedFile)}')`;

      imageNote.textContent = `Suggested filename: ${suggestedName} (upload to assets/photos/)`;
      downloadImgBtn.style.display = "inline-flex";
      setDirty();
      renderList();
    });

    downloadImgBtn.addEventListener("click", () => {
      if (!pickedFile || !suggestedName) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(pickedFile);
      a.download = suggestedName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Note: object URL will be released when page reloads; fine.
    });

    // Sizes + fills editors
    renderPairs("sizes", p.options?.sizes || [], "label", "price", "Add size", (newArr) => {
      if (!p.options) p.options = {};
      p.options.sizes = newArr;
    }, true);

    document.getElementById("addSizeBtn").addEventListener("click", () => {
      if (!p.options) p.options = {};
      if (!Array.isArray(p.options.sizes)) p.options.sizes = [];
      p.options.sizes.push({ label: "New size", price: 0.00 });
      setDirty();
      renderEditor();
    });

    renderPairs("fills", p.options?.fills || [], "label", "delta", "Add fill", (newArr) => {
      if (!p.options) p.options = {};
      p.options.fills = newArr;
    }, false);

    document.getElementById("addFillBtn").addEventListener("click", () => {
      if (!p.options) p.options = {};
      if (!Array.isArray(p.options.fills)) p.options.fills = [];
      p.options.fills.push({ label: "New fill", delta: 0.00 });
      setDirty();
      renderEditor();
    });

    // Colors, materials, tags
    wireTextArea("colors", (v) => {
      if (!p.options) p.options = {};
      p.options.colors = splitLines(v);
      setDirty();
      renderList();
    });
    wireTextArea("materials", (v) => { p.materials = splitLines(v); setDirty(); });
    wireTextArea("tags", (v) => { p.tags = splitLines(v); setDirty(); });

    // buy url and buyUrls json
    wireText("buyUrl", (v) => { p.buyUrl = v.trim(); setDirty(); });
    wireText("id", (v) => {
      const idx = getSelectedIndex();
      const newBase = slugify(v);
      const unique = ensureUniqueId(newBase, idx);
      p.id = unique;
      state.selectedId = unique;
      setDirty();
      render(); // update list + editor labels
    });
    wireTextArea("buyUrls", (v) => {
      try{
        const parsed = JSON.parse(v || "{}");
        p.buyUrls = (parsed && typeof parsed === "object") ? parsed : {};
        setDirty();
      } catch {
        // keep previous; do not overwrite; show hint
      }
    });
  }

  function splitLines(text){
    return String(text || "")
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  function renderPairs(containerId, arr, keyA, keyB, label, onUpdate, moneyField){
    const container = document.getElementById(containerId);
    if (!container) return;

    const rows = Array.isArray(arr) ? arr : [];
    container.innerHTML = rows.map((row, idx) => `
      <div class="pair">
        <input data-a="${idx}" value="${escapeAttr(row[keyA] ?? "")}" placeholder="Label" />
        <input data-b="${idx}" class="mini" value="${escapeAttr(row[keyB] ?? 0)}" placeholder="${moneyField ? "Price" : "Delta"}" />
        <button class="btn" type="button" data-del="${idx}">Remove</button>
      </div>
    `).join("");

    container.querySelectorAll("[data-a]").forEach(inp => {
      inp.addEventListener("input", () => {
        const i = Number(inp.getAttribute("data-a"));
        rows[i][keyA] = inp.value;
        onUpdate(rows);
        setDirty();
      });
    });

    container.querySelectorAll("[data-b]").forEach(inp => {
      inp.addEventListener("input", () => {
        const i = Number(inp.getAttribute("data-b"));
        const num = Number(inp.value);
        rows[i][keyB] = isFinite(num) ? num : 0;
        onUpdate(rows);
        setDirty();
      });
    });

    container.querySelectorAll("[data-del]").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-del"));
        rows.splice(i, 1);
        onUpdate(rows);
        setDirty();
        renderEditor();
      });
    });
  }

  function wireText(id, onChange){
    const el = document.getElementById(id);
    el.addEventListener("input", () => { onChange(el.value); setDirty(); });
  }
  function wireTextArea(id, onChange){
    const el = document.getElementById(id);
    el.addEventListener("input", () => { onChange(el.value); /* setDirty inside */ });
    // Some fields already call setDirty; keep simple and call here too
    el.addEventListener("input", () => { setDirty(); });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
  }
  function escapeAttr(s){
    return String(s).replace(/"/g, "&quot;");
  }

  function downloadText(filename, content, mime="text/plain"){
    const blob = new Blob([content], {type: mime});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function formatProductsJs(){
    const header = `// Generated by admin.html on ${nowStamp()}\n` +
                   `// Replace assets/products.js in your GitHub repo with this file.\n\n`;
    const body = "window.PRODUCTS = " + JSON.stringify(state.products, null, 2) + ";\n";
    return header + body;
  }

  function render(){
    renderList();
    renderEditor();
  }

  // Buttons
  $("downloadBtn").addEventListener("click", () => {
    downloadText("products.js", formatProductsJs(), "text/javascript");
  });

  $("exportJsonBtn").addEventListener("click", () => {
    downloadText("products.json", JSON.stringify(state.products, null, 2), "application/json");
  });

  $("resetBtn").addEventListener("click", () => {
    if (!confirm("Reset editor to match the current assets/products.js? This will overwrite your draft in this browser.")) return;
    state.products = deepCopy(LIVE);
    state.selectedId = state.products[0]?.id || null;
    saveDraft();
    render();
  });

  $("addBtn").addEventListener("click", () => {
    const p = defaultProduct();
    p.id = ensureUniqueId("new-pillow");
    p.name = "New Pillow";
    state.products.unshift(p);
    state.selectedId = p.id;
    setDirty();
    render();
  });

  $("duplicateBtn").addEventListener("click", () => {
    const cur = getSelected();
    if (!cur) return;
    const copy = deepCopy(cur);
    copy.id = ensureUniqueId(cur.id + "-copy");
    copy.name = (cur.name ? cur.name + " (Copy)" : copy.id);
    state.products.unshift(copy);
    state.selectedId = copy.id;
    setDirty();
    render();
  });

  $("deleteBtn").addEventListener("click", () => {
    const idx = getSelectedIndex();
    if (idx < 0) return;
    const p = state.products[idx];
    if (!confirm(`Delete "${p.name || p.id}"? This cannot be undone (unless you reset).`)) return;
    state.products.splice(idx, 1);
    state.selectedId = state.products[0]?.id || null;
    setDirty();
    render();
  });

  // Initial render
  if (state.draftLoaded){
    draftPill.textContent = "Draft: loaded";
  } else {
    draftPill.textContent = "Draft: new";
  }
  render();
  saveDraft();
})();
