import "./App.css";
import React from "react";
import Routes from "./Routes";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Confirm from "./Confirm";
import lightTheme from "./themes/light";
import darkTheme from "./themes/dark";
import customTheme from "./themes/custom";
import NavDrawer from "./components/NavDrawer";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Alert from "./components/Alert";
import Auth from "./components/Auth";
import Spinner from "./components/Spinner";
import Hooks from "./components/Hooks";
import { shallow } from "./components/Tools";
import Socket from "./components/Socket";
import { useMatch } from "react-router-dom";
import { set } from "./reducers";
import { useSelector } from "react-redux";

const themes = {
  light: lightTheme,
  dark: darkTheme,
  custom: customTheme,
};

var drawerWidth = 240;

const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);

function App(props) {
  const [userRelay, setUserRelay] = React.useState(false);

  var store = {
    hooks: useSelector((s) => s.hooks),
    map: useSelector((s) => s.map),
    auth: useSelector((s) => s.auth),
    theme: useSelector((s) => s.theme),
    small: useSelector((s) => s.small),
    user: useSelector((s) => s.user),
  };

  React.useEffect(() => {
    if (store.user && !userRelay) {
      window.ReactNativeWebView.postMessage(
        '{"action":"user","user":"' + store.user._id + '"}'
      );
      setUserRelay(true);
    }
  }, [store.user, userRelay]);

  let item_match = useMatch("/item/:ItemId");

  var ItemId = item_match
    ? item_match.params.ItemId
      ? item_match.params.ItemId
      : null
    : null;

  React.useEffect(() => {
    if (ItemId && !window.hasSearched) {
      set("small", true);
    } else if (store.small) {
      if (!ItemId) {
        if (!window.hasSearched) {
          //DEFAULT TO SMALL
          //set("small", false);
        }
      }

      //      set("small", false);
    }
  }, [ItemId, store.small]);

  const script_host = React.useRef(null);

  const os = React.useRef(null);

  var offset = os?.current?.clientHeight
    ? os.current.clientHeight + "px"
    : "0px";

  const hookBack = (hooks) => {
    var same = shallow(hooks, store.hooks);

    var offset_string = os.current.clientHeight + "px";

    if (hooks.offset === offset_string) {
      same = true;
    }

    if (!same && os && os.current) {
      set("hooks", {
        ...hooks,
        offset: os.current.clientHeight + "px",
      });
    }

    var inboundHooks = {};

    Object.keys(store.hooks).forEach((h, i) => {
      inboundHooks[h] = store.hooks[h];
    });
  };

  var small_check = store.hooks.isMobile ? true : false;

  if (small_check || store.small) {
    var small = true;
  } else {
    small = false;
  }

  if (store.map.visible) {
    var sx = {
      maxWidth: "none !important",
    };
  } else {
    sx = {};
  }

  if (!small) {
    sx = {
      ...sx,
      left: drawerWidth + "px !important",
      width: "calc(100% - " + drawerWidth + "px) !important",
      margin: 0,
      position: "absolute",
    };
  }

  //sx.height = "calc(100vh - " + store.hooks.offset + ")";

  return (
    <React.Fragment>
      <ThemeProvider theme={themes[store.theme]}>
        <CssBaseline />
        <Offset ref={os} />
        <React.Fragment>
          <Container sx={sx} disableGutters maxWidth="none">
            {store.auth.checked ? (
              <Routes offset={offset} small={small} />
            ) : (
              <Spinner offset={offset} full={true} />
            )}
          </Container>
          <NavDrawer offset={offset} small={small} drawerWidth={drawerWidth} />
        </React.Fragment>
        <Confirm />
        <Alert />
        <Auth />
        <Socket />
        <Hooks
          offset={offset}
          barRef={os}
          cb={hookBack}
          match_true={store.map.visible ? true : false}
        />
      </ThemeProvider>
      <div style={{ display: "none" }} ref={script_host}></div>
    </React.Fragment>
  );
}

export default App;
