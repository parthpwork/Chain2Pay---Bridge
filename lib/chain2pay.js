export async function createChain2PayPayment({ amount, email }) {
    const resp = await fetch("https://chain2pay.cloud/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency: "USD",
        merchant_wallet: process.env.CHAIN2PAY_WALLET,
        callback_url: process.env.CHAIN2PAY_CALLBACK_URL,
        customer_email: email || ""
      })
    });
  
    const data = await resp.json().catch(() => ({}));
  
    if (!resp.ok || !data?.payment_url) {
      throw new Error(`Chain2Pay generate failed: ${JSON.stringify(data)}`);
    }
  
    return data;
  }