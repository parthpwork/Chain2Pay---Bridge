let cache = { token: null, expiresAt: 0 };

export async function getShopifyAccessToken(shop) {
  const now = Math.floor(Date.now() / 1000);

  if (cache.token && cache.expiresAt - 60 > now) return cache.token;

  const resp = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.SHOPIFY_CLIENT_ID,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET
    })
  });

  const data = await resp.json().catch(() => ({}));

  if (!resp.ok || !data?.access_token) {
    throw new Error(`Shopify token error: ${JSON.stringify(data)}`);
  }

  cache.token = data.access_token;
  cache.expiresAt = now + (data.expires_in || 3600);

  return cache.token;
}