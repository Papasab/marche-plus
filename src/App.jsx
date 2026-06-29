import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP;
const SUPABASE_URL    = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY    = import.meta.env.VITE_SUPABASE_KEY;
const supabase        = createClient(SUPABASE_URL, SUPABASE_KEY);

const CATEGORIES = ["Tous", "Mode", "Électronique", "Maison", "Bureau"];

const PROMO_CODES = {
  "BIENVENUE": { discount: 10, label: "10% de réduction" },
  "ETE2025":   { discount: 15, label: "15% de réduction" },
  "FIDELITE":  { discount: 20, label: "20% de réduction" },
  "MALI10":    { discount: 10, label: "10% de réduction" },
};

const POINTS_RATIO = 1000;

const INITIAL_PRODUCTS = [
  { id: 1,  name: "Sac à dos urbain",    category: "Mode",         price: 45000, stock: 12, image: "/images/sac-dos.jpg",    images: ["/images/sac-dos.jpg","/images/sac-dos.jpg","/images/sac-dos.jpg"],    description: "Sac à dos urbain et élégant, parfait pour le quotidien.",    sizes: ["S","M","L"],           colors: ["Noir","Gris","Bleu"],       rating: 4.5, reviewsList: [{user:"Aminata",note:5,comment:"Très beau sac !"},{user:"Moussa",note:4,comment:"Bonne qualité."}] },
  { id: 2,  name: "Casque Bluetooth",     category: "Électronique", price: 32000, stock: 8,  image: "/images/casque.jpg",     images: ["/images/casque.jpg","/images/casque.jpg","/images/casque.jpg"],         description: "Casque audio Bluetooth avec réduction de bruit active.",     sizes: [],                      colors: ["Noir","Blanc"],             rating: 4.7, reviewsList: [{user:"Ibrahim",note:5,comment:"Son incroyable !"}] },
  { id: 3,  name: "Lampe de bureau LED",  category: "Maison",       price: 18500, stock: 20, image: "/images/lampe.jpg",      images: ["/images/lampe.jpg","/images/lampe.jpg","/images/lampe.jpg"],           description: "Lampe LED avec luminosité réglable, 3 modes de couleur.",    sizes: [],                      colors: ["Blanc","Noir"],             rating: 4.2, reviewsList: [{user:"Kadiatou",note:4,comment:"Belle lampe."}] },
  { id: 4,  name: "Montre connectée",     category: "Électronique", price: 89000, stock: 5,  image: "/images/montre.jpg",     images: ["/images/montre.jpg","/images/montre.jpg","/images/montre.jpg"],         description: "Montre connectée avec suivi santé, GPS, autonomie 7 jours.", sizes: [],                      colors: ["Noir","Argent","Or"],       rating: 4.8, reviewsList: [{user:"Seydou",note:5,comment:"Excellente !"}] },
  { id: 5,  name: "Chaussures de sport",  category: "Mode",         price: 55000, stock: 15, image: "/images/chaussures.jpg", images: ["/images/chaussures.jpg","/images/chaussures.jpg","/images/chaussures.jpg"], description: "Chaussures de sport légères et respirantes.",             sizes: ["39","40","41","42","43"], colors: ["Blanc","Noir","Rouge"],    rating: 4.4, reviewsList: [{user:"Boubacar",note:4,comment:"Très légères !"}] },
  { id: 6,  name: "Carnet premium",       category: "Bureau",       price: 8500,  stock: 50, image: "/images/carnet.jpg",     images: ["/images/carnet.jpg","/images/carnet.jpg","/images/carnet.jpg"],           description: "Carnet A5 à couverture rigide, 200 pages papier ivoire.",   sizes: ["A5","A4"],             colors: ["Marron","Noir","Bleu"],     rating: 4.1, reviewsList: [{user:"Aissata",note:4,comment:"Beau carnet."}] },
  { id: 7,  name: "Thermos inox 1L",      category: "Maison",       price: 14000, stock: 30, image: "/images/thermos.jpg",    images: ["/images/thermos.jpg","/images/thermos.jpg","/images/thermos.jpg"],        description: "Thermos en acier inoxydable double paroi. Garde chaud 12h.", sizes: ["500ml","1L"],           colors: ["Argent","Noir","Rouge"],    rating: 4.6, reviewsList: [{user:"Diallo",note:5,comment:"Garde chaud longtemps !"}] },
  { id: 8,  name: "Clavier sans fil",     category: "Électronique", price: 27000, stock: 9,  image: "/images/clavier.jpg",    images: ["/images/clavier.jpg","/images/clavier.jpg","/images/clavier.jpg"],        description: "Clavier sans fil Bluetooth, touches silencieuses.",          sizes: [],                      colors: ["Noir","Blanc"],             rating: 4.3, reviewsList: [{user:"Coulibaly",note:4,comment:"Très silencieux !"}] },
  { id: 9,  name: "Lunettes de soleil",   category: "Mode",         price: 22000, stock: 18, image: "/images/lunettes.jpg",   images: ["/images/lunettes.jpg","/images/lunettes.jpg","/images/lunettes.jpg"],     description: "Lunettes de soleil polarisées UV400.",                      sizes: [],                      colors: ["Noir","Marron","Doré"],     rating: 4.5, reviewsList: [{user:"Traoré",note:5,comment:"Superbes !"}] },
  { id: 10, name: "Plante succulente",    category: "Maison",       price: 6500,  stock: 40, image: "/images/plante.jpg",     images: ["/images/plante.jpg","/images/plante.jpg","/images/plante.jpg"],           description: "Plante succulente facile d'entretien.",                     sizes: ["Petit","Moyen"],       colors: ["Vert"],                     rating: 4.9, reviewsList: [{user:"Koné",note:5,comment:"Très belle !"}] },
  { id: 11, name: "Stylo plume",          category: "Bureau",       price: 12000, stock: 25, image: "/images/stylo.jpg",      images: ["/images/stylo.jpg","/images/stylo.jpg","/images/stylo.jpg"],             description: "Stylo plume élégant avec plume en acier inoxydable.",       sizes: [],                      colors: ["Noir","Bordeaux","Bleu marine"], rating: 4.4, reviewsList: [{user:"Sylla",note:4,comment:"Écriture fluide."}] },
  { id: 12, name: "Chargeur solaire",     category: "Électronique", price: 19500, stock: 11, image: "/images/chargeur.jpg",   images: ["/images/chargeur.jpg","/images/chargeur.jpg","/images/chargeur.jpg"],     description: "Chargeur solaire 20000mAh avec 2 panneaux solaires.",       sizes: [],                      colors: ["Noir","Vert militaire"],    rating: 4.2, reviewsList: [{user:"Camara",note:4,comment:"Pratique en voyage !"}] },
];

