import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { VendorRegister, VendorDashboard, VendorShopPage } from "./components/VendorSystem";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_KEY;
const WHATSAPP      = import.meta.env.VITE_WHATSAPP || "22391090523";
const ADMIN_EMAIL   = "kone91139@gmail.com";
const supabase      = createClient(SUPABASE_URL, SUPABASE_KEY);

const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
const genId = () => "CMD-" + Math.floor(100000 + Math.random() * 900000);

// ── Promo codes ───────────────────────────────────────────────────
const PROMO_CODES = {
  BIENVENUE: { discount: 10, label: "10% de réduction" },
  ETE2025:   { discount: 15, label: "15% de réduction" },
  FIDELITE:  { discount: 20, label: "20% de réduction" },
  MALI10:    { discount: 10, label: "10% de réduction" },
};

// ── Conditions d'utilisation ──────────────────────────────────────
function ConditionsPage({ onBack }) {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 16px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#6B21A8", fontSize: 14, cursor: "pointer", marginBottom: 20, fontWeight: 600 }}>← Retour</button>
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8E0FF", padding: "32px" }}>
        <h1 style={{ fontWeight: 900, fontSize: 26, color: "#1A0A2E", marginBottom: 6 }}>📋 Conditions d'utilisation</h1>
        <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 28 }}>Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>

        {[
          { title: "1. Présentation de Marché+", content: "Marché+ est une marketplace en ligne basée au Mali qui permet aux vendeurs de proposer leurs produits et aux clients de les acheter facilement. Nous facilitons les transactions entre acheteurs et vendeurs tout en prélevant une commission de 10% sur chaque vente." },
          { title: "2. Inscription et compte", content: "Pour utiliser Marché+, vous devez créer un compte avec une adresse email valide. Vous êtes responsable de la sécurité de votre compte et de toutes les activités qui s'y déroulent. Marché+ se réserve le droit de suspendre tout compte en cas d'abus." },
          { title: "3. Commandes et paiements", content: "Les commandes sont passées en ligne et confirmées par WhatsApp. Le paiement s'effectue par Orange Money, Moov Money ou à la livraison. Après confirmation du paiement, la commande est traitée dans les 24-48 heures." },
          { title: "4. Livraison", content: "Marché+ assure la livraison dans les principales villes du Mali. Les délais de livraison varient entre 1 et 5 jours ouvrables selon votre localisation. Les frais de livraison sont calculés en fonction de la distance." },
          { title: "5. Retours et remboursements", content: "Un produit peut être retourné dans les 48 heures suivant la réception si il est défectueux ou ne correspond pas à la description. Contactez-nous sur WhatsApp au +223 91 09 05 23 pour initier un retour. Les remboursements sont effectués dans les 5 jours ouvrables." },
          { title: "6. Vendeurs", content: "Les vendeurs doivent s'inscrire et être approuvés par Marché+ avant de vendre. Une commission de 10% est prélevée sur chaque vente. Les vendeurs sont responsables de la qualité et de la conformité de leurs produits." },
          { title: "7. Protection des données", content: "Marché+ collecte et utilise vos données personnelles uniquement pour traiter vos commandes et améliorer nos services. Vos données ne sont jamais vendues à des tiers. Vous pouvez demander la suppression de vos données à tout moment." },
          { title: "8. Contact", content: "Pour toute question, contactez-nous sur WhatsApp au +223 91 09 05 23 ou par email à kone91139@gmail.com. Notre équipe est disponible du lundi au samedi de 8h à 20h." },
        ].map(s => (
          <div key={s.title} style={{ marginBottom: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: "#6B21A8", marginBottom: 8 }}>{s.title}</h2>
            <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.8 }}>{s.content}</p>
          </div>
        ))}

        <div style={{ background: "#F5F2FF", borderRadius: 12, padding: "16px 20px", marginTop: 20, borderLeft: "4px solid #6B21A8" }}>
          <p style={{ fontSize: 13, color: "#6B21A8", fontWeight: 600 }}>En utilisant Marché+, vous acceptez ces conditions d'utilisation. Pour toute question, contactez-nous sur WhatsApp.</p>
        </div>
      </div>
    </div>
  );
}

