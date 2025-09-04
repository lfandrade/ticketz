import React, { useEffect, useState, useCallback } from "react";
import {
  Drawer, Dialog, DialogTitle, DialogContent,
  Box, Typography, IconButton, Divider, Tooltip
} from "@material-ui/core";
 import CloseIcon from "@material-ui/icons/Close";
 import AspectRatioIcon from "@material-ui/icons/AspectRatio"; // ícone para alternar modo
 import { useHelp } from "./HelpContext";

 export default function HelpPanel() {
  const { open, setOpen, resolve, currentId, panelMode, setPanelMode } = useHelp();
  const [entry, setEntry] = useState({});
  const handleClose = useCallback(() => setOpen(false), [setOpen]);


  useEffect(() => {
    if (!open || !currentId) { setEntry({}); return; }
    setEntry(resolve(currentId));
  }, [open, currentId, resolve]);

  // permitir fechar com ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  const Header = (
    <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
      <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
        {entry.title || "Ajuda"}
      </Typography>
      <Box display="flex" alignItems="center" gridGap={8}>
        <Tooltip title={panelMode === "drawer" ? "Abrir como modal" : "Abrir na lateral"}>
          <IconButton
            size="small"
            onClick={() => setPanelMode(panelMode === "drawer" ? "modal" : "drawer")}
            aria-label="toggle help mode"
          >
            <AspectRatioIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <IconButton size="small" onClick={handleClose} aria-label="close help">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );

  const Body = (
    <>
      <Divider />
      <Box p={2}>
        <Typography variant="body2" style={{ whiteSpace: "pre-wrap", lineHeight: 1.4 }}>
          {entry.description || ""}
        </Typography>
      </Box>
    </>
  );

    if (panelMode === "modal") {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        aria-labelledby="help-dialog-title"
      >
        <DialogTitle id="help-dialog-title" disableTypography>
          {Header}
        </DialogTitle>
        <DialogContent dividers>{Body}</DialogContent>
      </Dialog>
    );
  }

  // modo lateral (padrão)
  return (
    <Drawer
      anchor="left"
      variant="temporary"
      open={open}
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{ style: { width: 320 } }}
    >
      {Header}
      {Body}
    </Drawer>
  );
 }