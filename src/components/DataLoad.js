import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material";
import control from "../reducers";

function SimpleBackdrop(props) {
  const theme = useTheme();

  var h = window.innerHeight - parseInt(props.hooks.offset);
  var t = parseInt(props.hooks.offset);

  return (
    <div>
      <Backdrop
        sx={{
          position: "fixed",
          color: theme.palette.tableicon.main,
          backgroundColor: theme.palette.background.default,
          opacity: 0.8 + " !important",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          height: h,
          top: t,
          left:
            props.small || props.hooks.isMobile
              ? 0
              : props.hooks.drawerWidth + "px !important",
          width:
            props.small || props.hooks.isMobile
              ? "100%"
              : window.innerWidth - props.hooks.drawerWidth,
        }}
        open={true}
        transitionDuration={0}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export default control(SimpleBackdrop, ["hooks", "small", "menu"]);
