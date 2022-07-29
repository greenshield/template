import * as React from "react";
import control from "../reducers";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Night from "@mui/icons-material/Brightness2TwoTone";
import Day from "@mui/icons-material/WbSunnyTwoTone";
import UserIcon from "@mui/icons-material/Group";
import HomeIcon from "@mui/icons-material/Home";
import SellIcon from "@mui/icons-material/Sell";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

const icon_toggle = true;

function Menu(props) {
  const navigate = useNavigate();

  return (
    <React.Fragment>
      <List>
        <ListItem
          disablePadding
          onClick={() => {
            navigate("/");
            props.handleDrawerToggle();
          }}
        >
          <ListItemButton>
            <ListItemIcon>
              <HomeIcon color="secondary.contrasttext" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography color="secondary.contrastText">Home</Typography>
              }
            />
          </ListItemButton>
        </ListItem>

        {props.user ? (
          <ListItem
            disablePadding
            onClick={() => {
              navigate("/account");
              props.handleDrawerToggle();
            }}
          >
            <ListItemButton>
              <ListItemIcon>
                <HomeIcon color="secondary.contrasttext" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography color="secondary.contrastText">
                    My Account
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ) : null}

        {props.user && (
          <ListItem
            disablePadding
            onClick={() => {
              navigate("/sell");
              props.handleDrawerToggle();
            }}
          >
            <ListItemButton>
              <ListItemIcon>
                <SellIcon color="secondary.contrasttext" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography color="secondary.contrastText">
                    Post Item
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        )}

        {props.user && props.user.admin && 1 === 2 ? (
          <ListItem
            disablePadding
            onClick={() => {
              navigate("users");
              props.handleDrawerToggle();
            }}
          >
            <ListItemButton>
              <ListItemIcon>
                <UserIcon color="secondary.contrastText" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography color="secondary.contrastText">Users</Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ) : null}

        {props.user && props.user.status ? (
          <ListItem
            disablePadding
            onClick={() => {
              props.set("user", null);
              localStorage.removeItem("token");
              localStorage.removeItem("mode");
              navigate("/");
              props.handleDrawerToggle();
            }}
          >
            <ListItemButton color="secondary.contrastText">
              <ListItemIcon>
                <LogoutIcon color="secondary.contrasttext" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography color="secondary.contrastText">
                    Sign Out
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ) : (
          <ListItem
            disablePadding
            onClick={() => {
              navigate("/auth");
              props.handleDrawerToggle();
            }}
          >
            <ListItemButton>
              <ListItemIcon>
                <HomeIcon color="secondary.contrasttext" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography color="secondary.contrastText">
                    Sign In
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        )}

        {!icon_toggle ? (
          <React.Fragment>
            <Divider />
            <ListItem
              disablePadding
              onClick={() => {
                props.set("theme", props.theme === "light" ? "dark" : "light");
                props.handleDrawerToggle();
              }}
            >
              <ListItemButton>
                <ListItemIcon>
                  {props.theme === "dark" ? (
                    <Day color="secondary.contrasttext" />
                  ) : (
                    <Night color="secondary.contrasttext" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography color="secondary.contrastText">
                      {props.theme === "light" ? "Night" : "Bright"} Mode
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          </React.Fragment>
        ) : null}
      </List>
    </React.Fragment>
  );
}

export default control(Menu, ["theme", "menu", "temp", "user"]);
