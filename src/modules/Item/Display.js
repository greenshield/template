import * as React from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
/*
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
*/
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import CheckedFavoriteIcon from "@mui/icons-material/FavoriteOutlined";
import ShareIcon from "@mui/icons-material/IosShare";
import Slide from "@mui/material/Slide";
import control, { get } from "../../reducers";
//import { styled } from "@mui/material/styles";
import Moment from "moment-timezone";

import { Grid } from "@mui/material";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import { useParams } from "react-router-dom";
import Photos from "../../components/Gallery/Photos";
import ScheduleSupport from "./ScheduleSupport";
import CreateFeedback from "./CreateFeedback";
import axios from "axios";
import ScheduleIcon from "@mui/icons-material/CalendarMonth";
import LocalItem from "@mui/icons-material/LocalOffer";
import ChatIcon from "@mui/icons-material/ChatOutlined";

//const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);

function getLink(item) {
  if (item && item.VirtualSupportURLUnbranded) {
    return item.VirtualSupportURLUnbranded;
  }

  if (item && item.VirtualSupportURLUnbranded2) {
    return item.VirtualSupportURLUnbranded2;
  }
  return null;
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function Display(props) {
  const hooks = props.hooks;

  var nextNoon = new Date();
  if (nextNoon.getHours() >= 12) nextNoon.setDate(nextNoon.getDate() + 1);
  nextNoon.setHours(12, 0, 0, 0);
  const [barPosition, setBarPosition] = React.useState("absolute");
  const [barOpen, setBarOpen] = React.useState(false);
  const [isFavorite, setIsFavorite] = React.useState(false);

  const [feedbackDetails, setFeedbackDetails] = React.useState({
    phone: "",
    email: "",
    name: "",
    details: "",
  });

  var bar_offset = hooks.offset;

  const theme = useTheme();
  const componentTheme = createTheme({
    ...theme,
    palette: {
      ...theme.palette,
      mode: props.theme,
      primary: { main: "#ffffff !important" },
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

  const params = useParams();

  const navigate = useNavigate();

  const updateItem = async () => {
    await axios
      .post("/remote/items/user", {
        ItemId: params.ItemId,
        token: props.user.token,
      })
      .then((result) => {
        var _l = Object.assign({}, props.item);
        _l.item_user = result.data;
        props.set("item", _l);

        if (isFavorite !== _l.item_user.favorite) {
          setIsFavorite(_l.item_user.favorite);
        }
      });
  };

  React.useEffect(() => {
    if (props.item.item_user && isFavorite !== props.item.item_user.favorite) {
      setIsFavorite(props.item.item_user.favorite);
    }
  }, [props.item, isFavorite]);

  const handleClose = () => {
    //set("item", null);
    if (window.hasSearched) {
      window.stopLoad = true;
    }
    setBarPosition("absolute");
    navigate("/search");
  };

  const submitFavorite = async () => {
    var favorite = props.item.item_user ? props.item.item_user.favorite : false;
    favorite = !favorite;
    setIsFavorite(!isFavorite);
    await axios
      .post("/remote/items/favorite", {
        ItemId: params.ItemId,
        token: props.user.token,
        favorite: favorite,
      })
      .then((result) => {
        updateItem();
      });
  };

  const submitFeedback = async () => {
    var _l = get("item");
    var _item_user = _l._item_user;

    var feedback = _item_user?.feedback;

    await axios
      .post("/remote/items/feedback", {
        ItemId: params.ItemId,
        token: props.user.token,
        feedback,
      })
      .then((result) => {
        if (result.status) {
          var temp = Object.assign({}, props.temp);
          temp.confirm = {
            title: "Feedback Submitted",
            cancel_text: "Dismiss",
            text: `Thank you for your feedback.`,
            confirm_text: "Submit Feedback",
            hide_confirm: true,
            loading: false,
          };
          props.set("temp", temp);

          var __l = Object.assign({}, _l);
          __l.item_user = Object.assign({}, _item_user);
          delete __l._item_user;
          props.set("item", __l);

          updateItem();
        }
      });
  };

  const submitScheduledSupport = async () => {
    var _l = get("item");
    var _item_user = _l._item_user;
    var support = _item_user.support;

    await axios
      .post("/remote/items/support", {
        ItemId: params.ItemId,
        token: props.user.token,
        support,
      })
      .then((result) => {
        if (result.status) {
          var temp = Object.assign({}, props.temp);
          temp.confirm = {
            title: "Request Sent",
            cancel_text: "Dismiss",
            text: `Your request will be processed.`,
            confirm_text: "Send",
            hide_confirm: true,
            loading: false,
          };
          props.set("temp", temp);

          var __l = Object.assign({}, _l);
          var __item_user = _l.item_user ? Object.assign({}, _l.item_user) : {};

          __l.item_user = __item_user;
          delete __l._item_user;
          props.set("item", __l);

          updateItem();
        }
      })
      .catch((e) => null);
  };

  if (barPosition === "fixed") {
    var sx = {
      position: "fixed",
      top: bar_offset,
      zIndex: 1002,
      right: 0,
      width:
        !props.small && !props.hooks.isMobile ? "calc(100% - 240px)" : "100%",
      backgroundColor: theme.palette.brand.main + " !important",
      color: theme.palette.brand.top + " !important",
    };
  } else {
    sx = {
      position: "fixed",
      top: bar_offset,
      zIndex: 1002,
      right: 0,
      width:
        !props.small && !props.hooks.isMobile ? "calc(100% - 240px)" : "100%",
      backgroundColor: theme.palette.brand.main + " !important",
      color: theme.palette.brand.top + " !important",
    };
  }

  const handleExit = () => {
    setBarPosition("absolute");
    setBarOpen(false);
  };

  const handleEntered = () => {
    setBarPosition("fixed");
    setBarOpen(true);
  };

  var l = props.item;

  if (!l || l.ItemId !== params.ItemId) {
    return null;
  }

  const splitCamelCaseToString = (s) => {
    if (!s) {
      return "";
    }
    return s
      .split(/(?=[A-Z])/)
      .map((p) => {
        return p[0].toUpperCase() + p.slice(1);
      })
      .join(" ");
  };

  var _values = {
    PublicSewer: "Public Sewer",
    PublicWater: "Public Water",
    SingleFamilyResidence: (val) => splitCamelCaseToString(val),
  };

  var values = (val) => {
    if (_values[val]) {
      if (typeof _values[val] === "string") {
        return _values[val];
      } else {
        return _values[val](val);
      }
    } else {
      return val;
    }
  };

  var panel_details = {
    sections: [
      {
        title: "Information",
        fields: [
          { label: "ID #", field: "ItemId" },
          { label: "Status", field: "status" },
        ],
      },
      {
        title: "Details",
        subsections: [
          {
            title: "Location",
            fields: [
              { label: "Summary", field: "LocationSummary" },
              { label: "Description", field: "LocationDescription" },
            ],
          },
          {
            title: "Attributes",
            fields: [{ label: "Category", field: "category" }],
          },
        ],
      },
    ],
  };

  var mapped = panel_details.sections.map((section, si) => {
    return (
      <Grid item container key={si} sx={{ pl: "0px !important" }}>
        <Grid
          item
          xs={12}
          sx={{
            backgroundColor: theme.palette.table.light,
            pt: 0 + " !important",
            pl: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontSize: "1.2em", fontWeight: "bold" }}
          >
            {section.title}
          </Typography>
        </Grid>

        {section.fields &&
          section.fields.map((field, fi) => {
            return (
              <Grid container sx={{ pl: 1, pt: 1 }} key={"fi" + fi}>
                <Grid item xs={6}>
                  <Typography variant="subtitle">{field.label}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    {values(l[field.field])}
                  </Typography>
                </Grid>
              </Grid>
            );
          })}

        {section.subsections &&
          section.subsections.map((subsection, ssi) => {
            return (
              <Grid item container sx={{ pl: 1, mt: 1 }} key={"ssi" + ssi}>
                <Typography sx={{ fontWeight: "bold" }}>
                  {subsection.title}
                </Typography>

                {subsection.fields &&
                  subsection.fields.map((field, sfi) => {
                    return (
                      <Grid container key={"sfi" + sfi} sx={{ pt: 1 }}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle">
                            {field.label}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1">
                            {values(l[field.field])}
                          </Typography>
                        </Grid>
                      </Grid>
                    );
                  })}
              </Grid>
            );
          })}
      </Grid>
    );
  });

  var panel_details_map = <React.Fragment>{mapped}</React.Fragment>;

  var mh = props.hooks.isXs
    ? "420px"
    : props.hooks.isXl
    ? "620px"
    : props.hooks.isLg
    ? "420px"
    : !props.hooks.set
    ? "620px"
    : "340px";

  return (
    <ThemeProvider theme={componentTheme}>
      <div>
        {props.item ? (
          <Slide
            direction="up"
            in={props.item || params.ItemId ? true : false}
            mountOnEnter
            unmountOnExit
            timeout={{
              enter:
                params.ItemId && !window.hasSearched
                  ? 0
                  : !props.hooks.isMobile || 1 > 0
                  ? 0
                  : 0,
              exit: !props.hooks.isMobile || 1 > 0 ? 0 : 0,
            }}
          >
            <AppBar sx={sx}>
              <Toolbar
                style={{
                  paddingRight: "8px",
                }}
              >
                <Typography
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    flexGrow: 1,
                  }}
                  color="table"
                >
                  {props.item.title}
                </Typography>

                <IconButton
                  color={
                    l && l.item_user && l.item_user.favorite
                      ? "button"
                      : "button"
                  }
                  variant={
                    l && l.item_user && l.item_user.favorite
                      ? "contained"
                      : "outlined"
                  }
                  sx={{
                    borderRadius: "24px !important",
                    "&:hover": {
                      backgroundColor:
                        l && l.item_user && l.item_user.favorite
                          ? theme.palette.brand.light
                          : theme.palette.brand.main,
                    },
                  }}
                  onClick={submitFavorite}
                >
                  {isFavorite ? <CheckedFavoriteIcon /> : <FavoriteIcon />}
                </IconButton>

                <IconButton
                  color={"button"}
                  variant={"contained"}
                  sx={{
                    borderRadius: "24px !important",
                    "&:hover": {
                      backgroundColor: theme.palette.brand.main,
                    },
                  }}
                  onClick={() => {}}
                >
                  <ChatIcon />
                </IconButton>

                <IconButton
                  color={"button"}
                  variant={"contained"}
                  sx={{
                    borderRadius: "24px !important",
                    "&:hover": {
                      backgroundColor: theme.palette.brand.main,
                    },
                  }}
                  onClick={() => {
                    window.ReactNativeWebView.postMessage(
                      '{"action":"share","link":"' +
                        l.ItemId +
                        '","title":"' +
                        l.LocationSummary +
                        '"}'
                    );
                  }}
                >
                  <ShareIcon />
                </IconButton>

                <Button
                  color="button"
                  onClick={handleClose}
                  startIcon={<CloseIcon />}
                  style={{
                    marginLeft: "16px",
                    minWidth: "100px",
                  }}
                >
                  Close
                </Button>
              </Toolbar>
            </AppBar>
          </Slide>
        ) : null}
        <Dialog
          BackdropComponent={() => {
            return null;
          }}
          fullScreen
          open={props.item || params.ItemId ? true : false}
          onClose={handleClose}
          TransitionComponent={Transition}
          TransitionProps={{
            onEntered: handleEntered,
            onExit: handleExit,
          }}
          transitionDuration={{
            enter:
              params.ItemId && !window.hasSearched
                ? 0
                : !props.hooks.isMobile || 1 > 0
                ? 0
                : 0,
            exit: !props.hooks.isMobile || 1 > 0 ? 0 : 0,
          }}
          scroll="body"
          sx={{
            top: `${parseInt(hooks.offset) * 2}px !important`,
            zIndex: 1000,
          }}
          style={{
            overflowX: !barOpen ? "visible" : "hidden",
            overflowY: !barOpen ? "visible" : "overlay",
          }}
          PaperProps={{
            sx: {
              overflowY: !barOpen ? "hidden" : "overlay",
              right: 0,
              width:
                !props.small && !props.hooks.isMobile
                  ? "calc(100% - 240px)"
                  : "100%",
              position: "absolute",
            },
          }}
        >
          <Grid container spacing={2} sx={{ mt: 0, ml: 0, width: "100%" }}>
            <Grid
              item
              xs={12}
              sm={5}
              sx={{
                pr: props.hooks.isMobile ? 2 : 0,
                minHeight: props.hooks.isMobile ? "356px" : mh,
              }}
            >
              {l.photos && l.photos.length ? <Photos /> : null}
            </Grid>
            {props.item || 1 ? (
              <React.Fragment>
                <Grid item xs={12} sm={7} sx={{ pt: 0 + " !important" }}>
                  <Grid
                    container
                    flexDirection="row"
                    spacing={2}
                    sx={{ mt: 0, width: "100%", pr: 0 + " !important" }}
                  >
                    <Grid item xs={12} md={5}>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {l.title}
                      </Typography>
                      {l.LocationDescription}
                    </Grid>
                    <Grid item container xs={12} md={7} sx={{ p: 0, pt: 0 }}>
                      <Grid
                        item
                        container
                        xs={6}
                        md={6}
                        alignContent="center"
                        justifyContent="center"
                        textAlign="center"
                        sx={{ p: 1, pl: 0 }}
                      >
                        Date
                        <br />
                        {Moment(l.insert_stamp).format("MM/DD/YYYY")}
                      </Grid>

                      <Grid
                        item
                        container
                        xs={6}
                        md={6}
                        alignContent="center"
                        justifyContent="center"
                        textAlign="center"
                        sx={{ p: 1, pr: 0 }}
                      >
                        Time
                        <br />
                        {Moment(l.insert_stamp).format("hh:mm:ss A")}
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid
                    container
                    sx={{
                      mt: 2,
                      pr: 2,
                      justifyContent: getLink(l)
                        ? "space-around"
                        : "space-around",
                      display: "flex",
                    }}
                  >
                    {l && l.display ? (
                      <Button
                        color="brand"
                        variant="contained"
                        onClick={() => {}}
                      >
                        Chat
                      </Button>
                    ) : (
                      <Button
                        disabled={true}
                        color="brand"
                        variant="contained"
                        onClick={() => {}}
                      >
                        Chat
                      </Button>
                    )}
                  </Grid>

                  <Grid container sx={{ mt: 2, pr: 2 }}>
                    <Grid
                      item
                      xs={6}
                      alignContent="center"
                      justifyContent="center"
                      alignItems="center"
                      textAlign="center"
                      sx={{
                        borderWidth: "1px",
                        borderColor: theme.palette.sub.light,
                        borderStyle: "solid",
                        borderLeft: 0,
                        p: 0,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        if (l && l.item_user && l.item_user.support) {
                          return false;
                        }
                        var temp = Object.assign({}, props.temp);
                        temp.confirm = {
                          title: "Support",
                          cancel_text: "Cancel",
                          manual: true,
                          load: true,
                          loading_icon: <ScheduleIcon />,
                          component: (
                            <ScheduleSupport setItem={props.setItem} item={l} />
                          ),
                          confirm_text: "Submit Request",
                          callback_color: "brand",
                          callback: submitScheduledSupport,
                        };
                        props.set("temp", temp);
                      }}
                    >
                      <Button
                        color="brand"
                        disabled={
                          l && l.item_user && l.item_user.support ? true : false
                        }
                        fullWidth
                        sx={{
                          p: 2,
                        }}
                      >
                        Support
                      </Button>
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      alignContent="center"
                      justifyContent="center"
                      alignItems="center"
                      textAlign="center"
                      sx={{
                        borderWidth: "1px",
                        borderColor: theme.palette.sub.light,
                        borderStyle: "solid",
                        borderRight: 0,
                        borderLeft: 0,
                        p: 0,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        if (l && l.item_user && l.item_user.feedback) {
                          return false;
                        }
                        var temp = Object.assign({}, props.temp);
                        temp.confirm = {
                          title: "Send Feedback",
                          cancel_text: "Cancel",
                          manual: true,
                          load: true,
                          loading_icon: <LocalItem />,
                          component: (
                            <CreateFeedback
                              setFeedbackDetails={setFeedbackDetails}
                              feedbackDetails={feedbackDetails}
                              item={l}
                            />
                          ),
                          confirm_text: "Submit Feedback",
                          callback_color: "brand",
                          callback: submitFeedback,
                        };
                        props.set("temp", temp);
                      }}
                    >
                      <Button
                        disabled={
                          l && l.item_user && l.item_user.feedback
                            ? true
                            : false
                        }
                        color="brand"
                        fullWidth
                        sx={{
                          p: 2,
                        }}
                      >
                        Send Feedback
                      </Button>
                    </Grid>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    mt={2}
                    pr={2}
                    sx={{
                      textAlign: "justify",
                    }}
                  >
                    {l.location && l.location.coordinates ? (
                      <React.Fragment>
                        Location: {l.location.coordinates[1]},
                        {l.location.coordinates[0]}
                      </React.Fragment>
                    ) : null}
                  </Grid>
                </Grid>
              </React.Fragment>
            ) : null}
          </Grid>

          <Grid container sx={{ p: 2, m: 0 }}>
            <Grid item container sx={{ p: 0, m: 0 }} spacing={1}>
              {panel_details_map}
            </Grid>
          </Grid>
        </Dialog>
      </div>
    </ThemeProvider>
  );
}

export default control(Display, [
  "theme",
  "menu",
  "temp",
  "item",
  "hooks",
  "small",
  "user",
  "display",
]);
