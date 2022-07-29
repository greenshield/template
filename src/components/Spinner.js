import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import control from "../reducers";

function CircularIndeterminate(props) {
  var customsx = {
    display: "flex",
    flexGrow: 1,
    height: props.full ? "calc(100vh - " + props.offset + ")" : "auto",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  };

  return !props.offset ? null : (
    <Box sx={customsx} className="noselect">
      <CircularProgress disableShrink={true} />
    </Box>
  );
}

export default control(CircularIndeterminate, ["hooks"]);
