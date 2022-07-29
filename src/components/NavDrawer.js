import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import control from "../reducers";
import Menu from "./Menu";
import AppBar from "./AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";

function ResponsiveDrawer(props) {
  const drawerWidth = props.drawerWidth;

  const theme = useTheme();

  const { window } = props;

  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    props.set("menu", !props.menu);
  };

  const drawer = (
    <React.Fragment>
      {!props.hooks.isMobile ? (
        <Toolbar
          disableGutters
          style={{
            justifyContent: "center",
          }}
        >
          <Box
            flexDirection={"row"}
            onClick={() => {
              navigate("/");
            }}
            style={{
              cursor: "pointer",
              alignContent: "left",
              alignItems: "center",
              display: "flex",
              textAlign: "left",
            }}
          >
            <Typography
              variant="h6"
              noWrap
              component={NavLink}
              to="/"
              sx={{
                mr: 2,
                ml: 2,
                display: { xs: "none", md: "flex" },
                fontWeight: 700,
                letterSpacing: ".3rem",
                color:
                  props.theme === "dark"
                    ? "#ffffff"
                    : theme.palette.secondary.contrastText,
                textDecoration: "none",
                fontSize: "1.5em",
              }}
              className="noselect"
            >
              {props.theme === "dark" ? (
                <img
                  src="/assets/white.png"
                  style={{ height: "36px" }}
                  alt="logo"
                />
              ) : (
                <img
                  src="/assets/logo.png"
                  style={{ height: "36px" }}
                  alt="logo"
                />
              )}
            </Typography>
          </Box>
        </Toolbar>
      ) : null}
      <Menu handleDrawerToggle={handleDrawerToggle} />
    </React.Fragment>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" drawerWidth={drawerWidth} />
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          container={container}
          variant="temporary"
          transitionDuration={{ enter: 250, exit: 65 }}
          open={props.menu}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: false, // Better open performance on mobile.
          }}
          sx={{
            zIndex: 1800,
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        {!props.small ? (
          <Drawer
            variant="permanent"
            sx={{
              zIndex: 1800,
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        ) : null}
      </Box>
    </Box>
  );
}

ResponsiveDrawer.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default control(ResponsiveDrawer, [
  "alert",
  "theme",
  "auth",
  "hooks",
  "map",
  "menu",
  "small",
]);
