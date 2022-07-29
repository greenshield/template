import * as React from "react";
import { TextField, Container } from "@mui/material";
import control, { set } from "../../reducers";

function Address(props) {
  var { steps } = props;

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
          value={steps.address1 ? steps.address1 : ""}
          onChange={(e) => {
            var _steps = Object.assign({}, steps);
            _steps.address1 = e.target.value;
            set("steps", _steps);
          }}
        />

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          placeholder="Address Line 2"
          autoComplete="address2"
          value={steps.address2 ? steps.address2 : ""}
          onChange={(e) => {
            var _steps = Object.assign({}, steps);
            _steps.address2 = e.target.value;
            set("steps", _steps);
          }}
        />

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          placeholder="City"
          autoComplete="city"
          value={steps.city ? steps.city : ""}
          onChange={(e) => {
            var _steps = Object.assign({}, steps);
            _steps.city = e.target.value;
            set("steps", _steps);
          }}
        />

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          placeholder="State"
          autoComplete="state"
          value={steps.state ? steps.state : ""}
          onChange={(e) => {
            var _steps = Object.assign({}, steps);
            _steps.state = e.target.value;
            set("steps", _steps);
          }}
        />

        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          placeholder="Zip Code"
          autoComplete="zipcode"
          value={steps.zipcode ? steps.zipcode : ""}
          onChange={(e) => {
            var _steps = Object.assign({}, steps);
            _steps.zipcode = e.target.value;
            set("steps", _steps);
          }}
        />
      </form>
    </Container>
  );
}

export default control(Address, ["theme", "menu", "temp", "steps", "user"]);
