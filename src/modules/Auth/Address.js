import React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import axios from "axios";
import { useTheme } from "@mui/material";
import control from "../../reducers";

function Address(props) {
  const theme = useTheme();

  const [token] = React.useState(localStorage.getItem("token") || null);
  const [address, setAddress] = React.useState(
    props.user.address ? props.user.address : {}
  );

  var submit = (e) => {
    e.preventDefault();

    axios
      .post("/remote/users/modify", {
        token: token,
        updates: {
          address: address,
        },
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
          Update Address
        </Typography>
      </Grid>
      <form noValidate onSubmit={submit}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          placeholder="Address Line 1"
          autoComplete="address1"
          value={address.address1 ? address.address1 : ""}
          onChange={(e) => {
            var _address = Object.assign({}, address);
            _address.address1 = e.target.value;
            setAddress(_address);
          }}
        />

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          placeholder="Address Line 2"
          autoComplete="address2"
          value={address.address2 ? address.address2 : ""}
          onChange={(e) => {
            var _address = Object.assign({}, address);
            _address.address2 = e.target.value;
            setAddress(_address);
          }}
        />

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          placeholder="City"
          autoComplete="city"
          value={address.city ? address.city : ""}
          onChange={(e) => {
            var _address = Object.assign({}, address);
            _address.city = e.target.value;
            setAddress(_address);
          }}
        />

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          placeholder="State"
          autoComplete="state"
          value={address.state ? address.state : ""}
          onChange={(e) => {
            var _address = Object.assign({}, address);
            _address.state = e.target.value;
            setAddress(_address);
          }}
        />

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          placeholder="Zip Code"
          autoComplete="zipcode"
          value={address.zipcode ? address.zipcode : ""}
          onChange={(e) => {
            var _address = Object.assign({}, address);
            _address.zipcode = e.target.value;
            setAddress(_address);
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
          Update Address
        </Button>
      </form>
    </Container>
  );
}

export default control(Address, ["user", "alert", "user"]);
