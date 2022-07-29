import React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import axios from "axios";
import { Link } from "react-router-dom";
import { Link as Links } from "@mui/material";
import { useTheme } from "@mui/material";

import control from "../../reducers";

function Change(props) {
  const theme = useTheme();

  const [token] = React.useState(localStorage.getItem("token") || null);
  const [password, setPassword] = React.useState("");
  const [oldPassword, setOldPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

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
        token: token,
        password: password,
        old_password: oldPassword,
      })
      .then((result) => {
        props.set("alert", {
          open: true,
          severity: result.data.severity,
          message: result.data.message,
        });
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
      <form noValidate onSubmit={submit}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="old_password"
          placeholder="Old Password"
          type="password"
          id="old_password"
          autoComplete="off"
          value={oldPassword}
          onChange={(e) => {
            setOldPassword(e.target.value);
          }}
        />

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          placeholder="New Password"
          type="password"
          id="password"
          autoComplete="off"
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
          placeholder="Confirm New Password"
          type="password"
          value={confirmPassword}
          id="confirm_password"
          autoComplete="off"
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
        <Grid container>
          <Grid item xs>
            <Links component={Link} color="primary" to="/auth/forgot">
              Forgot password?
            </Links>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

export default control(Change, ["user", "alert"]);
