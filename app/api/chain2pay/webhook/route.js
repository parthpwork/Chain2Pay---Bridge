export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const payload = Object.fromEntries(searchParams.entries());
  
    // Vercel logs -> Functions -> logs
    console.log("Chain2Pay webhook received:", payload);
  
    return Response.json({ ok: true });
  }