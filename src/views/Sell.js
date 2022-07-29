import React from "react";
import control from "../reducers";
import { Grid, Container } from "@mui/material";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material";
import { NavLink } from "react-router-dom";

function Home(props) {
  const theme = useTheme();

  return (
    <Container maxWidth="xs">
      <Grid
        sx={{
          backgroundColor: theme.palette.brand.main + " !important",
          mt: 1,
        }}
        container
      >
        <Grid item xs={12}>
          <Button
            color="brand"
            fullWidth
            variant="contained"
            component={NavLink}
            to="/manage/drop"
          >
            Upload Photos
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

export default control(Home, ["user", "theme"]);
