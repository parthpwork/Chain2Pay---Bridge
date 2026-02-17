let cache = { token: null, expiresAt: 0 };

export async function getShopifyAccessToken(shop) {
  const now = Math.floor(Date.now() / 1000);
  if (cache.token && cache.expiresAt - 60 > now) return cache.token;

  const resp = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: process.env.SHOPIFY_CLIENT_ID,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET
    })
  });

  const text = await resp.text();

  // Try JSON parse but keep raw if it fails
  let data = {};
  try { data = JSON.parse(text); } catch {}

  if (!resp.ok || !data?.access_token) {
    throw new Error(`Shopify token error: status=${resp.status} body=${text}`);
  }

  cache.token = data.access_token;
  cache.expiresAt = now + (data.expires_in || 3600);
  return cache.token;
}