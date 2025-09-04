import React, { useEffect, useState } from "react";
import { Drawer, Box, Typography, IconButton, Divider } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { useHelp } from "./HelpContext";

const WIDTH = 320;

export default function HelpPanel() {
  const { open, setOpen, resolve } = useHelp();
  const [entry, setEntry] = useState({});

  useEffect(() => {
    const el = document.activeElement && document.activeElement.closest && document.activeElement.closest("[data-help-id]");
    const id = el && el.getAttribute("data-help-id");
    setEntry(resolve(id));
  }, [open, resolve]);

  return (
    <Drawer anchor="left" open={open} variant="persistent" PaperProps={{ style: { width: WIDTH } }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
        <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
          {entry.title || "Ajuda"}
        </Typography>
        <IconButton size="small" onClick={() => setOpen(false)} aria-label="close help">
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
