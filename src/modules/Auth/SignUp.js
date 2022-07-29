import * as React from "react";
import { Grid, Typography, TextField, Button, Container } from "@mui/material";
import { styled } from "@mui/material/styles";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import control from "../../reducers";
import axios from "axios";
import { Link } from "react-router-dom";
import { Link as Linker } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useTheme } from "@mui/material";

const StyledLoadingButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2) + " !important",
}));

function SignIn(props) {
  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm_password, setConfirmPassword] = React.useState("");

  const theme = useTheme();

  var submit = (e) => {
    e.preventDefault();

    if (password !== confirm_password) {
      props.set("alert", {
        open: true,
        severity: "error",
        message: "Passwords do not match",
      });

      return false;
    }

    axios
      .post("/remote/auth/signup", {
        email: email,
        password: password,
      })
      .then((result) => {
        if (result.data && result.data.error) {
          props.set("alert", {
            open: true,
            severity: "error",
            message: result.data.error,
          });
        } else if (result.data) {
          var user = result.data;

          props.set("user", result.data);

          if (user.mode) {
            props.set("theme", result.data.mode);
          }

          if (!props.compact) {
            navigate("/");
          }
        } else {
          props.set("alert", {
            open: true,
            severity: "error",
            message: "Invalid credentials",
          });
        }
      })
      .catch((err) => {
        props.set("alert", {
          open: true,
          severity: "error",
          message: `That action can't be performed right now`,
        });
      });
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      disableGutters
      style={{
        display: "flex",
        flexGrow: 1,
        height: "calc(100vh - " + props.offset + ")",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!props.compact ? (
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
            Sign Up
          </Typography>
        </Grid>
      ) : null}
      <form style={{ width: "100%" }} noValidate onSubmit={submit}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          placeholder="Email Address or Mobile Phone Number"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
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
          value={confirm_password}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
          }}
        />
        <StyledLoadingButton
          type="submit"
          fullWidth
          variant="contained"
          color={
            email && password && confirm_password ? "success" : "secondary"
          }
          disabled={!email || !password || !confirm_password}
        >
          Sign Up
        </StyledLoadingButton>

        <Grid container>
          <Grid item xs>
            <Linker component={Link} color="primary" to={"/auth/forgot"}>
              Forgot password?
            </Linker>
          </Grid>
          <Grid item>
            <Linker component={Link} color="primary" to={"/auth"}>
              Have an account? Sign In
            </Linker>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

export default control(SignIn, ["theme", "menu", "temp"]);
