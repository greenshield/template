import React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import control from "../../reducers";

function Alert(props) {
  return <MuiAlert elevation={0} variant="filled" {...props} />;
}

function Alerts(props) {
  const [open, setOpen] = React.useState(props.alert.open);

  React.useEffect(() => {
    setOpen(props.alert.open);
  }, [props.alert.open]);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    props.set("alert", {
      open: false,
    });
  };

  return open ? (
    <div
      sx={{
        width: "100%",
        "& > * + *": {
          marginTop: 2,
        },
      }}
    >
      <Snackbar
        anchorOrigin={{
          horizontal: props.alert.horizontal
            ? props.alert.horizontal
            : "center",
          vertical: props.alert.vertical ? props.alert.vertical : "bottom",
        }}
        open={props.alert.open}
        autoHideDuration={2000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity={props.alert.severity}>
          {props.alert.message}
        </Alert>
      </Snackbar>
    </div>
  ) : null;
}

export default control(Alerts, ["alert"]);
