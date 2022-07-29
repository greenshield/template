import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useTheme from "@mui/styles/useTheme";
import { Container, Grid } from "@mui/material";
import control from "../../reducers";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

function Edit(props) {
  const theme = useTheme();

  const [user, setUser] = React.useState(props.row);

  var updateUser = (field, value) => {
    var updates = {};
    updates[field] = value;

    var new_data = Object.assign({}, user, updates);
    setUser(new_data);
  };

  var deleteUser = (uid, soft) => {
    var _type = soft ? "soft" : "delete";

    axios
      .post("/remote/users/" + _type, {
        _id: user._id,
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

        if (soft) {
          new_data[props.index] = _edited;
        } else {
          new_data.splice(props.index, 1);
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

    var save_url = user._id ? "/remote/users/save" : "/remote/users/create";

    axios
      .post(save_url, {
        token: props.user.token,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        password: user.password,
        status: user.status,
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
          name: user.name,
          email: user.email,
          phone_number: user.phone_number,
        };

        if (props.adding) {
          _edited._id = result.data._id;
        }

        var new_data = props.data.rows.slice();

        new_data[props.index] = _edited;
        props.setData({ ...props.data, rows: new_data });
        props.setAdding(false);

        //Director('/users')
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
                ? "Add User"
                : "Edit User"}
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
                text: "Do you want to delete this user?",
                alt_confirm_text: "Yes, Soft",
                alt_callback_color: "warning",
                alt_callback: () => {
                  deleteUser(user._id, true);
                },
                confirm_text: "Yes, Full",
                callback_color: "error",
                callback: () => {
                  deleteUser(user._id);
                },
              };
              props.set("temp", temp);
            }}
          >
            <DeleteIcon color="error" />
          </IconButton>
        ) : null}
      </Grid>
      {user ? (
        <form
          style={{
            marginBottom: theme.spacing(2),
          }}
          noValidate
          onSubmit={submitSave}
          id="edit-form"
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                variant="standard"
                margin="normal"
                fullWidth
                id="name"
                label="Name"
                name="name"
                autoComplete="name"
                value={user.name ? user.name : ""}
                onChange={(e) => {
                  updateUser("name", e.target.value);
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                variant="standard"
                margin="normal"
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                value={user.email ? user.email : ""}
                onChange={(e) => {
                  updateUser("email", e.target.value);
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                variant="standard"
                margin="normal"
                fullWidth
                id="phone_number"
                label="Phone Number"
                name="phone_number"
                autoComplete="phone_number"
                value={user.phone_number ? user.phone_number : ""}
                onChange={(e) => {
                  updateUser("phone_number", e.target.value);
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                variant="standard"
                margin="normal"
                type="password"
                fullWidth
                id="password"
                label="Password"
                name="password"
                autoComplete="password"
                value={user.password ? user.password : ""}
                onChange={(e) => {
                  updateUser("password", e.target.value);
                }}
              />
              {user._id ? (
                <Typography variant="caption">
                  Leave blank to keep the same password
                </Typography>
              ) : null}
            </Grid>
          </Grid>
        </form>
      ) : null}
      <div id="form-scroll" style={{ height: "0px" }}></div>
    </Container>
  );
}

export default control(Edit, ["user", "temp", "alert", "hooks", "small"]);