// ── Auth ──────────────────────────────────────────────────────────
function AuthPage({ onAuth }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const emoji = hour < 12 ? "🌅" : hour < 18 ? "☀️" : "🌙";
  const [mode, setMode]       = useState("login");
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const submit = async () => {
    setError(""); setLoading(true);
    const fn = mode === "login"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password });
    const { data, error: e } = await fn;
    setLoading(false);
    if (e) { setError(e.message); return; }
    if (data.user) onAuth(data.user);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #4C1D95 0%, #6B21A8 60%, #D4AF37 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/logo.png" alt="Marché+" style={{ height: 80, objectFit: "contain", marginBottom: 12 }} onError={e => e.target.style.display="none"} />
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 99, padding: "8px 20px", display: "inline-block", marginBottom: 12, fontSize: 15, color: "#fff", fontWeight: 600 }}>
            {emoji} {greeting} ! Bienvenue sur Marché+
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 32, color: "#fff", letterSpacing: "-1px" }}>Marché+</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 4 }}>VOS ACCESSOIRES, VOTRE STYLE.</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 24, padding: "32px 28px", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
          <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 6, color: "#1A0A2E" }}>{mode === "login" ? "Connexion" : "Créer un compte"}</h2>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 24 }}>{mode === "login" ? "Connectez-vous pour continuer" : "Rejoignez Marché+ aujourd'hui"}</p>
          {[{ ph: "Email", val: email, set: setEmail, type: "email" }, { ph: "Mot de passe", val: password, set: setPass, type: "password" }].map(f => (
            <input key={f.ph} type={f.type} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)}
              style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "1.5px solid #E8E0FF", fontSize: 14, marginBottom: 12, background: "#F5F2FF" }} />
          ))}
          {error && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>✗ {error}</p>}
          <button onClick={submit} disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg, #6B21A8, #4C1D95)", color: "#fff", border: "none", padding: "14px", borderRadius: 12, fontWeight: 700, fontSize: 16, marginBottom: 16, boxShadow: "0 8px 24px rgba(107,33,168,0.3)", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
          <p style={{ textAlign: "center", fontSize: 13, color: "#9CA3AF" }}>
            {mode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
            <span onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{ color: "#6B21A8", fontWeight: 700, cursor: "pointer" }}>
              {mode === "login" ? "S'inscrire" : "Se connecter"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────
function Navbar({ page, setPage, cartCount, user, onLogout, onProfile, favCount, lang, setLang, onVendor, hasVendor }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav style={{ background: "#fff", borderBottom: "1px solid #E8E0FF", padding: "0 20px", display: "flex", alignItems: "center", gap: 12, height: 64, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(107,33,168,0.08)" }}>
      {/* Logo */}
      <div onClick={() => { setPage("home"); setMenuOpen(false); }} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, marginRight: "auto", flexShrink: 0 }}>
        <img src="/logo.png" alt="Marché+" style={{ height: 36, objectFit: "contain" }} onError={e => { e.target.style.display="none"; }} />
        <span style={{ fontWeight: 900, fontSize: 20, color: "#6B21A8", letterSpacing: "-0.5px" }}>Marché<span style={{ color: "#D4AF37" }}>+</span></span>
      </div>

      {/* Nav links desktop */}
      <div className="nav-links" style={{ display: "flex", gap: 4 }}>
        {[{ key: "home", label: "Accueil" }, { key: "shop", label: "Boutique" }, { key: "orders", label: "Commandes" }, { key: "tracking", label: "Suivi" }, { key: "tracking", label: "Suivi" }, { key: "tracking", label: "Suivi" }, { key: "tracking", label: "Suivi" }].map(({ key, label }) => (
          <button key={key} onClick={() => setPage(key)} style={{ background: page === key ? "#EDE9FE" : "transparent", color: page === key ? "#6B21A8" : "#6B7280", border: "none", padding: "8px 14px", borderRadius: 99, fontWeight: page === key ? 700 : 500, fontSize: 14 }}>{label}</button>
        ))}
      </div>

      {/* Actions desktop */}
      <div className="nav-user" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onVendor} style={{ background: hasVendor ? "#D1FAE5" : "linear-gradient(135deg, #6B21A8, #4C1D95)", color: hasVendor ? "#059669" : "#fff", border: "none", padding: "8px 14px", borderRadius: 99, fontSize: 13, fontWeight: 600 }}>
          🏪 {hasVendor ? "Ma boutique" : "Vendre"}
        </button>
        <button onClick={() => setPage("cart")} style={{ position: "relative", background: cartCount > 0 ? "#6B21A8" : "#F5F2FF", color: cartCount > 0 ? "#fff" : "#6B21A8", border: "none", padding: "8px 14px", borderRadius: 99, fontWeight: 700, fontSize: 14 }}>
          🛒 {cartCount > 0 && cartCount}
        </button>
        <button onClick={() => setPage("favorites")} style={{ background: "#F5F2FF", color: "#6B21A8", border: "none", padding: "8px 12px", borderRadius: 99, fontSize: 16 }}>
          {favCount > 0 ? "❤️" : "🤍"} {favCount > 0 && <span style={{ fontSize: 12 }}>{favCount}</span>}
        </button>
        <button onClick={onProfile} style={{ background: "#EDE9FE", color: "#6B21A8", border: "none", padding: "8px 14px", borderRadius: 99, fontWeight: 600, fontSize: 13 }}>
          👤 {user?.email?.split("@")[0]}
        </button>
        <button onClick={onLogout} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: 13, cursor: "pointer" }}>Déco</button>
      </div>

      {/* Mobile menu button */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="nav-mob">
        <button onClick={() => setPage("cart")} style={{ position: "relative", background: cartCount > 0 ? "#6B21A8" : "#F5F2FF", color: cartCount > 0 ? "#fff" : "#6B21A8", border: "none", width: 40, height: 40, borderRadius: "50%", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
          🛒
          {cartCount > 0 && <span style={{ position: "absolute", top: -2, right: -2, background: "#D4AF37", color: "#1A0A2E", width: 18, height: 18, borderRadius: "50%", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>}
        </button>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", fontSize: 22, color: "#6B21A8" }}>☰</button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-dropdown" style={{ position: "absolute", top: 64, left: 0, right: 0, background: "#fff", borderBottom: "1px solid #E8E0FF", padding: 16, display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 8px 24px rgba(107,33,168,0.1)", zIndex: 100 }}>
          {[{ key: "home", label: "🏠 Accueil" }, { key: "shop", label: "🛍 Boutique" }, { key: "orders", label: "📦 Commandes" }, { key: "favorites", label: "❤️ Favoris" }].map(({ key, label }) => (
            <button key={key} onClick={() => { setPage(key); setMenuOpen(false); }} style={{ background: page === key ? "#EDE9FE" : "transparent", color: page === key ? "#6B21A8" : "#1A0A2E", border: "none", padding: "12px 16px", borderRadius: 10, fontWeight: page === key ? 700 : 400, fontSize: 15, textAlign: "left" }}>{label}</button>
          ))}
          <button onClick={() => { onVendor(); setMenuOpen(false); }} style={{ background: "linear-gradient(135deg, #6B21A8, #4C1D95)", color: "#fff", border: "none", padding: "12px 16px", borderRadius: 10, fontWeight: 700, fontSize: 15, textAlign: "left" }}>🏪 {hasVendor ? "Ma boutique" : "Vendre"}</button>
          <button onClick={() => { onProfile(); setMenuOpen(false); }} style={{ background: "#F5F2FF", color: "#6B21A8", border: "none", padding: "12px 16px", borderRadius: 10, fontWeight: 600, fontSize: 15, textAlign: "left" }}>👤 Mon profil</button>
          <button onClick={() => { onLogout(); setMenuOpen(false); }} style={{ background: "none", border: "none", color: "#DC2626", padding: "12px 16px", fontSize: 15, textAlign: "left" }}>🚪 Déconnexion</button>
        </div>
      )}
    </nav>
  );
}

// ── Bottom Navigation (mobile) ────────────────────────────────────
function BottomNav({ page, setPage, cartCount, favCount, onProfile }) {
  const items = [
    { key: "home", label: "Accueil", icon: "🏠" },
    { key: "shop", label: "Catégories", icon: "🔲" },
    { key: "cart", label: "Panier", icon: "🛒", badge: cartCount },
    { key: "favorites", label: "Favoris", icon: "❤️", badge: favCount },
    { key: "profile", label: "Profil", icon: "👤" },
  ];
  return (
    <div className="bottom-nav" style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
      {items.map(item => (
        <button key={item.key} onClick={() => item.key === "profile" ? onProfile() : setPage(item.key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", color: page === item.key ? "#6B21A8" : "#9CA3AF", position: "relative", padding: "4px 8px" }}>
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          {item.badge > 0 && <span style={{ position: "absolute", top: 0, right: 0, background: "#D4AF37", color: "#1A0A2E", width: 16, height: 16, borderRadius: "50%", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.badge}</span>}
          <span style={{ fontSize: 10, fontWeight: page === item.key ? 700 : 400 }}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────
function ProductCard({ p, onSelect, onAdd, isFavorite, onToggleFav }) {
  const [hovered, setHovered] = useState(false);
  const hasDiscount = p.prix_original && p.prix_original > p.price;
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E0FF", overflow: "hidden", cursor: "pointer", transition: "all .3s", transform: hovered ? "translateY(-4px)" : "none", boxShadow: hovered ? "0 16px 40px rgba(107,33,168,0.15)" : "0 2px 8px rgba(107,33,168,0.05)" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => onSelect(p)}>
      <div style={{ position: "relative", height: 180, background: "#F5F2FF", overflow: "hidden" }}>
        <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s", transform: hovered ? "scale(1.06)" : "scale(1)" }} onError={e => e.target.style.display = "none"} />
        <button onClick={e => { e.stopPropagation(); onToggleFav(p); }} style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.95)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          {isFavorite(p.id) ? "❤️" : "🤍"}
        </button>
        {hasDiscount && <div style={{ position: "absolute", top: 10, left: 10, background: "#DC2626", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 99 }}>-{p.reduction}%</div>}
        {p.stock < 10 && !hasDiscount && <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(220,38,38,0.9)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99 }}>Stock limité</div>}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 10, color: "#6B21A8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>{p.category}</div>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, lineHeight: 1.3, color: "#1A0A2E" }}>{p.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 8 }}>
          {[1,2,3,4,5].map(n => <span key={n} style={{ fontSize: 10, color: n <= Math.round(p.rating) ? "#D4AF37" : "#E8E0FF" }}>★</span>)}
          <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 2 }}>{p.rating}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: "#D4AF37" }}>{fmt(p.price)}</div>
            {hasDiscount && <div style={{ fontSize: 11, color: "#9CA3AF", textDecoration: "line-through" }}>{fmt(p.prix_original)}</div>}
          </div>
          <button onClick={e => { e.stopPropagation(); onAdd(p); }} style={{ background: "linear-gradient(135deg, #6B21A8, #4C1D95)", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700, boxShadow: "0 4px 12px rgba(107,33,168,0.25)" }}>
            + Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Home Page ─────────────────────────────────────────────────────
function HomePage({ products, onSelect, onAdd, isFavorite, onToggleFav, setPage }) {
  const [slide, setSlide] = useState(0);
  const featured = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);

  const SLIDES = [
    { title: "NOUVEAUTÉS", sub: "Chaque jour de nouveaux produits !", cta: "Découvrir", bg: "linear-gradient(135deg, #4C1D95, #6B21A8)", img: "🛍" },
    { title: "PROMOTIONS", sub: "Jusqu'à -50% sur une sélection", cta: "Profiter", bg: "linear-gradient(135deg, #6B21A8, #D4AF37)", img: "🏷" },
    { title: "LIVRAISON", sub: "Rapide et sécurisée partout au Mali", cta: "Commander", bg: "linear-gradient(135deg, #1A0A2E, #4C1D95)", img: "🚚" },
  ];

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 16px 40px" }}>

      {/* Bannière principale */}
      <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 20, position: "relative", height: 180 }}>
        {SLIDES.map((s, i) => (
          <div key={i} style={{ position: "absolute", inset: 0, background: s.bg, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", opacity: i === slide ? 1 : 0, transition: "opacity .5s", pointerEvents: i === slide ? "auto" : "none" }}>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 6 }}>Marché+ Mali</div>
              <h2 style={{ fontWeight: 900, fontSize: 24, color: "#fff", marginBottom: 6, lineHeight: 1.1 }}>{s.title}</h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 16 }}>{s.sub}</p>
              <button onClick={() => setPage("shop")} style={{ background: "#D4AF37", color: "#1A0A2E", border: "none", padding: "10px 20px", borderRadius: 99, fontWeight: 800, fontSize: 14 }}>
                {s.cta} →
              </button>
            </div>
            <div style={{ fontSize: 70, opacity: 0.8 }}>{s.img}</div>
          </div>
        ))}
        {/* Dots */}
        <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
          {SLIDES.map((_, i) => <div key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 20 : 7, height: 7, borderRadius: 99, background: i === slide ? "#D4AF37" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all .3s" }} />)}
        </div>
      </div>

      {/* Catégories */}
      <div className="home-cats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Mode", icon: "👗", color: "#6B21A8", bg: "#EDE9FE" },
          { label: "Électronique", icon: "📱", color: "#1a56db", bg: "#e8f0fe" },
          { label: "Maison", icon: "🏠", color: "#059669", bg: "#D1FAE5" },
          { label: "Bureau", icon: "💼", color: "#D4AF37", bg: "#FEF3C7" },
        ].map(c => (
          <div key={c.label} onClick={() => setPage("shop")} style={{ background: c.bg, borderRadius: 14, padding: "16px 12px", textAlign: "center", cursor: "pointer", transition: "transform .2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{c.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: c.color }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Bannière promo */}
      <div style={{ background: "linear-gradient(135deg, #D4AF37, #B8960C)", borderRadius: 14, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#1A0A2E" }}>🎁 Code promo BIENVENUE</div>
          <div style={{ fontSize: 13, color: "#333", marginTop: 2 }}>10% de réduction sur votre première commande !</div>
        </div>
        <button onClick={() => setPage("shop")} style={{ background: "#1A0A2E", color: "#D4AF37", border: "none", padding: "10px 20px", borderRadius: 99, fontWeight: 700, fontSize: 13 }}>
          Profiter →
        </button>
      </div>

      {/* Nos meilleures offres */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontWeight: 800, fontSize: 18, color: "#1A0A2E" }}>⭐ Nos meilleures offres</h2>
          <button onClick={() => setPage("shop")} style={{ background: "none", border: "1px solid #6B21A8", color: "#6B21A8", padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>Voir tout →</button>
        </div>
        <div className="home-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 14 }}>
          {featured.map(p => <ProductCard key={p.id} p={p} onSelect={onSelect} onAdd={onAdd} isFavorite={isFavorite} onToggleFav={onToggleFav} />)}
        </div>
      </div>

      {/* Nouveautés */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontWeight: 800, fontSize: 18, color: "#1A0A2E" }}>🆕 Nouveautés</h2>
          <button onClick={() => setPage("shop")} style={{ background: "none", border: "1px solid #6B21A8", color: "#6B21A8", padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>Voir tout →</button>
        </div>
        <div className="home-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 14 }}>
          {newArrivals.map(p => <ProductCard key={p.id} p={p} onSelect={onSelect} onAdd={onAdd} isFavorite={isFavorite} onToggleFav={onToggleFav} />)}
        </div>
      </div>

      {/* Avantages */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 12, marginBottom: 32 }}>
        {[
          { icon: "✅", title: "Produits de qualité", desc: "Sélectionnés avec soin" },
          { icon: "💰", title: "Prix compétitifs", desc: "Meilleurs prix du marché" },
          { icon: "🚚", title: "Livraison rapide", desc: "1-3 jours au Mali" },
          { icon: "🎧", title: "Support à l'écoute", desc: "Via WhatsApp" },
        ].map(a => (
          <div key={a.title} style={{ background: "#fff", borderRadius: 14, padding: "16px 12px", textAlign: "center", border: "1px solid #E8E0FF" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{a.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#6B21A8", marginBottom: 4 }}>{a.title}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>{a.desc}</div>
          </div>
        ))}
      </div>

      {/* Bannière parrainage */}
      <div style={{ background: "linear-gradient(135deg, #4C1D95, #6B21A8)", borderRadius: 16, padding: "24px 28px", textAlign: "center", color: "#fff" }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🎁</div>
        <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Invitez vos amis — Gagnez 1 000 FCFA !</h3>
        <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 16 }}>Pour chaque ami qui commande, recevez 1 000 FCFA de réduction</p>
        <button onClick={() => setPage("profile")} style={{ background: "#D4AF37", color: "#1A0A2E", border: "none", padding: "10px 24px", borderRadius: 99, fontWeight: 700, fontSize: 14 }}>
          Commencer à parrainer →
        </button>
      </div>
    </div>
  );
}

// ── Shop Page ─────────────────────────────────────────────────────
function ShopPage({ products, onAdd, onSelect, favorites, onToggleFav, isFavorite }) {
  const [search, setSearch] = useState("");
  const [cat, setCat]       = useState("Tous");
  const CATS = ["Tous", "Mode", "Électronique", "Maison", "Bureau"];
  const filtered = products.filter(p =>
    (cat === "Tous" || p.category === cat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>
      {/* Search + filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input placeholder="🔍 Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "11px 18px", borderRadius: 99, border: "1.5px solid #E8E0FF", fontSize: 14, background: "#fff" }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ background: cat === c ? "#6B21A8" : "#fff", color: cat === c ? "#fff" : "#6B7280", border: `1.5px solid ${cat === c ? "#6B21A8" : "#E8E0FF"}`, padding: "8px 18px", borderRadius: 99, fontWeight: cat === c ? 700 : 500, fontSize: 13, flexShrink: 0 }}>
            {c}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9CA3AF" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <div style={{ fontWeight: 600 }}>Aucun produit trouvé</div>
        </div>
      ) : (
        <div className="product-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {filtered.map(p => <ProductCard key={p.id} p={p} onSelect={onSelect} onAdd={onAdd} isFavorite={isFavorite} onToggleFav={onToggleFav} />)}
        </div>
      )}
    </div>
  );
}

// ── Product Detail ────────────────────────────────────────────────
function ProductDetailPage({ product: p, onAdd, onBack, isFavorite, onToggleFav }) {
  const [qty, setQty]         = useState(1);
  const [mainImg, setMainImg] = useState(p.image);
  const [selColor, setColor]  = useState("");
  const [selSize, setSize]    = useState("");
  const images = p.images ? (Array.isArray(p.images) ? p.images : p.images.split(",").filter(Boolean)) : [p.image];
  const colors = p.colors ? p.colors.split(",").map(s => s.trim()) : [];
  const sizes  = p.sizes  ? p.sizes.split(",").map(s => s.trim())  : [];
  const hasDiscount = p.prix_original && p.prix_original > p.price;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 16px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#6B21A8", fontSize: 14, cursor: "pointer", marginBottom: 20, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>← Retour à la boutique</button>

      {/* Share buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "WhatsApp", bg: "#25D366", url: `https://wa.me/?text=${encodeURIComponent(`Regardez ce produit sur Marché+ : ${p.name} - ${fmt(p.price)}`)}` },
          { label: "Facebook", bg: "#1877F2", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` },
        ].map(s => (
          <a key={s.label} href={s.url} target="_blank" rel="noreferrer" style={{ background: s.bg, color: "#fff", padding: "8px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>{s.label}</a>
        ))}
        <button onClick={() => navigator.clipboard.writeText(window.location.href)} style={{ background: "#F5F2FF", color: "#6B21A8", border: "none", padding: "8px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600 }}>Copier lien</button>
      </div>

      <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        {/* Images */}
        <div>
          <div style={{ borderRadius: 16, overflow: "hidden", height: 320, background: "#F5F2FF", marginBottom: 12, position: "relative" }}>
            <img src={mainImg} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display="none"} />
            {hasDiscount && <div style={{ position: "absolute", top: 12, left: 12, background: "#DC2626", color: "#fff", fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 99 }}>-{p.reduction}%</div>}
            <button onClick={() => onToggleFav(p)} style={{ position: "absolute", top: 12, right: 12, width: 36, height: 36, borderRadius: "50%", background: "#fff", border: "none", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              {isFavorite(p.id) ? "❤️" : "🤍"}
            </button>
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8 }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setMainImg(img)} style={{ width: 72, height: 72, borderRadius: 10, overflow: "hidden", border: `2px solid ${mainImg === img ? "#6B21A8" : "#E8E0FF"}`, cursor: "pointer" }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div>
          <div style={{ fontSize: 11, color: "#6B21A8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>{p.category}</div>
          <h1 style={{ fontWeight: 900, fontSize: 22, color: "#1A0A2E", marginBottom: 8, lineHeight: 1.3 }}>{p.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            {[1,2,3,4,5].map(n => <span key={n} style={{ fontSize: 14, color: n <= Math.round(p.rating) ? "#D4AF37" : "#E8E0FF" }}>★</span>)}
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>{p.rating} ({p.reviews || 0} avis)</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
            <span style={{ fontWeight: 900, fontSize: 28, color: "#D4AF37" }}>{fmt(p.price)}</span>
            {hasDiscount && <span style={{ fontSize: 16, color: "#9CA3AF", textDecoration: "line-through" }}>{fmt(p.prix_original)}</span>}
          </div>
          {p.description && <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7, marginBottom: 16 }}>{p.description}</p>}
          {colors.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Couleur : <span style={{ color: "#6B21A8" }}>{selColor || "Choisir"}</span></div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {colors.map(c => <button key={c} onClick={() => setColor(c)} style={{ padding: "6px 14px", borderRadius: 99, border: `2px solid ${selColor === c ? "#6B21A8" : "#E8E0FF"}`, background: selColor === c ? "#EDE9FE" : "#fff", fontWeight: selColor === c ? 700 : 400, fontSize: 13 }}>{c}</button>)}
              </div>
            </div>
          )}
          {sizes.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Taille : <span style={{ color: "#6B21A8" }}>{selSize || "Choisir"}</span></div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {sizes.map(s => <button key={s} onClick={() => setSize(s)} style={{ width: 40, height: 40, borderRadius: 8, border: `2px solid ${selSize === s ? "#6B21A8" : "#E8E0FF"}`, background: selSize === s ? "#EDE9FE" : "#fff", fontWeight: selSize === s ? 700 : 400, fontSize: 13 }}>{s}</button>)}
              </div>
            </div>
          )}
          <div style={{ fontSize: 12, color: p.stock < 10 ? "#DC2626" : "#059669", fontWeight: 600, marginBottom: 16 }}>
            {p.stock < 10 ? `⚠ Plus que ${p.stock} en stock` : `✓ ${p.stock} disponibles`}
          </div>
          {/* Quantité + Ajouter */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1.5px solid #E8E0FF", borderRadius: 99, overflow: "hidden" }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 36, height: 36, background: "none", border: "none", fontSize: 18, color: "#6B21A8", fontWeight: 700 }}>−</button>
              <span style={{ padding: "0 12px", fontWeight: 700 }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} style={{ width: 36, height: 36, background: "none", border: "none", fontSize: 18, color: "#6B21A8", fontWeight: 700 }}>+</button>
            </div>
            <button onClick={() => onAdd({ ...p, qty, color: selColor, size: selSize })} style={{ flex: 1, background: "linear-gradient(135deg, #6B21A8, #4C1D95)", color: "#fff", border: "none", padding: "12px", borderRadius: 99, fontWeight: 700, fontSize: 15, boxShadow: "0 8px 24px rgba(107,33,168,0.3)" }}>
              🛒 Ajouter au panier
            </button>
          </div>
          {/* Vidéo */}
          {p.video && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>🎥 Vidéo du produit</div>
              <div style={{ borderRadius: 12, overflow: "hidden", position: "relative", paddingBottom: "56.25%", height: 0 }}>
                <iframe src={p.video.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                  allowFullScreen />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Cart Page ─────────────────────────────────────────────────────
function CartPage({ cart, onRemove, onUpdateQty, goToShop, goToPayment, promoCode, promoDiscount, promoLabel, onApplyPromo, onRemovePromo, points }) {
  const [code, setCode] = useState("");
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = Math.round(subtotal * promoDiscount / 100);
  const total    = subtotal - discount;

  if (cart.length === 0) return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 8, color: "#1A0A2E" }}>Votre panier est vide</h2>
      <p style={{ color: "#9CA3AF", marginBottom: 24 }}>Ajoutez des produits pour commencer vos achats</p>
      <button onClick={goToShop} style={{ background: "linear-gradient(135deg, #6B21A8, #4C1D95)", color: "#fff", border: "none", padding: "13px 28px", borderRadius: 99, fontWeight: 700, fontSize: 15 }}>Découvrir les produits</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 16px" }}>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 20, color: "#1A0A2E" }}>🛒 Mon panier ({cart.length} article{cart.length > 1 ? "s" : ""})</h2>
      {cart.map(item => (
        <div key={item.id + (item.color || "") + (item.size || "")} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8E0FF", padding: "14px 16px", marginBottom: 10, display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 10, overflow: "hidden", background: "#F5F2FF", flexShrink: 0 }}>
            <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display="none"} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{item.name}</div>
            {(item.color || item.size) && <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 4 }}>{item.color} {item.size}</div>}
            <div style={{ fontWeight: 900, fontSize: 15, color: "#D4AF37" }}>{fmt(item.price)}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => onUpdateQty(item.id, item.qty - 1)} style={{ width: 28, height: 28, borderRadius: "50%", background: "#F5F2FF", border: "none", color: "#6B21A8", fontWeight: 700 }}>−</button>
            <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
            <button onClick={() => onUpdateQty(item.id, item.qty + 1)} style={{ width: 28, height: 28, borderRadius: "50%", background: "#F5F2FF", border: "none", color: "#6B21A8", fontWeight: 700 }}>+</button>
          </div>
          <button onClick={() => onRemove(item.id)} style={{ background: "#FEE2E2", color: "#DC2626", border: "none", width: 32, height: 32, borderRadius: "50%", fontSize: 14, flexShrink: 0 }}>✕</button>
        </div>
      ))}

      {/* Promo code */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8E0FF", padding: "14px 16px", marginBottom: 10 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>🏷 Code promo</div>
        {promoCode ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#D1FAE5", borderRadius: 10, padding: "10px 14px" }}>
            <span style={{ color: "#059669", fontWeight: 600, fontSize: 14 }}>✓ {promoCode} — {promoLabel}</span>
            <button onClick={onRemovePromo} style={{ background: "none", border: "none", color: "#DC2626", fontWeight: 600, fontSize: 13 }}>Retirer</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="Entrer un code promo" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E8E0FF", fontSize: 14, background: "#F5F2FF" }} />
            <button onClick={() => { onApplyPromo(code); setCode(""); }} style={{ background: "#6B21A8", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: 14 }}>Appliquer</button>
          </div>
        )}
      </div>

      {/* Points */}
      {points > 0 && <div style={{ background: "#FEF3C7", borderRadius: 10, padding: "10px 14px", marginBottom: 10, fontSize: 13, color: "#D4AF37", fontWeight: 600 }}>⭐ Vous avez {points} points de fidélité</div>}

      {/* Total */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8E0FF", padding: "16px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
          <span style={{ color: "#6B7280" }}>Sous-total</span>
          <span style={{ fontWeight: 600 }}>{fmt(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
            <span style={{ color: "#059669" }}>Réduction ({promoDiscount}%)</span>
            <span style={{ color: "#059669", fontWeight: 600 }}>-{fmt(discount)}</span>
          </div>
        )}
        <div style={{ height: 1, background: "#E8E0FF", margin: "10px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18 }}>
          <span style={{ fontWeight: 800 }}>Total</span>
          <span style={{ fontWeight: 900, color: "#D4AF37" }}>{fmt(total)}</span>
        </div>
      </div>
      <button onClick={goToPayment} style={{ width: "100%", background: "linear-gradient(135deg, #6B21A8, #4C1D95)", color: "#fff", border: "none", padding: "15px", borderRadius: 99, fontWeight: 700, fontSize: 16, boxShadow: "0 8px 24px rgba(107,33,168,0.3)" }}>
        Commander — {fmt(total)} →
      </button>
    </div>
  );
}

// ── Payment Page ──────────────────────────────────────────────────
function PaymentPage({ cart, onConfirm, promoDiscount, promoCode }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", phone: "", address: "", method: "mobile" });
  const [errors, setErrors] = useState({});
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = Math.round(subtotal * promoDiscount / 100);
  const total    = subtotal - discount;
  const STEPS    = ["Livraison", "Paiement", "Confirmation"];
  const METHODS  = [
    { key: "mobile", label: "Mobile Money", sub: "Orange Money, Moov Money", icon: "📱" },
    { key: "paydunya", label: "Paiement en ligne", sub: "Orange Money, Moov Money, Carte bancaire", icon: "💳" },
    { key: "cash",   label: "À la livraison", sub: "Payez en espèces à réception", icon: "💵" },
  ];

  const StepBar = () => (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", marginBottom: 28 }}>
      {STEPS.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: step > i+1 ? "#059669" : step === i+1 ? "#6B21A8" : "#E8E0FF", color: step >= i+1 ? "#fff" : "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, boxShadow: step === i+1 ? "0 4px 14px rgba(107,33,168,0.3)" : "none" }}>
              {step > i+1 ? "✓" : i+1}
            </div>
            <div style={{ fontSize: 11, marginTop: 6, fontWeight: step === i+1 ? 700 : 400, color: step === i+1 ? "#6B21A8" : step > i+1 ? "#059669" : "#9CA3AF" }}>{s}</div>
          </div>
          {i < STEPS.length - 1 && <div style={{ height: 3, width: 70, background: step > i+1 ? "#6B21A8" : "#E8E0FF", margin: "16px 8px 0", borderRadius: 99, transition: "background .3s" }} />}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 24, textAlign: "center", color: "#1A0A2E" }}>Finaliser la commande</h2>
      <StepBar />

      {/* Step 1: Livraison */}
      {step === 1 && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E0FF", padding: "24px" }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: "#6B21A8" }}>📍 Informations de livraison</h3>
          {[
            { label: "Nom complet", key: "name", placeholder: "Ex: Amadou Diallo", type: "text" },
            { label: "Téléphone", key: "phone", placeholder: "Ex: +223 91 09 05 23", type: "tel" },
            { label: "Adresse de livraison", key: "address", placeholder: "Quartier, rue, porte...", type: "text" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6, color: "#1A0A2E" }}>{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${errors[f.key] ? "#DC2626" : "#E8E0FF"}`, fontSize: 14, background: "#F5F2FF" }} />
              {errors[f.key] && <p style={{ color: "#DC2626", fontSize: 12, marginTop: 4 }}>Ce champ est requis</p>}
            </div>
          ))}
          <button onClick={() => {
            const e = {};
            if (!form.name.trim()) e.name = true;
            if (!form.phone.trim()) e.phone = true;
            if (!form.address.trim()) e.address = true;
            setErrors(e);
            if (Object.keys(e).length === 0) setStep(2);
          }} style={{ width: "100%", background: "linear-gradient(135deg, #6B21A8, #4C1D95)", color: "#fff", border: "none", padding: "14px", borderRadius: 99, fontWeight: 700, fontSize: 15, boxShadow: "0 6px 20px rgba(107,33,168,0.3)" }}>
            Continuer →
          </button>
        </div>
      )}

      {/* Step 2: Paiement */}
      {step === 2 && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E0FF", padding: "24px" }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: "#6B21A8" }}>💳 Mode de paiement</h3>
          {METHODS.map(m => (
            <div key={m.key} onClick={() => setForm(p => ({ ...p, method: m.key }))} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, border: `2px solid ${form.method === m.key ? "#6B21A8" : "#E8E0FF"}`, marginBottom: 10, cursor: "pointer", background: form.method === m.key ? "#F5F2FF" : "#fff", transition: "all .2s" }}>
              <span style={{ fontSize: 24 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>{m.sub}</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${form.method === m.key ? "#6B21A8" : "#E8E0FF"}`, background: form.method === m.key ? "#6B21A8" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {form.method === m.key && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
              </div>
            </div>
          ))}

          {form.method === "paydunya" && (
            <div style={{ background: "#EDE9FE", borderRadius: 12, padding: "16px", marginTop: 14, border: "1px solid #6B21A8" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#6B21A8", marginBottom: 10 }}>💳 Paiement sécurisé via PayDunya</div>
              <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>Vous serez redirigé vers la page de paiement sécurisée PayDunya pour payer avec Orange Money, Moov Money ou carte bancaire.</p>
              <button onClick={async () => {
                const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
                const discount = Math.round(subtotal * promoDiscount / 100);
                const total = subtotal - discount;
                try {
                  const res = await fetch("https://app.paydunya.com/api/v1/checkout-invoice/create", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "PAYDUNYA-MASTER-KEY": import.meta.env.VITE_PAYDUNYA_MASTER_KEY,
                      "PAYDUNYA-PRIVATE-KEY": import.meta.env.VITE_PAYDUNYA_PRIVATE_KEY,
                      "PAYDUNYA-TOKEN": import.meta.env.VITE_PAYDUNYA_TOKEN,
                    },
                    body: JSON.stringify({
                      invoice: {
                        total_amount: total,
                        description: `Commande Marché+ — ${cart.map(i => i.name).join(", ")}`,
                      },
                      store: { name: "Marché+" },
                      actions: {
                        cancel_url: window.location.href,
                        return_url: window.location.href,
                        callback_url: window.location.href,
                      },
                    }),
                  });
                  const data = await res.json();
                  if (data.response_code === "00") {
                    window.location.href = data.response_text;
                  } else {
                    alert("Erreur PayDunya : " + data.response_text);
                  }
                } catch (e) {
                  alert("Erreur de connexion PayDunya");
                }
              }} style={{ width: "100%", background: "linear-gradient(135deg, #6B21A8, #4C1D95)", color: "#fff", border: "none", padding: "13px", borderRadius: 99, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                💳 Payer maintenant
              </button>
            </div>
          )}

          {form.method === "paydunya" && (
            <div style={{ background: "#EDE9FE", borderRadius: 12, padding: "16px", marginTop: 14, border: "1px solid #6B21A8" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#6B21A8", marginBottom: 10 }}>💳 Paiement sécurisé via PayDunya</div>
              <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>Vous serez redirigé vers la page de paiement sécurisée PayDunya pour payer avec Orange Money, Moov Money ou carte bancaire.</p>
              <button onClick={async () => {
                const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
                const discount = Math.round(subtotal * promoDiscount / 100);
                const total = subtotal - discount;
                try {
                  const res = await fetch("https://app.paydunya.com/api/v1/checkout-invoice/create", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "PAYDUNYA-MASTER-KEY": import.meta.env.VITE_PAYDUNYA_MASTER_KEY,
                      "PAYDUNYA-PRIVATE-KEY": import.meta.env.VITE_PAYDUNYA_PRIVATE_KEY,
                      "PAYDUNYA-TOKEN": import.meta.env.VITE_PAYDUNYA_TOKEN,
                    },
                    body: JSON.stringify({
                      invoice: {
                        total_amount: total,
                        description: `Commande Marché+ — ${cart.map(i => i.name).join(", ")}`,
                      },
                      store: { name: "Marché+" },
                      actions: {
                        cancel_url: window.location.href,
                        return_url: window.location.href,
                        callback_url: window.location.href,
                      },
                    }),
                  });
                  const data = await res.json();
                  if (data.response_code === "00") {
                    window.location.href = data.response_text;
                  } else {
                    alert("Erreur PayDunya : " + data.response_text);
                  }
                } catch (e) {
                  alert("Erreur de connexion PayDunya");
                }
              }} style={{ width: "100%", background: "linear-gradient(135deg, #6B21A8, #4C1D95)", color: "#fff", border: "none", padding: "13px", borderRadius: 99, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                💳 Payer maintenant
              </button>
            </div>
          )}

          {form.method === "mobile" && (
            <div style={{ background: "#FEF3C7", borderRadius: 12, padding: "16px", marginTop: 14, border: "1px solid #D4AF37" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#D4AF37", marginBottom: 10 }}>🟠 Paiement Orange Money</div>
              {[
                "Composez #144# sur votre téléphone",
                'Choisissez "Transfert d\'argent"',
                `Entrez le numéro : 91 09 05 23`,
                `Entrez le montant : ${fmt(total)}`,
                "Confirmez avec votre code secret",
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 13 }}>
                  <span style={{ background: "#6B21A8", color: "#fff", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i+1}</span>
                  <span dangerouslySetInnerHTML={{ __html: s.replace("91 09 05 23", "<strong style='color:#DC2626'>91 09 05 23</strong>").replace(fmt(total), `<strong style='color:#D4AF37'>${fmt(total)}</strong>`) }} />
                </div>
              ))}
              <div style={{ background: "#FEE2E2", borderRadius: 8, padding: "8px 12px", marginTop: 8, fontSize: 12, color: "#DC2626" }}>
                ⚠ Envoyez la capture du paiement sur WhatsApp après confirmation
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={() => setStep(1)} style={{ background: "#F5F2FF", color: "#6B21A8", border: "none", padding: "13px 20px", borderRadius: 99, fontWeight: 600 }}>← Retour</button>
            <button onClick={() => setStep(3)} style={{ flex: 1, background: "linear-gradient(135deg, #6B21A8, #4C1D95)", color: "#fff", border: "none", padding: "13px", borderRadius: 99, fontWeight: 700, fontSize: 15 }}>Confirmer →</button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E0FF", padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
          <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8, color: "#1A0A2E" }}>Récapitulatif</h3>
          <div style={{ background: "#F5F2FF", borderRadius: 12, padding: "16px", marginBottom: 16, textAlign: "left" }}>
            {[
              { label: "Nom", value: form.name },
              { label: "Téléphone", value: form.phone },
              { label: "Adresse", value: form.address },
              { label: "Paiement", value: METHODS.find(m => m.key === form.method)?.label },
              { label: "Total", value: fmt(total) },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: "#6B7280" }}>{r.label}</span>
                <span style={{ fontWeight: 700, color: r.label === "Total" ? "#D4AF37" : "#1A0A2E" }}>{r.value}</span>
              </div>
            ))}
          </div>
          <button onClick={() => onConfirm(form)} style={{ width: "100%", background: "linear-gradient(135deg, #25D366, #128C7E)", color: "#fff", border: "none", padding: "15px", borderRadius: 99, fontWeight: 700, fontSize: 16, marginBottom: 10, boxShadow: "0 8px 24px rgba(37,211,102,0.3)" }}>
            ✓ Confirmer & Envoyer sur WhatsApp
          </button>
          <button onClick={() => setStep(2)} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: 13 }}>← Modifier</button>
        </div>
      )}
    </div>
  );
}

// ── Orders Page ───────────────────────────────────────────────────
function TrackingPage({ supabase }) {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const STEPS = ["Reçue", "Préparée", "Expédiée", "Livrée"];

  const search = async () => {
    if (!orderId.trim()) return;
    setLoading(true); setError(""); setOrder(null);
    const { data } = await supabase.from("commandes").select("*").eq("id", orderId.trim()).single();
    if (data) setOrder(data);
    else setError("Commande introuvable. Vérifiez le numéro.");
    setLoading(false);
  };

  const cancel = async () => {
    if (!window.confirm("Voulez-vous vraiment annuler cette commande ?")) return;
    await supabase.from("commandes").update({ status: "Annulé" }).eq("id", order.id);
    setOrder({ ...order, status: "Annulé" });
  };

  const stepIdx = order ? STEPS.indexOf(order.status === "En cours" ? "Reçue" : order.status === "En transit" ? "Expédiée" : order.status) : -1;
  const pct = order?.status === "Livrée" ? 100 : order?.status === "Annulé" ? 0 : Math.max(10, ((stepIdx + 1) / STEPS.length) * 100);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 16px" }}>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 6, color: "#1A0A2E" }}>📍 Suivi de commande</h2>
      <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 24 }}>Entrez votre numéro de commande pour suivre votre livraison</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <input placeholder="Ex: CMD-123456" value={orderId} onChange={e => setOrderId(e.target.value.toUpperCase())} onKeyDown={e => e.key === "Enter" && search()}
          style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "1.5px solid #E8E0FF", fontSize: 14, background: "#fff" }} />
        <button onClick={search} disabled={loading} style={{ background: "linear-gradient(135deg, #6B21A8, #4C1D95)", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
          {loading ? "..." : "Rechercher"}
        </button>
      </div>

      {error && <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "12px 16px", borderRadius: 12, fontSize: 14, marginBottom: 16 }}>✗ {error}</div>}

      {order && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E0FF", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#6B21A8" }}>{order.id}</div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>👤 {order.client_nom} · 📞 {order.client_telephone}</div>
              <div style={{ fontSize: 13, color: "#9CA3AF" }}>📍 {order.client_adresse} · 📅 {order.date}</div>
            </div>
            <div style={{ fontWeight: 900, fontSize: 20, color: "#D4AF37" }}>{fmt(order.total)}</div>
          </div>

          {order.status !== "Annulé" ? (
            <div style={{ background: "#F5F2FF", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#6B21A8", fontWeight: 600, marginBottom: 10 }}>
                {order.status === "Livrée" ? "✅ Commande livrée avec succès !" : "⏳ En cours de traitement"}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                {STEPS.map(s => <span key={s} style={{ fontSize: 10, color: "#9CA3AF" }}>{s}</span>)}
              </div>
              <div style={{ height: 8, background: "#E8E0FF", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: order.status === "Livrée" ? "#059669" : "linear-gradient(90deg, #6B21A8, #D4AF37)", borderRadius: 99, transition: "width .5s" }} />
              </div>
            </div>
          ) : (
            <div style={{ background: "#FEE2E2", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#DC2626", fontWeight: 600 }}>✗ Commande annulée</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => navigator.clipboard.writeText(`https://marche-plus.vercel.app/?suivi=${order.id}`)} style={{ flex: 1, background: "#F5F2FF", color: "#6B21A8", border: "none", padding: "11px", borderRadius: 12, fontWeight: 600, fontSize: 13 }}>
              🔗 Copier le lien de suivi
            </button>
            {order.status === "En cours" && (
              <button onClick={cancel} style={{ background: "#FEE2E2", color: "#DC2626", border: "none", padding: "11px 18px", borderRadius: 12, fontWeight: 600, fontSize: 13 }}>
                ✗ Annuler
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersPage({ orders, loading }) {
  const STATUS_COLOR = { "En cours": "#1a56db", "Préparée": "#D4AF37", "Expédiée": "#6B21A8", "Livrée": "#059669", "Annulé": "#DC2626", "En transit": "#6B21A8" };
  const STEPS = ["Reçue", "Préparée", "Expédiée", "Livrée"];

  if (loading) return <div style={{ textAlign: "center", padding: 80, color: "#9CA3AF" }}>Chargement...</div>;
  if (orders.length === 0) return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>📦</div>
      <h2 style={{ fontWeight: 800, fontSize: 22, color: "#1A0A2E", marginBottom: 8 }}>Aucune commande</h2>
      <p style={{ color: "#9CA3AF" }}>Vos commandes apparaîtront ici</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 16px" }}>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 20, color: "#1A0A2E" }}>📦 Commandes ({orders.length})</h2>
      {orders.map(o => {
        const stepIdx = STEPS.indexOf(o.status === "En cours" ? "Reçue" : o.status === "En transit" ? "Expédiée" : o.status);
        const pct = o.status === "Livrée" ? 100 : o.status === "Annulé" ? 0 : Math.max(10, ((stepIdx + 1) / STEPS.length) * 100);
        return (
          <div key={o.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E0FF", padding: "18px 20px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: "#6B21A8" }}>{o.id}</div>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 3 }}>👤 {o.client_nom} · 📞 {o.client_telephone}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>📍 {o.client_adresse} · 💳 {o.paiement} · 📅 {o.date} · {o.items} art.</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ background: STATUS_COLOR[o.status] + "20", color: STATUS_COLOR[o.status], fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 99, marginBottom: 4 }}>{o.status}</div>
                <div style={{ fontWeight: 900, fontSize: 18, color: "#D4AF37" }}>{fmt(o.total)}</div>
              </div>
            </div>
            {o.status !== "Annulé" && (
              <div style={{ background: "#F5F2FF", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, color: "#6B21A8", fontWeight: 600, marginBottom: 8 }}>
                  {o.status === "Livrée" ? "✅ Commande livrée avec succès !" : `⏳ ${o.status === "En cours" ? "Commande en cours de traitement" : "En cours de livraison"}`}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  {STEPS.map(s => <span key={s} style={{ fontSize: 10, color: "#9CA3AF" }}>{s}</span>)}
                </div>
                <div style={{ height: 6, background: "#E8E0FF", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: o.status === "Livrée" ? "#059669" : "linear-gradient(90deg, #6B21A8, #D4AF37)", borderRadius: 99, transition: "width .5s" }} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Favorites Page ────────────────────────────────────────────────
function FavoritesPage({ favorites, onSelect, onToggleFav, onAdd, isFavorite }) {
  if (favorites.length === 0) return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>🤍</div>
      <h2 style={{ fontWeight: 800, fontSize: 22, color: "#1A0A2E", marginBottom: 8 }}>Aucun favori</h2>
      <p style={{ color: "#9CA3AF" }}>Ajoutez des produits à vos favoris</p>
    </div>
  );
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 20, color: "#1A0A2E" }}>❤️ Mes favoris ({favorites.length})</h2>
      <div className="product-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 16 }}>
        {favorites.map(p => <ProductCard key={p.id} p={p} onSelect={onSelect} onAdd={onAdd} isFavorite={isFavorite} onToggleFav={onToggleFav} />)}
      </div>
    </div>
  );
}

// ── Profile Page ──────────────────────────────────────────────────
function ProfilePage({ user, orders, favorites, onClose, setShowParrainage, supabase }) {
  const [tab, setTab]         = useState("info");
  const [profil, setProfil]   = useState({ nom: "", telephone: "", adresse: "", avatar_url: "" });
  const [saving, setSaving]   = useState(false);
  const totalSpent = orders.reduce((s, o) => s + o.total, 0);

  useEffect(() => {
    if (!user) return;
    supabase.from("profils").select("*").eq("id", user.id).single().then(({ data }) => { if (data) setProfil(data); });
  }, [user]);

  const save = async () => {
    setSaving(true);
    await supabase.from("profils").upsert({ id: user.id, ...profil, updated_at: new Date().toISOString() });
    setSaving(false); setTab("info");
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setProfil(p => ({ ...p, avatar_url: ev.target.result }));
    reader.readAsDataURL(file);
    const filename = `avatars/${user.id}-${Date.now()}`;
    const { error } = await supabase.storage.from("images").upload(filename, file, { upsert: true });
    if (!error) { const { data } = supabase.storage.from("images").getPublicUrl(filename); setProfil(p => ({ ...p, avatar_url: data.publicUrl })); }
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px" }}>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#6B21A8", fontSize: 14, cursor: "pointer", marginBottom: 16, fontWeight: 600 }}>← Retour</button>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #4C1D95, #6B21A8, #D4AF37)", borderRadius: 20, padding: "24px", marginBottom: 16, color: "#fff", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.2)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, border: "3px solid rgba(255,255,255,0.4)" }}>
            {profil.avatar_url ? <img src={profil.avatar_url} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
          </div>
          <label style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12 }}>
            📷<input type="file" accept="image/*" onChange={handleAvatar} style={{ display: "none" }} />
          </label>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>{profil.nom || user?.email?.split("@")[0]}</div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>{user?.email}</div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>Membre depuis {new Date(user?.created_at).toLocaleDateString("fr-FR")}</div>
        </div>
      </div>

      {/* Parrainage */}
      <button onClick={() => setShowParrainage(true)} style={{ width: "100%", background: "linear-gradient(135deg, #1A0A2E, #4C1D95)", color: "#fff", border: "none", padding: "13px", borderRadius: 99, fontWeight: 700, fontSize: 15, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        🎁 Programme de parrainage — Gagnez 1 000 FCFA !
      </button>

      {/* Stats */}
      <div className="profile-stats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[{ label: "Commandes", value: orders.length, icon: "📦" }, { label: "Total dépensé", value: fmt(totalSpent), icon: "💰" }, { label: "Favoris", value: favorites.length, icon: "❤️" }].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #E8E0FF", padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #E8E0FF", marginBottom: 16 }}>
        {[{ key: "info", label: "Mon compte" }, { key: "edit", label: "✏️ Modifier" }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "10px 16px", border: "none", background: "transparent", fontWeight: tab === t.key ? 700 : 400, color: tab === t.key ? "#6B21A8" : "#9CA3AF", borderBottom: `2px solid ${tab === t.key ? "#6B21A8" : "transparent"}`, fontSize: 13, marginBottom: -1 }}>{t.label}</button>
        ))}
      </div>

      {tab === "info" && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8E0FF", overflow: "hidden" }}>
          {[
            { icon: "👤", label: "Nom", value: profil.nom || "Non renseigné" },
            { icon: "📧", label: "Email", value: user?.email },
            { icon: "📞", label: "Téléphone", value: profil.telephone || "Non renseigné" },
            { icon: "📍", label: "Adresse", value: profil.adresse || "Non renseignée" },
            { icon: "📦", label: "Commandes", value: `${orders.length} commande${orders.length > 1 ? "s" : ""}` },
          ].map((item, i, arr) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: i < arr.length-1 ? "1px solid #F5F2FF" : "none" }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <div><div style={{ fontSize: 11, color: "#9CA3AF" }}>{item.label}</div><div style={{ fontWeight: 600, fontSize: 14, marginTop: 1 }}>{item.value}</div></div>
            </div>
          ))}
        </div>
      )}

      {tab === "edit" && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8E0FF", padding: "20px" }}>
          {[
            { label: "Nom complet", key: "nom", placeholder: "Ex: Amadou Diallo" },
            { label: "Téléphone", key: "telephone", placeholder: "Ex: +223 91 09 05 23" },
            { label: "Adresse principale", key: "adresse", placeholder: "Quartier, rue, porte..." },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6, color: "#1A0A2E" }}>{f.label}</label>
              <input placeholder={f.placeholder} value={profil[f.key] || ""} onChange={e => setProfil(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #E8E0FF", fontSize: 14, background: "#F5F2FF" }} />
            </div>
          ))}
          <button onClick={save} disabled={saving} style={{ width: "100%", background: "linear-gradient(135deg, #6B21A8, #4C1D95)", color: "#fff", border: "none", padding: "13px", borderRadius: 99, fontWeight: 700, fontSize: 15, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Enregistrement..." : "✓ Enregistrer"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Parrainage Page ───────────────────────────────────────────────
function ParrainagePage({ user, supabase, myParrainage, setMyParrainage, onBack }) {
  const [filleuls, setFilleuls] = useState([]);
  const [copied, setCopied]     = useState(false);

  const createCode = async () => {
    const code = "REF-" + user.email.split("@")[0].toUpperCase() + "-" + Math.random().toString(36).slice(2,6).toUpperCase();
    const { data } = await supabase.from("parrainages").insert({ parrain_id: user.id, parrain_email: user.email, code }).select().single();
    setMyParrainage(data);
  };

  useEffect(() => {
    if (!myParrainage) return;
    supabase.from("filleuls").select("*").eq("parrain_code", myParrainage.code).then(({ data }) => setFilleuls(data || []));
  }, [myParrainage]);

  const shareLink = myParrainage ? `https://marche-plus.vercel.app/?ref=${myParrainage.code}` : "";
  const copyLink  = () => { navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const shareWA   = () => window.open(`https://wa.me/?text=${encodeURIComponent(`Découvrez Marché+ ! Utilisez mon code pour 500 FCFA de réduction :\n${shareLink}`)}`, "_blank");

  return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "20px 16px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#6B21A8", fontSize: 14, cursor: "pointer", marginBottom: 16, fontWeight: 600 }}>← Retour</button>
      <div style={{ background: "linear-gradient(135deg, #4C1D95, #6B21A8, #D4AF37)", borderRadius: 20, padding: "28px 24px", marginBottom: 16, color: "#fff", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🎁</div>
        <h2 style={{ fontWeight: 900, fontSize: 20, marginBottom: 6 }}>Programme de parrainage</h2>
        <p style={{ fontSize: 13, opacity: 0.85 }}>Invitez vos amis et gagnez <strong>1 000 FCFA</strong> par ami qui commande !<br />Votre ami reçoit <strong>500 FCFA</strong> de réduction.</p>
      </div>

      {!myParrainage ? (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8E0FF", padding: "24px", textAlign: "center" }}>
          <button onClick={createCode} style={{ background: "linear-gradient(135deg, #6B21A8, #4C1D95)", color: "#fff", border: "none", padding: "13px 28px", borderRadius: 99, fontWeight: 700, fontSize: 15 }}>🎁 Créer mon code</button>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[{ label: "Amis parrainés", value: filleuls.length, icon: "👥" }, { label: "Gains totaux", value: fmt(myParrainage.gains_total || 0), icon: "💰" }, { label: "Mon code", value: myParrainage.code, icon: "🎯" }].map(s => (
              <div key={s.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #E8E0FF", padding: "14px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 12, color: "#6B21A8" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8E0FF", padding: "16px", marginBottom: 10 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>🔗 Votre lien de parrainage</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1, padding: "10px 14px", background: "#F5F2FF", borderRadius: 10, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shareLink}</div>
              <button onClick={copyLink} style={{ background: copied ? "#059669" : "#1A0A2E", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, fontWeight: 600, fontSize: 13 }}>{copied ? "✓" : "Copier"}</button>
            </div>
            <button onClick={shareWA} style={{ width: "100%", background: "#25D366", color: "#fff", border: "none", padding: "12px", borderRadius: 99, fontWeight: 700, fontSize: 14 }}>💬 Partager sur WhatsApp</button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]                 = useState(null);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState("home");
  const [products, setProducts]         = useState([]);
  const [cart, setCart]                 = useState([]);
  const [favorites, setFavorites]       = useState([]);
  const [orders, setOrders]             = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProfile, setShowProfile]   = useState(false);
  const [showParrainage, setShowParrainage] = useState(false);
  const [vendorPage, setVendorPage]     = useState(null);
  const [myVendor, setMyVendor]         = useState(null);
  const [myParrainage, setMyParrainage] = useState(null);
  const [promoCode, setPromoCode]       = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoLabel, setPromoLabel]     = useState("");
  const [points, setPoints]             = useState(0);
  const [toast, setToast]               = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const boutique = params.get("boutique");
    const ref      = params.get("ref");
    if (boutique) setVendorPage({ slug: boutique });
    if (ref) setPromoCode(ref);
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    const { data } = await supabase.from("produits").select("*").order("id");
    if (data) setProducts(data);
  };

  // Fetch orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    let query = supabase.from("commandes").select("*").order("created_at", { ascending: false });
    if (user?.email !== ADMIN_EMAIL) query = query.eq("user_id", user?.id);
    const { data } = await query;
    if (data) setOrders(data);
    setLoadingOrders(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    if (!user) return;
    fetchOrders();
    supabase.from("vendeurs").select("*").eq("user_id", user.id).single().then(({ data }) => { if (data) setMyVendor(data); });
    supabase.from("parrainages").select("*").eq("parrain_id", user.id).single().then(({ data }) => { if (data) setMyParrainage(data); });
  }, [user]);

  // Cart operations
  const addToCart = (p) => {
    setCart(c => {
      const existing = c.find(i => i.id === p.id);
      if (existing) return c.map(i => i.id === p.id ? { ...i, qty: i.qty + (p.qty || 1) } : i);
      return [...c, { ...p, qty: p.qty || 1 }];
    });
    showToast(`✓ ${p.name} ajouté au panier`);
  };
  const removeFromCart = (id) => setCart(c => c.filter(i => i.id !== id));
  const updateQty = (id, qty) => {
    if (qty <= 0) removeFromCart(id);
    else setCart(c => c.map(i => i.id === id ? { ...i, qty } : i));
  };

  // Favorites
  const toggleFavorite = (p) => setFavorites(f => f.find(i => i.id === p.id) ? f.filter(i => i.id !== p.id) : [...f, p]);
  const isFavorite     = (id) => favorites.some(f => f.id === id);

  // Promo
  const applyPromo = (code) => {
    const promo = PROMO_CODES[code];
    if (promo) { setPromoCode(code); setPromoDiscount(promo.discount); setPromoLabel(promo.label); showToast(`✓ Code ${code} appliqué — ${promo.label}`); }
    else showToast("✗ Code promo invalide");
  };
  const removePromo = () => { setPromoCode(""); setPromoDiscount(0); setPromoLabel(""); };

  // Place order
  const placeOrder = async (form) => {
    const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const cartCount = cart.reduce((s, i) => s + i.qty, 0);
    const discount  = Math.round(cartTotal * promoDiscount / 100);
    const total     = cartTotal - discount;
    const orderId   = genId();
    const methodLabel = { mobile: "Mobile Money", cash: "À la livraison", card: "Carte bancaire" }[form.method];

    // Save order
    const { error } = await supabase.from("commandes").insert({
      id: orderId, date: new Date().toISOString().slice(0,10), status: "En cours",
      total, items: cartCount, client_nom: form.name, client_telephone: form.phone,
      client_adresse: form.address, paiement: methodLabel,
      produits: JSON.stringify(cart.map(i => ({ nom: i.name, qty: i.qty, prix: i.price }))),
      user_id: user?.id,
    });
    if (error) console.error(error);

    // Points
    setPoints(p => p + Math.floor(total / 1000));

    // WhatsApp
    const msg = `🛍 *Nouvelle commande Marché+*\n\n📋 *${orderId}*\n👤 ${form.name}\n📞 ${form.phone}\n📍 ${form.address}\n💳 ${methodLabel}\n\n${cart.map(i => `• ${i.name} x${i.qty} — ${fmt(i.price)}`).join("\n")}\n\n💰 *Total : ${fmt(total)}*${promoCode ? `\n🏷 Code : ${promoCode}` : ""}`;

    const vendeurItems = cart.filter(i => i.vendeur_id);
    if (vendeurItems.length > 0) {
      const { data: v } = await supabase.from("vendeurs").select("whatsapp").eq("id", vendeurItems[0].vendeur_id).single();
      window.location.href = `https://wa.me/${v?.whatsapp || WHATSAPP}?text=${encodeURIComponent(msg)}`;
    } else {
      window.location.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
    }

    setCart([]); removePromo();
    fetchOrders();
    setPage("orders");
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "linear-gradient(135deg, #4C1D95, #6B21A8)" }}><div style={{ color: "#fff", fontSize: 24, fontWeight: 800 }}>Marché+ ⏳</div></div>;
  if (!user)   return <AuthPage onAuth={u => setUser(u)} />;

  // WhatsApp floating button
  const FloatingWA = () => (
    <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"
      style={{ position: "fixed", bottom: 90, right: 20, width: 52, height: 52, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: "0 4px 20px rgba(37,211,102,0.4)", zIndex: 150, textDecoration: "none" }}>
      💬
    </a>
  );

  // Toast
  const Toast = () => toast ? (
    <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "#1A0A2E", color: "#fff", padding: "12px 24px", borderRadius: 99, fontSize: 14, fontWeight: 600, zIndex: 300, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", whiteSpace: "nowrap", animation: "slideUp .3s ease" }}>
      {toast}
    </div>
  ) : null;

  const handlePageChange = (p) => {
    setPage(p);
    setSelectedProduct(null);
    setShowProfile(false);
    setShowParrainage(false);
  };

  return (
    <>
      <Navbar page={page} setPage={handlePageChange} cartCount={cartCount} user={user}
        onLogout={() => { supabase.auth.signOut(); setUser(null); }}
        onProfile={() => { setShowProfile(true); setSelectedProduct(null); setVendorPage(null); setShowParrainage(false); }}
        favCount={favorites.length} lang="FR" setLang={() => {}}
        onVendor={() => { setVendorPage(myVendor ? "dashboard" : "register"); setShowProfile(false); setSelectedProduct(null); }}
        hasVendor={!!myVendor}
      />

      {/* Pages */}
      {!showProfile && !showParrainage && !vendorPage && page === "home"     && !selectedProduct && <HomePage products={products} onSelect={setSelectedProduct} onAdd={addToCart} isFavorite={isFavorite} onToggleFav={toggleFavorite} setPage={handlePageChange} />}
      {!showProfile && !showParrainage && !vendorPage && page === "shop"     && !selectedProduct && <ShopPage products={products} onAdd={addToCart} onSelect={setSelectedProduct} favorites={favorites} onToggleFav={toggleFavorite} isFavorite={isFavorite} />}
      {!showProfile && !showParrainage && !vendorPage && selectedProduct     && <ProductDetailPage product={selectedProduct} onAdd={addToCart} onBack={() => setSelectedProduct(null)} isFavorite={isFavorite} onToggleFav={toggleFavorite} />}
      {!showProfile && !showParrainage && !vendorPage && page === "cart"     && <CartPage cart={cart} onRemove={removeFromCart} onUpdateQty={updateQty} goToShop={() => handlePageChange("shop")} goToPayment={() => handlePageChange("payment")} promoCode={promoCode} promoDiscount={promoDiscount} promoLabel={promoLabel} onApplyPromo={applyPromo} onRemovePromo={removePromo} points={points} />}
      {!showProfile && !showParrainage && !vendorPage && page === "payment"  && <PaymentPage cart={cart} onConfirm={placeOrder} promoDiscount={promoDiscount} promoCode={promoCode} />}
      
     {!showProfile && !showParrainage && !vendorPage && page === "orders"   && <OrdersPage orders={orders} loading={loadingOrders} />}
        {!showProfile && !showParrainage && !vendorPage && page === "tracking"  && <TrackingPage supabase={supabase} />}
      {!showProfile && !showParrainage && !vendorPage && page === "favorites" && <FavoritesPage favorites={favorites} onSelect={setSelectedProduct} onToggleFav={toggleFavorite} onAdd={addToCart} isFavorite={isFavorite} />}

      {/* Profile */}
      {showProfile && !showParrainage && !vendorPage && <ProfilePage user={user} orders={orders} favorites={favorites} onClose={() => setShowProfile(false)} setShowParrainage={setShowParrainage} supabase={supabase} />}

      {/* Parrainage */}
      {showParrainage && <ParrainagePage user={user} supabase={supabase} myParrainage={myParrainage} setMyParrainage={setMyParrainage} onBack={() => setShowParrainage(false)} />}

      {/* Vendor */}
      {vendorPage === "register" && <VendorRegister supabase={supabase} user={user} onDone={(v) => { setMyVendor(v); setVendorPage("dashboard"); }} onBack={() => setVendorPage(null)} />}
      {vendorPage === "dashboard" && myVendor && <VendorDashboard supabase={supabase} vendor={myVendor} onBack={() => setVendorPage(null)} user={user} />}
      {vendorPage && typeof vendorPage === "object" && vendorPage.slug && <VendorShopPage supabase={supabase} slug={vendorPage.slug} onAdd={addToCart} onBack={() => { setVendorPage(null); window.history.replaceState({}, "", "/"); }} />}

      {/* Bottom Nav */}
      <BottomNav page={page} setPage={handlePageChange} cartCount={cartCount} favCount={favorites.length} onProfile={() => { setShowProfile(true); setSelectedProduct(null); setVendorPage(null); }} />

      {page === "conditions" && !showProfile && !vendorPage && <ConditionsPage onBack={() => setPage("home")} />}
      <FloatingWA />
      <Toast />
      {/* Footer */}
      {!showProfile && !vendorPage && !showParrainage && (
        <div style={{ background: "#1A0A2E", color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "20px 16px", fontSize: 12, marginTop: 40 }}>
          <div style={{ marginBottom: 8 }}>
            <span onClick={() => setPage("conditions")} style={{ color: "#D4AF37", cursor: "pointer", fontWeight: 600 }}>Conditions d'utilisation</span>
            {" · "}
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Contact WhatsApp</a>
          </div>
          <div>© {new Date().getFullYear()} Marché+ Mali — Tous droits réservés</div>
        </div>
      )}
    </>
  );
}
