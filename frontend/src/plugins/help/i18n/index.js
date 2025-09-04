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

/**
 * Opcional (não usamos por padrão):
 * Se algum dia você QUISER registrar o ns "help" no i18n global:
 */
export function registerHelpI18n(i18n) {
  if (!i18n?.addResourceBundle) return;
  const add = (lng, res) =>
    i18n.addResourceBundle(lng, "help", res, true, true);

  ["pt-PT", "pt_PT", "pt-BR", "pt_BR", "pt"].forEach((lng) => add(lng, ptPT));
  ["en-US", "en_US", "en"].forEach((lng) => add(lng, enUS));
}
