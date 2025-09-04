import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getHelpEntry, normalizeLang } from "./i18n";

let externalI18n = null;
try {
  // leitura opcional; se não existir, seguimos sem ele
  externalI18n = require("../../translate/i18n").i18n || null;
} catch (_) {
  externalI18n = null;
}

const HelpContext = createContext(null);

const elClosestWithDataHelp = (node) => {
  if (!node) return null;
  if (node.getAttribute && node.getAttribute("data-help-id")) return node;
  return node.closest ? node.closest("[data-help-id]") : null;
};

const getCurrentLang = () => {
  const stored = typeof window !== "undefined" && window.localStorage
    ? window.localStorage.getItem("language")
    : null;
  return (
    stored ||
    (externalI18n && externalI18n.language) ||
    (typeof navigator !== "undefined" ? navigator.language : "pt-BR")
  );
};

export function HelpProvider({ children }) {
  const [currentId, setCurrentId] = useState(undefined);
  const [open, setOpen] = useState(false);

  const [panelMode, setPanelMode] = useState(
    () => (localStorage.getItem("help.panelMode") || "drawer")
  );

  useEffect(() => {
    localStorage.setItem("help.panelMode", panelMode);
  }, [panelMode]);

  

  const resolve = (id) => {
    if (!id) return {};

    const lang = normalizeLang(getCurrentLang());
    // 1) catálogo do plugin (não depende do app)
    const entry = getHelpEntry(lang, id);
    if (entry.title !== id || entry.description) return entry;

    // 2) fallback LEGADO: se o app tiver i18n e chaves antigas em translations.help.*
    if (externalI18n?.t) {
      const t = externalI18n.t.bind(externalI18n);
      const legacyTitle = t(`help.${id}.title`);
      const legacyDesc  = t(`help.${id}.description`);
      if (legacyTitle !== `help.${id}.title` || legacyDesc !== `help.${id}.description`) {
        return {
          title: legacyTitle !== `help.${id}.title` ? legacyTitle : id,
          description: legacyDesc !== `help.${id}.description` ? legacyDesc : "",
        };
      }
    }

    return entry; // volta o id + fallback do plugin
  };

  //const value = useMemo(() => ({ currentId, open, setOpen, resolve }), [currentId, open]);
  const openFor = (id, modeOverride) => {
    if (!id) return;
    setCurrentId(id);
    if (modeOverride === "drawer" || modeOverride === "modal") {
      setPanelMode(modeOverride);
    }
    setOpen(true);
  };
  
  const value = useMemo(
    () => ({ currentId, open, setOpen, resolve, openFor, panelMode, setPanelMode }),
    [currentId, open, panelMode]
  );

  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>;
}

export function useHelp() {
  const ctx = useContext(HelpContext);
  if (!ctx) throw new Error("useHelp deve ser usado dentro de <HelpProvider>");
  return ctx;
}
