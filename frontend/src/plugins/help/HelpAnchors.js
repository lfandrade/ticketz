// src/plugins/help/HelpAnchors.js
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { IconButton, Tooltip } from "@material-ui/core";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import { getHelpShort, normalizeLang } from "./i18n";
import { useHelp } from "./HelpContext";

let externalI18n = null;
try {
  externalI18n = require("../../translate/i18n").i18n || null;
} catch (_) {}

function getCurrentLang() {
  const stored =
    typeof window !== "undefined" && window.localStorage
      ? window.localStorage.getItem("language")
      : null;
  return normalizeLang(
    stored ||
      (externalI18n && externalI18n.language) ||
      (typeof navigator !== "undefined" ? navigator.language : "pt-BR")
  );
}

function AnchorLayer({ children, hidden }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const el = document.createElement("div");
    el.setAttribute("id", "help-anchors-root");
    el.style.position = "fixed";
    el.style.left = "0";
    el.style.top = "0";
    el.style.width = "100%";
    el.style.height = "0";
    el.style.zIndex = "2147483647"; // sempre no topo
    el.style.pointerEvents = "none";
    document.body.appendChild(el);
    rootRef.current = el;
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.style.display = hidden ? "none" : "block";
    }
  }, [hidden]);

  if (!rootRef.current) return null;
  return ReactDOM.createPortal(children, rootRef.current);
}


function useTargets() {
  const [targets, setTargets] = useState([]);
  const rafRef = useRef(null);

  const collectNow = useCallback(() => {
    const nodes = Array.from(document.querySelectorAll("[data-help-id]"));
    // Compare “por id” para evitar setState desnecessário
    const nextIds = nodes.map((n) => n.getAttribute("data-help-id") || "");
    setTargets((prev) => {
      const prevIds = prev.map((n) => n.getAttribute("data-help-id") || "");
      const sameLen = prev.length === nodes.length;
      const sameAll = sameLen && prevIds.every((id, i) => id === nextIds[i]);
      return sameAll ? prev : nodes;
    });
  }, []);

  const scheduleCollect = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      collectNow();
    });
  }, [collectNow]);

  useEffect(() => {
    collectNow();

    // Mutations: apenas childList e mudança de data-help-id
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          scheduleCollect();
          return;
        }
        if (m.type === "attributes" && m.attributeName === "data-help-id") {
          scheduleCollect();
          return;
        }
      }
    });
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-help-id"],
    });

    const onResize = () => scheduleCollect();
    const onScroll = () => scheduleCollect();

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });

    return () => {
      mo.disconnect();
      window.removeEventListener("resize", onResize, { passive: true });
      window.removeEventListener("scroll", onScroll, { passive: true, capture: true });
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [collectNow, scheduleCollect]);

  return targets;
}

export default function HelpAnchors() {
  const lang = getCurrentLang();
  const targets = useTargets();
  const { open, openFor } = useHelp(); // mantém montado sempre

    return (
    <AnchorLayer hidden={open}>
      {targets.map((el, idx) => {
        const id = el.getAttribute("data-help-id");
        if (!id) return null;

        const rect = el.getBoundingClientRect();
        if (!rect || rect.width === 0 || rect.height === 0) return null;

        const size = 20;
        const gap = 6;
        const left = Math.min(window.innerWidth - size - 8, rect.right + gap);
        const top = Math.max(0, rect.top + rect.height / 2 - size / 2);

        const title = getHelpShort(lang, id);

        return (
          <div
            key={`${id}-${idx}`} // key estável (não depende de posição)
            style={{
              position: "fixed",
              left: `${left}px`,
              top: `${top}px`,
              width: `${size}px`,
              height: `${size}px`,
              pointerEvents: "auto",
              zIndex: 2147483647,
            }}
          >
            <Tooltip title={title} placement="right" arrow>
              <IconButton
                size="small"
                style={{
                  width: size,
                  height: size,
                  opacity: 0.8,
                  background: "rgba(0,0,0,0.04)",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openFor(id);
                }}
              >
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        );
      })}
    </AnchorLayer>
  );
}
