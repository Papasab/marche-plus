import { useState, useEffect } from "react";

// Ce fichier contient tout le système multi-vendeurs :
// - Inscription vendeur
// - Dashboard vendeur (gérer ses produits, voir ses commandes, sa commission)
// - Page boutique publique par vendeur
// Import dans App.jsx : import { VendorRegister, VendorDashboard, VendorShopPage } from "./components/VendorSystem";

const COMMISSION_RATE = 10; // 10% — modifiable ici

const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// ─── Inscription Vendeur ──────────────────────────────────────────
export function VendorRegister({ supabase, user, onDone, onBack }) {
  const [form, setForm] = useState({ nom_boutique: "", whatsapp: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!form.nom_boutique.trim() || !form.whatsapp.trim()) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setLoading(true);
    const slug = slugify(form.nom_boutique) + "-" + Math.random().toString(36).slice(2, 6);

    const { data, error: insertError } = await supabase.from("vendeurs").insert({
      user_id: user.id,
      nom_boutique: form.nom_boutique,
      slug,
      whatsapp: form.whatsapp.replace(/\D/g, ""),
      description: form.description,
      statut: "approuve", // inscription ouverte = approuvé directement
    }).select().single();

    setLoading(false);
    if (insertError) { setError("Erreur : " + insertError.message); return; }
    onDone(data);
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "28px 20px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#888", fontSize: 14, cursor: "pointer", marginBottom: 20 }}>← Retour</button>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #ebebeb", padding: "30px 26px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🏪</div>
          <h2 style={{ fontWeight: 800, fontSize: 20 }}>Devenir vendeur sur Marché+</h2>
          <p style={{ fontSize: 13, color: "#888", marginTop: 6 }}>Créez votre propre boutique en quelques secondes</p>
        </div>

        <div style={{ background: "#fff8e1", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#b76e00" }}>
          💡 Marché+ prélève une commission de <strong>{COMMISSION_RATE}%</strong> sur chaque vente réalisée.
        </div>

        {[
          { label: "Nom de votre boutique *", key: "nom_boutique", placeholder: "Ex: Chez Aminata", type: "text" },
          { label: "Numéro WhatsApp *", key: "whatsapp", placeholder: "Ex: 22391000000", type: "tel" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>{f.label}</label>
            <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14 }} />
          </div>
        ))}

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Description de votre boutique</label>
          <textarea placeholder="Parlez de vos produits..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, fontFamily: "inherit", resize: "vertical" }} />
        </div>

        {error && <div style={{ background: "#fce8e8", color: "#c0392b", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>✗ {error}</div>}

        <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: "#1a1a1a", color: "#fff", border: "none", padding: "14px", borderRadius: 12, fontWeight: 700, fontSize: 15, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Création..." : "🏪 Créer ma boutique"}
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard Vendeur ────────────────────────────────────────────
export function VendorDashboard({ supabase, vendor, onAddProduct, onBack }) {
  const [tab, setTab] = useState("overview");
  const [myProducts, setMyProducts] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "", category: "Mode", image: "", description: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const { data: products } = await supabase.from("produits").select("*").eq("vendeur_id", vendor.id);
    const { data: orders } = await supabase.from("commandes").select("*").eq("vendeur_id", vendor.id).order("created_at", { ascending: false });
    setMyProducts(products || []);
    setMyOrders(orders || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const totalRevenue = myOrders.reduce((s, o) => s + o.total, 0);
  const totalCommission = Math.round(totalRevenue * COMMISSION_RATE / 100);
  const netRevenue = totalRevenue - totalCommission;

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    await supabase.from("produits").insert({
      name: newProduct.name,
      price: parseInt(newProduct.price),
      stock: parseInt(newProduct.stock) || 0,
      category: newProduct.category,
      image: newProduct.image || "/images/default.jpg",
      images: newProduct.image || "/images/default.jpg",
      description: newProduct.description,
      vendeur_id: vendor.id,
      rating: 5,
      reviews: 0,
    });
    setNewProduct({ name: "", price: "", stock: "", category: "Mode", image: "", description: "" });
    setShowAddForm(false);
    loadData();
  };

  const deleteProduct = async (id) => {
    await supabase.from("produits").delete().eq("id", id);
    loadData();
  };

  const shopUrl = `https://marche-plus.vercel.app/?boutique=${vendor.slug}`;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#888", fontSize: 14, cursor: "pointer", marginBottom: 20 }}>← Retour à Marché+</button>

      <div style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #333 100%)", borderRadius: 16, padding: "24px", marginBottom: 20, color: "#fff" }}>
        <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>VOTRE BOUTIQUE</div>
        <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>🏪 {vendor.nom_boutique}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shopUrl}</span>
          <button onClick={() => navigator.clipboard.writeText(shopUrl)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", flexShrink: 0 }}>Copier</button>
        </div>
      </div>

      <div style={{ display: "flex", marginBottom: 24, borderBottom: "1px solid #e8e8e8" }}>
        {[{ key: "overview", label: "Vue d'ensemble" }, { key: "products", label: "Mes produits" }, { key: "orders", label: "Mes commandes" }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "10px 20px", border: "none", background: "transparent", fontWeight: tab === t.key ? 700 : 400, color: tab === t.key ? "#1a1a1a" : "#888", borderBottom: `2px solid ${tab === t.key ? "#1a1a1a" : "transparent"}`, fontSize: 14, marginBottom: -1 }}>{t.label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 14 }}>
          {[
            { label: "Revenus bruts", value: fmt(totalRevenue), icon: "💰", bg: "#e8f0fe" },
            { label: `Commission Marché+ (${COMMISSION_RATE}%)`, value: "- " + fmt(totalCommission), icon: "📊", bg: "#fce8e8" },
            { label: "Vos gains nets", value: fmt(netRevenue), icon: "✅", bg: "#e6f7ef" },
            { label: "Produits en ligne", value: myProducts.length, icon: "🏷", bg: "#fff8e1" },
            { label: "Commandes reçues", value: myOrders.length, icon: "📦", bg: "#fce8f0" },
          ].map(m => (
            <div key={m.label} style={{ background: m.bg, borderRadius: 14, padding: "20px 18px" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{m.value}</div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 3 }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "products" && (
        <div>
          <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: "#1a1a1a", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13, marginBottom: 16 }}>
            {showAddForm ? "✕ Annuler" : "+ Ajouter un produit"}
          </button>

          {showAddForm && (
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", padding: 20, marginBottom: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <input placeholder="Nom du produit" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14 }} />
                <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14 }}>
                  {["Mode", "Électronique", "Maison", "Bureau"].map(c => <option key={c}>{c}</option>)}
                </select>
                <input type="number" placeholder="Prix (FCFA)" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14 }} />
                <input type="number" placeholder="Stock" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))} style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14 }} />
                <div style={{ gridColumn: "1 / -1" }}>
  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Photo du produit</label>
  <div style={{ border: "2px dashed #e0e0e0", borderRadius: 12, padding: 16, textAlign: "center", cursor: "pointer", background: "#faf8ff" }}
    onClick={() => document.getElementById("vendor-img-upload").click()}>
    {newProduct.image ? (
      <img src={newProduct.image} alt="aperçu" style={{ height: 120, objectFit: "cover", borderRadius: 8 }} />
    ) : (
      <div>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
        <div style={{ fontSize: 14, color: "#888" }}>Cliquez pour uploader une photo</div>
      </div>
    )}
  </div>
  <input id="vendor-img-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const filename = `produits/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("image").upload(filename, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("image").getPublicUrl(filename);
      setNewProduct(p => ({ ...p, image: data.publicUrl }));
    }
  }} />
