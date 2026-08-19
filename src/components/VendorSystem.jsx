import { useState, useEffect, useRef } from "react";

const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const COMMISSION_RATE = 10;
const CATEGORIES = ["Mode", "Électronique", "Maison", "Bureau"];

// ─── Image Uploader ───────────────────────────────────────────────
function ImageUploader({ currentImage, onImageChange, supabase, label = "Photo" }) {
  const [preview, setPreview] = useState(currentImage || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => { setPreview(currentImage || ""); }, [currentImage]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setPreview(base64);
      const filename = `produits/${Date.now()}-${file.name.replace(/\s/g, "-")}`;
      const { data: uploadData, error } = await supabase.storage.from("images").upload(filename, file, { upsert: true });
      if (!error && uploadData) {
        const { data: urlData } = supabase.storage.from("images").getPublicUrl(filename);
        setPreview(urlData.publicUrl);
        onImageChange(urlData.publicUrl);
      } else {
        onImageChange(base64);
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#6B21A8", display: "block", marginBottom: 6 }}>{label}</label>
      <div onClick={() => fileRef.current.click()} style={{
        width: "100%", height: 120, borderRadius: 12,
        border: `2px dashed ${preview ? "#6B21A8" : "#E8E0FF"}`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        cursor: "pointer", background: preview ? "transparent" : "#F5F2FF", overflow: "hidden", position: "relative",
      }}>
        {preview ? (
          <>
            <img src={preview} alt="aperçu" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(107,33,168,0.6)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: ".2s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}>
              <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>📷 Changer</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{uploading ? "Upload..." : "Cliquer pour ajouter"}</div>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
    </div>
  );
}

// ─── Inscription Vendeur ──────────────────────────────────────────
export function VendorRegister({ supabase, user, onDone, onBack }) {
  const [form, setForm] = useState({ nom_boutique: "", whatsapp: "", description: "" });
  const [logo, setLogo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!form.nom_boutique.trim() || !form.whatsapp.trim()) { setError("Veuillez remplir tous les champs obligatoires"); return; }
    setLoading(true);
    const slug = slugify(form.nom_boutique) + "-" + Math.random().toString(36).slice(2, 6);
    const { data, error: insertError } = await supabase.from("vendeurs").insert({
      user_id: user.id, nom_boutique: form.nom_boutique, slug,
      whatsapp: form.whatsapp.replace(/\D/g, ""), description: form.description,
      logo, statut: "approuve",
    }).select().single();
    setLoading(false);
    if (insertError) { setError("Erreur : " + insertError.message); return; }
    onDone(data);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #F5F2FF 0%, #EDE9FE 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#6B21A8", fontSize: 14, cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>← Retour à Marché+</button>
        <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #E8E0FF", padding: "36px 32px", boxShadow: "0 20px 60px rgba(107,33,168,0.15)" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #6B21A8, #D4AF37)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px" }}>🏪</div>
            <h2 style={{ fontWeight: 900, fontSize: 24, color: "#1A0A2E", marginBottom: 6 }}>Créer votre boutique</h2>
            <p style={{ fontSize: 13, color: "#6B7280" }}>Rejoignez Marché+ et vendez à des milliers de clients</p>
          </div>
          <div style={{ background: "linear-gradient(135deg, #EDE9FE, #FEF3C7)", borderRadius: 12, padding: "14px 16px", marginBottom: 24, fontSize: 13, color: "#6B21A8", fontWeight: 500 }}>
            💡 Marché+ prélève une commission de <strong>{COMMISSION_RATE}%</strong> sur chaque vente
          </div>
          <div style={{ marginBottom: 20 }}>
            <ImageUploader currentImage={logo} onImageChange={setLogo} supabase={supabase} label="Logo de votre boutique (optionnel)" />
          </div>
          {[
            { label: "Nom de votre boutique *", key: "nom_boutique", placeholder: "Ex: Chez Aminata", type: "text" },
            { label: "Numéro WhatsApp *", key: "whatsapp", placeholder: "Ex: 22391000000", type: "tel" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#1A0A2E", display: "block", marginBottom: 6 }}>{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #E8E0FF", fontSize: 14, background: "#F5F2FF" }} />
            </div>
          ))}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#1A0A2E", display: "block", marginBottom: 6 }}>Description</label>
            <textarea placeholder="Parlez de vos produits..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #E8E0FF", fontSize: 14, fontFamily: "inherit", resize: "vertical", background: "#F5F2FF" }} />
          </div>
          {error && <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>✗ {error}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg, #6B21A8, #4C1D95)", color: "#fff", border: "none", padding: "15px", borderRadius: 99, fontWeight: 700, fontSize: 16, cursor: "pointer", opacity: loading ? 0.7 : 1, boxShadow: "0 8px 24px rgba(107,33,168,0.35)" }}>
            {loading ? "Création..." : "🚀 Créer ma boutique"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Vendeur ────────────────────────────────────────────
export function VendorDashboard({ supabase, vendor, onBack, user }) {
  const [tab, setTab] = useState("overview");
  const [myProducts, setMyProducts] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "", category: "Mode", description: "", image: "", img2: "", img3: "", reduction: "0" });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const loadData = async () => {
    setLoading(true);
    const [{ data: products }, { data: orders }, { data: msgs }] = await Promise.all([
      supabase.from("produits").select("*").eq("vendeur_id", vendor.id),
      supabase.from("commandes").select("*").eq("vendeur_id", vendor.id).order("created_at", { ascending: false }),
      supabase.from("messages").select("*").or(`expediteur_id.eq.${user.id},destinataire_id.eq.${user.id}`).order("created_at", { ascending: true }),
    ]);
    setMyProducts(products || []);
    setMyOrders(orders || []);
    setMessages(msgs || []);
    setUnreadCount((msgs || []).filter(m => !m.lu && m.destinataire_id === user.id).length);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const totalRevenue = myOrders.reduce((s, o) => s + o.total, 0);
  const totalCommission = Math.round(totalRevenue * COMMISSION_RATE / 100);
  const netRevenue = totalRevenue - totalCommission;
  const shopUrl = `https://marche-plus.vercel.app/?boutique=${vendor.slug}`;

  const openAdd = () => {
    setEditingProduct(null);
    setNewProduct({ name: "", price: "", stock: "", category: "Mode", description: "", image: "", img2: "", img3: "", reduction: "0" });
    setShowAddForm(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    const imgs = p.images ? p.images.split(",") : [];
    setNewProduct({ name: p.name, price: p.prix_original || p.price, stock: p.stock, category: p.category, description: p.description || "", image: p.image || "", img2: imgs[1] || "", img3: imgs[2] || "", reduction: p.reduction || "0" });
    setShowAddForm(true);
  };

  const saveProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    setSaving(true);
    const images = [newProduct.image, newProduct.img2, newProduct.img3].filter(Boolean).join(",");
    const video = newProduct.video || "";
    const prixOriginal = parseInt(newProduct.price) || 0;
    const reduction = parseInt(newProduct.reduction) || 0;
    const prixFinal = reduction > 0 ? Math.round(prixOriginal * (1 - reduction / 100)) : prixOriginal;
    const data = {
      name: newProduct.name, price: prixFinal, prix_original: prixOriginal, reduction,
      stock: parseInt(newProduct.stock) || 0, category: newProduct.category,
      description: newProduct.description, image: newProduct.image, images, video, vendeur_id: vendor.id, rating: editingProduct?.rating || 5, reviews: editingProduct?.reviews || 0,
    };
    if (editingProduct) await supabase.from("produits").update(data).eq("id", editingProduct.id);
    else await supabase.from("produits").insert(data);
    setSaving(false); setShowAddForm(false); loadData();
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    await supabase.from("produits").delete().eq("id", id);
    loadData();
  };

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    // Envoyer message à l'admin (récupérer l'ID admin depuis les utilisateurs)
    const { data: adminData } = await supabase.from("utilisateurs").select("id").eq("email", "kone91139@gmail.com").single();
    if (adminData) {
      await supabase.from("messages").insert({ expediteur_id: user.id, destinataire_id: adminData.id, contenu: newMsg });
      setNewMsg("");
      loadData();
    }
  };

  const copyLink = () => { navigator.clipboard.writeText(shopUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const TABS = [
    { key: "overview", label: "Vue d'ensemble", icon: "📊" },
    { key: "products", label: "Mes produits", icon: "🛍" },
    { key: "orders", label: "Commandes", icon: "📦" },
    { key: "messages", label: "Messages", icon: "💬", badge: unreadCount },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F5F2FF" }}>
      <style>{`
        @media(max-width:600px){
          .vendor-stats { grid-template-columns: 1fr 1fr !important; }
          .vendor-prod-grid { grid-template-columns: 1fr !important; }
          .vendor-photos { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #4C1D95 0%, #6B21A8 60%, #D4AF37 100%)", padding: "24px 20px", color: "#fff" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: "7px 14px", borderRadius: 99, fontSize: 13, cursor: "pointer", marginBottom: 16, fontWeight: 600 }}>← Retour à Marché+</button>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, overflow: "hidden", border: "3px solid rgba(255,255,255,0.4)" }}>
            {vendor.logo ? <img src={vendor.logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🏪"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Votre boutique</div>
            <div style={{ fontWeight: 900, fontSize: 22 }}>{vendor.nom_boutique}</div>
            {vendor.description && <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>{vendor.description}</div>}
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ flex: 1, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: 0.9 }}>{shopUrl}</span>
          <button onClick={copyLink} style={{ background: copied ? "#D4AF37" : "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
            {copied ? "✓ Copié !" : "Copier"}
          </button>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Visitez ma boutique sur Marché+ : ${shopUrl}`)}`, "_blank")} style={{ background: "#25D366", border: "none", color: "#fff", padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
            WhatsApp
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E8E0FF", padding: "0 20px", display: "flex", gap: 4, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "14px 16px", border: "none", background: "transparent", whiteSpace: "nowrap",
            fontWeight: tab === t.key ? 700 : 400, color: tab === t.key ? "#6B21A8" : "#9CA3AF",
            borderBottom: `2.5px solid ${tab === t.key ? "#6B21A8" : "transparent"}`,
            fontSize: 13, cursor: "pointer", marginBottom: -1, display: "flex", alignItems: "center", gap: 6,
          }}>
            {t.icon} {t.label}
            {t.badge > 0 && <span style={{ background: "#DC2626", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99 }}>{t.badge}</span>}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 20px" }}>

        {/* VUE D'ENSEMBLE */}
        {tab === "overview" && (
          <>
            <div className="vendor-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Revenus bruts", value: fmt(totalRevenue), icon: "💰", color: "#1a56db", bg: "#e8f0fe" },
                { label: `Commission (${COMMISSION_RATE}%)`, value: "- " + fmt(totalCommission), icon: "📊", color: "#DC2626", bg: "#FEE2E2" },
                { label: "Vos gains nets", value: fmt(netRevenue), icon: "✅", color: "#059669", bg: "#D1FAE5" },
                { label: "Produits", value: myProducts.length, icon: "🏷", color: "#6B21A8", bg: "#EDE9FE" },
                { label: "Commandes", value: myOrders.length, icon: "📦", color: "#D4AF37", bg: "#FEF3C7" },
              ].map(m => (
                <div key={m.label} style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E0FF", padding: "18px 16px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: m.color, borderRadius: "16px 0 0 16px" }} />
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{m.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>{m.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E0FF", padding: "20px 22px" }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#6B21A8" }}>🚀 Guide rapide</h3>
              {[
                { step: "1", icon: "🛍", title: "Ajoutez vos produits", desc: "Allez dans \"Mes produits\" et ajoutez vos articles avec photos et prix", action: () => setTab("products") },
                { step: "2", icon: "🏷", title: "Ajoutez des réductions", desc: "Lors de l'ajout/modification d'un produit, définissez un % de réduction" },
                { step: "3", icon: "🔗", title: "Partagez votre boutique", desc: "Copiez votre lien et partagez-le sur WhatsApp et réseaux sociaux" },
                { step: "4", icon: "💬", title: "Contactez l'admin", desc: "Utilisez l'onglet Messages pour communiquer avec l'administrateur" },
              ].map(s => (
                <div key={s.step} onClick={s.action} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16, cursor: s.action ? "pointer" : "default" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #6B21A8, #D4AF37)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{s.step}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.icon} {s.title}</div>
                    <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 2 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* MES PRODUITS */}
        {tab === "products" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 20, color: "#1A0A2E" }}>Mes produits</h2>
                <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 2 }}>{myProducts.length} produit{myProducts.length > 1 ? "s" : ""} en ligne</p>
              </div>
              <button onClick={openAdd} style={{ background: "linear-gradient(135deg, #6B21A8, #4C1D95)", color: "#fff", border: "none", padding: "11px 22px", borderRadius: 99, fontWeight: 600, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(107,33,168,0.3)" }}>
                + Ajouter un produit
              </button>
            </div>

            {showAddForm && (
              <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #6B21A8", padding: "24px", marginBottom: 20, boxShadow: "0 8px 30px rgba(107,33,168,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 800, fontSize: 17, color: "#6B21A8" }}>{editingProduct ? "✏️ Modifier le produit" : "➕ Nouveau produit"}</h3>
                  <button onClick={() => setShowAddForm(false)} style={{ background: "none", border: "none", fontSize: 22, color: "#9CA3AF", cursor: "pointer" }}>×</button>
                </div>

                {/* Photos */}
                <div className="vendor-photos" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <ImageUploader currentImage={newProduct.image} onImageChange={url => setNewProduct(p => ({ ...p, image: url }))} supabase={supabase} label="📷 Photo principale *" />
                  <ImageUploader currentImage={newProduct.img2} onImageChange={url => setNewProduct(p => ({ ...p, img2: url }))} supabase={supabase} label="📷 Photo 2" />
                  <ImageUploader currentImage={newProduct.img3} onImageChange={url => setNewProduct(p => ({ ...p, img3: url }))} supabase={supabase} label="📷 Photo 3" />
              </div>

              {/* Upload vidéo */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B21A8", display: "block", marginBottom: 6 }}>🎥 Vidéo du produit (optionnel)</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {/* Upload depuis téléphone */}
                  <div>
                    <label style={{ fontSize: 11, color: "#9CA3AF", display: "block", marginBottom: 6 }}>📱 Depuis votre téléphone</label>
                    <div onClick={() => document.getElementById("vendor-video-upload").click()} style={{ border: "2px dashed #E8E0FF", borderRadius: 12, padding: "16px", textAlign: "center", cursor: "pointer", background: "#F5F2FF" }}>
                      {newProduct.video && !newProduct.video.includes("youtube") && !newProduct.video.includes("youtu") ? (
                        <video src={newProduct.video} style={{ width: "100%", borderRadius: 8, maxHeight: 120 }} controls />
                      ) : (
                        <>
                          <div style={{ fontSize: 28, marginBottom: 4 }}>🎬</div>
                          <div style={{ fontSize: 12, color: "#9CA3AF" }}>Cliquer pour uploader</div>
                          <div style={{ fontSize: 10, color: "#C4B5FD", marginTop: 2 }}>MP4, MOV, AVI</div>
                        </>
                      )}
                    </div>
                    <input id="vendor-video-upload" type="file" accept="video/*" style={{ display: "none" }} onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async (ev) => {
                        const base64 = ev.target.result;
                        setNewProduct(p => ({ ...p, video: base64 }));
                        const filename = `videos/${Date.now()}-${file.name.replace(/\s/g, "-")}`;
                        const { data: uploadData, error } = await supabase.storage.from("images").upload(filename, file, { upsert: true });
                        if (!error && uploadData) {
                          const { data: urlData } = supabase.storage.from("images").getPublicUrl(filename);
                          setNewProduct(p => ({ ...p, video: urlData.publicUrl }));
                        }
                      };
                      reader.readAsDataURL(file);
                    }} />
                  </div>
                  {/* URL YouTube */}
                  <div>
                    <label style={{ fontSize: 11, color: "#9CA3AF", display: "block", marginBottom: 6 }}>🎬 Ou lien YouTube</label>
                    <input placeholder="https://www.youtube.com/watch?v=..." value={newProduct.video && (newProduct.video.includes("youtube") || newProduct.video.includes("youtu")) ? newProduct.video : ""} onChange={e => setNewProduct(p => ({ ...p, video: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E8E0FF", fontSize: 13, background: "#F5F2FF", height: 120 }} />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  {[
                    { label: "Nom du produit *", key: "name", placeholder: "Ex: Robe africaine", type: "text" },
                    { label: "Prix original (FCFA) *", key: "price", placeholder: "Ex: 15000", type: "number" },
                    { label: "Stock", key: "stock", placeholder: "Ex: 10", type: "number" },
                    { label: "Réduction (%)", key: "reduction", placeholder: "Ex: 20 pour 20%", type: "number" },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#6B21A8", display: "block", marginBottom: 6 }}>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder} value={newProduct[f.key]} onChange={e => setNewProduct(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E8E0FF", fontSize: 14, background: "#F5F2FF" }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6B21A8", display: "block", marginBottom: 6 }}>Catégorie</label>
                    <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E8E0FF", fontSize: 14, background: "#F5F2FF" }}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Aperçu prix avec réduction */}
                {newProduct.price && parseInt(newProduct.reduction) > 0 && (
                  <div style={{ background: "#FEF3C7", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "line-through" }}>{fmt(parseInt(newProduct.price))}</span>
                    <span style={{ fontWeight: 800, fontSize: 16, color: "#D4AF37" }}>{fmt(Math.round(parseInt(newProduct.price) * (1 - parseInt(newProduct.reduction) / 100)))}</span>
                    <span style={{ background: "#DC2626", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>-{newProduct.reduction}%</span>
                  </div>
                )}

                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6B21A8", display: "block", marginBottom: 6 }}>Description</label>
                  <textarea placeholder="Décrivez votre produit..." value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                    rows={3} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E8E0FF", fontSize: 14, fontFamily: "inherit", resize: "vertical", background: "#F5F2FF" }} />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={saveProduct} disabled={saving} style={{ flex: 1, background: "linear-gradient(135deg, #059669, #047857)", color: "#fff", border: "none", padding: "13px", borderRadius: 99, fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Enregistrement..." : `✓ ${editingProduct ? "Modifier" : "Publier le produit"}`}
                  </button>
                  <button onClick={() => setShowAddForm(false)} style={{ background: "#F5F2FF", color: "#6B7280", border: "none", padding: "13px 20px", borderRadius: 99, fontWeight: 500, cursor: "pointer" }}>Annuler</button>
                </div>
              </div>
            )}

            {loading ? <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF" }}>Chargement...</div> :
              myProducts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#9CA3AF" }}>
                  <div style={{ fontSize: 52, marginBottom: 16 }}>🛍</div>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Aucun produit pour le moment</div>
                  <button onClick={openAdd} style={{ background: "#6B21A8", color: "#fff", border: "none", padding: "11px 24px", borderRadius: 99, fontWeight: 600, cursor: "pointer", marginTop: 12 }}>+ Ajouter mon premier produit</button>
                </div>
              ) : (
                <div className="vendor-prod-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 14 }}>
                  {myProducts.map(p => (
                    <div key={p.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E0FF", overflow: "hidden" }}>
                      <div style={{ height: 160, background: "#F5F2FF", overflow: "hidden", position: "relative" }}>
                        {p.image ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🛍</div>}
                        {p.reduction > 0 && <div style={{ position: "absolute", top: 8, left: 8, background: "#DC2626", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 99 }}>-{p.reduction}%</div>}
                        <div style={{ position: "absolute", top: 8, right: 8, background: p.stock < 10 ? "#FEE2E2" : "#D1FAE5", color: p.stock < 10 ? "#DC2626" : "#059669", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>Stock: {p.stock}</div>
                      </div>
                      <div style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: 11, color: "#6B21A8", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>{p.category}</div>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{p.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                          <span style={{ fontWeight: 900, fontSize: 17, color: "#D4AF37" }}>{fmt(p.price)}</span>
                          {p.prix_original && p.prix_original !== p.price && <span style={{ fontSize: 12, color: "#9CA3AF", textDecoration: "line-through" }}>{fmt(p.prix_original)}</span>}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => openEdit(p)} style={{ flex: 1, background: "#EDE9FE", color: "#6B21A8", border: "none", padding: "8px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>✏️ Modifier</button>
                          <button onClick={() => deleteProduct(p.id)} style={{ background: "#FEE2E2", color: "#DC2626", border: "none", padding: "8px 12px", borderRadius: 9, fontSize: 13, cursor: "pointer" }}>🗑</button>
                        </div>
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
            <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 20, color: "#1A0A2E" }}>Mes commandes</h2>
            {loading ? <p style={{ color: "#9CA3AF" }}>Chargement...</p> : myOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#9CA3AF" }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>📦</div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>Aucune commande reçue</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {myOrders.map(o => (
                  <div key={o.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8E0FF", padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#6B21A8" }}>{o.id}</div>
                        <div style={{ fontSize: 13, color: "#6B7280", marginTop: 3 }}>👤 {o.client_nom} · 📞 {o.client_telephone}</div>
                        <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>📍 {o.client_adresse} · 📅 {o.date}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 900, fontSize: 18, color: "#D4AF37" }}>{fmt(o.total)}</div>
                        <div style={{ fontSize: 11, color: "#DC2626", marginTop: 2 }}>Commission: -{fmt(Math.round(o.total * COMMISSION_RATE / 100))}</div>
                        <div style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>Net: {fmt(o.total - Math.round(o.total * COMMISSION_RATE / 100))}</div>
                      </div>
                    </div>
                    <button onClick={() => window.open(`https://wa.me/${o.client_telephone?.replace(/\D/g,"")}?text=${encodeURIComponent(`Bonjour ${o.client_nom}, merci pour votre commande ${o.id} sur ${vendor.nom_boutique} ! 🛍`)}`, "_blank")}
                      style={{ marginTop: 12, background: "#25D366", color: "#fff", border: "none", padding: "7px 16px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      📱 Contacter le client
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* MESSAGES */}
        {tab === "messages" && (
          <>
            <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 20, color: "#1A0A2E" }}>💬 Messages avec l'admin</h2>
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E0FF", overflow: "hidden" }}>
              {/* Zone messages */}
              <div style={{ height: 400, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: "center", margin: "auto", color: "#9CA3AF" }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
                    <div>Aucun message pour le moment</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Envoyez un message à l'administrateur</div>
                  </div>
                ) : messages.map((m, i) => {
                  const isMe = m.expediteur_id === user.id;
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                      <div style={{ maxWidth: "70%", background: isMe ? "linear-gradient(135deg, #6B21A8, #4C1D95)" : "#F5F2FF", color: isMe ? "#fff" : "#1A0A2E", padding: "10px 14px", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", fontSize: 14, lineHeight: 1.5 }}>
                        {m.contenu}
                        <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: "right" }}>
                          {new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Zone saisie */}
              <div style={{ borderTop: "1px solid #E8E0FF", padding: "14px 16px", display: "flex", gap: 10 }}>
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Écrivez votre message..."
                  style={{ flex: 1, padding: "10px 16px", borderRadius: 99, border: "1.5px solid #E8E0FF", fontSize: 14, background: "#F5F2FF" }} />
                <button onClick={sendMessage} style={{ background: "linear-gradient(135deg, #6B21A8, #4C1D95)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 99, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  Envoyer
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page Boutique Publique ───────────────────────────────────────
export function VendorShopPage({ supabase, slug, onAdd, onBack }) {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: v } = await supabase.from("vendeurs").select("*").eq("slug", slug).single();
      if (v) {
        setVendor(v);
        const { data: p } = await supabase.from("produits").select("*").eq("vendeur_id", v.id).order("id");
        setProducts(p || []);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div style={{ textAlign: "center", padding: 80, color: "#9CA3AF" }}>⏳ Chargement...</div>;
  if (!vendor) return <div style={{ textAlign: "center", padding: 80, color: "#9CA3AF" }}>Boutique introuvable.</div>;

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (selectedProduct) return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <button onClick={() => setSelectedProduct(null)} style={{ background: "none", border: "none", color: "#6B21A8", fontSize: 14, cursor: "pointer", marginBottom: 20, fontWeight: 600 }}>← Retour à la boutique</button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="vendor-detail-grid">
        <div>
          <div style={{ borderRadius: 16, overflow: "hidden", height: 300, background: "#F5F2FF" }}>
            <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
          </div>
          {selectedProduct.images && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {selectedProduct.images.split(",").filter(Boolean).map((img, i) => (
                <div key={i} style={{ width: 70, height: 70, borderRadius: 10, overflow: "hidden", border: "2px solid #E8E0FF", cursor: "pointer" }} onClick={() => {}}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#6B21A8", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>{selectedProduct.category}</div>
          <h1 style={{ fontWeight: 800, fontSize: 22, marginBottom: 10, color: "#1A0A2E" }}>{selectedProduct.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontWeight: 900, fontSize: 28, color: "#D4AF37" }}>{fmt(selectedProduct.price)}</span>
            {selectedProduct.prix_original && selectedProduct.prix_original !== selectedProduct.price && (
              <>
                <span style={{ fontSize: 16, color: "#9CA3AF", textDecoration: "line-through" }}>{fmt(selectedProduct.prix_original)}</span>
                <span style={{ background: "#DC2626", color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 99 }}>-{selectedProduct.reduction}%</span>
              </>
            )}
          </div>
          {selectedProduct.description && <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7, marginBottom: 20 }}>{selectedProduct.description}</p>}
          <div style={{ fontSize: 12, color: selectedProduct.stock < 10 ? "#DC2626" : "#9CA3AF", marginBottom: 20 }}>
            {selectedProduct.stock < 10 ? `⚠ Plus que ${selectedProduct.stock} en stock` : `✓ ${selectedProduct.stock} disponibles`}
          </div>
          <button onClick={() => { onAdd({ ...selectedProduct, vendeur_id: vendor.id }); setSelectedProduct(null); }}
            style={{ width: "100%", background: "linear-gradient(135deg, #6B21A8, #4C1D95)", color: "#fff", border: "none", padding: "14px", borderRadius: 99, fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 8px 24px rgba(107,33,168,0.3)" }}>
            🛒 Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F5F2FF" }}>
      <div style={{ background: "linear-gradient(135deg, #4C1D95, #6B21A8, #D4AF37)", padding: "32px 20px", color: "#fff", textAlign: "center", position: "relative" }}>
        <button onClick={onBack} style={{ position: "absolute", top: 16, left: 16, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: "7px 14px", borderRadius: 99, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>← Marché+</button>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 16px", overflow: "hidden", border: "3px solid rgba(255,255,255,0.4)" }}>
          {vendor.logo ? <img src={vendor.logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🏪"}
        </div>
        <h1 style={{ fontWeight: 900, fontSize: 26, marginBottom: 8 }}>{vendor.nom_boutique}</h1>
        {vendor.description && <p style={{ fontSize: 14, opacity: 0.85, maxWidth: 400, margin: "0 auto 16px" }}>{vendor.description}</p>}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <span style={{ background: "rgba(255,255,255,0.15)", padding: "5px 14px", borderRadius: 99, fontSize: 12 }}>🛍 {products.length} produits</span>
          <a href={`https://wa.me/${vendor.whatsapp}`} target="_blank" rel="noreferrer" style={{ background: "#25D366", color: "#fff", padding: "5px 14px", borderRadius: 99, fontSize: 12, textDecoration: "none", fontWeight: 600 }}>💬 Contacter</a>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        <input placeholder="🔍 Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "12px 18px", borderRadius: 99, border: "1.5px solid #E8E0FF", fontSize: 14, marginBottom: 24, background: "#fff", boxShadow: "0 2px 8px rgba(107,33,168,0.06)" }} />

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9CA3AF" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div>Aucun produit trouvé</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 16 }}>
            {filtered.map(p => (
              <div key={p.id} onClick={() => setSelectedProduct(p)} style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8E0FF", overflow: "hidden", cursor: "pointer", transition: "all .3s", boxShadow: "0 2px 8px rgba(107,33,168,0.06)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(107,33,168,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(107,33,168,0.06)"; }}>
                <div style={{ height: 200, background: "#F5F2FF", overflow: "hidden", position: "relative" }}>
                  {p.image ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56 }}>🛍</div>}
                  {p.reduction > 0 && <div style={{ position: "absolute", top: 10, left: 10, background: "#DC2626", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99 }}>🏷 -{p.reduction}%</div>}
                  {p.stock < 10 && <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(220,38,38,0.9)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99 }}>Stock limité</div>}
                </div>
                <div style={{ padding: "16px" }}>
                  <div style={{ fontSize: 10, color: "#6B21A8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>{p.category}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, lineHeight: 1.3, color: "#1A0A2E" }}>{p.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontWeight: 900, fontSize: 18, color: "#D4AF37" }}>{fmt(p.price)}</span>
                    {p.prix_original && p.prix_original !== p.price && <span style={{ fontSize: 12, color: "#9CA3AF", textDecoration: "line-through" }}>{fmt(p.prix_original)}</span>}
                  </div>
                  <button onClick={e => { e.stopPropagation(); onAdd({ ...p, vendeur_id: vendor.id }); }}
                    style={{ width: "100%", background: "linear-gradient(135deg, #6B21A8, #4C1D95)", color: "#fff", border: "none", padding: "10px", borderRadius: 99, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(107,33,168,0.25)" }}>
                    🛒 Ajouter au panier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