const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
const genId = () => "CMD-" + Date.now().toString().slice(-6);
const statusStyle = (s) => ({
  "Livré":      { bg: "#e6f7ef", color: "#0a7c45" },
  "En transit": { bg: "#fff8e1", color: "#b76e00" },
  "En cours":   { bg: "#e8f0fe", color: "#1a56db" },
  "Annulé":     { bg: "#fce8e8", color: "#c0392b" },
}[s] || { bg: "#f3f4f6", color: "#6b7280" });

function ProductImage({ src, alt, height = 120 }) {
  const [error, setError] = useState(false);
  if (error || !src) return <div style={{ background: "#f8f7f4", height, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🛍</div>;
  return (
    <div style={{ height, overflow: "hidden", background: "#f8f7f4" }}>
      <img src={src} alt={alt} onError={() => setError(true)} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
        onMouseEnter={e => e.target.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.target.style.transform = "scale(1)"} />
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.type === "error" ? "#c0392b" : "#1a1a1a", color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: "0 4px 24px rgba(0,0,0,0.18)", animation: "fadeInDown .2s ease" }}>
      {toast.type === "error" ? "✗ " : "✓ "}{toast.msg}
    </div>
  );
}

function Navbar({ page, setPage, cartCount, user, onLogout, onProfile, favCount, points, lang, setLang }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <style>{`@media(max-width:600px){.nav-links,.nav-user{display:none!important}.nav-mob{display:flex!important}}@media(min-width:601px){.nav-mob{display:none!important}.mob-drop{display:none!important}}@keyframes fadeInDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}`}</style>
      <nav style={{ background: "#fff", borderBottom: "1px solid #ebebeb", padding: "0 16px", display: "flex", alignItems: "center", gap: 6, height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <span onClick={() => { setPage("shop"); setMenuOpen(false); }} style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px", marginRight: "auto", cursor: "pointer" }}>🛍 Marché+</span>
        <div className="nav-links" style={{ display: "flex", gap: 4 }}>
          {[{ key: "shop", label: "Boutique" }, { key: "orders", label: "Commandes" }, { key: "admin", label: "Admin" }].map(({ key, label }) => (
            <button key={key} onClick={() => setPage(key)} style={{ background: page === key ? "#1a1a1a" : "transparent", color: page === key ? "#fff" : "#666", border: "none", padding: "8px 14px", borderRadius: 9, fontWeight: 500, fontSize: 13 }}>{label}</button>
          ))}
        </div>
        <button onClick={() => setPage("cart")} style={{ background: cartCount > 0 ? "#25D366" : "#f4f4f4", color: cartCount > 0 ? "#fff" : "#666", border: "none", padding: "8px 14px", borderRadius: 9, fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
          🛒{cartCount > 0 ? ` (${cartCount})` : ""}
        </button>
        <div className="nav-user" style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 10, borderLeft: "1px solid #ebebeb" }}>
          <button onClick={() => setLang(lang === "fr" ? "en" : "fr")} style={{ background: "#f4f4f4", color: "#555", border: "none", padding: "6px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{lang === "fr" ? "🇫🇷" : "🇬🇧"}</button>
          {points > 0 && <span style={{ background: "#fff8e1", color: "#b76e00", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99 }}>⭐ {points} pts</span>}
          {favCount > 0 && <span style={{ background: "#fce8f0", color: "#c0392b", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99 }}>❤️ {favCount}</span>}
          <button onClick={onProfile} style={{ background: "none", border: "none", fontSize: 13, color: "#555", cursor: "pointer", fontWeight: 500 }}>👤 {user?.email?.split("@")[0]}</button>
          <button onClick={onLogout} style={{ background: "#f4f4f4", color: "#666", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500 }}>Déco</button>
        </div>
        <button className="nav-mob" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", fontSize: 22, padding: "4px 8px", color: "#333", display: "none" }}>{menuOpen ? "✕" : "☰"}</button>
      </nav>
      {menuOpen && (
        <div className="mob-drop" style={{ position: "fixed", top: 60, left: 0, right: 0, background: "#fff", borderBottom: "1px solid #ebebeb", zIndex: 99, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          {[{ key: "shop", label: "🏪 Boutique" }, { key: "orders", label: "📦 Commandes" }, { key: "admin", label: "⚙️ Admin" }].map(({ key, label }) => (
            <button key={key} onClick={() => { setPage(key); setMenuOpen(false); }} style={{ background: page === key ? "#1a1a1a" : "#f4f4f4", color: page === key ? "#fff" : "#333", border: "none", padding: "12px 16px", borderRadius: 10, fontWeight: 500, fontSize: 14, textAlign: "left" }}>{label}</button>
          ))}
          <button onClick={() => { onProfile(); setMenuOpen(false); }} style={{ background: "#f8f7f4", color: "#1a1a1a", border: "1px solid #ebebeb", padding: "12px 16px", borderRadius: 10, fontWeight: 500, fontSize: 14, textAlign: "left" }}>👤 Mon profil — {user?.email?.split("@")[0]}</button>
          <div style={{ borderTop: "1px solid #ebebeb", paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={() => setLang(lang === "fr" ? "en" : "fr")} style={{ background: "#f4f4f4", border: "none", padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>{lang === "fr" ? "🇫🇷 Français" : "🇬🇧 English"}</button>
            <button onClick={() => { onLogout(); setMenuOpen(false); }} style={{ background: "#fce8e8", color: "#c0392b", border: "none", padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Déconnexion</button>
          </div>
        </div>
      )}
    </>
  );
}

function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError(""); setSuccess(""); setLoading(true);
    if (!email || !password) { setError("Veuillez remplir tous les champs"); setLoading(false); return; }
    if (password.length < 6) { setError("Mot de passe: minimum 6 caractères"); setLoading(false); return; }
    if (mode === "register") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setSuccess("Compte créé ! Connectez-vous maintenant.");
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("Email ou mot de passe incorrect");
      else onAuth(data.user);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #ebebeb", padding: "40px 36px", width: "100%", maxWidth: 420, boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🛍</div>
          <div style={{ fontWeight: 800, fontSize: 24 }}>Marché+</div>
          <div style={{ fontSize: 14, color: "#888", marginTop: 4 }}>{mode === "login" ? "Connectez-vous" : "Créez votre compte"}</div>
        </div>
        <div style={{ display: "flex", background: "#f4f4f4", borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {[{ key: "login", label: "Connexion" }, { key: "register", label: "Inscription" }].map(t => (
            <button key={t.key} onClick={() => { setMode(t.key); setError(""); setSuccess(""); }} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", background: mode === t.key ? "#fff" : "transparent", fontWeight: mode === t.key ? 700 : 400, color: mode === t.key ? "#1a1a1a" : "#888", fontSize: 14, boxShadow: mode === t.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>{t.label}</button>
          ))}
        </div>
        {[{ label: "Email", key: "email", type: "email", placeholder: "votre@email.com", val: email, set: setEmail }, { label: "Mot de passe", key: "pwd", type: "password", placeholder: "••••••••", val: password, set: setPassword }].map(f => (
          <div key={f.key} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>{f.label}</label>
            <input type={f.type} placeholder={f.placeholder} value={f.val} onChange={e => f.set(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14 }} />
          </div>
        ))}
        {error && <div style={{ background: "#fce8e8", color: "#c0392b", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>✗ {error}</div>}
        {success && <div style={{ background: "#e6f7ef", color: "#0a7c45", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>✓ {success}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: "#1a1a1a", color: "#fff", border: "none", padding: "14px", borderRadius: 12, fontWeight: 700, fontSize: 15, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>
      </div>
    </div>
  );
}

function ShopPage({ products, onAdd, onSelect, favorites, onToggleFav, isFavorite }) {
  const [category, setCategory] = useState("Tous");
  const [search, setSearch] = useState("");
  const filtered = products.filter(p => (category === "Tous" || p.category === category) && p.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <input placeholder="Rechercher un produit…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, padding: "10px 16px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, background: "#fff" }} />
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{ padding: "8px 16px", borderRadius: 99, border: `1.5px solid ${category === c ? "#1a1a1a" : "#e0e0e0"}`, background: category === c ? "#1a1a1a" : "#fff", color: category === c ? "#fff" : "#555", fontSize: 13, fontWeight: 500 }}>{c}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 16 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", overflow: "hidden", cursor: "pointer", transition: "transform .15s, box-shadow .15s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.07)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            onClick={() => onSelect(p)}>
            <ProductImage src={p.image} alt={p.name} height={150} />
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>{p.category}</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 5 }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#f5a623" }}>{"★".repeat(Math.floor(p.rating))}</span>
                <span style={{ fontSize: 11, color: "#bbb" }}>{p.rating} ({p.reviewsList?.length || 0})</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>{fmt(p.price)}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={e => { e.stopPropagation(); onToggleFav(p); }} style={{ background: isFavorite(p.id) ? "#fce8f0" : "#f4f4f4", color: isFavorite(p.id) ? "#e53e3e" : "#aaa", border: "none", padding: "7px 10px", borderRadius: 8, fontSize: 14 }}>
                    {isFavorite(p.id) ? "❤️" : "🤍"}
                  </button>
                  <button onClick={e => { e.stopPropagation(); onAdd(p); }} style={{ background: "#1a1a1a", color: "#fff", border: "none", padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>+ Ajouter</button>
                </div>
              </div>
              <div style={{ fontSize: 11, color: p.stock < 10 ? "#e53e3e" : "#bbb", marginTop: 6 }}>{p.stock < 10 ? `⚠ Plus que ${p.stock} en stock` : `${p.stock} disponibles`}</div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div style={{ textAlign: "center", padding: "70px 0", color: "#bbb" }}><div style={{ fontSize: 42, marginBottom: 12 }}>🔍</div><div style={{ fontWeight: 500 }}>Aucun produit trouvé</div></div>}
    </div>
  );
}

function ProductDetailPage({ product, onAdd, onBack, isFavorite, onToggleFav }) {
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [qty, setQty] = useState(1);
  const images = product.images || [product.image];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#888", fontSize: 14, cursor: "pointer" }}>← Retour à la boutique</button>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => window.open("https://wa.me/?text=" + encodeURIComponent("Découvrez " + product.name + " sur Marché+ : https://marche-plus.vercel.app"), "_blank")} style={{ background: "#25D366", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>WhatsApp</button>
          <button onClick={() => window.open("https://www.facebook.com/sharer/sharer.php?u=https://marche-plus.vercel.app", "_blank")} style={{ background: "#1877F2", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Facebook</button>
          <button onClick={() => navigator.clipboard.writeText("https://marche-plus.vercel.app")} style={{ background: "#f4f4f4", color: "#333", border: "none", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Copier lien</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          <div style={{ borderRadius: 16, overflow: "hidden", background: "#f8f7f4", marginBottom: 12, height: 340 }}>
            <img src={images[activeImg]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {images.map((img, i) => (
              <div key={i} onClick={() => setActiveImg(i)} style={{ width: 70, height: 70, borderRadius: 10, overflow: "hidden", cursor: "pointer", border: `2.5px solid ${activeImg === i ? "#1a1a1a" : "#e0e0e0"}` }}>
                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
            <h1 style={{ fontWeight: 800, fontSize: 22, lineHeight: 1.2 }}>{product.name}</h1>
            <button onClick={() => onToggleFav(product)} style={{ background: isFavorite(product.id) ? "#fce8f0" : "#f4f4f4", color: isFavorite(product.id) ? "#e53e3e" : "#aaa", border: "none", padding: "10px 14px", borderRadius: 10, fontSize: 20, flexShrink: 0 }}>
              {isFavorite(product.id) ? "❤️" : "🤍"}
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ color: "#f5a623", fontSize: 16 }}>{"★".repeat(Math.floor(product.rating))}</span>
            <span style={{ fontSize: 13, color: "#888" }}>{product.rating} ({product.reviewsList?.length || 0} avis)</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 28, marginBottom: 16 }}>{fmt(product.price)}</div>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 20 }}>{product.description}</p>

          {product.colors?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Couleur : <span style={{ fontWeight: 400, color: "#888" }}>{selectedColor}</span></div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.colors.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)} style={{ padding: "6px 14px", borderRadius: 99, border: `2px solid ${selectedColor === c ? "#1a1a1a" : "#e0e0e0"}`, background: selectedColor === c ? "#1a1a1a" : "#fff", color: selectedColor === c ? "#fff" : "#555", fontSize: 13, fontWeight: 500 }}>{c}</button>
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Taille : <span style={{ fontWeight: 400, color: "#888" }}>{selectedSize}</span></div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)} style={{ width: 44, height: 44, borderRadius: 10, border: `2px solid ${selectedSize === s ? "#1a1a1a" : "#e0e0e0"}`, background: selectedSize === s ? "#1a1a1a" : "#fff", color: selectedSize === s ? "#fff" : "#555", fontSize: 13, fontWeight: 600 }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f4f4f4", borderRadius: 10, padding: "6px 12px" }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ background: "none", border: "none", fontSize: 18, fontWeight: 700, cursor: "pointer" }}>−</button>
              <span style={{ fontWeight: 700, minWidth: 24, textAlign: "center" }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={{ background: "none", border: "none", fontSize: 18, fontWeight: 700, cursor: "pointer" }}>+</button>
            </div>
            <button onClick={() => { for(let i = 0; i < qty; i++) onAdd(product); }} style={{ flex: 1, background: "#1a1a1a", color: "#fff", border: "none", padding: "14px", borderRadius: 12, fontWeight: 700, fontSize: 15 }}>🛒 Ajouter au panier</button>
          </div>
          <div style={{ fontSize: 12, color: product.stock < 10 ? "#e53e3e" : "#aaa" }}>{product.stock < 10 ? `⚠ Plus que ${product.stock} en stock` : `✓ ${product.stock} disponibles`}</div>
        </div>
      </div>

      {product.reviewsList?.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>⭐ Avis clients</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {product.reviewsList.map((r, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, border: "1px solid #ebebeb", padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>👤 {r.user}</span>
                  <span style={{ color: "#f5a623" }}>{"★".repeat(r.note)}</span>
                </div>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CartPage({ cart, onRemove, onUpdateQty, goToShop, goToPayment, promoCode, promoDiscount, promoLabel, onApplyPromo, onRemovePromo, points }) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = Math.round(subtotal * promoDiscount / 100);
  const finalTotal = subtotal - discount;
  const [codeInput, setCodeInput] = useState("");
  const [promoError, setPromoError] = useState("");

  const handlePromo = () => {
    if (onApplyPromo(codeInput)) setPromoError("");
    else setPromoError("Code invalide");
  };

  if (cart.length === 0) return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 20px", textAlign: "center", color: "#bbb" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>🛒</div>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Votre panier est vide</div>
      <button onClick={goToShop} style={{ background: "#1a1a1a", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 10, fontWeight: 600 }}>Découvrir les produits</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px" }}>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 22 }}>Mon panier ({cart.reduce((s, i) => s + i.qty, 0)} articles)</h2>
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", overflow: "hidden", marginBottom: 18 }}>
        {cart.map((item, i) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderBottom: i < cart.length - 1 ? "1px solid #f2f2f2" : "none" }}>
            <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}><ProductImage src={item.image} alt={item.name} height={52} /></div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div><div style={{ fontSize: 12, color: "#aaa" }}>{fmt(item.price)} / unité</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => onUpdateQty(item.id, -1)} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #ddd", background: "#fff", fontWeight: 700 }}>−</button>
              <span style={{ fontWeight: 700, minWidth: 22, textAlign: "center" }}>{item.qty}</span>
              <button onClick={() => onUpdateQty(item.id, 1)} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #ddd", background: "#fff", fontWeight: 700 }}>+</button>
            </div>
            <div style={{ fontWeight: 700, minWidth: 110, textAlign: "right" }}>{fmt(item.price * item.qty)}</div>
            <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", color: "#ccc", fontSize: 20, padding: "0 4px" }}>×</button>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", padding: "16px 20px", marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>🏷 Code promo</div>
        {promoCode ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#e6f7ef", borderRadius: 10, padding: "10px 14px" }}>
            <div><div style={{ fontWeight: 700, color: "#0a7c45" }}>{promoCode}</div><div style={{ fontSize: 13, color: "#0a7c45" }}>{promoLabel} ✓</div></div>
            <button onClick={onRemovePromo} style={{ background: "none", border: "none", color: "#e53e3e", cursor: "pointer", fontSize: 18 }}>×</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="Entrez votre code..." value={codeInput} onChange={e => setCodeInput(e.target.value)} style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${promoError ? "#e53e3e" : "#e0e0e0"}`, fontSize: 14 }} />
            <button onClick={handlePromo} style={{ background: "#1a1a1a", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: 13 }}>Appliquer</button>
          </div>
        )}
        {promoError && <div style={{ fontSize: 12, color: "#e53e3e", marginTop: 6 }}>{promoError}</div>}
      </div>

      {points > 0 && (
        <div style={{ background: "#fff8e1", borderRadius: 12, border: "1px solid #ffe082", padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>⭐</span>
          <div><div style={{ fontWeight: 600, fontSize: 14 }}>Vous avez {points} points de fidélité</div><div style={{ fontSize: 12, color: "#888" }}>Continuez vos achats pour en gagner plus !</div></div>
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#888", marginBottom: 6 }}><span>Sous-total</span><span>{fmt(subtotal)}</span></div>
        {promoDiscount > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#0a7c45", marginBottom: 6 }}><span>Réduction ({promoDiscount}%)</span><span>- {fmt(discount)}</span></div>}
        <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 10, paddingTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div><div style={{ fontSize: 13, color: "#888" }}>Total à payer</div><div style={{ fontWeight: 800, fontSize: 24 }}>{fmt(finalTotal)}</div></div>
          <button onClick={goToPayment} style={{ background: "#1a1a1a", color: "#fff", border: "none", padding: "14px 34px", borderRadius: 12, fontWeight: 700, fontSize: 15 }}>Commander →</button>
        </div>
      </div>
    </div>
  );
}

function PaymentPage({ cart, onConfirm, promoDiscount, promoCode }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", phone: "", address: "", method: "mobile" });
  const [errors, setErrors] = useState({});
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = Math.round(subtotal * promoDiscount / 100);
  const total = subtotal - discount;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Champ requis";
    if (!form.phone.trim()) e.phone = "Champ requis";
    if (!form.address.trim()) e.address = "Champ requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const METHODS = [
    { key: "mobile", label: "Orange Money", sub: "Composez #144#", icon: "🟠" },
    { key: "cash",   label: "À la livraison", sub: "Payez en espèces", icon: "💵" },
    { key: "card",   label: "Carte bancaire", sub: "Visa, Mastercard", icon: "💳" },
  ];
  const methodLabel = METHODS.find(m => m.key === form.method)?.label;

  const StepDot = ({ n }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%", background: step > n ? "#0a7c45" : step === n ? "#1a1a1a" : "#e0e0e0", color: step >= n ? "#fff" : "#aaa", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{step > n ? "✓" : n}</div>
      <div style={{ fontSize: 11, marginTop: 4, fontWeight: step === n ? 600 : 400, color: step >= n ? "#1a1a1a" : "#aaa" }}>{["Livraison","Paiement","Confirmation"][n-1]}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "28px 20px" }}>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 20 }}>Finaliser la commande</h2>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", marginBottom: 28 }}>
        <StepDot n={1} /><div style={{ height: 1, width: 60, background: step > 1 ? "#1a1a1a" : "#e0e0e0", margin: "14px 4px 0" }} />
        <StepDot n={2} /><div style={{ height: 1, width: 60, background: step > 2 ? "#1a1a1a" : "#e0e0e0", margin: "14px 4px 0" }} />
        <StepDot n={3} />
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #ebebeb", padding: "26px 24px" }}>
        {step === 1 && (
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Informations de livraison</h3>
            {[{label:"Nom complet",key:"name",placeholder:"Ex : Amadou Diallo",type:"text"},{label:"Téléphone",key:"phone",placeholder:"Ex : +223 91 09 05 23",type:"tel"},{label:"Adresse de livraison",key:"address",placeholder:"Quartier, rue, porte…",type:"text"}].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14, border: `1.5px solid ${errors[f.key] ? "#e53e3e" : "#e0e0e0"}` }} />
                {errors[f.key] && <span style={{ fontSize: 11, color: "#e53e3e", marginTop: 3, display: "block" }}>{errors[f.key]}</span>}
              </div>
            ))}
            <button onClick={() => { if (validate()) setStep(2); }} style={{ width: "100%", background: "#1a1a1a", color: "#fff", border: "none", padding: "14px", borderRadius: 12, fontWeight: 700, fontSize: 15 }}>Continuer →</button>
          </div>
        )}
        {step === 2 && (
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Mode de paiement</h3>
            {METHODS.map(m => (
              <div key={m.key} onClick={() => setForm(p => ({ ...p, method: m.key }))} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, marginBottom: 10, cursor: "pointer", border: `2px solid ${form.method === m.key ? "#1a1a1a" : "#e0e0e0"}`, background: form.method === m.key ? "#f8f7f4" : "#fff" }}>
                <span style={{ fontSize: 26 }}>{m.icon}</span>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div><div style={{ fontSize: 12, color: "#888" }}>{m.sub}</div></div>
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${form.method === m.key ? "#1a1a1a" : "#ccc"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {form.method === m.key && <div style={{ width: 9, height: 9, background: "#1a1a1a", borderRadius: "50%" }} />}
                </div>
              </div>
            ))}
            {form.method === "mobile" && (
              <div style={{ background: "#fff8f0", border: "2px solid #ff6600", borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 28 }}>🟠</span>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#ff6600" }}>Paiement Orange Money</div>
                </div>
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.8 }}>
                  <div>1️⃣ Composez <strong>#144#</strong></div>
                  <div>2️⃣ Choisissez <strong>"Transfert d'argent"</strong></div>
                  <div>3️⃣ Numéro : <strong style={{ fontSize: 16, color: "#ff6600" }}>91 09 05 23</strong></div>
                  <div>4️⃣ Montant : <strong style={{ color: "#ff6600" }}>{fmt(total)}</strong></div>
                  <div>5️⃣ Confirmez avec votre <strong>code secret</strong></div>
                </div>
              </div>
            )}
            <div style={{ background: "#f8f7f4", borderRadius: 10, padding: "14px 16px", margin: "16px 0" }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Récapitulatif</div>
              {cart.map(i => (<div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "#555" }}><span>{i.name} × {i.qty}</span><span>{fmt(i.price * i.qty)}</span></div>))}
              {promoDiscount > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#0a7c45", marginTop: 4 }}><span>Réduction ({promoDiscount}%)</span><span>- {fmt(discount)}</span></div>}
              <div style={{ borderTop: "1px solid #e0e0e0", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 800 }}><span>Total</span><span>{fmt(total)}</span></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: "#f4f4f4", color: "#555", border: "none", padding: "13px", borderRadius: 12, fontWeight: 600 }}>← Retour</button>
              <button onClick={() => setStep(3)} style={{ flex: 2, background: "#1a1a1a", color: "#fff", border: "none", padding: "13px", borderRadius: 12, fontWeight: 700 }}>Payer {fmt(total)} →</button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 10 }}>Tout est prêt !</h3>
            <p style={{ color: "#666", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
              Livraison à : <strong>{form.address}</strong><br />
              Contact : <strong>{form.phone}</strong><br />
              Paiement : <strong>{methodLabel}</strong><br />
              Total : <strong>{fmt(total)}</strong>
            </p>
            <div style={{ background: "#e8f8ef", border: "1px solid #b2e5c8", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#0a7c45" }}>
              📲 WhatsApp s'ouvrira avec les détails de votre commande
            </div>
            <button onClick={() => onConfirm(form)} style={{ width: "100%", background: "#25D366", color: "#fff", border: "none", padding: "16px", borderRadius: 12, fontWeight: 700, fontSize: 16, marginBottom: 10 }}>
              💬 Confirmer et envoyer sur WhatsApp
            </button>
            <button onClick={() => setStep(2)} style={{ width: "100%", background: "#f4f4f4", color: "#555", border: "none", padding: "12px", borderRadius: 12, fontWeight: 500 }}>← Modifier</button>
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersPage({ orders, loading }) {
  if (loading) return <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 20px", textAlign: "center", color: "#bbb" }}><div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div><div>Chargement...</div></div>;
  if (orders.length === 0) return <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 20px", textAlign: "center", color: "#bbb" }}><div style={{ fontSize: 48, marginBottom: 16 }}>📦</div><div style={{ fontWeight: 500 }}>Aucune commande pour le moment</div></div>;
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 20px" }}>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 22 }}>Commandes ({orders.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {orders.map(o => {
          const sc = statusStyle(o.status);
          return (
            <div key={o.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", padding: "18px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{o.id}</div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>👤 {o.client_nom} · 📞 {o.client_telephone}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>📍 {o.client_adresse}</div>
                  <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>💳 {o.paiement} · {o.date} · {o.items} art.</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <span style={{ background: sc.bg, color: sc.color, fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 99 }}>{o.status}</span>
                  <span style={{ fontWeight: 800, fontSize: 16 }}>{fmt(o.total)}</span>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                {o.status === "En cours" && (
                  <div style={{ background: "#e8f0fe", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 12, color: "#1a56db", fontWeight: 500, marginBottom: 6 }}>🕐 En cours de traitement</div>
                    <div style={{ height: 6, background: "#e0e0e0", borderRadius: 99, overflow: "hidden" }}><div style={{ width: "25%", height: "100%", background: "#1a56db", borderRadius: 99 }} /></div>
                  </div>
                )}
                {o.status === "En transit" && (
                  <div style={{ background: "#fff8e1", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 12, color: "#b76e00", fontWeight: 500, marginBottom: 6 }}>📦 En cours de livraison</div>
                    <div style={{ height: 6, background: "#ffe082", borderRadius: 99, overflow: "hidden" }}><div style={{ width: "75%", height: "100%", background: "#f5a623", borderRadius: 99 }} /></div>
                  </div>
                )}
                {o.status === "Livré" && (
                  <div style={{ background: "#e6f7ef", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 12, color: "#0a7c45", fontWeight: 500, marginBottom: 6 }}>✅ Commande livrée !</div>
                    <div style={{ height: 6, background: "#b2e5c8", borderRadius: 99, overflow: "hidden" }}><div style={{ width: "100%", height: "100%", background: "#0a7c45", borderRadius: 99 }} /></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminPage({ products, setProducts, orders, setOrders }) {
  const [tab, setTab] = useState("overview");
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const delivered    = orders.filter(o => o.status === "Livré").length;
  const lowStock     = products.filter(p => p.stock < 10);

  const updateOrderStatus = async (id, status) => {
    await supabase.from("commandes").update({ status }).eq("id", id);
    setOrders(os => os.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px" }}>
      <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 20 }}>Tableau de bord Admin</h2>
      <div style={{ display: "flex", marginBottom: 24, borderBottom: "1px solid #e8e8e8" }}>
        {[{key:"overview",label:"Vue d'ensemble"},{key:"products",label:"Produits"},{key:"orders",label:"Commandes"}].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "10px 20px", border: "none", background: "transparent", fontWeight: tab === t.key ? 700 : 400, color: tab === t.key ? "#1a1a1a" : "#888", borderBottom: `2px solid ${tab === t.key ? "#1a1a1a" : "transparent"}`, fontSize: 14, marginBottom: -1 }}>{t.label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 14, marginBottom: 28 }}>
            {[{label:"Chiffre d'affaires",value:fmt(totalRevenue),icon:"💰",bg:"#e6f7ef"},{label:"Commandes totales",value:orders.length,icon:"📦",bg:"#e8f0fe"},{label:"Livrées",value:delivered,icon:"✅",bg:"#fff8e1"},{label:"Produits actifs",value:products.length,icon:"🏷",bg:"#fce8f0"}].map(m => (
              <div key={m.label} style={{ background: m.bg, borderRadius: 14, padding: "20px 18px" }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>{m.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 22 }}>{m.value}</div>
                <div style={{ fontSize: 12, color: "#555", marginTop: 3 }}>{m.label}</div>
              </div>
            ))}
          </div>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>📊 Répartition des commandes</h3>
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", padding: "20px", marginBottom: 24 }}>
            {["En cours","En transit","Livré","Annulé"].map(s => {
              const count = orders.filter(o => o.status === s).length;
              const pct = orders.length > 0 ? Math.round(count / orders.length * 100) : 0;
              const colors = {"En cours":"#1a56db","En transit":"#b76e00","Livré":"#0a7c45","Annulé":"#c0392b"};
              return (
                <div key={s} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                    <span style={{ fontWeight: 500 }}>{s}</span>
                    <span style={{ color: colors[s], fontWeight: 700 }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 8, background: "#f0f0f0", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: pct + "%", height: "100%", background: colors[s], borderRadius: 99, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>⚠ Stock faible</h3>
          {lowStock.length === 0 ? <p style={{ color: "#aaa", fontSize: 13 }}>Aucun produit en stock faible.</p> : lowStock.map(p => (
            <div key={p.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0d9d9", padding: "12px 18px", display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontWeight: 600, flex: 1 }}>{p.name}</span>
              <span style={{ fontSize: 12, background: "#fce8e8", color: "#c0392b", padding: "4px 12px", borderRadius: 99, fontWeight: 600 }}>{p.stock} restant{p.stock > 1 ? "s" : ""}</span>
            </div>
          ))}
        </>
      )}

      {tab === "products" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {products.map(p => (
            <div key={p.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #ebebeb", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden" }}><ProductImage src={p.image} alt={p.name} height={44} /></div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div><div style={{ fontSize: 12, color: "#888" }}>{p.category} · {fmt(p.price)}</div></div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#888" }}>Stock :</span>
                <button onClick={() => setProducts(ps => ps.map(x => x.id === p.id ? {...x, stock: Math.max(0, x.stock - 1)} : x))} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #ddd", background: "#fff", fontWeight: 700 }}>−</button>
                <span style={{ fontWeight: 800, minWidth: 26, textAlign: "center", color: p.stock < 10 ? "#e53e3e" : "#1a1a1a" }}>{p.stock}</span>
                <button onClick={() => setProducts(ps => ps.map(x => x.id === p.id ? {...x, stock: x.stock + 1} : x))} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #ddd", background: "#fff", fontWeight: 700 }}>+</button>
              </div>
              <span style={{ fontSize: 12, background: "#f4f4f4", color: "#666", padding: "4px 10px", borderRadius: 6 }}>★ {p.rating}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "orders" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {orders.length === 0 && <p style={{ color: "#aaa", fontSize: 13 }}>Aucune commande.</p>}
          {orders.map(o => {
            const sc = statusStyle(o.status);
            return (
              <div key={o.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #ebebeb", padding: "14px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{o.id}</div>
                  <div style={{ fontSize: 12, color: "#555" }}>👤 {o.client_nom} · 📞 {o.client_telephone}</div>
                  <div style={{ fontSize: 12, color: "#aaa" }}>📍 {o.client_adresse} · {o.date}</div>
                </div>
                <span style={{ fontWeight: 700 }}>{fmt(o.total)}</span>
                <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #ddd", background: sc.bg, color: sc.color, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                  {["En cours","En transit","Livré","Annulé"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProfilePage({ user, orders, favorites, onClose, onSelect }) {
  const [tab, setTab] = useState("info");
  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", fontSize: 14, cursor: "pointer", marginBottom: 20 }}>← Retour</button>
      <div style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #333 100%)", borderRadius: 16, padding: "24px", marginBottom: 20, color: "#fff", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>👤</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.email?.split("@")[0]}</div>
          <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>{user?.email}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[{label:"Commandes",value:orders.length,icon:"📦"},{label:"Total dépensé",value:fmt(totalSpent),icon:"💰"},{label:"Favoris",value:favorites.length,icon:"❤️"}].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #ebebeb", padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", borderBottom: "1px solid #e8e8e8", marginBottom: 20 }}>
        {[{key:"info",label:"Mon compte"},{key:"favorites",label:"❤️ Favoris"}].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "10px 20px", border: "none", background: "transparent", fontWeight: tab === t.key ? 700 : 400, color: tab === t.key ? "#1a1a1a" : "#888", borderBottom: `2px solid ${tab === t.key ? "#1a1a1a" : "transparent"}`, fontSize: 14, marginBottom: -1 }}>{t.label}</button>
        ))}
      </div>
      {tab === "info" && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", overflow: "hidden" }}>
          {[{icon:"📧",label:"Email",value:user?.email},{icon:"📦",label:"Commandes",value:`${orders.length} commande${orders.length > 1 ? "s" : ""}`},{icon:"💰",label:"Total dépensé",value:fmt(totalSpent)}].map((item, i, arr) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderBottom: i < arr.length - 1 ? "1px solid #f2f2f2" : "none" }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <div><div style={{ fontSize: 12, color: "#aaa" }}>{item.label}</div><div style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>{item.value}</div></div>
            </div>
          ))}
        </div>
      )}
      {tab === "favorites" && (
        favorites.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 0", color: "#bbb" }}><div style={{ fontSize: 42, marginBottom: 12 }}>🤍</div><div style={{ fontWeight: 500 }}>Aucun favori</div></div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {favorites.map(p => (
              <div key={p.id} onClick={() => onSelect(p)} style={{ background: "#fff", borderRadius: 14, border: "1px solid #ebebeb", overflow: "hidden", cursor: "pointer" }}>
                <div style={{ height: 120, overflow: "hidden" }}><ProductImage src={p.image} alt={p.name} height={120} /></div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{fmt(p.price)}</div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("shop");
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [toast, setToast] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoLabel, setPromoLabel] = useState("");
  const [points, setPoints] = useState(0);
  const [lang, setLang] = useState("fr");

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user || null); setCheckingAuth(false); });
    supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user || null); });
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("produits").select("*").order("id");
    if (!error && data && data.length > 0) {
      const parsed = data.map(p => ({ ...p, images: p.images ? p.images.split(",") : [p.image], sizes: p.sizes ? p.sizes.split(",").filter(Boolean) : [], colors: p.colors ? p.colors.split(",").filter(Boolean) : [], reviewsList: [] }));
      setProducts(parsed);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase.from("commandes").select("*").order("created_at", { ascending: false });
    if (!error && data) setOrders(data);
    setLoadingOrders(false);
  };

  useEffect(() => { if (page === "orders" || page === "admin") fetchOrders(); }, [page]);

  const addToCart = (product) => {
    setCart(prev => { const ex = prev.find(i => i.id === product.id); if (ex) return prev.map(i => i.id === product.id ? {...i, qty: i.qty + 1} : i); return [...prev, {...product, qty: 1}]; });
    showToast(product.name + " ajouté au panier");
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id, delta) => setCart(prev => prev.map(i => i.id === id ? {...i, qty: i.qty + delta} : i).filter(i => i.qty > 0));

  const toggleFavorite = (product) => setFavorites(prev => { const exists = prev.find(p => p.id === product.id); if (exists) return prev.filter(p => p.id !== product.id); return [...prev, product]; });
  const isFavorite = (id) => favorites.some(p => p.id === id);

  const applyPromo = (code) => {
    const promo = PROMO_CODES[code.toUpperCase()];
    if (promo) { setPromoCode(code.toUpperCase()); setPromoDiscount(promo.discount); setPromoLabel(promo.label); return true; }
    return false;
  };
  const removePromo = () => { setPromoCode(""); setPromoDiscount(0); setPromoLabel(""); };

  const placeOrder = (form) => {
    const cartCount = cart.reduce((s, i) => s + i.qty, 0);
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const discount = Math.round(subtotal * promoDiscount / 100);
    const cartTotal = subtotal - discount;
    const orderId = genId();
    const methodLabel = {mobile:"Orange Money",cash:"À la livraison",card:"Carte bancaire"}[form.method];

    const lignes = cart.map(i => "• " + i.name + " x" + i.qty + " = " + fmt(i.price * i.qty)).join("\n");
    const msg = "🛍 Nouvelle commande " + orderId + "\n\n👤 Client: " + form.name + "\n📞 Tel: " + form.phone + "\n📍 Adresse: " + form.address + "\n💳 Paiement: " + methodLabel + (promoCode ? "\n🏷 Code promo: " + promoCode + " (-" + promoDiscount + "%)" : "") + "\n\n🧾 Articles:\n" + lignes + "\n\n💰 TOTAL: " + fmt(cartTotal) + "\n\nMerci pour votre commande! 🙏";
    window.location.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);

    supabase.from("commandes").insert({ id: orderId, date: new Date().toISOString().slice(0,10), status: "En cours", total: cartTotal, items: cartCount, client_nom: form.name, client_telephone: form.phone, client_adresse: form.address, paiement: methodLabel, produits: JSON.stringify(cart.map(i => ({nom:i.name,qty:i.qty,prix:i.price}))) }).then(({error}) => { if (error) console.error(error); });

    const earnedPoints = Math.floor(cartTotal / POINTS_RATIO);
    if (earnedPoints > 0) { setPoints(prev => prev + earnedPoints); }

    setCart([]); setPromoCode(""); setPromoDiscount(0); setPromoLabel("");
    setPage("orders");
    showToast("Commande confirmée ! Message WhatsApp envoyé 📲");
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  if (checkingAuth) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f7f4" }}><div style={{ textAlign: "center", color: "#aaa" }}><div style={{ fontSize: 48, marginBottom: 12 }}>🛍</div><div>Chargement...</div></div></div>;
  if (!user) return <AuthPage onAuth={setUser} />;

  return (
    <>
      <Toast toast={toast} />
      <Navbar page={page} setPage={(p) => { setShowProfile(false); setSelectedProduct(null); setPage(p); }} cartCount={cartCount} user={user} onLogout={() => { supabase.auth.signOut(); setUser(null); }} onProfile={() => { setShowProfile(true); setSelectedProduct(null); }} favCount={favorites.length} points={points} lang={lang} setLang={setLang} />
      {showProfile && <ProfilePage user={user} orders={orders} favorites={favorites} onClose={() => setShowProfile(false)} onSelect={(p) => { setShowProfile(false); setPage("shop"); setSelectedProduct(p); }} />}
      {!showProfile && page === "shop" && !selectedProduct && <ShopPage products={products} onAdd={addToCart} onSelect={setSelectedProduct} favorites={favorites} onToggleFav={toggleFavorite} isFavorite={isFavorite} />}
      {!showProfile && page === "shop" && selectedProduct && <ProductDetailPage product={selectedProduct} onAdd={addToCart} onBack={() => setSelectedProduct(null)} isFavorite={isFavorite} onToggleFav={toggleFavorite} />}
      {!showProfile && page === "cart" && <CartPage cart={cart} onRemove={removeFromCart} onUpdateQty={updateQty} goToShop={() => setPage("shop")} goToPayment={() => setPage("payment")} promoCode={promoCode} promoDiscount={promoDiscount} promoLabel={promoLabel} onApplyPromo={applyPromo} onRemovePromo={removePromo} points={points} />}
      {!showProfile && page === "payment" && <PaymentPage cart={cart} onConfirm={placeOrder} promoDiscount={promoDiscount} promoCode={promoCode} />}
      {!showProfile && page === "orders" && <OrdersPage orders={orders} loading={loadingOrders} />}
      {!showProfile && page === "admin" && <AdminPage products={products} setProducts={setProducts} orders={orders} setOrders={setOrders} />}

      <a href={"https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent("Bonjour, j'ai une question sur votre boutique Marché+")} target="_blank" rel="noreferrer"
        style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, background: "#25D366", color: "#fff", width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: "0 4px 20px rgba(37,211,102,0.4)", textDecoration: "none" }}>
        💬
      </a>
    </>
  );
}
