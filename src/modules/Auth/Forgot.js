import * as React from "react";
import { Grid, Typography, TextField, Button, Container } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import control from "../../reducers";
import axios from "axios";
import { useTheme } from "@mui/material";

function Forgot(props) {
  const [email, setEmail] = React.useState("");

  const theme = useTheme();

  var submit = (e) => {
    e.preventDefault();
    axios
      .post("/remote/auth/forgot", {
        email: email,
      })
      .then(async (result) => {
        if (result.data) {
          var user = result.data;

          if (user.status) {
            props.set("alert", {
              open: true,
              severity: "success",
              message: "password reset sent",
            });
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
        props.set("alert", {
          open: true,
          severity: "error",
          message: `That action can't be performed right now`,
        });
      });
  };

  return (
    <Container component="main" disableGutters maxWidth="xs">
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
          Forgot Password
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
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="secondary"
          sx={{
            m: 2,
            ml: 0,
            mr: 0,
          }}
        >
          Reset Password
        </Button>
      </form>
    </Container>
  );
}

export default control(Forgot, ["theme", "menu", "temp"]);
