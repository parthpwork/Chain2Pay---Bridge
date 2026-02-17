let cache = { token: null, expiresAt: 0 };

export async function getShopifyAccessToken(shop) {
  // ── Validate env vars up front ──
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      `Shopify credentials missing — SHOPIFY_CLIENT_ID=${clientId ? "set" : "MISSING"}, ` +
      `SHOPIFY_CLIENT_SECRET=${clientSecret ? "set" : "MISSING"}. ` +
      `Check Vercel environment variables.`
    );
  }

  // ── Validate shop domain format ──
  if (!shop || !shop.includes(".myshopify.com")) {
    throw new Error(
      `Invalid shop domain: "${shop}". Expected format: yourstore.myshopify.com`
    );
  }

  // ── Return cached token if still valid ──
  const now = Math.floor(Date.now() / 1000);
  if (cache.token && cache.expiresAt - 60 > now) return cache.token;

  // ── Build request ──
  const url = `https://${shop}/admin/oauth/access_token`;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  console.log("[shopifyToken] POST", url);
  console.log("[shopifyToken] body:", body.toString().replace(clientSecret, "***"));

  // ── Call Shopify ──
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await resp.text();
  console.log("[shopifyToken] status:", resp.status);
  console.log("[shopifyToken] response body:", text.slice(0, 500));

  // ── Parse response ──
  let data;
  try {
    data = JSON.parse(text);
  } catch (parseErr) {
    throw new Error(
      `Shopify returned non-JSON (status ${resp.status}). ` +
      `Body starts with: ${text.slice(0, 200)}`
    );
  }

  if (!resp.ok || !data?.access_token) {
    throw new Error(
      `Shopify token request failed: status=${resp.status} ` +
      `response=${JSON.stringify(data)}`
    );
  }

  // ── Cache and return ──
  cache.token = data.access_token;
  cache.expiresAt = now + (data.expires_in || 3600);
  console.log("[shopifyToken] token acquired, expires_in:", data.expires_in);
  return cache.token;
}
