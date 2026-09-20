import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY,
);

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Méthode non autorisée" });
  }

  const authorization = request.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return response.status(401).json({ error: "Authentification requise" });
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return response.status(401).json({ error: "Session invalide" });

  const { total, description, cancel_url, return_url, callback_url } = request.body || {};
  const amount = Number(total);

  if (!Number.isFinite(amount) || amount <= 0 || !description) {
    return response.status(400).json({ error: "Montant ou description invalide" });
  }

  const requiredKeys = ["PAYDUNYA_MASTER_KEY", "PAYDUNYA_PRIVATE_KEY", "PAYDUNYA_TOKEN"];
  if (requiredKeys.some(key => !process.env[key])) {
    return response.status(500).json({ error: "Paiement non configuré côté serveur" });
  }

  try {
    const paydunyaResponse = await fetch("https://app.paydunya.com/api/v1/checkout-invoice/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY,
        "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY,
        "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN,
      },
      body: JSON.stringify({
        invoice: { total_amount: amount, description },
        store: { name: "Marché+" },
        actions: { cancel_url, return_url, callback_url },
      }),
    });

    const data = await paydunyaResponse.json();
    if (!paydunyaResponse.ok || data.response_code !== "00") {
      return response.status(502).json({ error: data.response_text || "Erreur PayDunya" });
    }

    return response.status(200).json({ url: data.response_text });
  } catch {
    return response.status(502).json({ error: "Service de paiement indisponible" });
  }
}
