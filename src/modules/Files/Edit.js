import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/styles";
import { Container, Grid } from "@mui/material";
import control from "../../reducers";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

function Edit(props) {
  const theme = useTheme();
  const [file, setfile] = React.useState(props.row);

  var updatefile = (field, value) => {
    var updates = {};
    updates[field] = value;

    var new_data = Object.assign({}, file, updates);
    setfile(new_data);
  };

  var deletefile = (uid, soft) => {
    var _type = soft ? "soft" : "delete";

    axios
      .post("/remote/files/" + _type, {
        _id: file._id,
      })
      .then((result) => {
        props.setOpenRecord(null);

        //disable row
        var _edited = props.data.rows[props.index];
        _edited = {
          ..._edited,
          deleted: true,
        };

        var new_data = props.data.rows.slice();

        if (!props.state.query.deleted || !soft) {
          new_data.splice(props.index, 1);
        } else {
          new_data[props.index] = _edited;
        }

        props.setData({ ...props.data, rows: new_data });

        props.set("alert", {
          open: true,
          severity: result.data.severity,
          message: result.data.message,
        });
      });
  };

  var submitSave = (e) => {
    e.preventDefault();

    var save_url = file._id ? "/remote/files/save" : "/remote/files/create";

    axios
      .post(save_url, {
        token: props.user.token,
        _id: file._id,
        filename: file.filename,
        status: file.status,
      })
      .then((result) => {
        props.set("alert", {
          open: true,
          severity: result.data.severity,
          message: result.data.message,
        });

        var _edited = props.data.rows[props.index];
        _edited = {
          ..._edited,
          filename: file.filename,
        };

        if (props.adding) {
          _edited._id = result.data._id;
        }

        var new_data = props.data.rows.slice();

        new_data[props.index] = _edited;
        props.setData({ ...props.data, rows: new_data });
        props.setAdding(false);

        //Director('/files')
      })
      .catch((err) => {
        props.set("alert", {
          open: true,
          severity: "error",
          message: "Error",
        });
      });
  };

  return (
    <Container
      component="main"
      maxWidth={props.small ? "xs" : "none"}
      disableGutters
      style={{
        margin: 0,
        padding: "16px",
        paddingBottom: "0px",
        maxWidth: window.innerWidth,
      }}
    >
      <CssBaseline />
      <div id="form-start" style={{ height: "0px" }}></div>
      <Grid
        container
        justifyContent="left"
        direction="row"
        alignItems="center"
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          flexWrap: "nowrap",
        }}
      >
        <Grid container style={{ flex: "1 1 100%", alignItems: "center" }}>
          <Grid item>
            <IconButton
              style={{ marginRight: "8px", flex: "0 0 auto" }}
              onClick={() => {
                props.setOpenRecord(null);
                props.clearAdding();
              }}
            >
              <CancelIcon color="action" />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography
              component="h2"
              variant="h6"
              style={{ flex: "0 0 auto" }}
            >
              {props.title
                ? props.title
                : props.adding
                ? "Add file"
                : "Edit file"}
            </Typography>
          </Grid>
        </Grid>
        <IconButton
          style={{ marginLeft: "8px", flex: "0 0 auto" }}
          onClick={submitSave}
        >
          <SaveIcon color="success" />
        </IconButton>

        {!props.adding ? (
          <IconButton
            style={{ marginLeft: "8px", flex: "0 0 auto" }}
            onClick={() => {
              var temp = Object.assign({}, props.temp);
              temp.confirm = {
                title: "Are you sure?",
                cancel_text: "No",
                text: "Do you want to delete this file?",
                alt_confirm_text: "Yes, Soft",
                alt_callback_color: "warning",
                alt_callback: () => {
                  deletefile(file._id, true);
                },
                confirm_text: "Yes, Full",
                callback_color: "error",
                callback: () => {
                  deletefile(file._id);
                },
              };
              props.set("temp", temp);
            }}
          >
            <DeleteIcon color="error" />
          </IconButton>
        ) : null}
      </Grid>
      {file ? (
        <form
          style={{
            marginBottom: theme.spacing(2),
          }}
          noValidate
          onSubmit={submitSave}
          id="edit-form"
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
              <TextField
                variant="standard"
                margin="normal"
                fullWidth
                id="filename"
                label="Filename"
                name="filename"
                autoComplete="filename"
                value={file.filename ? file.filename : ""}
                onChange={(e) => {
                  updatefile("filename", e.target.value);
                }}
              />
            </Grid>
          </Grid>
        </form>
      ) : null}
      <div id="form-scroll" style={{ height: "0px" }}></div>
    </Container>
  );
}

export default control(Edit, ["user", "temp", "alert", "hooks", "small"]);
