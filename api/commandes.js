import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const PROMO_CODES = { BIENVENUE: 10, ETE2025: 15, FIDELITE: 20, MALI10: 10 };

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Méthode non autorisée" });
  }

  const authorization = request.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return response.status(401).json({ error: "Authentification requise" });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return response.status(500).json({ error: "Service de commande non configuré" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return response.status(401).json({ error: "Session invalide" });

  const body = request.body || {};
  if (body.action === "get") {
    if (typeof body.id !== "string" || !body.id.startsWith("CMD-")) {
      return response.status(400).json({ error: "Numéro de commande invalide" });
    }
    const { data, error } = await supabase.from("commandes").select("*").eq("id", body.id).eq("user_id", user.id).maybeSingle();
    if (error) return response.status(500).json({ error: "Impossible de charger cette commande" });
    if (!data) return response.status(404).json({ error: "Commande introuvable" });
    return response.status(200).json({ order: data });
  }

  if (body.action === "cancel") {
    if (typeof body.id !== "string" || !body.id.startsWith("CMD-")) {
      return response.status(400).json({ error: "Numéro de commande invalide" });
    }
    const { data, error } = await supabase.from("commandes").update({ status: "Annulé" })
      .eq("id", body.id).eq("user_id", user.id).eq("status", "En cours").select("id").maybeSingle();
    if (error) return response.status(500).json({ error: "Impossible d’annuler cette commande" });
    if (!data) return response.status(409).json({ error: "Cette commande ne peut plus être annulée" });
    return response.status(200).json({ success: true });
  }

  if (body.action !== "create") return response.status(400).json({ error: "Action invalide" });

  const { name, phone, address, items, promoCode } = body;
  if (typeof name !== "string" || !name.trim() || name.length > 120 ||
      typeof phone !== "string" || !phone.trim() || phone.length > 40 ||
      typeof address !== "string" || !address.trim() || address.length > 500) {
    return response.status(400).json({ error: "Informations de livraison invalides" });
  }
  if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
    return response.status(400).json({ error: "Panier invalide" });
  }

  const quantities = new Map();
  for (const item of items) {
    const id = String(item?.id ?? "");
    const quantity = Number(item?.quantity);
    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return response.status(400).json({ error: "Produit ou quantité invalide" });
    }
    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }

  const { data: products, error: productsError } = await supabase.from("produits")
    .select("id, name, price, stock, vendeur_id")
    .in("id", [...quantities.keys()]);
  if (productsError) return response.status(500).json({ error: "Impossible de vérifier les produits" });
  if (!products || products.length !== quantities.size) {
    return response.status(409).json({ error: "Un ou plusieurs produits ne sont plus disponibles" });
  }

  const groups = new Map();
  for (const product of products) {
    const quantity = quantities.get(String(product.id));
    const price = Number(product.price);
    const stock = Number(product.stock);
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || quantity > stock) {
      return response.status(409).json({ error: `Stock insuffisant pour ${product.name}` });
    }
    const key = product.vendeur_id == null ? "admin" : String(product.vendeur_id);
    const group = groups.get(key) || { vendeur_id: product.vendeur_id ?? null, lines: [], subtotal: 0, count: 0 };
    group.lines.push({ id: product.id, nom: product.name, qty: quantity, prix: price });
    group.subtotal += price * quantity;
    group.count += quantity;
    groups.set(key, group);
  }

  const normalizedPromo = typeof promoCode === "string" ? promoCode.trim().toUpperCase() : "";
  const discountRate = normalizedPromo ? PROMO_CODES[normalizedPromo] : 0;
  if (normalizedPromo && !discountRate) return response.status(400).json({ error: "Code promo invalide" });

  const ordersToInsert = [...groups.values()].map(group => {
    const total = group.subtotal - Math.round(group.subtotal * discountRate / 100);
    return {
      id: `CMD-${randomUUID()}`,
      date: new Date().toISOString().slice(0, 10),
      status: "En cours",
      total,
      items: group.count,
      client_nom: name.trim(),
      client_telephone: phone.trim(),
      client_adresse: address.trim(),
      paiement: "À la livraison",
      produits: JSON.stringify(group.lines),
      user_id: user.id,
      vendeur_id: group.vendeur_id,
    };
  });
  const { data: createdOrders, error: insertError } = await supabase.from("commandes").insert(ordersToInsert).select();
  if (insertError) return response.status(500).json({ error: "Impossible d’enregistrer la commande. Vérifiez les règles Supabase." });

  return response.status(201).json({ orders: createdOrders });
}