/**
 * api.js — Fetch API layer for the motivational quote banner.
 */

const ENDPOINTS = [
  {
    url: "https://dummyjson.com/quotes/random",
    parse: ({ quote, author }) => ({ text: quote, author }),
  },
  {
    url: "https://api.quotable.io/random?tags=inspirational|motivational",
    parse: ({ content, author }) => ({ text: content, author }),
  },
];

/** Local pool used when every endpoint is unreachable. */
const FALLBACKS = [
  { text: "Small steps, taken consistently, finish big projects.", author: "Offline" },
  { text: "Focus is the art of knowing what to ignore.", author: "Offline" },
  { text: "Done is better than perfect — then make it better.", author: "Offline" },
];

/**
 * Fetch a random quote, trying each endpoint in turn.
 * Always resolves — errors are reported through the `ok` flag.
 */
export const fetchQuote = async ({ timeout = 6000 } = {}) => {
  for (const { url, parse } of ENDPOINTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      const { text, author } = parse(await response.json());
      if (!text) throw new Error("Empty quote payload");
      return { ok: true, quote: { text, author: author || "Unknown" } };
    } catch (error) {
      console.warn(`Quote request failed for ${url}:`, error.message);
    } finally {
      clearTimeout(timer);
    }
  }
  const fallback = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
  return { ok: false, quote: { ...fallback } };
};