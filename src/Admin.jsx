import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const supabase    = createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_EMAIL    = "kone91139@gmail.com";
const ADMIN_PASSWORD = "Souare46";
const COMMISSION     = 10;

const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

const STATUS_COLORS = {
  "En cours":   { bg: "#e8f0fe", color: "#1a56db" },
  "En transit": { bg: "#fff8e1", color: "#b76e00" },
  "Livré":      { bg: "#e6f7ef", color: "#0a7c45" },
  "Annulé":     { bg: "#fce8e8", color: "#c0392b" },
};

const PIE_COLORS = ["#FF6B00", "#1a56db", "#0a7c45", "#c0392b"];
const CATEGORIES = ["Mode", "Électronique", "Maison", "Bureau"];

// ─── Login Admin ──────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminPwd, setAdminPwd] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError(""); setLoading(true);
    if (email !== ADMIN_EMAIL) { setError("Accès refusé — email non autorisé"); setLoading(false); return; }
    const { data, error: e } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (e) { setError("Email ou mot de passe incorrect"); return; }
    setStep(2);
  };

  const handleAdminPwd = () => {
    if (adminPwd === ADMIN_PASSWORD) onLogin();
    else setError("Mot de passe admin incorrect");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #ebebeb", padding: "40px 36px", width: "100%", maxWidth: 420, boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🔐</div>
          <h2 style={{ fontWeight: 800, fontSize: 22 }}>Marché+ Admin</h2>
          <p style={{ fontSize: 13, color: "#888", marginTop: 6 }}>{step === 1 ? "Connectez-vous avec votre compte" : "Entrez le mot de passe administrateur"}</p>
        </div>

        {step === 1 && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Email</label>
              <input type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Mot de passe</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14 }} />
            </div>
            {error && <div style={{ background: "#fce8e8", color: "#c0392b", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>✗ {error}</div>}
            <button onClick={handleLogin} disabled={loading} style={{ width: "100%", background: "#FF6B00", color: "#fff", border: "none", padding: "14px", borderRadius: 12, fontWeight: 700, fontSize: 15, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Connexion..." : "Se connecter →"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Mot de passe Admin</label>
              <input type="password" placeholder="Mot de passe admin" value={adminPwd} onChange={e => setAdminPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdminPwd()} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14 }} />
            </div>
            {error && <div style={{ background: "#fce8e8", color: "#c0392b", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>✗ {error}</div>}
            <button onClick={handleAdminPwd} style={{ width: "100%", background: "#FF6B00", color: "#fff", border: "none", padding: "14px", borderRadius: 12, fontWeight: 700, fontSize: 15 }}>
              Accéder au tableau de bord →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard Admin ──────────────────────────────────────────────
function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7j");

  // Form ajout/modif produit
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: "", category: "Mode", price: "", stock: "", image: "", description: "", sizes: "", colors: "" });

  const loadData = async () => {
    setLoading(true);
    const [{ data: o }, { data: p }, { data: v }] = await Promise.all([
      supabase.from("commandes").select("*").order("created_at", { ascending: false }),
      supabase.from("produits").select("*").order("id"),
      supabase.from("vendeurs").select("*").order("created_at", { ascending: false }),
    ]);
    setOrders(o || []);
    setProducts(p || []);
    setVendors(v || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // Stats
  const totalRevenue  = orders.reduce((s, o) => s + o.total, 0);
  const delivered     = orders.filter(o => o.status === "Livré").length;
  const pendingOrders = orders.filter(o => o.status === "En cours").length;
  const lowStock      = products.filter(p => p.stock < 10);

  const periodDays = { "7j": 7, "30j": 30, "90j": 90 }[period];
  const revenueByDay = (() => {
    const days = [];
    const now = new Date();
    for (let i = periodDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayOrders = orders.filter(o => o.date === dateStr);
      days.push({ date: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), revenue: dayOrders.reduce((s, o) => s + o.total, 0), orders: dayOrders.length });
    }
    return days;
  })();

  const statusPieData = ["En cours", "En transit", "Livré", "Annulé"].map(s => ({ name: s, value: orders.filter(o => o.status === s).length })).filter(d => d.value > 0);

  // Produit CRUD
  const openAddProduct = () => {
    setEditProduct(null);
    setProductForm({ name: "", category: "Mode", price: "", stock: "", image: "", description: "", sizes: "", colors: "" });
    setShowProductForm(true);
  };

  const openEditProduct = (p) => {
    setEditProduct(p);
    setProductForm({
      name: p.name, category: p.category, price: p.price, stock: p.stock,
      image: p.image || "", description: p.description || "",
      sizes: Array.isArray(p.sizes) ? p.sizes.join(",") : (p.sizes || ""),
      colors: Array.isArray(p.colors) ? p.colors.join(",") : (p.colors || ""),
    });
    setShowProductForm(true);
  };

  const saveProduct = async () => {
    const data = {
      name: productForm.name, category: productForm.category,
      price: parseInt(productForm.price) || 0, stock: parseInt(productForm.stock) || 0,
      image: productForm.image, description: productForm.description,
      sizes: productForm.sizes, colors: productForm.colors,
      images: productForm.image,
      rating: editProduct?.rating || 5, reviews: editProduct?.reviews || 0,
    };
    if (editProduct) {
      await supabase.from("produits").update(data).eq("id", editProduct.id);
    } else {
      await supabase.from("produits").insert(data);
    }
    setShowProductForm(false);
    loadData();
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    await supabase.from("produits").delete().eq("id", id);
    loadData();
  };

  const updateOrderStatus = async (id, status) => {
    await supabase.from("commandes").update({ status }).eq("id", id);
    setOrders(os => os.map(o => o.id === id ? { ...o, status } : o));
  };

  const updateVendorStatus = async (id, statut) => {
    await supabase.from("vendeurs").update({ statut }).eq("id", id);
    setVendors(vs => vs.map(v => v.id === id ? { ...v, statut } : v));
  };

  const TABS = [
    { key: "overview",  label: "📊 Vue d'ensemble" },
    { key: "products",  label: "🛍 Produits" },
    { key: "orders",    label: "📦 Commandes" },
    { key: "vendors",   label: "🏪 Vendeurs" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4" }}>
      {/* Header */}
      <header style={{ background: "#1a1a1a", color: "#fff", padding: "0 28px", height: 60, display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 100 }}>
        <span style={{ fontWeight: 800, fontSize: 18, color: "#FF6B00" }}>🛍 Marché+</span>
        <span style={{ fontSize: 13, opacity: 0.6, marginRight: "auto" }}>Tableau de bord Admin</span>
        {pendingOrders > 0 && (
          <span style={{ background: "#FF6B00", color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99 }}>
            {pendingOrders} commande{pendingOrders > 1 ? "s" : ""} en attente
          </span>
        )}
        <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: "7px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
          Déconnexion
        </button>
      </header>

      <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
        {/* Sidebar */}
        <aside style={{ width: 220, background: "#fff", borderRight: "1px solid #ebebeb", padding: "20px 12px", flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              width: "100%", textAlign: "left", padding: "11px 14px", borderRadius: 10,
              background: tab === t.key ? "#FFF3E8" : "transparent",
              color: tab === t.key ? "#FF6B00" : "#555",
              border: "none", fontWeight: tab === t.key ? 700 : 400,
              fontSize: 14, marginBottom: 4, cursor: "pointer",
              borderLeft: tab === t.key ? "3px solid #FF6B00" : "3px solid transparent",
            }}>{t.label}</button>
          ))}

          {/* Lien vers la boutique */}
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #ebebeb" }}>
            <a href="https://marche-plus.vercel.app" target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#888", textDecoration: "none", display: "block", padding: "8px 14px" }}>
              🔗 Voir la boutique
            </a>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: "28px 24px", overflow: "auto" }}>

          {/* VUE D'ENSEMBLE */}
          {tab === "overview" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                <h2 style={{ fontWeight: 800, fontSize: 20 }}>Vue d'ensemble</h2>
                <div style={{ display: "flex", gap: 8 }}>
                  {["7j","30j","90j"].map(p => (
                    <button key={p} onClick={() => setPeriod(p)} style={{ padding: "6px 16px", borderRadius: 99, border: `1.5px solid ${period === p ? "#FF6B00" : "#e0e0e0"}`, background: period === p ? "#FF6B00" : "#fff", color: period === p ? "#fff" : "#666", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{p}</button>
                  ))}
                </div>
              </div>

              {/* Métriques */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
                {[
                  { label: "Chiffre d'affaires", value: fmt(totalRevenue), icon: "💰", bg: "#e6f7ef", color: "#0a7c45" },
                  { label: "Commandes totales",  value: orders.length,     icon: "📦", bg: "#e8f0fe", color: "#1a56db" },
                  { label: "Livrées",            value: delivered,         icon: "✅", bg: "#fff8e1", color: "#b76e00" },
                  { label: "En attente",         value: pendingOrders,     icon: "⏳", bg: "#fce8f0", color: "#c0392b" },
                  { label: "Produits actifs",    value: products.length,   icon: "🏷",  bg: "#f3f0ff", color: "#7c3aed" },
                  { label: "Vendeurs",           value: vendors.length,    icon: "🏪", bg: "#f0f9ff", color: "#0369a1" },
                ].map(m => (
                  <div key={m.label} style={{ background: m.bg, borderRadius: 14, padding: "18px 16px" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 20, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 3 }}>{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Courbe CA */}
              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", padding: "20px", marginBottom: 20 }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📈 Évolution du chiffre d'affaires</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={revenueByDay}>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} width={60} tickFormatter={v => v >= 1000 ? (v/1000) + "k" : v} />
                    <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 10, border: "1px solid #ebebeb", fontSize: 12 }} />
                    <Area type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={2.5} fill="url(#grad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                {/* Barres commandes */}
                <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", padding: "20px" }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📦 Commandes par jour</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={revenueByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#aaa" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#aaa" }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #ebebeb", fontSize: 12 }} />
                      <Bar dataKey="orders" fill="#FF6B00" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Camembert statuts */}
                <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", padding: "20px" }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>🥧 Statuts des commandes</h3>
                  {statusPieData.length === 0 ? <p style={{ color: "#aaa", fontSize: 13 }}>Aucune commande.</p> : (
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={3}>
                          {statusPieData.map((entry, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #ebebeb", fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                    {statusPieData.map((d, i) => (
                      <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#666" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {d.name} ({d.value})
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stock faible */}
              {lowStock.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0d9d9", padding: "20px" }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#c0392b" }}>⚠️ Stock faible</h3>
                  {lowStock.map(p => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, padding: "10px 14px", background: "#fce8e8", borderRadius: 10 }}>
                      <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{p.name}</span>
                      <span style={{ fontSize: 12, color: "#c0392b", fontWeight: 700 }}>{p.stock} restant{p.stock > 1 ? "s" : ""}</span>
                      <button onClick={() => openEditProduct(p)} style={{ background: "#c0392b", color: "#fff", border: "none", padding: "5px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>Modifier</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* PRODUITS */}
          {tab === "products" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontWeight: 800, fontSize: 20 }}>Produits ({products.length})</h2>
                <button onClick={openAddProduct} style={{ background: "#FF6B00", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  + Ajouter un produit
                </button>
              </div>

              {showProductForm && (
                <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", padding: "24px", marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>{editProduct ? "✏️ Modifier le produit" : "➕ Nouveau produit"}</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {[
                      { label: "Nom du produit *", key: "name", type: "text", placeholder: "Ex: Sac à dos urbain" },
                      { label: "Prix (FCFA) *", key: "price", type: "number", placeholder: "Ex: 45000" },
                      { label: "Stock *", key: "stock", type: "number", placeholder: "Ex: 12" },
                      { label: "Image (chemin)", key: "image", type: "text", placeholder: "/images/produit.jpg" },
                      { label: "Tailles (séparées par virgule)", key: "sizes", type: "text", placeholder: "S,M,L ou 39,40,41" },
                      { label: "Couleurs (séparées par virgule)", key: "colors", type: "text", placeholder: "Noir,Blanc,Rouge" },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>{f.label}</label>
                        <input type={f.type} placeholder={f.placeholder} value={productForm[f.key]} onChange={e => setProductForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14 }} />
                      </div>
                    ))}
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Catégorie</label>
                      <select value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14 }}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Description</label>
                      <textarea placeholder="Description du produit..." value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, fontFamily: "inherit", resize: "vertical" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                    <button onClick={saveProduct} style={{ background: "#0a7c45", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                      ✓ {editProduct ? "Enregistrer" : "Publier le produit"}
                    </button>
                    <button onClick={() => setShowProductForm(false)} style={{ background: "#f4f4f4", color: "#555", border: "none", padding: "12px 24px", borderRadius: 10, fontWeight: 500, fontSize: 14, cursor: "pointer" }}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {loading ? <p style={{ color: "#aaa" }}>Chargement...</p> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {products.map(p => (
                    <div key={p.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #ebebeb", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", background: "#f8f7f4", flexShrink: 0 }}>
                        <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                      </div>
                      <div style={{ flex: 1, minWidth: 150 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "#888" }}>{p.category} · {fmt(p.price)}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, color: "#888" }}>Stock :</span>
                        <span style={{ fontWeight: 800, fontSize: 15, color: p.stock < 10 ? "#c0392b" : "#1a1a1a" }}>{p.stock}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openEditProduct(p)} style={{ background: "#e8f0fe", color: "#1a56db", border: "none", padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>✏️ Modifier</button>
                        <button onClick={() => deleteProduct(p.id)} style={{ background: "#fce8e8", color: "#c0392b", border: "none", padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>🗑 Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* COMMANDES */}
          {tab === "orders" && (
            <>
              <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 20 }}>Commandes ({orders.length})</h2>
              {loading ? <p style={{ color: "#aaa" }}>Chargement...</p> : orders.length === 0 ? (
                <p style={{ color: "#aaa" }}>Aucune commande pour le moment.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {orders.map(o => {
                    const sc = STATUS_COLORS[o.status] || { bg: "#f4f4f4", color: "#888" };
                    return (
                      <div key={o.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #ebebeb", padding: "16px 20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>{o.id}</div>
                            <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>👤 {o.client_nom} · 📞 {o.client_telephone}</div>
                            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>📍 {o.client_adresse} · 💳 {o.paiement}</div>
                            <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>📅 {o.date} · {o.items} article{o.items > 1 ? "s" : ""}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: 800, fontSize: 18 }}>{fmt(o.total)}</div>
                            <div style={{ fontSize: 11, color: "#aaa" }}>Commission: {fmt(Math.round(o.total * COMMISSION / 100))}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ background: sc.bg, color: sc.color, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 99 }}>{o.status}</span>
                          <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 12, cursor: "pointer" }}>
                            {["En cours", "En transit", "Livré", "Annulé"].map(s => <option key={s}>{s}</option>)}
                          </select>
                          <button onClick={() => window.open(`https://wa.me/${o.client_telephone}?text=${encodeURIComponent(`Bonjour ${o.client_nom}, votre commande ${o.id} est maintenant "${o.status}". Merci de votre confiance ! 🛍 Marché+`)}`, "_blank")} style={{ background: "#25D366", color: "#fff", border: "none", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            📱 WhatsApp
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* VENDEURS */}
          {tab === "vendors" && (
            <>
              <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 20 }}>Vendeurs ({vendors.length})</h2>
              {loading ? <p style={{ color: "#aaa" }}>Chargement...</p> : vendors.length === 0 ? (
                <p style={{ color: "#aaa" }}>Aucun vendeur inscrit pour le moment.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {vendors.map(v => (
                    <div key={v.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #ebebeb", padding: "16px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>🏪 {v.nom_boutique}</div>
                          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>📞 {v.whatsapp}</div>
                          <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>🔗 Slug: {v.slug}</div>
                          {v.description && <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{v.description}</div>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ background: v.statut === "approuve" ? "#e6f7ef" : "#fff8e1", color: v.statut === "approuve" ? "#0a7c45" : "#b76e00", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 99 }}>
                            {v.statut === "approuve" ? "✅ Approuvé" : "⏳ En attente"}
                          </span>
                          <select value={v.statut} onChange={e => updateVendorStatus(v.id, e.target.value)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 12, cursor: "pointer" }}>
                            <option value="approuve">Approuvé</option>
                            <option value="suspendu">Suspendu</option>
                            <option value="en_attente">En attente</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}

// ─── App Admin ────────────────────────────────────────────────────
export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(false);

  return loggedIn
    ? <AdminDashboard onLogout={() => { supabase.auth.signOut(); setLoggedIn(false); }} />
    : <AdminLogin onLogin={() => setLoggedIn(true)} />;
}
