/**
 * /api/kamino/[...path].js
 * Vercel serverless proxy — forwards requests to api.kamino.finance.
 * Resolves CORS and direct-fetch 403 issues when calling Kamino from the browser.
 */
export const config = { runtime: "edge" };

const UPSTREAM = "https://api.kamino.finance";

export default async function handler(req) {
  const url = new URL(req.url);

  // Strip /api/kamino prefix; everything after becomes the upstream path
  const upstreamPath = url.pathname.replace(/^\/api\/kamino/, "") || "/";
  const upstreamURL = `${UPSTREAM}${upstreamPath}${url.search}`;

  const headers = new Headers();
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");

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
    responseHeaders.set("Access-Control-Allow-Headers", "Content-Type");

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
