import * as React from "react";
import { Grid, Typography, TextField, Container } from "@mui/material";
import { styled } from "@mui/material/styles";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SignInIcon from "@mui/icons-material/ArrowForwardRounded";
import control from "../../reducers";
import axios from "axios";
import { Link } from "react-router-dom";
import { Link as Linker } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

const StyledLoadingButton = styled(LoadingButton)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2) + " !important",
}));

function SignIn(props) {
  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [loading, setLoading] = React.useState(false);

  const theme = useTheme();

  var submit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      var message =
        !email && !password
          ? "Both fields are required"
          : !email
          ? "Email or phone number is required"
          : "Password is required";

      props.set("alert", {
        open: true,
        severity: "error",
        message: message,
        vertical: "bottom",
        horizontal: "center",
      });
      return false;
    }

    setLoading(true);
    axios
      .post("/remote/auth/signin", {
        email: email,
        password: password,
      })
      .then(async (result) => {
        setLoading(false);
        if (result.data) {
          var user = result.data;

          if (user.status) {
            props.set("auth", Object.assign({}, props.auth, { checked: true }));

            props.set("user", result.data);

            if (user.mode) {
              props.set("theme", result.data.mode);
            }

            navigate("/");
          } else {
            props.set("alert", {
              open: true,
              severity: "error",
              message: "Invalid credentials",
            });
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
        setLoading(false);
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
          Sign In
        </Typography>
      </Grid>
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <StyledLoadingButton
          type="submit"
          fullWidth
          color={email && password ? "success" : "secondary"}
          startIcon={<SignInIcon />}
          loading={loading}
          loadingPosition="start"
          variant="contained"
          disabled={!email || !password}
        >
          Sign In
        </StyledLoadingButton>

        <Grid container>
          <Grid item xs>
            <Linker component={Link} color="primary" to={"/auth/forgot"}>
              Forgot password?
            </Linker>
          </Grid>
          <Grid item>
            <Linker component={Link} color="primary" to={"/steps/default"}>
              No account? Sign Up
            </Linker>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

export default control(SignIn, ["theme", "menu", "temp", "auth"]);
