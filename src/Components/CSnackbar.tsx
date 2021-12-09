import React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const CSnackBar = (props: {
  open: boolean;
  onClose: () => void;
  content: React.ReactNode;
  type: AlertProps["severity"];
  autoHideDuration?: number;
  msgIdx: number; 
}) => {
  const { open, onClose, content, type, autoHideDuration=5000 , msgIdx} = props;

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") return;

    onClose?.();
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      sx={{ bottom: `${24 * (msgIdx + 1) + 48*msgIdx}px !important`, color: "red"}}
    >
      <Alert severity={type} onClose={handleClose}>
        {content}
      </Alert>
    </Snackbar>
  );
};
