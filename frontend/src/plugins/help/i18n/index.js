import ptPT from "./pt_PT";
import enUS from "./en_US";

const CATALOG = {
  pt_PT: ptPT,
  en_US: enUS,
};

export function normalizeLang(lang) {
  if (!lang) return "pt_PT";
  const lc = String(lang).replace("-", "_");
  if (lc.startsWith("pt")) return "pt_PT";
  if (lc.startsWith("en")) return "en_US";
  return "en_US";
}

export function getHelpEntry(lang, id) {
  const keyTitle = `${id}.title`;
  const keyDesc  = `${id}.description`;

  const bundle = CATALOG[normalizeLang(lang)] || {};
  const title = bundle[keyTitle];
  const description = bundle[keyDesc];
  const fallback = bundle.fallback || "Help not available.";

  return {
    title: title || id,
    description: description || fallback,
  };
}

export function getHelpShort(lang, id) {
  const bundle = CATALOG[normalizeLang(lang)] || {};
  const keyShort = `${id}.short`;
  if (bundle[keyShort]) return bundle[keyShort];

  const { title, description } = getHelpEntry(lang, id);
  // 1ª frase da descrição (ou título), limitada
  const base = (description && description !== "Help not available.") ? description : title;
  const firstSentence = String(base).split(/(?<=[.!?])\s/)[0];
  return firstSentence.length > 100 ? firstSentence.slice(0, 100) + "…" : firstSentence;
}
