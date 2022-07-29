import React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import axios from "axios";
import { useTheme } from "@mui/material";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import control from "../../reducers";

function Reset(props) {
  const theme = useTheme();
  const params = useParams();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const navigate = useNavigate();

  var submit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      props.set("alert", {
        open: true,
        severity: "error",
        message: "Passwords do not match",
      });

      return false;
    }

    axios
      .post("/remote/auth/change", {
        resetToken: params.resetToken,
        password: password,
      })
      .then((result) => {
        props.set("alert", {
          open: true,
          severity: result.data.severity,
          message: result.data.message,
        });

        var _temp = Object.assign({}, props.temp);
        delete _temp.user;
        props.set("user", props.temp.user);
        props.set("temp", _temp);
        navigate("/");
      });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Grid
        container
        justifyContent="center"
        direction="row"
        alignItems="center"
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: theme.spacing(3),
        }}
      >
        <LockOutlinedIcon
          fontSize="large"
          color="primary"
          style={{ marginRight: "8px" }}
        />

        <Typography component="h1" variant="h5">
          Change Password
        </Typography>
      </Grid>
      {props.temp.user || props.user ? (
        <Grid
          container
          justifyContent="center"
          direction="row"
          alignItems="center"
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: theme.spacing(3),
          }}
        >
          {props.temp.user && !props.user ? (
            <div>
              {props.temp.user.email
                ? props.temp.user.email
                : props.temp.user.phone}
            </div>
          ) : null}
          {props.user ? (
            <div>{props.user.email ? props.user.email : props.user.phone}</div>
          ) : null}
        </Grid>
      ) : null}
      <form noValidate onSubmit={submit}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          placeholder="Password"
          type="password"
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="confirm_password"
          placeholder="Confirm Password"
          type="password"
          id="confirm_password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
          }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{
            m: 2,
            ml: 0,
            mr: 0,
          }}
        >
          Change Password
        </Button>
      </form>
    </Container>
  );
}

export default control(Reset, ["user", "alert", "temp"]);
