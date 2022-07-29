import * as React from "react";
import control, { set } from "../../reducers";
import axios from "axios";
import { Grid, TextField, Button, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import OpenIcon from "@mui/icons-material/FilterList";
import ReplaceIcon from "@mui/icons-material/Save";

function SavedSearches(props) {
  const [loaded, setLoaded] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [searchName, setSearchName] = React.useState("");

  React.useEffect(() => {
    var load = (async) => {
      var url = "/remote/items/savedsearches";
      var body = { token: props.user.token };
      setLoading(true);
      axios
        .post(url, body)
        .then((results) => {
          set("searches", results.data);
          //setData(results.data);
          setLoaded(true);
          setLoading(false);
        })
        .catch((e) => {
          setLoading(false);
        });
    };

    if (!loaded) {
      load();
    }
  }, [loaded, props.user.token]);

  var saved_searches = props.searches.map((s, i) => {
    return (
      <Grid
        item
        container
        key={i}
        sx={{
          pl: 0 + " !important",
          pr: 0 + " !important",
          justifyContent: "space-between",
        }}
        alignItems="center"
      >
        <Grid item xs={5}>
          <Typography variant="body2">{s.title}</Typography>
        </Grid>
        <Grid item>
          <Button
            onClick={async () => {
              await set("filters", { ...s.filters, saved: true });

              var temp = Object.assign({}, props.temp, {
                confirm: null,
                refresh_filters: true,
              });
              set("temp", temp);
              props.loadSearch(s.filters);
            }}
            size="small"
            variant="contained"
            startIcon={<OpenIcon />}
          >
            Open
          </Button>
        </Grid>
        <Grid item>
          <Button
            onClick={async () => {
              await set("filters", { ...s.filters, saved: true });

              var temp = Object.assign({}, props.temp, {
                confirm: null,
              });
              set("temp", temp);
              props.saveSearch(null, s._id);
            }}
            size="small"
            variant="contained"
            color="success"
            startIcon={<ReplaceIcon />}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    );
  });

  return (
    <React.Fragment>
      <Grid container item>
        <Grid
          container
          item
          alignItems="center"
          spacing={1}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <Grid item>
            <TextField
              sx={{
                m: 1,
                ml: 0,
                mr: 0,
              }}
              variant="outlined"
              size="small"
              fullWidth
              placeholder="Name this search"
              autoComplete="off"
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
              }}
            />
          </Grid>
          <Grid item>
            <LoadingButton
              variant="contained"
              loadingPosition="start"
              loading={loading}
              startIcon={<SaveIcon />}
              onClick={() => {
                props.saveSearch(searchName);
              }}
            >
              Save
            </LoadingButton>
          </Grid>
        </Grid>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          {saved_searches}
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default control(SavedSearches, [
  "theme",
  "menu",
  "temp",
  "user",
  "searches",
  "filters",
]);
