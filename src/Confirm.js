import React from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import control from "./reducers";
import LoadingButton from "@mui/lab/LoadingButton";

function Confirm(props) {
  const handleClose = () => {
    if (props.temp.confirm && props.temp.confirm.prevent_close) {
      return false;
    }

    var temp = Object.assign({}, props.temp, {
      confirm: null,
    });

    if (props.temp.confirm.cancel) {
      props.temp.confirm.cancel();
    }

    props.set("temp", temp);
  };

  if (!props.temp.confirm) {
    return null;
  }

  return (
    <Dialog
      open={props.temp.confirm ? true : false}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      fullWidth
      maxWidth={props.temp.confirm.size ? props.temp.confirm.size : "xs"}
      scroll="paper"
    >
      <DialogTitle style={{ paddingBottom: "8px" }}>
        {props.temp.confirm && props.temp.confirm.title
          ? props.temp.confirm.title
          : ""}
      </DialogTitle>
      <DialogContent style={{ paddingTop: "0px" }}>
        {props.temp.confirm.component ? (
          props.temp.confirm.component
        ) : (
          <Typography>
            {props.temp.confirm && props.temp.confirm.text
              ? props.temp.confirm.text
              : "Are you sure?"}
          </Typography>
        )}
      </DialogContent>
      {props.temp.confirm && !props.temp.confirm.hide_buttons ? (
        <DialogActions>
          <Button
            onClick={handleClose}
            color={
              props.temp.confirm.cancel_color
                ? props.temp.confirm.cancel_color
                : "secondary"
            }
            variant="outlined"
          >
            {props.temp.confirm && props.temp.confirm.cancel_text
              ? props.temp.confirm.cancel_text
              : "Cancel"}
          </Button>

          {!props.temp.confirm.hide_confirm ? (
            props.temp.confirm.load ? (
              <LoadingButton
                startIcon={props.temp.confirm.loading_icon}
                variant="contained"
                onClick={() => {
                  if (props.temp.confirm && props.temp.confirm.callback) {
                    if (props.temp.confirm.load) {
                      var _temp = Object.assign({}, props.temp);
                      var _confirm = Object.assign({}, _temp.confirm);
                      _confirm.loading = true;
                      _temp.confirm = _confirm;
                      props.set("temp", _temp);
                    }

                    props.temp.confirm.callback();
                    if (!props.temp.confirm.manual) {
                      handleClose();
                    }
                  }
                }}
                color={
                  props.temp.confirm.callback_color
                    ? props.temp.confirm.callback_color
                    : "primary"
                }
                loading={props.temp.confirm.loading}
                loadingPosition="start"
              >
                {props.temp.confirm && props.temp.confirm.confirm_text
                  ? props.temp.confirm.confirm_text
                  : "Yes"}
              </LoadingButton>
            ) : (
              <Button
                variant="contained"
                onClick={() => {
                  if (props.temp.confirm && props.temp.confirm.callback) {
                    if (!props.temp.confirm.manual) {
                      handleClose();
                    }
                    if (props.temp.confirm.load) {
                      var temp = { ...props.temp, loading: true };
                      props.set("temp", temp);
                    }
                    props.temp.confirm.callback();
                  }
                }}
                color={
                  props.temp.confirm.callback_color
                    ? props.temp.confirm.callback_color
                    : "primary"
                }
              >
                {props.temp.confirm && props.temp.confirm.confirm_text
                  ? props.temp.confirm.confirm_text
                  : "Yes"}
              </Button>
            )
          ) : null}

          {props.temp.confirm.alt_confirm_text ? (
            <Button
              variant="contained"
              onClick={() => {
                if (props.temp.confirm && props.temp.confirm.alt_callback) {
                  handleClose();
                  props.temp.confirm.alt_callback();
                }
              }}
              color={
                props.temp.confirm.alt_callback_color
                  ? props.temp.confirm.alt_callback_color
                  : "primary"
              }
            >
              {props.temp.confirm && props.temp.confirm.alt_confirm_text
                ? props.temp.confirm.alt_confirm_text
                : "Yes"}
            </Button>
          ) : null}
        </DialogActions>
      ) : (
        <DialogActions></DialogActions>
      )}
    </Dialog>
  );
}

export default control(Confirm, ["mem", "temp"]);
