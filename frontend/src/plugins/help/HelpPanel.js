import React, { useEffect, useState, useCallback } from "react";
 import { Drawer, Box, Typography, IconButton, Divider } from "@material-ui/core";
 import CloseIcon from "@material-ui/icons/Close";
 import { useHelp } from "./HelpContext";

 export default function HelpPanel() {
  const { open, setOpen, resolve, currentId } = useHelp();
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

   return (
    <Drawer
      anchor="left"
      variant="temporary"         // backdrop + clique fora fecha
      open={open}
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{ style: { width: 320 } }}
    >
       <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
         <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
           {entry.title || "Ajuda"}
         </Typography>
       <IconButton size="small" onClick={handleClose} aria-label="close help">
           <CloseIcon fontSize="small" />
         </IconButton>
       </Box>
       <Divider />
       <Box p={2}>
         <Typography variant="body2" style={{ whiteSpace: "pre-wrap", lineHeight: 1.4 }}>
           {entry.description || ""}
         </Typography>
       </Box>
    </Drawer>
   );
 }
