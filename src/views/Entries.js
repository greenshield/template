import React from "react";
import { set } from "../reducers";
import { useSelector } from "react-redux";
import { Container } from "@mui/material";
import axios from "axios";
import Tabs from "./Tabs";

function Home(props) {
  const [loaded, setLoaded] = React.useState(false);

  var store = {
    user: useSelector((s) => s.user),
    temp: useSelector((s) => s.temp),
    alert: useSelector((s) => s.alert),
    entries: useSelector((s) => s.entries),
  };

  React.useEffect(() => {
    var load = (async) => {
      var url = "/remote/users/entries";
      var body = { token: store.user.token };

      axios
        .post(url, body)
        .then((results) => {
          set("entries", results.data);
          setLoaded(true);
        })
        .catch((e) => {});
    };

    if (!loaded) {
      load();
    }
  }, [loaded, store.user]);

  var details = async (entryId, documentId) => {
    var url =
      process.env.REACT_APP_SERVER_ENDPOINT +
      `/remote/users/document/${entryId}/${documentId}?token=` +
      store.user.token;

    //console.log(process.env);

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        '{"action":"open","file":"' + url + '"}'
      );
    } else {
      window.open(url, "_new");
    }
  };

  return (
    <Container sx={{ p: 0, pl: 1, pr: 1 }}>
      <Tabs details={details} />
    </Container>
  );
}

export default Home;
