/**
 * /api/dialect/[...path].js
 * Vercel serverless proxy — general purpose forwarding proxy.
 * The first path segment after /api/dialect/ is treated as the target hostname.
 * Everything after is the upstream path + query string.
 *
 * Supported upstreams:
 *   /api/dialect/api.jup.ag/...        → https://api.jup.ag/...
 *   /api/dialect/kamino.dial.to/...    → https://kamino.dial.to/...
 *
 * This matches the URL pattern produced by DIALECT_PROXY in config.js.
 */
export const config = { runtime: "edge" };

// Allowlisted upstream hostnames (security: do not proxy arbitrary hosts)
const ALLOWED_HOSTS = new Set(["api.jup.ag", "kamino.dial.to"]);

export default async function handler(req) {
  const url = new URL(req.url);

  // Pathname is: /api/dialect/<hostname>/<rest...>
  const stripped = url.pathname.replace(/^\/api\/dialect\/?/, "");
  const slashIdx = stripped.indexOf("/");
  const hostname = slashIdx === -1 ? stripped : stripped.slice(0, slashIdx);
  const rest = slashIdx === -1 ? "/" : stripped.slice(slashIdx);

  if (!ALLOWED_HOSTS.has(hostname)) {
    return new Response(
      JSON.stringify({ error: `Upstream host '${hostname}' is not allowed.` }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  const upstreamURL = `https://${hostname}${rest}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.set("Accept", "application/json");

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
