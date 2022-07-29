import * as React from "react";
import { Grid, Typography, TextField, Container } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import control, { set } from "../../reducers";

import { useTheme } from "@mui/material";

function SignUp(props) {
  var { steps } = props;

  const theme = useTheme();

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
      <form style={{ width: "100%" }} noValidate onSubmit={props.submit}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          placeholder="Email Address or Mobile Phone Number"
          name="email"
          autoComplete="email"
          disabled={props.user ? true : false}
          value={steps.email ? steps.email : ""}
          onChange={(e) => {
            var _steps = Object.assign({}, steps);
            _steps.email = e.target.value;
            set("steps", _steps);
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
          disabled={props.user ? true : false}
          autoComplete="new-password"
          value={steps.password ? steps.password : ""}
          onChange={(e) => {
            var _steps = Object.assign({}, steps);
            _steps.password = e.target.value;
            set("steps", _steps);
          }}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          disabled={props.user ? true : false}
          name="confirm_password"
          placeholder="Confirm Password"
          type="password"
          id="confirm_password"
          autoComplete="new-password"
          value={steps.confirm_password ? steps.confirm_password : ""}
          onChange={(e) => {
            var _steps = Object.assign({}, steps);
            _steps.confirm_password = e.target.value;
            set("steps", _steps);
          }}
        />
      </form>
    </Container>
  );
}

export default control(SignUp, ["theme", "menu", "temp", "steps", "user"]);
