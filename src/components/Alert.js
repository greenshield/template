import React from "react";
import { Alert as AlertComponent, Snackbar } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import control, { set } from "../reducers";

function Alert(props) {
  const [open, setOpen] = React.useState(false);
  const [key, setKey] = React.useState(null);

  const { alert } = props;

  React.useEffect(() => {
    if (key && alert.key && alert.key !== key && open) {
      setOpen(false);
    } else if (alert.key && !open) {
      setTimeout(() => {
        setKey(alert.key);
        setOpen(true);
      }, 100);
    }
  }, [alert, key, open]);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    set("alert", {});
    setOpen(false);
    setKey(null);
  };

  if (!open || key !== props.alert.key) {
    return false;
  }

  if (open && props.alert.no_alert) {
    const action = (
      <React.Fragment>
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={handleClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </React.Fragment>
    );

    return (
      <div>
        <Snackbar
          anchorOrigin={{
            horizontal: props.alert.horizontal
              ? props.alert.horizontal
              : "center",
            vertical: props.alert.vertical ? props.alert.vertical : "bottom",
          }}
          open={open}
          autoHideDuration={2000}
          onClose={handleClose}
          message={open ? props.alert.message : ""}
          action={action}
        />
      </div>
    );
  }

  return (
    <div>
      <Snackbar
        anchorOrigin={{
          horizontal: props.alert.horizontal
            ? props.alert.horizontal
            : "center",
          vertical: props.alert.vertical ? props.alert.vertical : "bottom",
        }}
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
      >
        {open && key === props.alert.key ? (
          <AlertComponent
            elevation={6}
            variant="filled"
            onClose={handleClose}
            severity={props.alert.severity}
          >
            {props.alert.message}
          </AlertComponent>
        ) : null}
      </Snackbar>
    </div>
  );
}

export default control(Alert, ["alert", "snack"]);
