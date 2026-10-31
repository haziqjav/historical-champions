// Minimal server-side boundary for the optional Gemini "War Chronicle".
// The Gemini key exists ONLY in this process's environment (GEMINI_API_KEY) - never in the game
// bundle, APK or AAB. Deploy anywhere that runs Node (Cloud Run, Render, Fly, a VPS...).
//
//   cd server && npm install && GEMINI_API_KEY=... ALLOWED_ORIGINS=https://localhost node chronicle-proxy.mjs
//
// Env: GEMINI_API_KEY (required for AI), PORT (8787), ALLOWED_ORIGINS (comma list; default dev origins),
//      GEMINI_TEXT_MODEL, GEMINI_TTS_MODEL, GEMINI_VOICE (model names change - verify they are current).
import http from 'node:http';

const PORT = Number(process.env.PORT || 8787);
const KEY = process.env.GEMINI_API_KEY || '';
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-3-flash-preview';
const TTS_MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts';
const VOICE = process.env.GEMINI_VOICE || 'Zephyr';
// Capacitor Android serves the app from https://localhost (Capacitor 6+ default); dev uses http://localhost:3000.
const ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://localhost,http://localhost,http://localhost:3000').split(',').map((s) => s.trim());
const NAMES = {
  salahuddin: 'Salahuddin Ayyubi', baldwin_iv: 'Baldwin IV', nooruddin: 'Nooruddin Zangi', balian: 'Balian of Ibelin',
  guy: 'Guy de Lusignan', reynald: 'Reynald of Châtillon', shirkuh: 'Asad ad-Din Shirkuh', bori: 'Bori',
};
const RATE = { windowMs: 60_000, max: 12 };
const hits = new Map();

const send = (res, code, body, origin) => {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
  });
  res.end(JSON.stringify(body));
};

const limited = (ip) => {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < RATE.windowMs);
  arr.push(now); hits.set(ip, arr);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < RATE.windowMs)) hits.delete(k);
  return arr.length > RATE.max;
};

export function validate(b) {
  if (!b || typeof b !== 'object') return null;
  const int = (v, lo, hi) => (Number.isInteger(v) && v >= lo && v <= hi ? v : null);
  const w = NAMES[b.winnerId], l = NAMES[b.loserId];
  const hp = int(b.remainingHpPercentage, 0, 100), combo = int(b.maxCombo, 0, 999), dur = int(b.durationSeconds, 0, 3600);
  if (!w || !l || b.winnerId === b.loserId || hp === null || combo === null || dur === null) return null;
  return { w, l, hp, combo, dur };
}

export const buildPrompt = ({ w, l, hp, combo, dur }) =>
  `You are a seasoned historian, known for dramatic and insightful recounts of legendary duels. Write a vivid, complete war chronicle (a flowing narrative of 3 to 5 well-formed sentences) about a pivotal battle between ${w} and ${l}. ${w} achieved a decisive victory, retaining ${hp}% health with a ${combo}-hit combo, in ${dur} seconds. Highlight the victor's enduring legacy and the drama of the conflict. All sentences must be complete and the narrative must end gracefully.`;

let ai = null;
const getAi = async () => { if (!ai) { const { GoogleGenAI } = await import('@google/genai'); ai = new GoogleGenAI({ apiKey: KEY }); } return ai; };

export const server = http.createServer(async (req, res) => {
  const origin = ORIGINS.includes(req.headers.origin || '') ? req.headers.origin : null;
  if (req.method === 'OPTIONS') {
    res.writeHead(204, origin ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600', Vary: 'Origin' } : {});
    return res.end();
  }
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, { ok: true, aiConfigured: !!KEY }, origin);
  if (req.method !== 'POST' || req.url !== '/api/chronicle') return send(res, 404, { error: 'not_found' }, origin);
  if (req.headers.origin && !origin) return send(res, 403, { error: 'origin_not_allowed' });
  if (limited(req.socket.remoteAddress || 'x')) return send(res, 429, { error: 'rate_limited' }, origin);
  if (!KEY) return send(res, 503, { error: 'chronicle_unavailable' }, origin);

  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > 2048) return send(res, 413, { error: 'too_large' }, origin); }
  let parsed; try { parsed = JSON.parse(raw); } catch { return send(res, 400, { error: 'bad_json' }, origin); }
  const v = validate(parsed);
  if (!v) return send(res, 400, { error: 'bad_request' }, origin);

  try {
    const client = await getAi();
    const t = await client.models.generateContent({
      model: TEXT_MODEL, contents: [{ parts: [{ text: buildPrompt(v) }] }],
      config: { temperature: 0.9, topP: 0.95, topK: 64, maxOutputTokens: 500 },
    });
    const text = (t.text || '').trim();
    if (text.length < 100 || !/[.!?]["”']?$/.test(text)) return send(res, 502, { error: 'incomplete_text' }, origin);
    let audioBase64;
    try {
      const s = await client.models.generateContent({
        model: TTS_MODEL, contents: [{ parts: [{ text }] }],
        config: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } },
      });
      audioBase64 = s.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch { /* text-only is fine */ }
    return send(res, 200, { text, audioBase64 }, origin);
  } catch {
    return send(res, 502, { error: 'upstream_failed' }, origin); // never leak upstream details/keys
  }
});

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('chronicle-proxy.mjs')) {
  server.listen(PORT, () => console.log(`chronicle proxy on :${PORT} (AI ${KEY ? 'configured' : 'NOT configured - will answer 503'})`));
}
