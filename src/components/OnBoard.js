import * as React from "react";
import control from "../reducers";
import { Grid, Container, Button } from "@mui/material";
import { NavLink } from "react-router-dom";

function OnBoard(props) {
  return (
    <Container maxWidth="xs" sx={{ p: 0 }}>
      <Grid container sx={{ mt: 2 }}>
        <Grid
          item
          xs={12}
          justifyContent="center"
          textAlign="center"
          sx={{ mb: 1 }}
        >
          <img src="/assets/logo.png" style={{ height: "56px" }} alt="Logo" />
        </Grid>
        <Grid
          item
          xs={12}
          sx={{ justifyContent: "space-between", display: "flex", pt: 2 }}
        >
          <Button component={NavLink} to="/auth" variant="contained">
            Sign In
          </Button>
          <Button component={NavLink} to="/steps/default" variant="contained">
            Sign Up
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

export default control(OnBoard, ["theme", "menu", "temp", "user"]);
