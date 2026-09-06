import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
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
  "En cours":   { bg: "#191b1f", color: "#1a56db" },
  "En transit": { bg: "#fff8e1", color: "#b76e00" },
  "Livré":      { bg: "#e6f7ef", color: "#0a7c45" },
  "Annulé":     { bg: "#fce8e8", color: "#c0392b" },
};

const PIE_COLORS = ["#FF6B00", "#1a56db", "#0a7c45", "#c0392b"];
const CATEGORIES = ["Mode", "Électronique", "Maison", "Bureau"];

// ─── Styles globaux ───────────────────────────────────────────────
const S = {
  card: { background: "#fff", borderRadius: 16, border: "1px solid #ebebeb", padding: "20px 24px", marginBottom: 16 },
  btn: (color = "#FF6B00") => ({ background: color, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }),
  input: (err) => ({ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${err ? "#e53e3e" : "#e0e0e0"}`, fontSize: 14, fontFamily: "inherit" }),
  badge: (bg, color) => ({ background: bg, color, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 99 }),
};

// ─── Login ────────────────────────────────────────────────────────
// ── Promo Manager ─────────────────────────────────────────────────
function PromoManager({ supabase }) {
  const [promos, setPromos] = useState([]);
  const [form, setForm]     = useState({ code: "", reduction: "", description: "" });
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("codes_promo").select("*").order("created_at", { ascending: false });
    setPromos(data || []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.code || !form.reduction) return;
    await supabase.from("codes_promo").insert({ code: form.code.toUpperCase(), reduction: parseInt(form.reduction), description: form.description });
    setForm({ code: "", reduction: "", description: "" }); setShowForm(false); load();
  };

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)} style={{ background: `linear-gradient(135deg, #6B21A8, #4C1D95)`, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 99, fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
        {showForm ? "Annuler" : "+ Nouveau code promo"}
      </button>
      {showForm && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8E0FF", padding: "20px", marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            {[{ label: "Code", key: "code", placeholder: "Ex: NOEL25" }, { label: "Réduction (%)", key: "reduction", placeholder: "Ex: 25" }, { label: "Description", key: "description", placeholder: "Ex: 25% pour Noël" }].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6B21A8", display: "block", marginBottom: 6 }}>{f.label}</label>
                <input placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E8E0FF", fontSize: 14, background: "#F5F2FF" }} />
              </div>
            ))}
          </div>
          <button onClick={save} style={{ background: "linear-gradient(135deg, #059669, #047857)", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 99, fontWeight: 700, fontSize: 14 }}>✓ Créer le code</button>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 12 }}>
        {promos.map(p => (
          <div key={p.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8E0FF", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ background: "#EDE9FE", color: "#6B21A8", fontWeight: 800, fontSize: 16, padding: "6px 14px", borderRadius: 99 }}>{p.code}</span>
              <span style={{ background: "#FEF3C7", color: "#D4AF37", fontWeight: 700, fontSize: 14, padding: "4px 10px", borderRadius: 99 }}>-{p.reduction}%</span>
            </div>
            <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 10 }}>{p.description}</div>
            <button onClick={async () => { await supabase.from("codes_promo").delete().eq("id", p.id); load(); }}
              style={{ background: "#FEE2E2", color: "#DC2626", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>🗑 Supprimer</button>
          </div>
        ))}
        {promos.length === 0 && <p style={{ color: "#9CA3AF", fontSize: 14 }}>Aucun code promo créé</p>}
      </div>
    </div>
  );
}

