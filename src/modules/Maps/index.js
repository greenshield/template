import * as React from "react";
import { Route, Routes } from "react-router-dom";
import control from "../../reducers";
import Map from "./Map";
import List from "./ListView";
import Filters from "./Filters";
import Search from "./Search";
import Grid from "@mui/material/Grid";
import { useParams } from "react-router-dom";
import axios from "axios";
//import Location from "./Location";

function Maps(props) {
  var params = useParams();
  const [map, setMap] = React.useState(null);
  const [listening, setListening] = React.useState(false);
  const [markers, setMarkers] = React.useState([]);
  const [loaded, setLoaded] = React.useState(false);
  const [loader, setLoader] = React.useState(false);

  const [center] = React.useState({
    lat: 37.4027209,
    lng: -122.1811808,
  });
  var filters = props.filters;

  const filterRef = React.useRef(props.filters);

  React.useEffect(() => {
    filterRef.current = filters;
  }, [filters]);

  const [pos, setPos] = React.useState({ lat: null, lng: null });
  window.newPos = (new_pos) => {
    //window.ReactNativeWebView.postMessage('{"action":"log","message":"setPos test is '+new_pos.lat+'"}')
    setPos(new_pos);
  };

  var loadSearch = (f) => {
    var b = map.getBounds();
    if (b) {
      var ne = b.getNorthEast();
      var sw = b.getSouthWest();
      load(ne, sw, f, "search");
    }
  };

  React.useEffect(() => {
    window.ReactNativeWebView.postMessage('{"action":"requestLocation"}');
  }, []);

  React.useEffect(() => {
    if (window.google?.maps && map) {
      window.detachListeners();

      if (!listening) {
        setListening(true);
      }
      window.attachListeners();
    }
  }, [props.filters, map, center, filters, params.ItemId, listening]);

  var load = async (ne, sw, custom, loadSource) => {
    if (params.ItemId || window.searching) {
      return false;
    }
    if (window.stopLoad) {
      window.stopLoad = false;
      return false;
    }

    if (window.fitting) {
      window.fitting = false;
      //return false;
    }

    window.searching = true;
    var f = custom ? custom : filterRef.current;
    var _filters = Object.assign({}, f);
    delete _filters.open;
    setLoader(true);

    if (_filters.Price) {
      var Price = _filters.Price.slice();
      if (_filters.Price[1] === 20) {
        Price[1] = 100000000;
      } else if (_filters.Price[1] < 11) {
        Price[1] = _filters.Price[1] * 100000;
      } else {
        var count = _filters.Price[1] - 10;
        var total = 1000000 * count;

        var _total = total + 1000000;
        Price[1] = _total;
      }

      if (_filters.Price[0] === 20) {
        Price[0] = 100000000;
      } else if (_filters.Price[0] < 11) {
        Price[0] = _filters.Price[0] * 100000;
      } else {
        count = _filters.Price[0] - 10;
        total = 1000000 * count;

        _total = total + 1000000;
        Price[0] = _total;
      }
    }

    _filters.Price = Price;

    axios
      .post("/remote/items/search", {
        query: {
          search_term: _filters.search_term ? _filters.search_term : "",
        },
        location: center,
        box: [ne, sw],
        filters: _filters,
        token: props.user ? props.user.token : null,
      })
      .then((result) => {
        setLoader(false);
        window.ReactNativeWebView.postMessage('{"action":"loaded"}');
        if (result.data.data) {
          if (window.markers?.length) {
            window.markers.forEach((m, i) => {
              //.me_marker.setMap(null);
              m.setMap(null);
            });
          }

          setMarkers(result.data.data);

          //console.log(filterRef.current);

          if (_filters.search_term) {
            focus_bounds(result.data.data);
          }

          //set("markers", result.data.data);
        }

        window.searchCount = window.searchCount + 1;
        window.hasSearched = true;
        window.searching = false;
      })
      .catch((err) => {
        setLoader(false);
        window.searching = false;
      });
  };

  var focus_bounds = (_markers) => {
    if (!_markers.length) {
      return false;
    }

    var bounds = new window.google.maps.LatLngBounds();

    _markers.forEach((m, i) => {
      var latlng = {
        lat: m.location.coordinates[1],
        lng: m.location.coordinates[0],
      };
      bounds.extend(latlng);
    });

    window.fitting = true;

    if (window.google?.maps && map) {
      window.detachListeners();

      map.fitBounds(bounds, 0);

      window.attachListeners();
    }
  };

  window.detachListeners = () => {
    window.google.maps.event.clearListeners(map, "idle");
  };

  window.attachListeners = () => {
    "idle".split(",").forEach(function (e) {
      window.google.maps.event.addListener(map, e, () => {
        if (window.searching || window.fitting) {
          if (window.fitting) {
            window.fitting = false;
            return false;
          }
          if (window.searching) {
            return false;
          }
        }

        if (map) {
          setLoaded(true);
          var bounds = map.getBounds();
          if (bounds) {
            var ne = bounds.getNorthEast();
            var sw = bounds.getSouthWest();

            if (window.mc) {
              window.mc.clearMarkers();
            }
            window.markers.forEach((m, i) => {
              //window.me_marker.setMap(null);
              m.setMap(null);
            });

            load(ne, sw);
          }
        }
      });
    });
  };

  return (
    <React.Fragment>
      <Filters loadSearch={loadSearch} />
      <div
        style={{
          //position: "absolute",
          height: "52px",
          zIndex: 1,
          width: "100%",
        }}
      >
        <Grid
          container
          alignItems="center"
          textAlign="center"
          justifyContent="center"
          sx={{ pt: 0 }}
        >
          <Search map={map} load={load} loader={loader} setLoader={setLoader} />
        </Grid>
      </div>
      {/*<Location setPos={window.newPos} pos={window.pos} />*/}
      <Routes>
        <Route
          path={`/`}
          exact
          element={
            <Map
              setMarkers={setMarkers}
              mapMarkers={markers}
              offset={props.offset}
              format="map"
              load={load}
              map={map}
              setMap={setMap}
              loaded={loaded}
              setLoaded={setLoaded}
              loader={loader}
              setLoader={setLoader}
              pos={pos}
              center={center}
              focus_bounds={focus_bounds}
              list={
                <List
                  offset={props.offset}
                  format="list"
                  map={map}
                  setMap={setMap}
                  setLoaded={setLoaded}
                  setMarkers={setMarkers}
                  markers={markers}
                />
              }
            />
          }
        />
        <Route
          path={`/list`}
          exact
          element={
            <List
              offset={props.offset}
              format="list"
              map={map}
              setMap={setMap}
              setLoaded={setLoaded}
              setMarkers={setMarkers}
              markers={markers}
            />
          }
        />
      </Routes>
    </React.Fragment>
  );
}

export default control(Maps, [
  "theme",
  "menu",
  "temp",
  "markers",
  "filters",
  "user",
]);
