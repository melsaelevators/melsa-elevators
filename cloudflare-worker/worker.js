/**
 * Melsa Elevators — AI image proxy (Cloudflare Worker)
 *
 * Keeps the Gemini API key secret. The website sends the prompt and the URLs of
 * the selected product photos; this worker downloads those photos, sends them to
 * Gemini as references, and returns the generated image.
 *
 * Setup: add a secret named GEMINI_API_KEY in the worker's Settings → Variables.
 */

const ALLOWED_ORIGIN = "https://melsaelevators.github.io";
const ALLOWED_IMAGE_PREFIX = "https://melsaelevators.github.io/melsa-elevators/assets/";
// Tried in order; the first one Google accepts is used.
const MODELS = ["gemini-3.1-flash-image", "gemini-nano-banana-2.1", "gemini-3.1-flash-image-preview"];
const LIMIT_PER_HOUR = 8; // per visitor (best effort)

const hits = new Map();

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors(origin) },
  });
}

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function tooMany(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 3600_000);
  if (list.length >= LIMIT_PER_HOUR) return true;
  list.push(now);
  hits.set(ip, list);
  return false;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { headers: cors(origin) });
    if (request.method !== "POST") return json({ error: "Not found" }, 404, origin);
    if (origin !== ALLOWED_ORIGIN) return json({ error: "Not allowed" }, 403, origin);
    if (!env.GEMINI_API_KEY) return json({ error: "Server is missing GEMINI_API_KEY." }, 500, origin);

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (tooMany(ip)) return json({ error: "You've reached the hourly limit. Please try again later." }, 429, origin);

    let body;
    try { body = await request.json(); } catch { return json({ error: "Bad request" }, 400, origin); }
    const prompt = String(body.prompt || "").slice(0, 3000);
    const images = Array.isArray(body.images) ? body.images.slice(0, 3) : [];
    if (!prompt || images.some((u) => typeof u !== "string" || !u.startsWith(ALLOWED_IMAGE_PREFIX))) {
      return json({ error: "Bad request" }, 400, origin);
    }

    // Download the selected product photos and attach them as references.
    const parts = [{ text: prompt }];
    for (const url of images) {
      const r = await fetch(url);
      if (!r.ok) return json({ error: "Could not load a product photo." }, 502, origin);
      const mime = (r.headers.get("content-type") || "image/jpeg").split(";")[0];
      parts.push({ inline_data: { mime_type: mime, data: toBase64(await r.arrayBuffer()) } });
    }

    const payload = {
      contents: [{ parts }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { aspectRatio: "3:4" } },
    };

    let lastError = "Image service error.";
    for (const model of MODELS) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (res.status === 404) { lastError = `Model ${model} not found.`; continue; }
      if (!res.ok) {
        console.log("Gemini error", model, res.status, JSON.stringify(data).slice(0, 500));
        return json({ error: "The AI service could not create the image. Please try again." }, 502, origin);
      }
      const out = (data.candidates?.[0]?.content?.parts || []).find((p) => p.inline_data || p.inlineData);
      if (!out) return json({ error: "No image was returned. Please try again." }, 502, origin);
      const img = out.inline_data || out.inlineData;
      return json({ image: img.data, mime: img.mime_type || img.mimeType || "image/png", model }, 200, origin);
    }
    return json({ error: lastError }, 502, origin);
  },
};
