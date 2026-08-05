import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const supabase     = createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_EMAIL    = "kone91139@gmail.com";
const ADMIN_PASSWORD = "Souare46";
const COMMISSION     = 10;
const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

const VIOLET      = "#6B21A8";
const VIOLET_DARK = "#4C1D95";
const JAUNE       = "#D4AF37";
const BG          = "#F5F2FF";
const BORDER      = "#E8E0FF";

const STATUS_COLORS = {
  "En cours":   { bg: "#EDE9FE", color: "#6B21A8" },
  "En transit": { bg: "#FEF3C7", color: "#D4AF37" },
  "Livré":      { bg: "#D1FAE5", color: "#059669" },
  "Annulé":     { bg: "#FEE2E2", color: "#DC2626" },
};

const PIE_COLORS = [VIOLET, JAUNE, "#059669", "#DC2626"];
const CATEGORIES = ["Mode", "Électronique", "Maison", "Bureau"];

// ── Login ─────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [adminPwd, setAdminPwd] = useState("");
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleLogin = async () => {
    setError(""); setLoading(true);
    if (email !== ADMIN_EMAIL) { setError("Accès refusé — email non autorisé"); setLoading(false); return; }
    const { error: e } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (e) { setError("Email ou mot de passe incorrect"); return; }
    setStep(2);
  };

  const handleSecret = () => {
    if (adminPwd === ADMIN_PASSWORD) onLogin();
    else setError("Code secret incorrect");
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${VIOLET_DARK}, ${VIOLET}, ${JAUNE})`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px", border: "3px solid rgba(255,255,255,0.4)" }}>⚙️</div>
          <h1 style={{ fontWeight: 900, fontSize: 28, color: "#fff" }}>Marché+ Admin</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 4 }}>Tableau de bord administrateur</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 24, padding: "32px 28px", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
          {step === 1 ? (
            <>
              <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 20, color: "#1A0A2E" }}>Connexion</h2>
              {[{ ph: "Email admin", val: email, set: setEmail, type: "email" }, { ph: "Mot de passe", val: password, set: setPassword, type: "password" }].map(f => (
                <input key={f.ph} type={f.type} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${BORDER}`, fontSize: 14, marginBottom: 12, background: BG }} />
              ))}
              {error && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>✗ {error}</p>}
              <button onClick={handleLogin} disabled={loading} style={{ width: "100%", background: `linear-gradient(135deg, ${VIOLET}, ${VIOLET_DARK})`, color: "#fff", border: "none", padding: "13px", borderRadius: 99, fontWeight: 700, fontSize: 15, boxShadow: "0 8px 24px rgba(107,33,168,0.3)" }}>
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </>
          ) : (
            <>
              <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8, color: "#1A0A2E" }}>Code secret</h2>
              <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 20 }}>Entrez le code secret administrateur</p>
              <input type="password" placeholder="Code secret" value={adminPwd} onChange={e => setAdminPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSecret()}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${BORDER}`, fontSize: 14, marginBottom: 12, background: BG }} />
              {error && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>✗ {error}</p>}
              <button onClick={handleSecret} style={{ width: "100%", background: `linear-gradient(135deg, ${VIOLET}, ${VIOLET_DARK})`, color: "#fff", border: "none", padding: "13px", borderRadius: 99, fontWeight: 700, fontSize: 15 }}>
                Accéder au dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Image Uploader ────────────────────────────────────────────────
function ImageUploader({ currentImage, onImageChange, label = "Photo" }) {
  const [preview, setPreview] = useState(currentImage || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => { setPreview(currentImage || ""); }, [currentImage]);

  const handleFile = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setPreview(base64);
      const filename = `produits/${Date.now()}-${file.name.replace(/\s/g, "-")}`;
      const { data: uploadData, error } = await supabase.storage.from("images").upload(filename, file, { upsert: true });
      if (!error && uploadData) {
        const { data: urlData } = supabase.storage.from("images").getPublicUrl(filename);
        setPreview(urlData.publicUrl); onImageChange(urlData.publicUrl);
      } else { onImageChange(base64); }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: VIOLET, display: "block", marginBottom: 6 }}>{label}</label>}
      <div onClick={() => fileRef.current.click()} style={{ width: "100%", height: 110, borderRadius: 12, border: `2px dashed ${preview ? VIOLET : BORDER}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: preview ? "transparent" : BG, overflow: "hidden", position: "relative" }}>
        {preview ? (
          <>
            <img src={preview} alt="aperçu" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(107,33,168,0.6)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: ".2s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
              <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>📷 Changer</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 24, marginBottom: 4 }}>📷</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{uploading ? "Upload..." : "Cliquer pour ajouter"}</div>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────
