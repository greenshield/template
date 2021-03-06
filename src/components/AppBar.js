import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import { NavLink } from "react-router-dom";
import Night from "@mui/icons-material/Brightness2Outlined";
import Day from "@mui/icons-material/WbSunnyOutlined";
import UserIcon from "@mui/icons-material/Group";
import HomeIcon from "@mui/icons-material/Home";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuOpen from "@mui/icons-material/MenuOpen";
import LockIcon from "@mui/icons-material/Lock";
import NotificationIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import axios from "axios";
import Moment from "moment-timezone";

import control, { set } from "../reducers";

const ResponsiveAppBar = (props) => {
  const navigate = useNavigate();

  const handleOpenNavMenu = (event) => {
    props.set("menu", !props.menu);
  };

  var { theme } = props;

  if (props.drawerWidth) {
    var customsx = {
      width: { sm: `calc(100% - ${props.drawerWidth}px)` },
      ml: { sm: `${props.drawerWidth}px` },
      backgroundColor: "#000000",
      color: "#ffffff",
      backgroundImage: "none !important",
    };

    if (props.hooks.isMobile || props.small) {
      customsx.ml = "0px";
      customsx.width = "100%";
    }
  } else {
    customsx = {
      backgroundColor: "#000000",
      color: "#ffffff",
    };
  }

  var sx = {
    maxWidth: "none",
  };

  return (
    <AppBar
      position="fixed"
      sx={customsx}
      color={process.env.REACT_APP_BRAND_COLOR ? "brand" : "primary"}
    >
      <Container style={sx}>
        <Toolbar
          disableGutters
          style={{
            alignItems: "center",
            alignContent: "center",
            justifyContent: "center",
          }}
          className="top-toolbar"
        >
          {props.auth.checked ? (
            <React.Fragment>
              <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleOpenNavMenu}
                  color="inherit"
                  style={{ cursor: "pointer", padding: "8px" }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
              {props.small || props.hooks.isMobile ? (
                <Box
                  style={{
                    alignContent: "left",
                    alignItems: "center",
                    justifyContent: "left",
                    display: "flex",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  sx={{ width: { xs: "100%", md: "auto" } }}
                  onClick={() => {
                    navigate("/");
                  }}
                  className="noselect"
                >
                  <Typography
                    component={NavLink}
                    variant="h5"
                    noWrap
                    to="/"
                    sx={{
                      ml: { xs: 2, md: 0 },
                      mr: 2,
                      display: { xs: "flex", md: "flex" },
                      fontWeight: 700,
                      letterSpacing: ".3rem",
                      color: "inherit",
                      textDecoration: "none",
                      fontSize: "1.5em",
                      alignItems: "center",
                      alignContent: "center",
                    }}
                    className="noselect"
                  >
                    <img
                      src="/assets/white.png"
                      style={{ height: "36px" }}
                      alt="logo"
                    />
                  </Typography>
                </Box>
              ) : null}
              <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleOpenNavMenu}
                    color="inherit"
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>

                <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                  <Button
                    color="inherit"
                    to="/"
                    component={NavLink}
                    sx={{
                      my: 2,
                      color: "white",
                      marginLeft: "4px",
                      marginRight: "4px",
                      marginTop: "0px",
                      marginBottom: "0px",
                    }}
                    startIcon={<HomeIcon />}
                    id="focuser1"
                  >
                    Home
                  </Button>
                  {props.user ? (
                    <Button
                      color="inherit"
                      to="/account"
                      component={NavLink}
                      sx={{
                        my: 2,
                        color: "white",
                        marginLeft: "4px",
                        marginRight: "4px",
                        marginTop: "0px",
                        marginBottom: "0px",
                      }}
                      startIcon={<UserIcon />}
                    >
                      My Account
                    </Button>
                  ) : null}
                  {props.user && props.user.admin && 1 === 2 ? (
                    <Button
                      color="inherit"
                      to="users"
                      component={NavLink}
                      sx={{
                        my: 2,
                        color: "white",
                        marginLeft: "4px",
                        marginRight: "4px",
                        marginTop: "0px",
                        marginBottom: "0px",
                      }}
                      startIcon={<UserIcon />}
                    >
                      Users
                    </Button>
                  ) : null}

                  {props.user && props.user.status ? (
                    <Button
                      color="inherit"
                      onClick={() => {
                        props.set("user", null);
                        localStorage.removeItem("token");
                        /*
                        localStorage.removeItem("mode");
                        props.set('theme', 'custom')
                        */
                        navigate("/");
                      }}
                      sx={{
                        my: 2,
                        color: "white",
                        marginLeft: "4px",
                        marginRight: "4px",
                        marginTop: "0px",
                        marginBottom: "0px",
                      }}
                      startIcon={<LogoutIcon />}
                    >
                      Sign Out
                    </Button>
                  ) : (
                    <Button
                      color="inherit"
                      to="auth"
                      component={NavLink}
                      sx={{
                        my: 2,
                        color: "white",
                        marginLeft: "4px",
                        marginRight: "4px",
                        marginTop: "0px",
                        marginBottom: "0px",
                      }}
                      startIcon={<LockIcon />}
                    >
                      Sign In
                    </Button>
                  )}
                </Box>
              </Box>
              {props.notifications && props.notifications.length ? (
                <Box sx={{ flexGrow: 0 }}>
                  <IconButton
                    color="inherit"
                    style={{ color: "#ffffff", marginRight: "8px" }}
                    onClick={() => {
                      var _n = props.notifications.slice();
                      var n = Object.assign({}, _n[0]);

                      _n.splice(0, 1);
                      n.key = Moment().valueOf().toString();
                      var _remove = () => {
                        window.notifications = _n;
                        set("notifications", _n);
                      };

                      set("alert", { open: false });

                      setTimeout(() => {
                        set("alert", n);
                        if (n.confirm) {
                          axios
                            .post("/remote/users/notification", {
                              token: localStorage.getItem("token"),
                              notification: n.confirm,
                            })
                            .then((result) => {});
                        }
                      }, 10);

                      _remove();
                    }}
                  >
                    <Badge
                      badgeContent={
                        <span style={{ color: "#ffffff" }}>
                          {props.notifications.length}
                        </span>
                      }
                      color="info"
                    >
                      <NotificationIcon />
                    </Badge>
                  </IconButton>
                </Box>
              ) : null}
              {!props.hooks.isMobile ? (
                <Box sx={{ flexGrow: 0 }}>
                  <IconButton
                    id="focuser2"
                    color="inherit"
                    style={{ color: "#ffffff" }}
                    onClick={() => {
                      props.set("menu", false);
                      props.set("small", !props.small);
                    }}
                  >
                    {props.small ? (
                      <MenuOpen
                        sx={{
                          transform: "scaleX(-1)",
                        }}
                      />
                    ) : (
                      <MenuOpen />
                    )}
                  </IconButton>
                </Box>
              ) : null}
              <Box sx={{ flexGrow: 0 }}>
                <IconButton
                  id="focuser"
                  color="inherit"
                  style={{ color: "#ffffff" }}
                  onClick={() => {
                    props.set("theme", theme === "light" ? "dark" : "light");

                    axios
                      .post("/remote/users/mode", {
                        token: localStorage.getItem("token"),
                        mode: theme === "light" ? "dark" : "light",
                      })
                      .then((result) => {});
                  }}
                >
                  {theme === "dark" ? <Day /> : <Night />}
                </IconButton>
              </Box>
            </React.Fragment>
          ) : null}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default control(ResponsiveAppBar, [
  "menu",
  "user",
  "auth",
  "theme",
  "small",
  "hooks",
  "notifications",
  "alert",
  "snack",
]);