// ── Flash Sale Manager ────────────────────────────────────────────
function FlashSaleManager({ supabase, products, fmt }) {
  const [sales, setSales]   = useState([]);
  const [form, setForm]     = useState({ produit_id: "", reduction: "", date_fin: "" });
  const [showForm, setShowForm] = useState(false);
  const [timers, setTimers] = useState({});

  const load = async () => {
    const { data } = await supabase.from("flash_sales").select("*, produits(name, image, price)").eq("actif", true).order("created_at", { ascending: false });
    setSales(data || []);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const t = {};
      sales.forEach(s => {
        const diff = new Date(s.date_fin) - now;
        if (diff > 0) {
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const sec = Math.floor((diff % 60000) / 1000);
          t[s.id] = `${h}h ${m}m ${sec}s`;
        } else {
          t[s.id] = "Terminé";
        }
      });
      setTimers(t);
    }, 1000);
    return () => clearInterval(interval);
  }, [sales]);

  const save = async () => {
    if (!form.produit_id || !form.reduction || !form.date_fin) return;
    await supabase.from("flash_sales").insert({ produit_id: parseInt(form.produit_id), reduction: parseInt(form.reduction), date_debut: new Date().toISOString(), date_fin: new Date(form.date_fin).toISOString(), actif: true });
    setForm({ produit_id: "", reduction: "", date_fin: "" }); setShowForm(false); load();
  };

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)} style={{ background: "linear-gradient(135deg, #DC2626, #b91c1c)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 99, fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
        {showForm ? "Annuler" : "⚡ Nouvelle flash sale"}
      </button>
      {showForm && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8E0FF", padding: "20px", marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6B21A8", display: "block", marginBottom: 6 }}>Produit</label>
              <select value={form.produit_id} onChange={e => setForm(p => ({ ...p, produit_id: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E8E0FF", fontSize: 14, background: "#F5F2FF" }}>
                <option value="">Choisir un produit</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6B21A8", display: "block", marginBottom: 6 }}>Réduction (%)</label>
              <input type="number" placeholder="Ex: 30" value={form.reduction} onChange={e => setForm(p => ({ ...p, reduction: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E8E0FF", fontSize: 14, background: "#F5F2FF" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6B21A8", display: "block", marginBottom: 6 }}>Date de fin</label>
              <input type="datetime-local" value={form.date_fin} onChange={e => setForm(p => ({ ...p, date_fin: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E8E0FF", fontSize: 14, background: "#F5F2FF" }} />
            </div>
          </div>
          <button onClick={save} style={{ background: "linear-gradient(135deg, #059669, #047857)", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 99, fontWeight: 700, fontSize: 14 }}>⚡ Créer la flash sale</button>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 14 }}>
        {sales.map(s => (
          <div key={s.id} style={{ background: "#fff", borderRadius: 14, border: "2px solid #DC2626", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #DC2626, #b91c1c)", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>⚡ FLASH SALE -{s.reduction}%</span>
              <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 99 }}>{timers[s.id] || "..."}</span>
            </div>
            <div style={{ padding: "14px", display: "flex", gap: 12, alignItems: "center" }}>
              {s.produits?.image && <img src={s.produits.image} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} />}
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.produits?.name}</div>
                <div style={{ fontSize: 13, color: "#D4AF37", fontWeight: 800 }}>{fmt(Math.round(s.produits?.price * (1 - s.reduction/100)))}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", textDecoration: "line-through" }}>{fmt(s.produits?.price)}</div>
              </div>
            </div>
            <div style={{ padding: "0 14px 14px" }}>
              <button onClick={async () => { await supabase.from("flash_sales").update({ actif: false }).eq("id", s.id); load(); }}
                style={{ background: "#FEE2E2", color: "#DC2626", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Terminer</button>
            </div>
          </div>
        ))}
        {sales.length === 0 && <p style={{ color: "#9CA3AF", fontSize: 14 }}>Aucune flash sale active</p>}
      </div>
    </div>
  );
}

// ── Annonce Manager ───────────────────────────────────────────────
function AnnonceManager({ supabase }) {
  const [annonces, setAnnonces] = useState([]);
  const [message, setMessage]   = useState("");
  const [couleur, setCouleur]   = useState("#6B21A8");

  const load = async () => {
    const { data } = await supabase.from("annonces").select("*").order("created_at", { ascending: false });
    setAnnonces(data || []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!message.trim()) return;
    await supabase.from("annonces").insert({ message, couleur, actif: true });
    setMessage(""); load();
  };

  return (
    <div>
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8E0FF", padding: "20px", marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, color: "#6B21A8", marginBottom: 14 }}>📢 Nouvelle annonce</h3>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#6B21A8", display: "block", marginBottom: 6 }}>Message</label>
          <input placeholder="Ex: Livraison gratuite ce week-end !" value={message} onChange={e => setMessage(e.target.value)}
            style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #E8E0FF", fontSize: 14, background: "#F5F2FF" }} />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6B21A8", display: "block", marginBottom: 6 }}>Couleur</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["#6B21A8", "#DC2626", "#059669", "#D4AF37", "#1a56db"].map(c => (
                <div key={c} onClick={() => setCouleur(c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: couleur === c ? "3px solid #1A0A2E" : "none" }} />
              ))}
            </div>
          </div>
          <div style={{ flex: 1, background: couleur, borderRadius: 10, padding: "10px 16px", color: "#fff", fontSize: 13, fontWeight: 600 }}>
            📢 {message || "Aperçu de votre annonce"}
          </div>
        </div>
        <button onClick={save} style={{ background: `linear-gradient(135deg, #6B21A8, #4C1D95)`, color: "#fff", border: "none", padding: "10px 24px", borderRadius: 99, fontWeight: 700, fontSize: 14 }}>
          📢 Publier l'annonce
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {annonces.map(a => (
          <div key={a.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #E8E0FF", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: a.couleur, flexShrink: 0 }} />
            <div style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>{a.message}</div>
            <span style={{ background: a.actif ? "#D1FAE5" : "#FEE2E2", color: a.actif ? "#059669" : "#DC2626", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>
              {a.actif ? "Active" : "Inactive"}
            </span>
            <button onClick={async () => { await supabase.from("annonces").update({ actif: !a.actif }).eq("id", a.id); load(); }}
              style={{ background: "#EDE9FE", color: "#6B21A8", border: "none", padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
              {a.actif ? "Désactiver" : "Activer"}
            </button>
            <button onClick={async () => { await supabase.from("annonces").delete().eq("id", a.id); load(); }}
              style={{ background: "#FEE2E2", color: "#DC2626", border: "none", padding: "5px 10px", borderRadius: 8, fontSize: 12 }}>🗑</button>
          </div>
        ))}
        {annonces.length === 0 && <p style={{ color: "#9CA3AF", fontSize: 14 }}>Aucune annonce créée</p>}
      </div>
    </div>
  );
}

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
    const { error: e } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (e) { setError("Email ou mot de passe incorrect"); return; }
    setStep(2);
  };

  const handleAdminPwd = () => {
    if (adminPwd === ADMIN_PASSWORD) onLogin();
    else setError("Mot de passe admin incorrect");
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a1a1a 0%, #2d1810 50%, #1a1a1a 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px" }}>🛍</div>
          <h1 style={{ fontWeight: 900, fontSize: 28, color: "#fff", letterSpacing: "-1px" }}>Marché+ <span style={{ color: "#FF6B00" }}>Admin</span></h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Tableau de bord administrateur</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", padding: "36px 32px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {[1, 2].map(n => (
              <div key={n} style={{ flex: 1, height: 4, borderRadius: 99, background: step >= n ? "#FF6B00" : "rgba(255,255,255,0.15)" }} />
            ))}
          </div>

          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>
            {step === 1 ? "Étape 1 : Connexion au compte" : "Étape 2 : Vérification admin"}
          </p>

          {step === 1 && (
            <>
              {[
                { label: "Email", key: "email", type: "email", val: email, set: setEmail, ph: "kone91139@gmail.com" },
                { label: "Mot de passe", key: "pwd", type: "password", val: password, set: setPassword, ph: "••••••••" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.15)", fontSize: 14, background: "rgba(255,255,255,0.08)", color: "#fff", outline: "none" }} />
                </div>
              ))}
              {error && <div style={{ background: "rgba(192,57,43,0.2)", color: "#ff8080", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>✗ {error}</div>}
              <button onClick={handleLogin} disabled={loading} style={{ width: "100%", background: "#FF6B00", color: "#fff", border: "none", padding: "14px", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
                {loading ? "Connexion..." : "Continuer →"}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Entrez le code secret administrateur</p>
              </div>
              <input type="password" placeholder="Code admin secret" value={adminPwd} onChange={e => setAdminPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdminPwd()}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.15)", fontSize: 14, background: "rgba(255,255,255,0.08)", color: "#fff", outline: "none", marginBottom: 14, letterSpacing: 4, textAlign: "center" }} />
              {error && <div style={{ background: "rgba(192,57,43,0.2)", color: "#ff8080", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>✗ {error}</div>}
              <button onClick={handleAdminPwd} style={{ width: "100%", background: "#FF6B00", color: "#fff", border: "none", padding: "14px", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                🔓 Accéder au tableau de bord
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Image Uploader ───────────────────────────────────────────────
function ImageUploader({ currentImage, onImageChange }) {
  const [preview, setPreview] = useState(currentImage || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview local
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setUploading(true);
    const filename = `produits/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from("images").upload(filename, file, { upsert: true });

    if (!error) {
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(filename);
      onImageChange(urlData.publicUrl);
    } else {
      // Fallback: use local path
      onImageChange(`/images/${file.name}`);
    }
    setUploading(false);
  };

  return (
    <div>
      <div
        onClick={() => fileRef.current.click()}
        style={{
          width: "100%", height: 160, borderRadius: 12, border: "2px dashed #e0e0e0",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          cursor: "pointer", background: preview ? "transparent" : "#f8f7f4", overflow: "hidden",
          position: "relative", transition: "border-color 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#FF6B00"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "#e0e0e0"}
      >
        {preview ? (
          <>
            <img src={preview} alt="aperçu" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}>
              <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>📷 Changer la photo</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#555" }}>{uploading ? "Téléchargement..." : "Cliquer pour ajouter une photo"}</div>
            <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>JPG, PNG, WEBP</div>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      {preview && (
        <div style={{ marginTop: 8 }}>
          <input value={preview} onChange={e => { setPreview(e.target.value); onImageChange(e.target.value); }} placeholder="Ou entrez l'URL de l'image" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: 12 }} />
        </div>
      )}
    </div>
  );
}


// ─── Export Excel ─────────────────────────────────────────────────
function exportToExcel(orders, type = "commandes") {
  const data = orders.map(o => ({
    "ID Commande":    o.id,
    "Date":           o.date,
    "Client":         o.client_nom,
    "Téléphone":      o.client_telephone,
    "Adresse":        o.client_adresse,
    "Paiement":       o.paiement,
    "Articles":       o.items,
    "Total (FCFA)":   o.total,
    "Commission (FCFA)": Math.round(o.total * 0.1),
    "Net (FCFA)":     o.total - Math.round(o.total * 0.1),
    "Statut":         o.status,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();

  // Style colonnes
  ws["!cols"] = [
    { wch: 14 }, { wch: 12 }, { wch: 20 }, { wch: 16 },
    { wch: 30 }, { wch: 15 }, { wch: 8 }, { wch: 14 },
    { wch: 16 }, { wch: 14 }, { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Commandes");
  XLSX.writeFile(wb, `marche-plus-${type}-${new Date().toISOString().slice(0,10)}.xlsx`);
}

// ─── Dashboard ────────────────────────────────────────────────
function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7j");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: "", category: "Mode", price: "", stock: "", image: "", description: "", sizes: "", colors: "" });
  const [saving, setSaving] = useState(false);
  const [searchOrder, setSearchOrder] = useState("");
  const [users, setUsers] = useState([]);
  const [faqItems, setFaqItems] = useState([
    { q: "Comment passer une commande ?", a: "Ajoutez un produit au panier, puis cliquez sur Commander et suivez les étapes." },
    { q: "Quels sont les modes de paiement ?", a: "Nous acceptons Orange Money, le paiement à la livraison et Mastercard." },
    { q: "Comment suivre ma commande ?", a: "Allez dans l'onglet Suivi et entrez votre numéro de commande (ex: CMD-123456)." },
    { q: "Puis-je retourner un produit ?", a: "Oui, contactez-nous sur WhatsApp dans les 48h après réception." },
    { q: "Quels sont les délais de livraison ?", a: "La livraison prend généralement 1 à 3 jours selon votre localisation." },
  ]);
  const [editFaq, setEditFaq] = useState(null);
  const [newFaq, setNewFaq] = useState({ q: "", a: "" });
  const [showFaqForm, setShowFaqForm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [{ data: o }, { data: p }, { data: v }, { data: u }] = await Promise.all([
      supabase.from("commandes").select("*").order("created_at", { ascending: false }),
      supabase.from("produits").select("*").order("id"),
      supabase.from("vendeurs").select("*").order("created_at", { ascending: false }),
      supabase.from("utilisateurs").select("*").order("created_at", { ascending: false }),
    ]);
    setOrders(o || []);
    setProducts(p || []);
    setVendors(v || []);
    setUsers(u || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

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

  const openAddProduct = () => {
    setEditProduct(null);
    setProductForm({ name: "", category: "Mode", price: "", stock: "", image: "", description: "", sizes: "", colors: "", img2: "", img3: "", video: "" });
    setShowProductForm(true);
  };

  const openEditProduct = (p) => {
    setEditProduct(p);
    setProductForm({
      name: p.name, category: p.category, price: p.price, stock: p.stock,
      image: p.image || "", description: p.description || "",
      img2: p.images?.split(",")?.[1] || "",
      img3: p.images?.split(",")?.[2] || "",
      video: p.video || "",
      sizes: Array.isArray(p.sizes) ? p.sizes.join(",") : (p.sizes || ""),
      colors: Array.isArray(p.colors) ? p.colors.join(",") : (p.colors || ""),
    });
    setShowProductForm(true);
    setTimeout(() => document.getElementById("product-form")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const saveProduct = async () => {
    setSaving(true);
    const data = {
      name: productForm.name, category: productForm.category,
      price: parseInt(productForm.price) || 0, stock: parseInt(productForm.stock) || 0,
      image: productForm.image, images: Array.isArray(productForm.images) ? productForm.images.filter(Boolean).join(",") : productForm.image,
      description: productForm.description,
      sizes: productForm.sizes, colors: productForm.colors, video: productForm.video || "",
      rating: editProduct?.rating || 5, reviews: editProduct?.reviews || 0,
    };
    if (editProduct) {
      await supabase.from("produits").update(data).eq("id", editProduct.id);
    } else {
      await supabase.from("produits").insert(data);
    }
    setSaving(false);
    setShowProductForm(false);
    loadData();
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Supprimer ce produit définitivement ?")) return;
    await supabase.from("produits").delete().eq("id", id);
    loadData();
  };

  const updateOrderStatus = async (id, status) => {
    await supabase.from("commandes").update({ status }).eq("id", id);
    setOrders(os => os.map(o => o.id === id ? { ...o, status } : o));

    // Notification WhatsApp automatique au client
    const order = orders.find(o => o.id === id);
    if (order && order.client_telephone) {
      const statusEmoji = { "En cours": "⏳", "En transit": "🚚", "Livré": "✅", "Annulé": "❌" }[status] || "📦";
      const msg = `Bonjour ${order.client_nom} 👋

${statusEmoji} Votre commande *${order.id}* est maintenant *"${status}"*.

${status === "En transit" ? "🚚 Votre colis est en route !" : status === "Livré" ? "🎉 Votre commande a été livrée !" : ""}

📍 Suivez votre commande : https://marche-plus.vercel.app/?suivi=${order.id}

Merci de votre confiance ! 🛍
*Marché+*`;
      window.open("https://wa.me/" + order.client_telephone.replace(/\D/g,"") + "?text=" + encodeURIComponent(msg), "_blank");
    }
  };

  const filteredOrders = orders.filter(o =>
    !searchOrder || o.id?.includes(searchOrder) || o.client_nom?.toLowerCase().includes(searchOrder.toLowerCase()) || o.client_telephone?.includes(searchOrder)
  );

  const TABS = [
    { key: "overview", label: "Vue d'ensemble", icon: "📊" },
    { key: "products", label: "Produits",        icon: "🛍" },
    { key: "orders",   label: "Commandes",       icon: "📦", badge: pendingOrders },
    { key: "vendors",  label: "Vendeurs",         icon: "🏪" },
    { key: "users",    label: "Utilisateurs",     icon: "👥" },
    { key: "faq",      label: "FAQ / Contact",    icon: "❓" },
    { key: "rapport",  label: "Rapport mensuel",  icon: "📈" },
    { key: "livreurs", label: "Livreurs",         icon: "🚚" },
    { key: "promos",   label: "Codes promo",      icon: "🏷" },
    { key: "flashsale", label: "Flash Sales",     icon: "⚡" },
    { key: "annonces", label: "Annonces",         icon: "📢" },
    { key: "livraison", label: "Livraisons",      icon: "🚚" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f7", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        input, textarea, select { outline: none; }
        input:focus, textarea:focus, select:focus { border-color: #FF6B00 !important; }
        button:hover { opacity: 0.9; }
        @media(max-width:768px){ .admin-sidebar{ display: none !important; } .admin-main{ margin-left: 0 !important; } }
      `}</style>

      {/* Header */}
      <header style={{ background: "#1a1a1a", height: 62, display: "flex", alignItems: "center", padding: "0 24px", gap: 16, position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: "auto" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛍</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>Marché+</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Tableau de bord admin</div>
          </div>
        </div>

        {pendingOrders > 0 && (
          <div style={{ background: "#FF6B00", color: "#fff", fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 99, cursor: "pointer" }} onClick={() => setTab("orders")}>
            🔔 {pendingOrders} en attente
          </div>
        )}

        <a href="https://marche-plus.vercel.app" target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, textDecoration: "none" }}>🔗 Boutique</a>

        <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)", padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
          Déconnexion
        </button>
      </header>

      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ position: "fixed", top: 62, left: 0, bottom: 0, width: 230, background: "#fff", borderRight: "1px solid #ebebeb", padding: "16px 12px", overflowY: "auto", zIndex: 100 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            width: "100%", textAlign: "left", padding: "11px 14px", borderRadius: 10, marginBottom: 4,
            background: tab === t.key ? "#FFF3E8" : "transparent",
            color: tab === t.key ? "#FF6B00" : "#555",
            border: "none", fontWeight: tab === t.key ? 700 : 400, fontSize: 14, cursor: "pointer",
            borderLeft: `3px solid ${tab === t.key ? "#FF6B00" : "transparent"}`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span>{t.icon}</span>
            <span style={{ flex: 1 }}>{t.label}</span>
            {t.badge > 0 && <span style={{ background: "#FF6B00", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 99 }}>{t.badge}</span>}
          </button>
        ))}

        {/* Mini stats */}
        <div style={{ marginTop: 20, padding: "14px", background: "#f8f7f4", borderRadius: 12 }}>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Résumé</div>
          {[
            { label: "CA total", value: fmt(totalRevenue) },
            { label: "Commandes", value: orders.length },
            { label: "Produits", value: products.length },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: "#888" }}>{s.label}</span>
              <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{s.value}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 230, marginTop: 62, padding: "28px 24px", minHeight: "calc(100vh - 62px)" }}>

        {/* VUE D'ENSEMBLE */}
        {tab === "overview" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 2 }}>Vue d'ensemble</h2>
                <p style={{ fontSize: 13, color: "#888" }}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <button onClick={() => exportToExcel(orders)} style={{ background: "#0a7c45", color: "#fff", border: "none", padding: "9px 16px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                📊 Exporter toutes les commandes
              </button>
              <div style={{ display: "flex", gap: 6, background: "#fff", borderRadius: 10, padding: 4, border: "1px solid #ebebeb" }}>
                {["7j","30j","90j"].map(p => (
                  <button key={p} onClick={() => setPeriod(p)} style={{ padding: "6px 14px", borderRadius: 7, border: "none", background: period === p ? "#FF6B00" : "transparent", color: period === p ? "#fff" : "#666", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{p}</button>
                ))}
              </div>
            </div>

            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 14, marginBottom: 22 }}>
              {[
                { label: "Chiffre d'affaires", value: fmt(totalRevenue), icon: "💰", color: "#0a7c45", bg: "#e6f7ef" },
                { label: "Commandes",           value: orders.length,     icon: "📦", color: "#1a56db", bg: "#e8f0fe" },
                { label: "Livrées",             value: delivered,         icon: "✅", color: "#b76e00", bg: "#fff8e1" },
                { label: "En attente",          value: pendingOrders,     icon: "⏳", color: "#c0392b", bg: pendingOrders > 0 ? "#fce8e8" : "#f4f4f4" },
                { label: "Produits",            value: products.length,   icon: "🏷",  color: "#7c3aed", bg: "#f3f0ff" },
                { label: "Vendeurs",            value: vendors.length,    icon: "🏪", color: "#0369a1", bg: "#f0f9ff" },
              ].map(m => (
                <div key={m.label} style={{ background: "#fff", borderRadius: 14, padding: "18px 16px", border: "1px solid #ebebeb", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: m.color, borderRadius: "14px 0 0 14px" }} />
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{m.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 20, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Courbe */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #ebebeb", padding: "22px", marginBottom: 18 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>📈 Évolution du chiffre d'affaires ({period})</h3>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={revenueByDay}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#bbb" }} axisLine={false} tickLine={false} width={65} tickFormatter={v => v >= 1000 ? (v/1000) + "k" : v} />
                  <Tooltip formatter={v => [fmt(v), "CA"]} contentStyle={{ borderRadius: 10, border: "1px solid #ebebeb", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={2.5} fill="url(#grad)" dot={{ fill: "#FF6B00", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 18 }}>
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #ebebeb", padding: "22px" }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📦 Commandes par jour</h3>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#bbb" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#bbb" }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #ebebeb", fontSize: 12 }} />
                    <Bar dataKey="orders" fill="#FF6B00" radius={[5,5,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #ebebeb", padding: "22px" }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>🥧 Statuts</h3>
                {statusPieData.length === 0 ? <p style={{ color: "#aaa", fontSize: 13 }}>Aucune commande.</p> : (
                  <>
                    <ResponsiveContainer width="100%" height={130}>
                      <PieChart>
                        <Pie data={statusPieData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3}>
                          {statusPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    {statusPieData.map((d, i) => (
                      <div key={d.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i] }} />
                          <span style={{ color: "#666" }}>{d.name}</span>
                        </div>
                        <span style={{ fontWeight: 700 }}>{d.value}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {lowStock.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #f0d9d9", padding: "20px 22px" }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: "#c0392b", marginBottom: 14 }}>⚠️ Alertes stock faible</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 10 }}>
                  {lowStock.map(p => (
                    <div key={p.id} style={{ background: "#fce8e8", borderRadius: 10, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "#c0392b", marginTop: 2 }}>{p.stock} restant{p.stock > 1 ? "s" : ""}</div>
                      </div>
                      <button onClick={() => { setTab("products"); openEditProduct(p); }} style={{ background: "#c0392b", color: "#fff", border: "none", padding: "5px 10px", borderRadius: 7, fontSize: 11, cursor: "pointer" }}>Modifier</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* PRODUITS */}
        {tab === "products" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 2 }}>Produits</h2>
                <p style={{ fontSize: 13, color: "#888" }}>{products.length} produit{products.length > 1 ? "s" : ""} en ligne</p>
              </div>
              <button onClick={openAddProduct} style={{ background: "#FF6B00", color: "#fff", border: "none", padding: "11px 22px", borderRadius: 11, fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                + Ajouter un produit
              </button>
            </div>

            {showProductForm && (
              <div id="product-form" style={{ background: "#fff", borderRadius: 16, border: "1px solid #ebebeb", padding: "26px", marginBottom: 22, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                  <h3 style={{ fontWeight: 800, fontSize: 17 }}>{editProduct ? "✏️ Modifier le produit" : "➕ Nouveau produit"}</h3>
                  <button onClick={() => setShowProductForm(false)} style={{ background: "none", border: "none", fontSize: 20, color: "#aaa", cursor: "pointer" }}>×</button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {/* Colonne gauche */}
                  <div>
                    <div style={{ marginBottom: 14 }}>
  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Photos du produit (3 photos)</label>
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <div>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Photo principale</div>
      <ImageUploader currentImage={productForm.image} onImageChange={url => setProductForm(p => ({ ...p, image: url, images: [url, ...(p.images?.slice(1) || [])] }))} />
    </div>
    <div>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Photo 2</div>
      <ImageUploader currentImage={productForm.images?.[1] || ""} onImageChange={url => setProductForm(p => ({ ...p, images: [p.image || url, url, p.images?.[2] || url] }))} />
    </div>
    <div>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Photo 3</div>
      <ImageUploader currentImage={productForm.images?.[2] || ""} onImageChange={url => setProductForm(p => ({ ...p, images: [p.image || url, p.images?.[1] || url, url] }))} />
    </div>
  </div>
</div>
                  </div>

                  {/* Colonne droite */}
                  <div>
                    {[
                      { label: "Nom du produit *", key: "name", type: "text", placeholder: "Ex: Sac à dos urbain" },
                      { label: "Prix (FCFA) *", key: "price", type: "number", placeholder: "Ex: 45000" },
                      { label: "Stock *", key: "stock", type: "number", placeholder: "Ex: 12" },
                    ].map(f => (
                      <div key={f.key} style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>{f.label}</label>
                        <input type={f.type} placeholder={f.placeholder} value={productForm[f.key]} onChange={e => setProductForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14 }} />
                      </div>
                    ))}
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Catégorie</label>
                      <select value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14 }}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Ligne complète */}
                  <div style={{ gridColumn: "1 / -1", marginBottom: 14 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>🎥 URL Vidéo <span style={{ color: "#aaa", fontWeight: 400 }}>(YouTube, TikTok...)</span></label>
                    <input placeholder="Ex: https://www.youtube.com/watch?v=..." value={productForm.video || ""} onChange={e => setProductForm(p => ({ ...p, video: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14 }} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Description</label>
                    <textarea placeholder="Description du produit..." value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, fontFamily: "inherit", resize: "vertical" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Tailles <span style={{ color: "#aaa", fontWeight: 400 }}>(séparées par virgule)</span></label>
                    <input placeholder="S,M,L ou 39,40,41" value={productForm.sizes} onChange={e => setProductForm(p => ({ ...p, sizes: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Couleurs <span style={{ color: "#aaa", fontWeight: 400 }}>(séparées par virgule)</span></label>
                    <input placeholder="Noir,Blanc,Rouge" value={productForm.colors} onChange={e => setProductForm(p => ({ ...p, colors: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14 }} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button onClick={saveProduct} disabled={saving} style={{ background: "#0a7c45", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 11, fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Enregistrement..." : `✓ ${editProduct ? "Enregistrer les modifications" : "Publier le produit"}`}
                  </button>
                  <button onClick={() => setShowProductForm(false)} style={{ background: "#f4f4f4", color: "#555", border: "none", padding: "12px 22px", borderRadius: 11, fontWeight: 500, fontSize: 14, cursor: "pointer" }}>
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {loading ? <p style={{ color: "#aaa" }}>Chargement...</p> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 14 }}>
                {products.map(p => (
                  <div key={p.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", overflow: "hidden" }}>
                    <div style={{ height: 160, overflow: "hidden", background: "#f8f7f4", position: "relative" }}>
                      <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                      <div style={{ position: "absolute", top: 8, right: 8, background: p.stock < 10 ? "#fce8e8" : "#e6f7ef", color: p.stock < 10 ? "#c0392b" : "#0a7c45", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>
                        Stock: {p.stock}
                      </div>
                    </div>
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>{p.category}</div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{p.name}</div>
                      <div style={{ fontWeight: 800, fontSize: 17, color: "#FF6B00", marginBottom: 12 }}>{fmt(p.price)}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openEditProduct(p)} style={{ flex: 1, background: "#e8f0fe", color: "#1a56db", border: "none", padding: "8px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>✏️ Modifier</button>
                        <button onClick={() => deleteProduct(p.id)} style={{ background: "#fce8e8", color: "#c0392b", border: "none", padding: "8px 12px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>🗑</button>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 2 }}>Commandes</h2>
                <p style={{ fontSize: 13, color: "#888" }}>{orders.length} commande{orders.length > 1 ? "s" : ""} au total</p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input placeholder="🔍 Rechercher..." value={searchOrder} onChange={e => setSearchOrder(e.target.value)} style={{ padding: "10px 16px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 13, width: 220 }} />
                <button onClick={() => exportToExcel(orders)} style={{ background: "#0a7c45", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  📊 Exporter Excel
                </button>
                <button onClick={() => exportToExcel(filteredOrders, "selection")} disabled={filteredOrders.length === orders.length} style={{ background: "#1a56db", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: filteredOrders.length === orders.length ? 0.4 : 1 }}>
                  📋 Exporter sélection
                </button>
              </div>
            </div>

            {loading ? <p style={{ color: "#aaa" }}>Chargement...</p> : filteredOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#bbb" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                <div>Aucune commande trouvée</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filteredOrders.map(o => {
                  const sc = STATUS_COLORS[o.status] || { bg: "#f4f4f4", color: "#888" };
                  return (
                    <div key={o.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", padding: "18px 22px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{o.id}</div>
                          <div style={{ fontSize: 13, color: "#555" }}>👤 <strong>{o.client_nom}</strong> · 📞 {o.client_telephone}</div>
                          <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>📍 {o.client_adresse}</div>
                          <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>📅 {o.date} · 💳 {o.paiement} · {o.items} article{o.items > 1 ? "s" : ""}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 900, fontSize: 20, color: "#1a1a1a" }}>{fmt(o.total)}</div>
                          <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Commission: -{fmt(Math.round(o.total * COMMISSION / 100))}</div>
                          <div style={{ fontSize: 11, color: "#0a7c45", fontWeight: 600 }}>Net: {fmt(o.total - Math.round(o.total * COMMISSION / 100))}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ ...S.badge(sc.bg, sc.color) }}>{o.status}</span>
                        <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 12, cursor: "pointer" }}>
                          {["En cours","En transit","Livré","Annulé"].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <button onClick={() => window.open(`https://wa.me/${o.client_telephone?.replace(/\D/g,"")}?text=${encodeURIComponent(`Bonjour ${o.client_nom} 👋\n\nVotre commande *${o.id}* est maintenant *"${o.status}"*.\n\nMerci de votre confiance ! 🛍\n*Marché+*`)}`, "_blank")} style={{ background: "#25D366", color: "#fff", border: "none", padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          📱 Notifier
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* UTILISATEURS */}
        {tab === "users" && (
          <>
            <div style={{ marginBottom: 22 }}>
              <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 2 }}>Utilisateurs</h2>
              <p style={{ fontSize: 13, color: "#888" }}>{users.length} utilisateur{users.length > 1 ? "s" : ""} inscrit{users.length > 1 ? "s" : ""}</p>
            </div>

            {/* Rapport mensuel */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", padding: "20px 22px", marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>📧 Rapport mensuel des ventes</h3>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 14 }}>Générez un rapport mensuel et envoyez-le par email</p>
              <div style={{ background: "#f8f7f4", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
                {(() => {
                  const now = new Date();
                  const month = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
                  const monthOrders = orders.filter(o => o.date?.startsWith(now.toISOString().slice(0,7)));
                  const monthRevenue = monthOrders.reduce((s, o) => s + o.total, 0);
                  return (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      {[
                        { label: "Mois", value: month },
                        { label: "Commandes", value: monthOrders.length },
                        { label: "CA du mois", value: fmt(monthRevenue) },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: "center" }}>
                          <div style={{ fontWeight: 800, fontSize: 16 }}>{s.value}</div>
                          <div style={{ fontSize: 12, color: "#888" }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
              <button onClick={() => {
                const now = new Date();
                const month = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
                const monthOrders = orders.filter(o => o.date?.startsWith(now.toISOString().slice(0,7)));
                const monthRevenue = monthOrders.reduce((s, o) => s + o.total, 0);
                const commission = Math.round(monthRevenue * 0.1);
                const rapport = `📊 RAPPORT MENSUEL MARCHÉ+
${month}

` +
                  `💰 Chiffre d'affaires: ${fmt(monthRevenue)}
` +
                  `📦 Commandes: ${monthOrders.length}
` +
                  `✅ Livrées: ${monthOrders.filter(o => o.status === "Livré").length}
` +
                  `⏳ En cours: ${monthOrders.filter(o => o.status === "En cours").length}

` +
                  `Généré le ${new Date().toLocaleDateString("fr-FR")} par Marché+`;
                const mailtoLink = "mailto:kone91139@gmail.com?subject=" + encodeURIComponent("Rapport mensuel Marché+ - " + month) + "&body=" + encodeURIComponent(rapport);
                window.open(mailtoLink);
              }} style={{ background: "#1a56db", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                📧 Envoyer le rapport par email
              </button>
            </div>

            {loading ? <p style={{ color: "#aaa" }}>Chargement...</p> : users.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#bbb" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                <div>Aucun utilisateur enregistré</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Les utilisateurs apparaîtront ici après leur première connexion</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {users.map(u => (
                  <div key={u.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #ebebeb", padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FF6B00", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                      {u.email?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{u.email}</div>
                      <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>Inscrit le {new Date(u.created_at).toLocaleDateString("fr-FR")}</div>
                    </div>
                    <span style={{ background: u.statut === "bloque" ? "#fce8e8" : "#e6f7ef", color: u.statut === "bloque" ? "#c0392b" : "#0a7c45", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 99 }}>
                      {u.statut === "bloque" ? "🚫 Bloqué" : "✅ Actif"}
                    </span>
                    <button onClick={async () => {
                      const newStatus = u.statut === "bloque" ? "actif" : "bloque";
                      await supabase.from("utilisateurs").upsert({ id: u.id, email: u.email, statut: newStatus });
                      setUsers(us => us.map(x => x.id === u.id ? { ...x, statut: newStatus } : x));
                    }} style={{ background: u.statut === "bloque" ? "#e6f7ef" : "#fce8e8", color: u.statut === "bloque" ? "#0a7c45" : "#c0392b", border: "none", padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {u.statut === "bloque" ? "Débloquer" : "Bloquer"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* FAQ / CONTACT */}
        {tab === "livreurs" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 22, color: "#1A0A2E" }}>🚚 Livreurs</h2>
                <p style={{ fontSize: 13, color: "#9CA3AF" }}>Gérez vos livreurs et assignez les commandes</p>
              </div>
              <button onClick={() => setShowAddLivreur(true)} style={{ background: `linear-gradient(135deg, ${VIOLET}, ${VIOLET_DARK})`, color: "#fff", border: "none", padding: "11px 22px", borderRadius: 99, fontWeight: 700, fontSize: 14 }}>
                + Ajouter un livreur
              </button>
            </div>

            {showAddLivreur && (
              <div style={{ background: "#fff", borderRadius: 16, border: `1.5px solid ${VIOLET}`, padding: "24px", marginBottom: 20 }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: VIOLET, marginBottom: 16 }}>➕ Nouveau livreur</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  {[{ label: "Nom complet", key: "nom", placeholder: "Ex: Moussa Coulibaly" }, { label: "Téléphone", key: "telephone", placeholder: "Ex: +223 91 00 00 00" }, { label: "Zone de livraison", key: "zone", placeholder: "Ex: Bamako centre, ACI 2000..." }].map(f => (
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
                  }} style={{ background: `linear-gradient(135deg, #059669, #047857)`, color: "#fff", border: "none", padding: "11px 24px", borderRadius: 99, fontWeight: 700, fontSize: 14 }}>✓ Enregistrer</button>
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ background: l.statut === "disponible" ? "#D1FAE5" : "#FEE2E2", color: l.statut === "disponible" ? "#059669" : "#DC2626", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 99 }}>
                      {l.statut === "disponible" ? "✓ Disponible" : "✗ Occupé"}
                    </span>
                    <span style={{ fontSize: 12, color: "#9CA3AF" }}>📦 {l.commandes_livrees} livraisons</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button onClick={async () => { await supabase.from("livreurs").update({ statut: l.statut === "disponible" ? "occupe" : "disponible" }).eq("id", l.id); loadAll(); }}
                      style={{ flex: 1, background: "#EDE9FE", color: VIOLET, border: "none", padding: "8px", borderRadius: 9, fontSize: 12, fontWeight: 600 }}>
                      {l.statut === "disponible" ? "Marquer occupé" : "Marquer disponible"}
                    </button>
                    <button onClick={async () => { if (!window.confirm("Supprimer ce livreur ?")) return; await supabase.from("livreurs").delete().eq("id", l.id); loadAll(); }}
                      style={{ background: "#FEE2E2", color: "#DC2626", border: "none", padding: "8px 12px", borderRadius: 9, fontSize: 12 }}>🗑</button>
                  </div>
                </div>
              ))}
              {livreurs.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "#9CA3AF", gridColumn: "1/-1" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🚚</div>
                <div>Aucun livreur enregistré</div>
              </div>}
            </div>

            {/* Assigner livreur aux commandes */}
            <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, padding: "20px" }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: "#1A0A2E" }}>📦 Assigner un livreur aux commandes en attente</h3>
              {orders.filter(o => o.status === "En cours").map(o => (
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
                  }} style={{ padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${BORDER}`, fontSize: 13, background: BG }}>
                    <option value="">Choisir un livreur</option>
                    {livreurs.filter(l => l.statut === "disponible").map(l => (
                      <option key={l.id} value={l.id}>{l.nom} — {l.zone}</option>
                    ))}
                  </select>
                </div>
              ))}
              {orders.filter(o => o.status === "En cours").length === 0 && <p style={{ color: "#9CA3AF", fontSize: 13 }}>Aucune commande en attente de livraison</p>}
            </div>
          </>
        )}

        {tab === "rapport" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 22, color: "#1A0A2E" }}>📈 Rapport mensuel</h2>
                <p style={{ fontSize: 13, color: "#9CA3AF" }}>{new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</p>
              </div>
              <button onClick={() => {
                const rapport = `📊 *RAPPORT MENSUEL — MARCHÉ+*\n${new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}\n\n💰 CA total : ${fmt(orders.reduce((s,o) => s+o.total, 0))}\n📦 Commandes : ${orders.length}\n🛍 Produits : ${products.length}\n🏪 Vendeurs : ${vendors.length}\n👥 Clients : ${users.length}\n\n✅ Livrées : ${orders.filter(o=>o.status==="Livrée").length}\n⏳ En cours : ${orders.filter(o=>o.status==="En cours").length}\n❌ Annulées : ${orders.filter(o=>o.status==="Annulé").length}\n\n📉 Commission totale : ${fmt(Math.round(orders.reduce((s,o)=>s+o.total,0)*0.1))}\n\nMarché+ 🛍`;
                window.open(`https://wa.me/22391090523?text=${encodeURIComponent(rapport)}`, "_blank");
              }} style={{ background: "#25D366", color: "#fff", border: "none", padding: "11px 22px", borderRadius: 99, fontWeight: 700, fontSize: 14 }}>
                📱 Envoyer sur WhatsApp
              </button>
            </div>

            {/* Stats globales */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
              {[
                { label: "CA total", value: fmt(orders.reduce((s,o) => s+o.total, 0)), icon: "💰", color: "#6B21A8" },
                { label: "Commission (10%)", value: fmt(Math.round(orders.reduce((s,o) => s+o.total, 0)*0.1)), icon: "📊", color: "#DC2626" },
                { label: "Commandes total", value: orders.length, icon: "📦", color: "#D4AF37" },
                { label: "Clients inscrits", value: users.length, icon: "👥", color: "#059669" },
                { label: "Produits en ligne", value: products.length, icon: "🛍", color: "#6B21A8" },
                { label: "Vendeurs actifs", value: vendors.filter(v=>v.statut==="approuve").length, icon: "🏪", color: "#1a56db" },
              ].map(s => (
                <div key={s.label} style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E0FF", padding: "18px 16px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: s.color }} />
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontWeight: 900, fontSize: 20, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Statuts commandes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E0FF", padding: "20px" }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#1A0A2E" }}>📦 Statuts des commandes</h3>
                {[
                  { label: "En cours", color: "#6B21A8", count: orders.filter(o=>o.status==="En cours").length },
                  { label: "En transit", color: "#D4AF37", count: orders.filter(o=>o.status==="En transit").length },
                  { label: "Livrée", color: "#059669", count: orders.filter(o=>o.status==="Livrée").length },
                  { label: "Annulé", color: "#DC2626", count: orders.filter(o=>o.status==="Annulé").length },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
                      <span style={{ fontSize: 14 }}>{s.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 100, height: 6, background: "#E8E0FF", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ width: `${orders.length ? (s.count/orders.length*100) : 0}%`, height: "100%", background: s.color, borderRadius: 99 }} />
                      </div>
                      <span style={{ fontWeight: 700, color: s.color, fontSize: 14, minWidth: 20 }}>{s.count}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top vendeurs */}
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E0FF", padding: "20px" }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#1A0A2E" }}>🏆 Top vendeurs</h3>
                {vendors.map(v => {
                  const ventes = orders.filter(o=>o.vendeur_id===v.id).reduce((s,o)=>s+o.total,0);
                  return { ...v, ventes };
                }).sort((a,b)=>b.ventes-a.ventes).slice(0,5).map((v, i) => (
                  <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: i===0?"#D4AF37":i===1?"#9CA3AF":i===2?"#CD7F32":"#E8E0FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: i<3?"#fff":"#6B21A8" }}>{i+1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{v.nom_boutique}</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>{fmt(v.ventes)}</div>
                    </div>
                  </div>
                ))}
                {vendors.length === 0 && <p style={{ color: "#9CA3AF", fontSize: 13 }}>Aucun vendeur</p>}
              </div>
            </div>

            {/* Top produits */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E0FF", padding: "20px" }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#1A0A2E" }}>🛍 Top produits vendus</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 12 }}>
                {products.slice(0,6).map((p, i) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", background: "#F5F2FF", borderRadius: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", background: "#E8E0FF", flexShrink: 0 }}>
                      {p.image ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>🛍</div>}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "#D4AF37", fontWeight: 700 }}>{fmt(p.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "rapport" && (
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ fontWeight: 800, fontSize: 22, color: "#1A0A2E" }}>📈 Rapport mensuel</h2>
              <button onClick={() => {
                const rapport = `📊 *RAPPORT MENSUEL — MARCHÉ+*\n${new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}\n\n💰 CA total : ${fmt(orders.reduce((s,o) => s+o.total, 0))}\n📦 Commandes : ${orders.length}\n🛍 Produits : ${products.length}\n🏪 Vendeurs : ${vendors.length}\n👥 Clients : ${users.length}\n\n✅ Livrées : ${orders.filter(o=>o.status==="Livré").length}\n⏳ En cours : ${orders.filter(o=>o.status==="En cours").length}\n❌ Annulées : ${orders.filter(o=>o.status==="Annulé").length}\n\n📉 Commission totale : ${fmt(Math.round(orders.reduce((s,o)=>s+o.total,0)*0.1))}\n\nMarché+ 🛍`;
                window.open(`https://wa.me/22391090523?text=${encodeURIComponent(rapport)}`, "_blank");
              }} style={{ background: "#25D366", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 99, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>📱 Envoyer sur WhatsApp</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
              {[
                { label: "CA total", value: fmt(orders.reduce((s,o) => s+o.total, 0)), icon: "💰", color: VIOLET },
                { label: "Commission (10%)", value: fmt(Math.round(orders.reduce((s,o) => s+o.total, 0)*0.1)), icon: "📊", color: "#DC2626" },
                { label: "Commandes total", value: orders.length, icon: "📦", color: JAUNE },
                { label: "Clients inscrits", value: users.length, icon: "👥", color: "#059669" },
                { label: "Produits en ligne", value: products.length, icon: "🛍", color: VIOLET },
                { label: "Vendeurs actifs", value: vendors.filter(v=>v.statut==="approuve").length, icon: "🏪", color: "#1a56db" },
              ].map(s => (
                <div key={s.label} style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, padding: "18px 16px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: s.color }} />
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontWeight: 900, fontSize: 20, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, padding: "20px" }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📦 Statuts commandes</h3>
                {[
                  { label: "En cours", color: VIOLET, count: orders.filter(o=>o.status==="En cours").length },
                  { label: "En transit", color: JAUNE, count: orders.filter(o=>o.status==="En transit").length },
                  { label: "Livré", color: "#059669", count: orders.filter(o=>o.status==="Livré").length },
                  { label: "Annulé", color: "#DC2626", count: orders.filter(o=>o.status==="Annulé").length },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
                      <span style={{ fontSize: 14 }}>{s.label}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: s.color }}>{s.count}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, padding: "20px" }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🏆 Top vendeurs</h3>
                {vendors.map(v => ({ ...v, ventes: orders.filter(o=>o.vendeur_id===v.id).reduce((s,o)=>s+o.total,0) })).sort((a,b)=>b.ventes-a.ventes).slice(0,5).map((v, i) => (
                  <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: i===0?"#D4AF37":i===1?"#9CA3AF":"#CD7F32", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: "#fff" }}>{i+1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{v.nom_boutique}</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>{fmt(v.ventes)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "promos" && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 22, color: "#1A0A2E", marginBottom: 20 }}>🏷 Codes promo</h2>
            <PromoManager supabase={supabase} fmt={fmt} />
          </div>
        )}

        {tab === "flashsale" && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 22, color: "#1A0A2E", marginBottom: 20 }}>⚡ Flash Sales</h2>
            <FlashSaleManager supabase={supabase} products={products} fmt={fmt} />
          </div>
        )}

        {tab === "annonces" && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 22, color: "#1A0A2E", marginBottom: 20 }}>📢 Annonces</h2>
            <AnnonceManager supabase={supabase} />
          </div>
        )}

        {tab === "faq" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 2 }}>FAQ & Contact</h2>
                <p style={{ fontSize: 13, color: "#888" }}>Gérez les questions fréquentes de vos clients</p>
              </div>
              <button onClick={() => setShowFaqForm(!showFaqForm)} style={{ background: "#FF6B00", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                {showFaqForm ? "Annuler" : "+ Ajouter une question"}
              </button>
            </div>

            {showFaqForm && (
              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", padding: "20px", marginBottom: 20 }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Nouvelle question FAQ</h3>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Question</label>
                  <input value={newFaq.q} onChange={e => setNewFaq(p => ({ ...p, q: e.target.value }))} placeholder="Ex: Comment retourner un produit ?" style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14 }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Réponse</label>
                  <textarea value={newFaq.a} onChange={e => setNewFaq(p => ({ ...p, a: e.target.value }))} placeholder="Entrez la réponse..." rows={3} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, fontFamily: "inherit", resize: "vertical" }} />
                </div>
                <button onClick={() => {
                  if (!newFaq.q || !newFaq.a) return;
                  setFaqItems(prev => [...prev, newFaq]);
                  setNewFaq({ q: "", a: "" });
                  setShowFaqForm(false);
                }} style={{ background: "#0a7c45", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  ✓ Ajouter
                </button>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {faqItems.map((item, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 12, border: "1px solid #ebebeb", padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#FF6B00", marginBottom: 6 }}>❓ {item.q}</div>
                      <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>💬 {item.a}</div>
                    </div>
                    <button onClick={() => setFaqItems(prev => prev.filter((_, j) => j !== i))} style={{ background: "#fce8e8", color: "#c0392b", border: "none", padding: "5px 10px", borderRadius: 7, fontSize: 12, cursor: "pointer", flexShrink: 0 }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Info contact */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", padding: "20px 22px", marginTop: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>📞 Informations de contact</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "WhatsApp", value: "+223 91 09 05 23", icon: "📱" },
                  { label: "Email", value: "kone91139@gmail.com", icon: "📧" },
                  { label: "Boutique en ligne", value: "marche-plus.vercel.app", icon: "🌐" },
                  { label: "Admin", value: "marche-plus.vercel.app/admin.html", icon: "⚙️" },
                ].map(c => (
                  <div key={c.label} style={{ background: "#f8f7f4", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>{c.icon} {c.label}</div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* VENDEURS */}
        {tab === "vendors" && (
          <>
            <div style={{ marginBottom: 22 }}>
              <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 2 }}>Vendeurs</h2>
              <p style={{ fontSize: 13, color: "#888" }}>{vendors.length} vendeur{vendors.length > 1 ? "s" : ""} inscrit{vendors.length > 1 ? "s" : ""}</p>
            </div>
            {loading ? <p style={{ color: "#aaa" }}>Chargement...</p> : vendors.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#bbb" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
                <div>Aucun vendeur inscrit pour le moment</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 14 }}>
                {vendors.map(v => (
                  <div key={v.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏪</div>
                      <div>
                       
                        <div style={{ fontSize: 12, color: "#888" }}>📞 {v.whatsapp}</div>
                      </div>
                    </div>
                    {v.description && <p style={{ fontSize: 13, color: "#666", marginBottom: 12, lineHeight: 1.5 }}>{v.description}</p>}
                    <div style={{ fontSize: 11, color: "#aaa", marginBottom: 12 }}>🔗 {v.slug}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ ...S.badge(v.statut === "approuve" ? "#e6f7ef" : "#fff8e1", v.statut === "approuve" ? "#0a7c45" : "#b76e00") }}>
                        {v.statut === "approuve" ? "✅ Approuvé" : "⏳ En attente"}
                      </span>
                      <button onClick={async () => {
                          await supabase.from("vendeurs").update({ verifie: !v.verifie }).eq("id", v.id);
                          loadAll();
                        }} style={{ background: v.verifie ? "#D1FAE5" : "#F5F2FF", color: v.verifie ? "#059669" : "#6B21A8", border: "none", padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          {v.verifie ? "✅ Vérifié" : "⬜ Vérifier"}
                        </button>
                        <button onClick={() => {
                          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://marche-plus.vercel.app/?boutique=${v.slug}`)}`;
                          window.open(qrUrl, "_blank");
                        }} style={{ background: "#EDE9FE", color: "#6B21A8", border: "none", padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          📱 QR Code
                        </button>
                        <select value={v.statut} onChange={async e => {
                        await supabase.from("vendeurs").update({ statut: e.target.value }).eq("id", v.id);
                        setVendors(vs => vs.map(x => x.id === v.id ? { ...x, statut: e.target.value } : x));
                      }} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 12, cursor: "pointer" }}>
                        <option value="approuve">Approuvé</option>
                        <option value="suspendu">Suspendu</option>
                        <option value="en_attente">En attente</option>
                      </select>
                      <button onClick={() => {
                        const ventes = orders.filter(o => o.vendeur_id === v.id).reduce((s, o) => s + o.total, 0);
                        const commission = Math.round(ventes * 0.1);
                        const msg = `Bonjour ${v.nom_boutique} 👋\n\n📊 *Récapitulatif du mois — Marché+*\n\n💰 Total ventes : ${fmt(ventes)}\n📉 Commission Marché+ (10%) : ${fmt(commission)}\n✅ Vos gains nets : ${fmt(ventes - commission)}\n\nMerci de nous envoyer *${fmt(commission)}* sur Orange Money au *91 09 05 23* avant le 05 du mois prochain.\n\nMerci pour votre confiance ! 🛍 Marché+`;
                        window.open(`https://wa.me/${v.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
                      }} style={{ background: "#25D366", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        📱 Récapitulatif WhatsApp
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  return loggedIn
    ? <AdminDashboard onLogout={() => { supabase.auth.signOut(); setLoggedIn(false); }} />
    : <AdminLogin onLogin={() => setLoggedIn(true)} />;
}
