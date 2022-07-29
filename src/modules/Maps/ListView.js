import Grid from "@mui/material/Grid";
import ListItem from "./ListItem";

import * as React from "react";

import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import control from "../../reducers";

import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function Display(props) {
  const hooks = props.hooks;

  const theme = useTheme();
  const componentTheme = createTheme({
    ...theme,
    palette: {
      ...theme.palette,
      mode: props.theme,
      //primary: { main: "#ffffff !important" },
    },
    components: {
      ...theme.components,
      MuiPaper: {
        styleOverrides: {
          root: {
            color: theme.palette.secondary.contrastText,
          },
        },
      },
    },
  });

  const handleClose = () => {
    var show = props.display.show;

    if (show === "map") {
      props.set("display", { show: "list" });
    } else {
      props.set("display", { show: "map" });
    }
  };

  const handleExit = () => {};

  const handleEntered = () => {};

  var items = props.markers.map((l, i) => {
    return (
      <Grid xs={12} md={4} item key={i}>
        <ListItem key={i} l={l}></ListItem>
      </Grid>
    );
  });

  return (
    <ThemeProvider theme={componentTheme}>
      <div>
        <Dialog
          BackdropComponent={() => {
            return null;
          }}
          fullScreen
          open={true}
          onClose={handleClose}
          TransitionComponent={Transition}
          TransitionProps={{
            onEntered: handleEntered,
            onExit: handleExit,
          }}
          transitionDuration={{
            enter: 0,
            exit: 0,
          }}
          scroll="body"
          sx={{
            top: `${parseInt(hooks.offset) + 52}px !important`,
            zIndex: 900,
          }}
          style={{
            overflowX: "visible",
            overflowY: "overlay",
          }}
          PaperProps={{
            sx: {
              overflowY: "overlay",
              right: 0,
              width:
                !props.small && !props.hooks.isMobile
                  ? "calc(100% - 240px)"
                  : "100%",
              position: "absolute",
              backgroundColor: theme.palette.background.tiled,
            },
          }}
        >
          <Grid
            container
            spacing={2}
            sx={{
              m: 0,
              p: 0,
              pr: 2,
              width: "100%",
            }}
          >
            <React.Fragment>
              <Grid
                item
                xs={12}
                md={12}
                sx={{
                  m: 0,
                  width: "100%",
                  p: 0 + " !important",
                  mb: 2,
                }}
              >
                <Grid container spacing={2} sx={{ width: "100%", p: 0, m: 0 }}>
                  {items}
                </Grid>
              </Grid>
            </React.Fragment>
          </Grid>
        </Dialog>
      </div>
    </ThemeProvider>
  );
}

export default control(Display, [
  "hooks",
  "item",
  "small",
  "auth",
  "user",
  "display",
  "theme",
]);
