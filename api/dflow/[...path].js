/**
 * /api/dflow/[...path].js
 * Vercel serverless proxy — forwards requests to e.quote-api.dflow.net
 * Injects Authorization header server-side using DFLOW_API_KEY env var.
 */
export const config = { runtime: "edge" };

const UPSTREAM = "https://e.quote-api.dflow.net";

export default async function handler(req) {
  const url = new URL(req.url);

  // Strip the /api/dflow prefix; everything after becomes the upstream path
  const upstreamPath = url.pathname.replace(/^\/api\/dflow/, "") || "/";
  const upstreamURL = `${UPSTREAM}${upstreamPath}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.set("Content-Type", "application/json");

  const apiKey = process.env.DFLOW_API_KEY;
  if (apiKey) headers.set("Authorization", `Bearer ${apiKey}`);

  try {
    const upstream = await fetch(upstreamURL, {
      method: req.method,
      headers,
      body:
        req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      redirect: "follow",
    });

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    responseHeaders.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