function Dashboard({ onLogout }) {
  const [tab, setTab]         = useState("overview");
  const [products, setProducts] = useState([]);
  const [orders, setOrders]   = useState([]);
  const [vendors, setVendors] = useState([]);
  const [users, setUsers]     = useState([]);
  const [messages, setMessages] = useState([]);
  const [faqs, setFaqs]       = useState([]);
  const [period, setPeriod]   = useState(30);
  const [loading, setLoading] = useState(true);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const [livreurs, setLivreurs] = useState([]);
  const [showAddLivreur, setShowAddLivreur] = useState(false);
  const [newLivreur, setNewLivreur] = useState({});

  // Product form
  const EMPTY_PRODUCT = { name: "", category: "Mode", price: "", prix_original: "", reduction: "0", stock: "", image: "", img2: "", img3: "", description: "", sizes: "", colors: "", video: "" };
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct]         = useState(null);
  const [productForm, setProductForm]         = useState(EMPTY_PRODUCT);
  const [savingProduct, setSavingProduct]     = useState(false);

  // Messages
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [newMsg, setNewMsg]                 = useState("");
  const [adminUser, setAdminUser]           = useState(null);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: p }, { data: o }, { data: v }, { data: u }, { data: m }, { data: f }] = await Promise.all([
      supabase.from("produits").select("*").order("id"),
      supabase.from("commandes").select("*").order("created_at", { ascending: false }),
      supabase.from("vendeurs").select("*").order("created_at", { ascending: false }),
      supabase.from("utilisateurs").select("*").order("created_at", { ascending: false }),
      supabase.from("messages").select("*").order("created_at", { ascending: true }),
      supabase.from("faqs").select("*").order("id"),
      supabase.from("livreurs").select("*").order("created_at", { ascending: false }),
    ]);
    setProducts(p || []); setOrders(o || []); setVendors(v || []);
    setUsers(u || []); setMessages(m || []); setFaqs(f || []);
    const { data: liv } = await supabase.from("livreurs").select("*").order("created_at", { ascending: false });
    setLivreurs(liv || []);
    setUnreadMsgs((m || []).filter(msg => !msg.lu).length);
    const { data: au } = await supabase.auth.getUser();
    setAdminUser(au?.user);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  // Stats
  const now       = new Date();
  const cutoff    = new Date(now - period * 24 * 60 * 60 * 1000);
  const recent    = orders.filter(o => new Date(o.created_at || o.date) >= cutoff);
  const totalCA   = recent.reduce((s, o) => s + o.total, 0);
  const totalComm = Math.round(totalCA * COMMISSION / 100);
  const pending   = orders.filter(o => o.status === "En cours").length;

  // Chart data
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * 86400000);
    const label = d.toLocaleDateString("fr-FR", { weekday: "short" });
    const dayOrders = orders.filter(o => new Date(o.created_at || o.date).toDateString() === d.toDateString());
    return { label, ca: dayOrders.reduce((s, o) => s + o.total, 0), commandes: dayOrders.length };
  });

  const pieData = Object.entries(
    orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  // Product CRUD
  const openAddProduct = () => { setEditProduct(null); setProductForm(EMPTY_PRODUCT); setShowProductForm(true); };
  const openEditProduct = (p) => {
    setEditProduct(p);
    const imgs = p.images ? p.images.split(",") : [];
    setProductForm({ name: p.name, category: p.category, price: p.prix_original || p.price, prix_original: p.prix_original || "", reduction: p.reduction || "0", stock: p.stock, image: p.image || "", img2: imgs[1] || "", img3: imgs[2] || "", description: p.description || "", sizes: p.sizes || "", colors: p.colors || "", video: p.video || "" });
    setShowProductForm(true);
  };

  const saveProduct = async () => {
    setSavingProduct(true);
    const prixOriginal = parseInt(productForm.price) || 0;
    const reduction    = parseInt(productForm.reduction) || 0;
    const prixFinal    = reduction > 0 ? Math.round(prixOriginal * (1 - reduction / 100)) : prixOriginal;
    const images       = [productForm.image, productForm.img2, productForm.img3].filter(Boolean).join(",");
    const data = {
      name: productForm.name, category: productForm.category,
      price: prixFinal, prix_original: prixOriginal, reduction,
      stock: parseInt(productForm.stock) || 0,
      image: productForm.image, images,
      description: productForm.description,
      sizes: productForm.sizes, colors: productForm.colors,
      video: productForm.video || "",
      rating: editProduct?.rating || 5, reviews: editProduct?.reviews || 0,
    };
    if (editProduct) await supabase.from("produits").update(data).eq("id", editProduct.id);
    else await supabase.from("produits").insert(data);
    setSavingProduct(false); setShowProductForm(false); loadAll();
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    await supabase.from("produits").delete().eq("id", id);
    loadAll();
  };

  // Order status
  const updateOrderStatus = async (id, status) => {
    await supabase.from("commandes").update({ status }).eq("id", id);
    loadAll();
  };

  // Export Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(orders.map(o => ({
      ID: o.id, Date: o.date, Client: o.client_nom, Téléphone: o.client_telephone,
      Adresse: o.client_adresse, Paiement: o.paiement, Total: o.total, Statut: o.status,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Commandes");
    XLSX.writeFile(wb, `commandes-marche-plus-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // Messages
  const getVendorMessages = (vendorUserId) => messages.filter(m => m.expediteur_id === vendorUserId || m.destinataire_id === vendorUserId);

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedVendor || !adminUser) return;
    await supabase.from("messages").insert({ expediteur_id: adminUser.id, destinataire_id: selectedVendor.user_id, contenu: newMsg });
    setNewMsg(""); loadAll();
  };

  const TABS = [
    { key: "overview",  label: "Vue d'ensemble", icon: "📊" },
    { key: "products",  label: "Produits",        icon: "🛍" },
    { key: "orders",    label: "Commandes",       icon: "📦", badge: pending },
    { key: "vendors",   label: "Vendeurs",        icon: "🏪" },
    { key: "messages",  label: "Messages",        icon: "💬", badge: unreadMsgs },
    { key: "users",     label: "Utilisateurs",    icon: "👥" },
    { key: "faq",       label: "FAQ",             icon: "❓" },
    { key: "rapport",  label: "Rapport mensuel",  icon: "??" },
  ];

  const Sidebar = () => (
    <div style={{ width: 220, background: "#fff", borderRight: `1px solid ${BORDER}`, height: "calc(100vh - 64px)", position: "sticky", top: 64, flexShrink: 0, overflowY: "auto" }}>
      {TABS.map(t => (
        <button key={t.key} onClick={() => setTab(t.key)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "13px 20px", border: "none", background: tab === t.key ? `linear-gradient(135deg, ${VIOLET}15, ${VIOLET}08)` : "transparent", color: tab === t.key ? VIOLET : "#6B7280", fontWeight: tab === t.key ? 700 : 400, fontSize: 14, textAlign: "left", borderLeft: `3px solid ${tab === t.key ? VIOLET : "transparent"}`, cursor: "pointer" }}>
          <span>{t.icon}</span> {t.label}
          {t.badge > 0 && <span style={{ marginLeft: "auto", background: "#DC2626", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99 }}>{t.badge}</span>}
        </button>
      ))}
      <div style={{ margin: "16px", padding: "14px", background: BG, borderRadius: 12, border: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Résumé</div>
        {[{ label: "CA total", value: fmt(orders.reduce((s, o) => s + o.total, 0)) }, { label: "Commandes", value: orders.length }, { label: "Produits", value: products.length }, { label: "Vendeurs", value: vendors.length }].map(s => (
          <div key={s.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
            <span style={{ color: "#9CA3AF" }}>{s.label}</span>
            <span style={{ fontWeight: 700, color: VIOLET }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
      <Sidebar />
      <div className="admin-main" style={{ flex: 1, padding: "24px", overflowY: "auto", background: BG }}>

        {/* VUE D'ENSEMBLE */}
        {tab === "overview" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ fontWeight: 800, fontSize: 22, color: "#1A0A2E" }}>📊 Vue d'ensemble</h2>
              <div style={{ display: "flex", gap: 8 }}>
                {[7, 30, 90].map(d => (
                  <button key={d} onClick={() => setPeriod(d)} style={{ background: period === d ? VIOLET : "#fff", color: period === d ? "#fff" : "#6B7280", border: `1px solid ${period === d ? VIOLET : BORDER}`, padding: "7px 16px", borderRadius: 99, fontSize: 13, fontWeight: period === d ? 700 : 400 }}>{d}j</button>
                ))}
              </div>
            </div>

            {/* Stats cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
              {[
                { label: `CA (${period}j)`, value: fmt(totalCA), icon: "💰", color: VIOLET, bg: "#EDE9FE" },
                { label: "Commission", value: fmt(totalComm), icon: "📊", color: "#DC2626", bg: "#FEE2E2" },
                { label: "Commandes", value: recent.length, icon: "📦", color: JAUNE, bg: "#FEF3C7" },
                { label: "En attente", value: pending, icon: "⏳", color: "#1a56db", bg: "#e8f0fe" },
                { label: "Produits", value: products.length, icon: "🛍", color: "#059669", bg: "#D1FAE5" },
                { label: "Vendeurs", value: vendors.length, icon: "🏪", color: VIOLET, bg: "#EDE9FE" },
              ].map(s => (
                <div key={s.label} style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, padding: "18px 16px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: s.color }} />
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontWeight: 900, fontSize: 20, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="admin-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, padding: "20px" }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#1A0A2E" }}>📈 CA 7 derniers jours</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="caGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={VIOLET} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={VIOLET} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={v => fmt(v)} />
                    <Area type="monotone" dataKey="ca" stroke={VIOLET} fill="url(#caGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, padding: "20px" }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#1A0A2E" }}>📦 Statuts des commandes</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Commandes récentes */}
            <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, padding: "20px" }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#1A0A2E" }}>🕐 Commandes récentes</h3>
              {orders.slice(0, 5).map(o => (
                <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${BG}`, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: VIOLET }}>{o.id}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF" }}>{o.client_nom} · {o.date}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 800, color: JAUNE }}>{fmt(o.total)}</span>
                    <span style={{ ...STATUS_COLORS[o.status], background: STATUS_COLORS[o.status]?.bg, color: STATUS_COLORS[o.status]?.color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PRODUITS */}
        {tab === "products" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 22, color: "#1A0A2E" }}>🛍 Produits</h2>
                <p style={{ fontSize: 13, color: "#9CA3AF" }}>{products.length} produits en ligne</p>
              </div>
              <button onClick={openAddProduct} style={{ background: `linear-gradient(135deg, ${VIOLET}, ${VIOLET_DARK})`, color: "#fff", border: "none", padding: "11px 22px", borderRadius: 99, fontWeight: 700, fontSize: 14, boxShadow: "0 4px 14px rgba(107,33,168,0.3)" }}>
                + Ajouter un produit
              </button>
            </div>

            {showProductForm && (
              <div style={{ background: "#fff", borderRadius: 16, border: `1.5px solid ${VIOLET}`, padding: "24px", marginBottom: 20, boxShadow: "0 8px 30px rgba(107,33,168,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 800, fontSize: 17, color: VIOLET }}>{editProduct ? "✏️ Modifier le produit" : "➕ Nouveau produit"}</h3>
                  <button onClick={() => setShowProductForm(false)} style={{ background: "none", border: "none", fontSize: 22, color: "#9CA3AF", cursor: "pointer" }}>×</button>
                </div>

                {/* Photos */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <ImageUploader currentImage={productForm.image} onImageChange={url => setProductForm(p => ({ ...p, image: url }))} label="📷 Photo principale *" />
                  <ImageUploader currentImage={productForm.img2} onImageChange={url => setProductForm(p => ({ ...p, img2: url }))} label="📷 Photo 2" />
                  <ImageUploader currentImage={productForm.img3} onImageChange={url => setProductForm(p => ({ ...p, img3: url }))} label="📷 Photo 3" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
                  {[
                    { label: "Nom du produit *", key: "name", type: "text", placeholder: "Ex: Sac à main" },
                    { label: "Prix original (FCFA) *", key: "price", type: "number", placeholder: "Ex: 15000" },
                    { label: "Réduction (%)", key: "reduction", type: "number", placeholder: "Ex: 20" },
                    { label: "Stock", key: "stock", type: "number", placeholder: "Ex: 10" },
                    { label: "Tailles (virgule)", key: "sizes", type: "text", placeholder: "S,M,L ou 38,39,40" },
                    { label: "Couleurs (virgule)", key: "colors", type: "text", placeholder: "Noir,Blanc,Rouge" },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: VIOLET, display: "block", marginBottom: 6 }}>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder} value={productForm[f.key]} onChange={e => setProductForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${BORDER}`, fontSize: 14, background: BG }} />
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: VIOLET, display: "block", marginBottom: 6 }}>Catégorie</label>
                    <select value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${BORDER}`, fontSize: 14, background: BG }}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: VIOLET, display: "block", marginBottom: 6 }}>🎥 URL Vidéo (YouTube)</label>
                    <input placeholder="https://www.youtube.com/watch?v=..." value={productForm.video} onChange={e => setProductForm(p => ({ ...p, video: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${BORDER}`, fontSize: 14, background: BG }} />
                  </div>
                </div>

                {productForm.price && parseInt(productForm.reduction) > 0 && (
                  <div style={{ background: "#FEF3C7", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "line-through" }}>{fmt(parseInt(productForm.price))}</span>
                    <span style={{ fontWeight: 800, color: JAUNE }}>{fmt(Math.round(parseInt(productForm.price) * (1 - parseInt(productForm.reduction) / 100)))}</span>
                    <span style={{ background: "#DC2626", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>-{productForm.reduction}%</span>
                  </div>
                )}

                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: VIOLET, display: "block", marginBottom: 6 }}>Description</label>
                  <textarea placeholder="Description détaillée du produit..." value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))}
                    rows={3} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${BORDER}`, fontSize: 14, fontFamily: "inherit", resize: "vertical", background: BG }} />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={saveProduct} disabled={savingProduct} style={{ flex: 1, background: "linear-gradient(135deg, #059669, #047857)", color: "#fff", border: "none", padding: "13px", borderRadius: 99, fontWeight: 700, fontSize: 15 }}>
                    {savingProduct ? "Enregistrement..." : `✓ ${editProduct ? "Modifier" : "Publier"}`}
                  </button>
                  <button onClick={() => setShowProductForm(false)} style={{ background: BG, color: "#6B7280", border: "none", padding: "13px 20px", borderRadius: 99 }}>Annuler</button>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 14 }}>
              {products.map(p => (
                <div key={p.id} style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                  <div style={{ height: 160, background: BG, overflow: "hidden", position: "relative" }}>
                    {p.image ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🛍</div>}
                    {p.reduction > 0 && <div style={{ position: "absolute", top: 8, left: 8, background: "#DC2626", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99 }}>-{p.reduction}%</div>}
                    <div style={{ position: "absolute", top: 8, right: 8, background: p.stock < 10 ? "#FEE2E2" : "#D1FAE5", color: p.stock < 10 ? "#DC2626" : "#059669", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>Stock: {p.stock}</div>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, color: VIOLET, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{p.category}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{p.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <span style={{ fontWeight: 900, fontSize: 15, color: JAUNE }}>{fmt(p.price)}</span>
                      {p.prix_original && p.prix_original !== p.price && <span style={{ fontSize: 11, color: "#9CA3AF", textDecoration: "line-through" }}>{fmt(p.prix_original)}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEditProduct(p)} style={{ flex: 1, background: "#EDE9FE", color: VIOLET, border: "none", padding: "7px", borderRadius: 9, fontSize: 12, fontWeight: 600 }}>✏️ Modifier</button>
                      <button onClick={() => deleteProduct(p.id)} style={{ background: "#FEE2E2", color: "#DC2626", border: "none", padding: "7px 10px", borderRadius: 9 }}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* COMMANDES */}
        {tab === "orders" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 22, color: "#1A0A2E" }}>📦 Commandes</h2>
                <p style={{ fontSize: 13, color: "#9CA3AF" }}>{orders.length} commandes au total</p>
              </div>
              <button onClick={exportExcel} style={{ background: "linear-gradient(135deg, #059669, #047857)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 99, fontWeight: 600, fontSize: 14 }}>
                📊 Exporter Excel
              </button>
            </div>
            {orders.map(o => (
              <div key={o.id} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${BORDER}`, padding: "16px 20px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: VIOLET }}>{o.id}</div>
                    <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>👤 {o.client_nom} · 📞 {o.client_telephone}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>📍 {o.client_adresse} · 💳 {o.paiement} · 📅 {o.date}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 900, fontSize: 18, color: JAUNE }}>{fmt(o.total)}</div>
                    <div style={{ background: STATUS_COLORS[o.status]?.bg || "#F5F2FF", color: STATUS_COLORS[o.status]?.color || VIOLET, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 99, marginTop: 4, display: "inline-block" }}>{o.status}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["En cours", "En transit", "Livré", "Annulé"].map(s => (
                    <button key={s} onClick={() => updateOrderStatus(o.id, s)} style={{ background: o.status === s ? VIOLET : "#F5F2FF", color: o.status === s ? "#fff" : "#6B7280", border: "none", padding: "6px 12px", borderRadius: 99, fontSize: 12, fontWeight: o.status === s ? 700 : 400 }}>{s}</button>
                  ))}
                  <button onClick={() => window.open(`https://wa.me/${o.client_telephone?.replace(/\D/g,"")}?text=${encodeURIComponent(`Bonjour ${o.client_nom}, votre commande ${o.id} est en cours de traitement. Merci pour votre confiance ! 🛍 Marché+`)}`, "_blank")}
                    style={{ background: "#25D366", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>📱 WhatsApp</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* VENDEURS */}
        {tab === "vendors" && (
          <>
            <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 20, color: "#1A0A2E" }}>🏪 Vendeurs ({vendors.length})</h2>
            {vendors.map(v => (
              <div key={v.id} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${BORDER}`, padding: "16px 20px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: BG, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {v.logo ? <img src={v.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🏪"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{v.nom_boutique}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>📞 {v.whatsapp} · Slug: {v.slug}</div>
                  {v.description && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{v.description}</div>}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ background: v.statut === "approuve" ? "#D1FAE5" : "#FEE2E2", color: v.statut === "approuve" ? "#059669" : "#DC2626", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 99 }}>
                    {v.statut === "approuve" ? "✓ Approuvé" : "✗ Suspendu"}
                  </span>
                  <button onClick={async () => { await supabase.from("vendeurs").update({ statut: v.statut === "approuve" ? "suspendu" : "approuve" }).eq("id", v.id); loadAll(); }}
                    style={{ background: v.statut === "approuve" ? "#FEE2E2" : "#D1FAE5", color: v.statut === "approuve" ? "#DC2626" : "#059669", border: "none", padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                    {v.statut === "approuve" ? "Suspendre" : "Approuver"}
                  </button>
                  <button onClick={() => {
                    const ventes = orders.filter(o => o.vendeur_id === v.id).reduce((s, o) => s + o.total, 0);
                    const commission = Math.round(ventes * 0.1);
                    const msg = `Bonjour ${v.nom_boutique} !\n\n📊 *Récapitulatif mensuel — Marché+*\n\n💰 Total ventes : ${fmt(ventes)}\n📉 Commission (10%) : ${fmt(commission)}\n✅ Gains nets : ${fmt(ventes - commission)}\n\nMerci d'envoyer *${fmt(commission)}* sur Orange Money au *91 09 05 23* avant le 05 du mois.\n\nMerci ! 🛍 Marché+`;
                    window.open(`https://wa.me/${v.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
                  }} style={{ background: "#25D366", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    📱 Récap WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* MESSAGES */}
        {tab === "messages" && (
          <>
            <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 20, color: "#1A0A2E" }}>💬 Messages vendeurs</h2>
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, height: "calc(100vh - 200px)" }}>
              {/* Liste vendeurs */}
              <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, fontWeight: 700, fontSize: 14, color: VIOLET }}>Vendeurs</div>
                <div style={{ overflowY: "auto", flex: 1 }}>
                  {vendors.map(v => {
                    const vMsgs = getVendorMessages(v.user_id);
                    const unread = vMsgs.filter(m => !m.lu && m.expediteur_id === v.user_id).length;
                    return (
                      <div key={v.id} onClick={() => setSelectedVendor(v)} style={{ padding: "12px 16px", borderBottom: `1px solid ${BG}`, cursor: "pointer", background: selectedVendor?.id === v.id ? "#EDE9FE" : "transparent", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: BG, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                          {v.logo ? <img src={v.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🏪"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{v.nom_boutique}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF" }}>{vMsgs.length} message{vMsgs.length > 1 ? "s" : ""}</div>
                        </div>
                        {unread > 0 && <span style={{ background: "#DC2626", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99 }}>{unread}</span>}
                      </div>
                    );
                  })}
                  {vendors.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF", fontSize: 13 }}>Aucun vendeur</div>}
                </div>
              </div>

              {/* Zone chat */}
              <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {selectedVendor ? (
                  <>
                    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>🏪 {selectedVendor.nom_boutique}</div>
                      <div style={{ fontSize: 12, color: "#9CA3AF" }}>📞 {selectedVendor.whatsapp}</div>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                      {getVendorMessages(selectedVendor.user_id).map((m, i) => {
                        const isAdmin = m.expediteur_id === adminUser?.id;
                        return (
                          <div key={i} style={{ display: "flex", justifyContent: isAdmin ? "flex-end" : "flex-start" }}>
                            <div style={{ maxWidth: "70%", background: isAdmin ? `linear-gradient(135deg, ${VIOLET}, ${VIOLET_DARK})` : BG, color: isAdmin ? "#fff" : "#1A0A2E", padding: "10px 14px", borderRadius: isAdmin ? "16px 16px 4px 16px" : "16px 16px 16px 4px", fontSize: 14, lineHeight: 1.5 }}>
                              {m.contenu}
                              <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: "right" }}>
                                {new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {getVendorMessages(selectedVendor.user_id).length === 0 && (
                        <div style={{ textAlign: "center", margin: "auto", color: "#9CA3AF" }}>
                          <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                          <div>Aucun message avec ce vendeur</div>
                        </div>
                      )}
                    </div>
                    <div style={{ borderTop: `1px solid ${BORDER}`, padding: "12px 16px", display: "flex", gap: 10 }}>
                      <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Écrire un message..."
                        style={{ flex: 1, padding: "10px 16px", borderRadius: 99, border: `1.5px solid ${BORDER}`, fontSize: 14, background: BG }} />
                      <button onClick={sendMessage} style={{ background: `linear-gradient(135deg, ${VIOLET}, ${VIOLET_DARK})`, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 99, fontWeight: 600, fontSize: 14 }}>Envoyer</button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9CA3AF", flexDirection: "column", gap: 12 }}>
                    <div style={{ fontSize: 48 }}>💬</div>
                    <div>Sélectionnez un vendeur pour voir les messages</div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* UTILISATEURS */}
        {tab === "users" && (
          <>
            <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 20, color: "#1A0A2E" }}>👥 Utilisateurs ({users.length})</h2>
            {users.map(u => (
              <div key={u.id} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${BORDER}`, padding: "14px 18px", marginBottom: 8, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${VIOLET}, ${JAUNE})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                  {u.email?.[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{u.email}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>Inscrit le {new Date(u.created_at).toLocaleDateString("fr-FR")}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ background: u.statut === "actif" ? "#D1FAE5" : "#FEE2E2", color: u.statut === "actif" ? "#059669" : "#DC2626", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>
                    {u.statut === "actif" ? "Actif" : "Bloqué"}
                  </span>
                  <button onClick={async () => { await supabase.from("utilisateurs").update({ statut: u.statut === "actif" ? "bloque" : "actif" }).eq("id", u.id); loadAll(); }}
                    style={{ background: u.statut === "actif" ? "#FEE2E2" : "#D1FAE5", color: u.statut === "actif" ? "#DC2626" : "#059669", border: "none", padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                    {u.statut === "actif" ? "Bloquer" : "Débloquer"}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* FAQ */}
        
        {tab === "livreurs" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 22, color: "#1A0A2E" }}>🚚 Livreurs</h2>
                <p style={{ fontSize: 13, color: "#9CA3AF" }}>{livreurs.length} livreur{livreurs.length > 1 ? "s" : ""} enregistré{livreurs.length > 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => setShowAddLivreur(true)} style={{ background: `linear-gradient(135deg, ${VIOLET}, ${VIOLET_DARK})`, color: "#fff", border: "none", padding: "11px 22px", borderRadius: 99, fontWeight: 700, fontSize: 14 }}>
                + Ajouter un livreur
              </button>
            </div>

            {showAddLivreur && (
              <div style={{ background: "#fff", borderRadius: 16, border: `1.5px solid ${VIOLET}`, padding: "24px", marginBottom: 20 }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: VIOLET, marginBottom: 16 }}>➕ Nouveau livreur</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  {[
                    { label: "Nom complet", key: "nom", placeholder: "Ex: Moussa Coulibaly" },
                    { label: "Téléphone", key: "telephone", placeholder: "Ex: +223 91 00 00 00" },
                    { label: "Zone de livraison", key: "zone", placeholder: "Ex: Bamako centre, ACI 2000" },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: VIOLET, display: "block", marginBottom: 6 }}>{f.label}</label>
                      <input placeholder={f.placeholder} value={newLivreur[f.key] || ""} onChange={e => setNewLivreur(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${BORDER}`, fontSize: 14, background: BG }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={async () => {
                    if (!newLivreur.nom || !newLivreur.telephone) return;
                    await supabase.from("livreurs").insert(newLivreur);
                    setNewLivreur({}); setShowAddLivreur(false); loadAll();
                  }} style={{ background: "linear-gradient(135deg, #059669, #047857)", color: "#fff", border: "none", padding: "11px 24px", borderRadius: 99, fontWeight: 700, fontSize: 14 }}>✓ Enregistrer</button>
                  <button onClick={() => setShowAddLivreur(false)} style={{ background: BG, color: "#6B7280", border: "none", padding: "11px 20px", borderRadius: 99 }}>Annuler</button>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 14, marginBottom: 24 }}>
              {livreurs.map(l => (
                <div key={l.id} style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, padding: "18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${VIOLET}, ${JAUNE})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>
                      {l.nom[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{l.nom}</div>
                      <div style={{ fontSize: 12, color: "#9CA3AF" }}>📞 {l.telephone}</div>
                      {l.zone && <div style={{ fontSize: 12, color: "#9CA3AF" }}>📍 {l.zone}</div>}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ background: l.statut === "disponible" ? "#D1FAE5" : "#FEE2E2", color: l.statut === "disponible" ? "#059669" : "#DC2626", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 99 }}>
                      {l.statut === "disponible" ? "✓ Disponible" : "✗ Occupé"}
                    </span>
                    <span style={{ fontSize: 12, color: "#9CA3AF" }}>📦 {l.commandes_livrees || 0} livraisons</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={async () => { await supabase.from("livreurs").update({ statut: l.statut === "disponible" ? "occupe" : "disponible" }).eq("id", l.id); loadAll(); }}
                      style={{ flex: 1, background: "#EDE9FE", color: VIOLET, border: "none", padding: "8px", borderRadius: 9, fontSize: 12, fontWeight: 600 }}>
                      {l.statut === "disponible" ? "Marquer occupé" : "Marquer disponible"}
                    </button>
                    <button onClick={async () => { if (!window.confirm("Supprimer ?")) return; await supabase.from("livreurs").delete().eq("id", l.id); loadAll(); }}
                      style={{ background: "#FEE2E2", color: "#DC2626", border: "none", padding: "8px 12px", borderRadius: 9 }}>🗑</button>
                    <button onClick={() => window.open(`https://wa.me/${l.telephone?.replace(/\D/g,"")}`, "_blank")}
                      style={{ background: "#25D366", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 9 }}>📱</button>
                  </div>
                </div>
              ))}
              {livreurs.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "#9CA3AF", gridColumn: "1/-1" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🚚</div>
                  <div>Aucun livreur enregistré</div>
                </div>
              )}
            </div>

            <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, padding: "20px" }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: "#1A0A2E" }}>📦 Assigner un livreur aux commandes en attente</h3>
              {orders.filter(o => o.status === "En cours").length === 0 ? (
                <p style={{ color: "#9CA3AF", fontSize: 13 }}>Aucune commande en attente</p>
              ) : orders.filter(o => o.status === "En cours").map(o => (
                <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${BG}`, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: VIOLET }}>{o.id}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF" }}>👤 {o.client_nom} · 📍 {o.client_adresse}</div>
                  </div>
                  <select onChange={async e => {
                    if (!e.target.value) return;
                    await supabase.from("livraisons").insert({ commande_id: o.id, livreur_id: e.target.value });
                    await supabase.from("commandes").update({ status: "En transit" }).eq("id", o.id);
                    await supabase.from("livreurs").update({ statut: "occupe" }).eq("id", e.target.value);
                    loadAll();
                  }} defaultValue="" style={{ padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${BORDER}`, fontSize: 13, background: BG }}>
                    <option value="">Choisir un livreur</option>
                    {livreurs.filter(l => l.statut === "disponible").map(l => (
                      <option key={l.id} value={l.id}>{l.nom} — {l.zone}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "rapport" && (<div style={{ maxWidth: 900, margin: "0 auto" }}><h2 style={{ fontWeight: 800, fontSize: 22, color: "#1A0A2E", marginBottom: 20 }}>?? Rapport mensuel</h2><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>{[{ label: "CA total", value: fmt(orders.reduce((s,o)=>s+o.total,0)), icon: "??", color: "#6B21A8" },{ label: "Commandes", value: orders.length, icon: "??", color: "#D4AF37" },{ label: "Clients", value: users.length, icon: "??", color: "#059669" },{ label: "Vendeurs actifs", value: vendors.filter(v=>v.statut==="approuve").length, icon: "??", color: "#1a56db" },{ label: "Livrees", value: orders.filter(o=>o.status==="Livree").length, icon: "?", color: "#059669" },{ label: "Annulees", value: orders.filter(o=>o.status==="Annule").length, icon: "?", color: "#DC2626" }].map(s=>(<div key={s.label} style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E0FF", padding: "18px 16px" }}><div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div><div style={{ fontWeight: 900, fontSize: 20, color: s.color }}>{s.value}</div><div style={{ fontSize: 12, color: "#9CA3AF" }}>{s.label}</div></div>))}</div></div>)}
{tab === "faq" && (
          <>
            <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 20, color: "#1A0A2E" }}>❓ FAQ / Contact</h2>
            <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, padding: "20px" }}>
              <p style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center", padding: "40px 0" }}>Section FAQ — Ajoutez vos questions fréquentes</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Admin ────────────────────────────────────────────────────
export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${VIOLET_DARK}, ${VIOLET})`, padding: "0 24px", height: 64, display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 20px rgba(107,33,168,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚙️</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: "#fff" }}>Marché+</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Tableau de bord admin</div>
          </div>
        </div>
        {loggedIn && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            <a href="/" target="_blank" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", padding: "7px 16px", borderRadius: 99, fontSize: 13, textDecoration: "none", fontWeight: 600 }}>🔗 Boutique</a>
            <button onClick={() => { supabase.auth.signOut(); setLoggedIn(false); }} style={{ background: "#DC2626", color: "#fff", border: "none", padding: "7px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600 }}>Déconnexion</button>
          </div>
        )}
      </div>

      {!loggedIn ? <AdminLogin onLogin={() => setLoggedIn(true)} /> : <Dashboard onLogout={() => setLoggedIn(false)} />}
    </div>
  );
}
