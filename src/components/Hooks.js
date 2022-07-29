import React /*useState*/ from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useMatch } from "react-router-dom";

import control, { set } from "../reducers";
import { useTheme } from "@mui/material";

function Hooks(props) {
  const theme = useTheme();
  var matches = theme.breakpoints.only("sm");
  var isSmall = useMediaQuery(matches);

  matches = theme.breakpoints.only("xs");
  var isxSmall = useMediaQuery(matches);

  matches = theme.breakpoints.only("md");
  var isMd = useMediaQuery(matches);

  matches = theme.breakpoints.only("lg");
  var isLg = useMediaQuery(matches);

  matches = theme.breakpoints.only("xl");
  var isXl = useMediaQuery(matches);

  const [width, setWidth] = React.useState(window.innerWidth);
  const [height, setHeight] = React.useState(window.innerHeight);

  let reset_match = useMatch("/auth/reset/:resetToken");

  var reset_token = reset_match
    ? reset_match.params.resetToken
      ? true
      : false
    : false;

  let verify_match = useMatch("/auth/reset/:verifyToken");

  var verify_token = verify_match
    ? verify_match.params.verifyToken
      ? true
      : false
    : false;

  let verify_match_phone = useMatch("/auth/verifyphone/:verifyToken");

  var phone_token = verify_match_phone
    ? verify_match_phone.params.verifyToken
      ? true
      : false
    : false;

  var tokens = verify_token || reset_token || phone_token ? true : false;

  var { hooks, small } = props;

  React.useEffect(() => {
    const listener = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };

    window.addEventListener("resize", listener);
    return () => {
      window.removeEventListener("resize", listener);
    };
  }, [hooks, small]);

  const { cb, offset, match_true } = props;

  var h = props.hooks;

  React.useEffect(() => {
    if (cb) {
      var hooks = {
        tokens: tokens,
        isSmall: isSmall,
        isxSmall: isxSmall,
        isMd: isMd,
        isLg: isLg,
        isXl: isXl,
        width: width,
        height: height,
        offset: offset,
        isMobile: isSmall || isxSmall ? true : false,
        drawerWidth: 240,
        set: true,
      };

      var same = true;
      Object.keys(hooks).forEach((hook, i) => {
        if (hooks[hook] !== h[hook]) {
          same = false;
        }
      });

      if (!same) {
        set("hooks", hooks);
      }
    }
  }, [
    cb,
    tokens,
    isSmall,
    isxSmall,
    isMd,
    isLg,
    isXl,
    width,
    height,
    offset,
    h,
    match_true,
  ]);

  return null;
}

export default control(Hooks, ["user", "alert", "hooks", "small"]);
