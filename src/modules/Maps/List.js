import React from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import Spinner from "../../components/Spinner";
import control from "../../reducers";

import Grid from "@mui/material/Grid";
import ListItem from "./ListItem";
//import { MarkerClusterer } from "@googlemaps/markerclusterer";
window.hasSearched = false;

function Wrap(props) {
  var { setMap, setLoaded } = props;
  React.useEffect(() => {
    window.hasSearched = false;
    window.searching = false;
    window.searchCount = 0;
    window.stopLoad = false;

    setMap(null);
    setLoaded(false);
  }, [setMap, setLoaded]);

  const render = (status) => {
    return <Spinner full={true} offset={props.hooks.offset} status={status} />;
  };

  var items = props.markers.map((l, i) => {
    return (
      <Grid xs={12} md={4} item key={i}>
        <ListItem key={i} item={l}></ListItem>
      </Grid>
    );
  });

  return (
    <Wrapper apiKey={process.env.REACT_APP_GOOGLE_API_KEY} render={render}>
      <Grid container spacing={2} sx={{ mt: 0, p: 2, pt: 0 }}>
        {items}
      </Grid>
    </Wrapper>
  );
}

export default control(Wrap, [
  "hooks",
  "item",
  "small",
  "auth",
  "user",
  "display",
]);
