import * as React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListIcon from "@mui/icons-material/List";
import MapIcon from "@mui/icons-material/Map";
import SearchIcon from "@mui/icons-material/Search";
import FilterIcon from "@mui/icons-material/FilterList";
import control, { set } from "../../reducers";
//import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import SaveIcon from "@mui/icons-material/StarBorder";
import SavedIcon from "@mui/icons-material/Star";
import SaveSearchIcon from "@mui/icons-material/Save";
import SavedSearches from "./SavedSearches";
import axios from "axios";
import { useTheme } from "@mui/material/styles";

function Search(props) {
  //  var navigate = useNavigate();
  var theme = useTheme();
  var saveSearch = async (title, _id) => {
    axios
      .post("/remote/items/savesearch", {
        filters: props.filters,
        token: props.user.token,
        title: title,
        id: _id,
      })
      .then((results) => {
        set("searches", results.data);
      })
      .catch();
  };

  var loadSearch = (filters) => {
    var b = props.map.getBounds();
    if (b) {
      var ne = b.getNorthEast();
      var sw = b.getSouthWest();
      props.load(ne, sw, filters, "search");
    }
  };

  return (
    <React.Fragment>
      <Paper
        component="form"
        sx={{
          p: "2px 4px",
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
        onSubmit={(e) => {
          e.preventDefault();

          var _filters = {
            ...props.filters,
          };
          var __filters = Object.assign({}, _filters);
          if (_filters.search_term) {
            _filters.search_term = "";
          }
          props.set("filters", _filters);

          loadSearch(__filters);
        }}
      >
        <IconButton
          sx={{ p: "10px" }}
          aria-label="list"
          onClick={() => {
            var show = props.display.show;

            if (show === "map") {
              props.set("display", { show: "list" });
              // navigate("/search/list");
            } else {
              props.set("display", { show: "map" });
              //navigate("/search");
            }
            //props.set("display", { show: show });
          }}
        >
          {props.display.show === "map" ? <ListIcon /> : <MapIcon />}
        </IconButton>

        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="search by location or ID#"
          inputProps={{ "aria-label": "search by location or ID#" }}
          value={props.filters.search_term ? props.filters.search_term : ""}
          onChange={(e) => {
            var _filters = Object.assign({}, props.filters);
            _filters.search_term = e.target.value;
            props.set("filters", _filters);
          }}
        />
        <IconButton type="submit" sx={{ p: "10px" }} aria-label="search">
          <SearchIcon />
        </IconButton>
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton
          color="primary"
          sx={{ p: "10px" }}
          aria-label="search"
          onClick={() => {
            if (!props.filters.open) {
              props.set("filters", { ...props.filters, open: true });
            }
          }}
        >
          <FilterIcon />
        </IconButton>
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton
          color="primary"
          sx={{ p: "10px" }}
          aria-label="search"
          onClick={() => {
            var temp = Object.assign({}, props.temp);
            temp.confirm = {
              title: "Saved Searches",
              cancel_text: "Close",
              manual: true,
              load: true,
              loading_icon: <SaveSearchIcon />,
              component: (
                <SavedSearches
                  saveSearch={saveSearch}
                  loadSearch={loadSearch}
                />
              ),
              hide_confirm: true,
            };
            props.set("temp", temp);
          }}
        >
          {props.filters.saved ? <SavedIcon /> : <SaveIcon />}
        </IconButton>
      </Paper>
      <Box
        sx={{
          width: "100%",
          height: "4px",
          backgroundColor: theme.palette.background.bar,
        }}
      >
        {props.loader ? <LinearProgress color="brand" /> : null}
      </Box>
    </React.Fragment>
  );
}
export default control(Search, [
  "theme",
  "menu",
  "temp",
  "filters",
  "display",
  "user",
  "searches",
]);
