import React from "react";
import control, { set } from "../reducers";
import { useSelector } from "react-redux";
import { Grid, Container, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material";
import { NavLink } from "react-router-dom";
import OnBoard from "../components/OnBoard";
import axios from "axios";

function Home(props) {
  var store = {
    user: useSelector((s) => s.user),
    temp: useSelector((s) => s.temp),
    alert: useSelector((s) => s.alert),
  };

  const theme = useTheme();

  var signOutAll = () => {
    axios
      .post("/remote/auth/signoutall", {
        token: store.user.token,
      })
      .then(async (result) => {
        if (result.data && result.data.status === "signed out") {
          set("user", null);
          localStorage.removeItem("token");
        }
      })
      .catch((err) => {
        set("alert", {
          open: true,
          severity: "error",
          message: "Error signing out",
        });
      });
  };

  if (!store.user) {
    return (
      <Container maxWidth="xl">
        <OnBoard />
      </Container>
    );
  }

  return (
    <Container maxWidth="xs">
      <Grid
        sx={{
          backgroundColor: theme.palette.brand.main + " !important",
          mt: 2,
        }}
        container
      >
        {!props.user.upgraded ? (
          <Grid
            item
            xs={12}
            sx={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              color: "#ffffff",
              p: 2,
            }}
          >
            <Typography variant="body1">Want to upgrade?</Typography>
          </Grid>
        ) : null}
        {props.user.upgraded ? (
          <Grid
            item
            xs={12}
            sx={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              backgroundColor: "#ffffff",
            }}
          >
            Your subscription is active.
          </Grid>
        ) : (
          <Grid
            item
            xs={12}
            sx={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              color: "#ffffff",
            }}
          >
            <Button
              component={NavLink}
              to="/payment/choose"
              color="button"
              variant="contained"
              sx={{
                color: theme.palette.brand.main,
                "&:hover": {
                  color: "#ffffff !important",
                },
              }}
            >
              Subscribe Now
            </Button>
          </Grid>
        )}
        {!props.user.upgraded ? (
          <Grid
            item
            xs={12}
            sx={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              color: "#ffffff",
              p: 2,
            }}
          >
            <Typography variant="body2">
              You do not need to subscribe to post items.
            </Typography>
          </Grid>
        ) : null}
      </Grid>

      <Grid
        xs={12}
        container
        item
        spacing={1}
        flexDirection="column"
        sx={{
          mt: 0,
        }}
      >
        <Grid item xs={12}>
          <Button
            color="brand"
            fullWidth
            variant="contained"
            component={NavLink}
            to="/search"
          >
            Search
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            color="brand"
            fullWidth
            variant="contained"
            component={NavLink}
            to="/sell"
          >
            Post ITem
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            color="brand"
            fullWidth
            variant="contained"
            component={NavLink}
            to="/entries"
          >
            Entries
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            color="brand"
            fullWidth
            variant="contained"
            component={NavLink}
            to="/auth/change"
          >
            Change Password
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            color="brand"
            fullWidth
            variant="contained"
            component={NavLink}
            to="/auth/update"
          >
            Update Credentials
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Button
            color="brand"
            fullWidth
            variant="contained"
            component={NavLink}
            to="/auth/address"
          >
            Update Address
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Button
            disabled={!window.socket}
            color="brand"
            fullWidth
            variant="contained"
            onClick={() => {
              axios
                .post("/remote/auth/testsocket", { socket: window.socket.id })
                .catch((err) => {});
            }}
          >
            Test Socket
          </Button>
        </Grid>
        {props.user.admin ? (
          <Grid item xs={12}>
            <Button
              component={NavLink}
              to="/users"
              color="brand"
              fullWidth
              variant="contained"
            >
              Manage Users
            </Button>
          </Grid>
        ) : null}

        <Grid item xs={12}>
          <Button
            color="brand"
            fullWidth
            variant="contained"
            onClick={() => {
              signOutAll();
            }}
          >
            Sign Out All Sessions
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

export default control(Home, ["user", "theme"]);