</div>
                <textarea placeholder="Description" value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} rows={2} style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, gridColumn: "1 / -1", fontFamily: "inherit" }} />
              </div>
              <button onClick={addProduct} style={{ background: "#0a7c45", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 10, fontWeight: 600, fontSize: 13 }}>✓ Publier le produit</button>
            </div>
          )}

          {loading ? <p style={{ color: "#aaa" }}>Chargement...</p> : myProducts.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: 13 }}>Aucun produit pour le moment. Ajoutez votre premier produit !</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {myProducts.map(p => (
                <div key={p.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #ebebeb", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div><div style={{ fontSize: 12, color: "#888" }}>{p.category} · {fmt(p.price)} · Stock: {p.stock}</div></div>
                  <button onClick={() => deleteProduct(p.id)} style={{ background: "#fce8e8", color: "#c0392b", border: "none", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Supprimer</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "orders" && (
        loading ? <p style={{ color: "#aaa" }}>Chargement...</p> : myOrders.length === 0 ? (
          <p style={{ color: "#aaa", fontSize: 13 }}>Aucune commande reçue pour le moment.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {myOrders.map(o => (
              <div key={o.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #ebebeb", padding: "14px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{o.id}</div>
                    <div style={{ fontSize: 12, color: "#555" }}>👤 {o.client_nom} · 📞 {o.client_telephone}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700 }}>{fmt(o.total)}</div>
                    <div style={{ fontSize: 11, color: "#c0392b" }}>Commission: -{fmt(o.commission || 0)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── Page Boutique Publique d'un Vendeur ─────────────────────────
export function VendorShopPage({ supabase, slug, onAdd, onBack }) {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: v } = await supabase.from("vendeurs").select("*").eq("slug", slug).single();
      if (v) {
        setVendor(v);
        const { data: p } = await supabase.from("produits").select("*").eq("vendeur_id", v.id);
        setProducts(p || []);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div style={{ textAlign: "center", padding: 80, color: "#aaa" }}>Chargement de la boutique...</div>;
  if (!vendor) return <div style={{ textAlign: "center", padding: 80, color: "#aaa" }}>Boutique introuvable.</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#888", fontSize: 14, cursor: "pointer", marginBottom: 20 }}>← Retour à Marché+</button>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #ebebeb", padding: "24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#1a1a1a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>🏪</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>{vendor.nom_boutique}</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{vendor.description}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 16 }}>
        {products.map(p => (
          <div key={p.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", overflow: "hidden" }}>
            <div style={{ height: 140, background: "#f8f7f4", overflow: "hidden" }}>
              <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
            </div>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{p.name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>{fmt(p.price)}</span>
                <button onClick={() => onAdd({ ...p, vendeur_id: vendor.id })} style={{ background: "#1a1a1a", color: "#fff", border: "none", padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>+ Ajouter</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {products.length === 0 && <p style={{ textAlign: "center", color: "#aaa", padding: 40 }}>Cette boutique n'a pas encore de produits.</p>}
    </div>
  );
}
