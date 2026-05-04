/**
 * /api/solana-rpc.js
 * Vercel serverless proxy — forwards JSON-RPC requests to PRIVATE_RPC_URL.
 * Keeps the private RPC endpoint URL out of the client bundle.
 */
export const config = { runtime: "edge" };

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const rpcUrl = process.env.PRIVATE_RPC_URL;
  if (!rpcUrl) {
    return new Response(
      JSON.stringify({ error: "PRIVATE_RPC_URL not configured" }),
      {
        status: 503,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      },
    );
  }

  try {
    const body = await req.text();

    const upstream = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const responseHeaders = new Headers(upstream.headers);
    Object.entries(CORS_HEADERS).forEach(([k, v]) => responseHeaders.set(k, v));

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
}
