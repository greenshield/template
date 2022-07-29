import * as React from "react";
import { TextField, Container } from "@mui/material";
import control, { set } from "../../reducers";

function Address(props) {
  var { sell } = props;

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
      <form style={{ width: "100%" }} noValidate>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          placeholder="Address Line 1"
          autoComplete="address1"
          value={sell.address1 ? sell.address1 : ""}
          onChange={(e) => {
            var _sell = Object.assign({}, sell);
            _sell.address1 = e.target.value;
            set("sell", _sell);
          }}
        />

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          placeholder="Address Line 2"
          autoComplete="address2"
          value={sell.address2 ? sell.address2 : ""}
          onChange={(e) => {
            var _sell = Object.assign({}, sell);
            _sell.address2 = e.target.value;
            set("sell", _sell);
          }}
        />

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          placeholder="City"
          autoComplete="city"
          value={sell.city ? sell.city : ""}
          onChange={(e) => {
            var _sell = Object.assign({}, sell);
            _sell.city = e.target.value;
            set("sell", _sell);
          }}
        />

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          placeholder="State"
          autoComplete="state"
          value={sell.state ? sell.state : ""}
          onChange={(e) => {
            var _sell = Object.assign({}, sell);
            _sell.state = e.target.value;
            set("sell", _sell);
          }}
        />

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          placeholder="Zip Code"
          autoComplete="zipcode"
          value={sell.zipcode ? sell.zipcode : ""}
          onChange={(e) => {
            var _sell = Object.assign({}, sell);
            _sell.zipcode = e.target.value;
            set("sell", _sell);
          }}
        />
      </form>
    </Container>
  );
}

export default control(Address, ["theme", "menu", "temp", "sell", "user"]);
