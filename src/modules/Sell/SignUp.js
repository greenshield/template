import * as React from "react";
import { Grid, Typography, TextField, Container } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import control, { set } from "../../reducers";

import { useTheme } from "@mui/material";

function SignUp(props) {
  var { sell } = props;

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
          value={sell.email ? sell.email : ""}
          onChange={(e) => {
            var _sell = Object.assign({}, sell);
            _sell.email = e.target.value;
            set("sell", _sell);
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
          value={sell.password ? sell.password : ""}
          onChange={(e) => {
            var _sell = Object.assign({}, sell);
            _sell.password = e.target.value;
            set("sell", _sell);
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
          value={sell.confirm_password ? sell.confirm_password : ""}
          onChange={(e) => {
            var _sell = Object.assign({}, sell);
            _sell.confirm_password = e.target.value;
            set("sell", _sell);
          }}
        />
      </form>
    </Container>
  );
}

export default control(SignUp, ["theme", "menu", "temp", "sell", "user"]);
