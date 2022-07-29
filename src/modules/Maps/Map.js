import React from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import Spinner from "../../components/Spinner";
import control, { set, get } from "../../reducers";
import axios from "axios";
import { isMobile } from "react-device-detect";
import Display from "../Item/Display";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import haversine from "haversine-distance";

//import { MarkerClusterer } from "@googlemaps/markerclusterer";
window.hasSearched = false;

function Map(props) {
  const navigate = useNavigate();
  var full_height = window.innerHeight - parseInt(props.hooks.offset, 10);

  var containerStyle = {
    width: "100%",
    //height: "calc(100vh - " + props.offset + " - env(safe-area-inset-bottom))",
    height: full_height - 52,
  };

  const ref = React.useRef(null);

  const { map, setMap } = props;
  const [zoom, setZoom] = React.useState(props.zoom);
  const [center, setCenter] = React.useState(props.center);
  const [populated, setPopulated] = React.useState(false);
  //const [loadingItem, setLoadingItem] = React.useState(false);

  const { initialLoad, mapMarkers, setMarkers, auth, user } = props;

  var params = useParams();

  var setLoaded = props.setLoaded;
  var loaded = props.loaded;

  var setLoader = props.setLoader;

  React.useEffect(() => {
    if (ref.current && !map && !params.ItemId) {
      var map_styles = [
        {
          featureType: "poi",
          stylers: [
            {
              visibility: "off",
            },
          ],
        },
        {
          featureType: "road",
          elementType: "labels.icon",
          stylers: [
            {
              visibility: "off",
            },
          ],
        },
        {
          featureType: "transit",
          stylers: [
            {
              visibility: "off",
            },
          ],
        },
      ];

      if (props.theme === "dark") {
        map_styles.push(
          {
            elementType: "geometry",
            stylers: [
              {
                color: "#1d2c4d",
              },
            ],
          },
          {
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#8ec3b9",
              },
            ],
          },
          {
            elementType: "labels.text.stroke",
            stylers: [
              {
                color: "#1a3646",
              },
            ],
          },
          {
            featureType: "administrative.country",
            elementType: "geometry.stroke",
            stylers: [
              {
                color: "#4b6878",
              },
            ],
          },
          {
            featureType: "administrative.land_parcel",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#64779e",
              },
            ],
          },
          {
            featureType: "administrative.province",
            elementType: "geometry.stroke",
            stylers: [
              {
                color: "#4b6878",
              },
            ],
          },
          {
            featureType: "landscape.man_made",
            elementType: "geometry.stroke",
            stylers: [
              {
                color: "#334e87",
              },
            ],
          },
          {
            featureType: "landscape.natural",
            elementType: "geometry",
            stylers: [
              {
                color: "#023e58",
              },
            ],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [
              {
                color: "#304a7d",
              },
            ],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#98a5be",
              },
            ],
          },
          {
            featureType: "road",
            elementType: "labels.text.stroke",
            stylers: [
              {
                color: "#1d2c4d",
              },
            ],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [
              {
                color: "#2c6675",
              },
            ],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [
              {
                color: "#255763",
              },
            ],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#b0d5ce",
              },
            ],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.stroke",
            stylers: [
              {
                color: "#023e58",
              },
            ],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [
              {
                color: "#0e1626",
              },
            ],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#4e6d70",
              },
            ],
          },
          {
            featureType: "poi.park",
            elementType: "geometry.fill",
            stylers: [
              {
                color: "#023e58",
              },
            ],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#3C7680",
              },
            ],
          }
        );
      }

      setMap(
        new window.google.maps.Map(ref.current, {
          center,
          zoom,
          disableDefaultUI: true,
          zoomControl: true,
          styles: map_styles,
        })
      );
    }

    if (map && (center.lat !== props.pos.lat || center.lng !== props.pos.lng)) {
      if (props.pos.lat !== null && props.pos.lng !== null) {
        setCenter(props.pos);
        map.setCenter(props.pos);
      }
    }
  }, [ref, map, center, zoom, setMap, params.ItemId, props.pos, props.theme]);

  React.useEffect(() => {
    if (map) {
      var me_icon = {
        size: new window.google.maps.Size(48, 48),
        scaledSize: new window.google.maps.Size(48, 48),
        url: "/assets/location.png",
      };

      if (window.me_marker) {
        window.me_marker.setMap(null);
        delete window.me_marker;
      }

      window.me_marker = new window.google.maps.Marker({
        optimized: true,
        position: {
          lat: center.lat,
          lng: center.lng,
        },
        label: {
          text: " ",
          color: "#bababa",
          fontSize: "12px",
          fontWeight: "bold",
        },
        zIndex: 2,
        icon: me_icon,
        map: populated ? map : null,
      });
    }
  }, [center, map, populated]);

  React.useEffect(() => {
    if (localStorage.getItem("token") && !auth.checked) {
    } else {
      if (!params.ItemId) {
        if (window.markers) {
          window.markers.forEach((m, i) => {
            //m.setMap(null);
          });
        }

        var skip = false;

        if (window.markers?.length) {
          mapMarkers.forEach((m, ii) => {
            var same = true;
            if (
              window.markers &&
              window.markers.length &&
              (!window.markers[ii] ||
                !window.markers[ii].ItemId ||
                window.markers[ii].ItemId !== m.ItemId ||
                !window.markers[ii].map)
            ) {
              same = false;
            }

            if (
              same &
              (window.markers &&
                window.markers.length &&
                (mapMarkers.length === window.markers.length - 1 ||
                  mapMarkers.length === window.markers.length))
            ) {
              skip = true;
            } else {
              skip = false;
            }
          });
        }

        if (!skip) {
          window.markers = [];

          setPopulated(false);

          // Add some markers to the map.

          mapMarkers.forEach((marker, i) => {
            var m = marker;

            var title = marker.title
              ? marker.title
              : marker.location.coordinates[1] +
                "," +
                marker.location.coordinates[0];

            const a = {
              latitude: marker.location.coordinates[1],
              longitude: marker.location.coordinates[0],
            };
            const b = { latitude: center.lat, longitude: center.lng };
            /*const _b = {
              latitude: map.getCenter().lat(),
              longitude: map.getCenter().lng(),
            };*/

            const dist = haversine(a, b);

            if (dist <= 1609.34 && marker.highlighted) {
              var highlighted = true;

              var icon = {
                size: new window.google.maps.Size(48, 48),
                scaledSize: new window.google.maps.Size(48, 48),

                url:
                  marker.status === "Active"
                    ? highlighted
                      ? "/assets/highlighted.png"
                      : "/assets/standard.png"
                    : "/assets/deleted.png",
              };
            } else {
              highlighted = false;

              icon = {
                size: new window.google.maps.Size(48, 48),
                scaledSize: new window.google.maps.Size(48, 48),
                url:
                  marker.status === "Active"
                    ? highlighted
                      ? "/assets/highlighted.png"
                      : "/assets/standard.png"
                    : "/assets/deleted.png",
              };
            }

            const _marker = new window.google.maps.Marker({
              optimized: true,
              position: {
                lat: marker.location.coordinates[1],
                lng: marker.location.coordinates[0],
              },
              label: {
                text: title,
                color:
                  marker.status === "Active"
                    ? highlighted
                      ? "#ffffff"
                      : "#000000"
                    : "#000000",
                fontSize: highlighted ? "16px" : "12px",
                fontWeight: "bold",
              },
              zIndex: highlighted ? 2 : 1,
              icon: icon,
              map: populated ? map : null,
            });
            //_marker.setMap(map);
            _marker.ItemId = m.ItemId;
            window.markers.push(_marker);
            _marker.addListener("click", (e) => {
              if (e.domEvent.pointerType === "click") {
                //set("item", m);
                navigate("/item/" + marker.ItemId);
              } else {
                if (!isMobile) {
                  setLoader(true);
                  setTimeout(() => {
                    document.getElementById("focuser").focus();
                    document.getElementById("focuser").blur();
                    //this opens window before loading
                    window.tempItem = m;

                    navigate("/item/" + marker.ItemId);
                  }, 10);
                } else {
                  //this opens window before loading
                  window.tempItem = m;
                  setLoader(true);
                  navigate("/item/" + marker.ItemId);
                }
              }
            });
          });

          setPopulated(true);
        }
      } else {
        var item = get("item");

        var loadItem = async () => {
          await axios
            .post("/remote/items/details", {
              query: {
                ItemId: params.ItemId,
              },
              token: user ? user.token : null,
            })
            .then((result) => {
              window.loadingItem = false;
              setLoader(false);
              if (result.data) {
                set("item", result.data);
              }
            })
            .catch((err) => {
              setLoader(false);
            });
          return true;
        };

        if (!item && !window.loadingItem) {
          if (window.tempItem) {
            set("item", window.tempItem);
            window.tempItem = null;
            setTimeout(() => {
              window.loadingItem = true;
              loadItem();
            }, 175);
          } else {
            window.loadingItem = true;
            loadItem();
          }
        } else {
        }
      }
    }
    /*
    const renderer = {
      render: ({ count, position }) => {
        return new window.google.maps.Marker({
          label: { text: String(count), color: "#000000", fontSize: "16px" },
          position,
          zIndex: Number(window.google.maps.Marker.MAX_ZINDEX) + count,
          icon: {
            url: "http://maps.google.com/mapfiles/kml/paddle/wht-blank.png",
            labelOrigin: new window.google.maps.Point(32, 20),
          },
        });
      },
    };

    window.mc = new MarkerClusterer({ markers: window.markers, map, renderer });
    */
  }, [
    mapMarkers,
    map,
    populated,
    navigate,
    params.ItemId,

    auth,
    user,
    setLoader,
    center,
  ]);

  var load = props.load;

  React.useEffect(() => {
    var item = get("item");
    if (item && !params.ItemId) {
      set("item", null);

      if (map) {
        window.google.maps.event.clearListeners(map, "idle");

        "idle".split(",").forEach(function (e) {
          window.google.maps.event.addListener(map, e, () => {
            console.log("idle addListener Map.js 256");
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

        if (window.searchCount === 0) {
          var b = map.getBounds();
          if (b) {
            var ne = b.getNorthEast();
            var sw = b.getSouthWest();

            load(ne, sw);
          }
        }
      }
    }
  }, [params.ItemId, load, map, setLoaded]);

  React.useEffect(() => {
    if (map && !loaded) {
      window.zoom = zoom;
    }
  }, [
    map,
    loaded,
    setLoaded,
    zoom,
    setZoom,
    initialLoad,
    mapMarkers,
    setMarkers,
  ]);

  React.useEffect(() => {
    return () => {
      //setMap(null);
      set("map", { visible: false, stretch: true });
    };
  }, []);

  React.useEffect(() => {
    set("map", { visible: true, stretch: true });
  }, []);

  return (
    <>
      <div id="google-map" ref={ref} style={containerStyle} />
      {React.Children.map(props.children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { map });
        }
      })}
    </>
  );
}

function Wrap(props) {
  var zoom = 15;
  //  const [markers, setMarkers] = React.useState([]);
  var loaded = props.loaded;
  var setLoaded = props.setLoaded;

  var params = useParams();

  var { setMarkers } = props;

  var load = props.load;

  var map = props.map;
  var setMap = props.setMap;

  var setLoader = props.setLoader;

  var filters = props.filters;

  React.useEffect(() => {
    window.searchCount = 0;
    if (params.ItemId && !window.hasSearched) {
      set("small", true);
    } else if (get("small")) {
      //set("small", false);
    }
  }, [params.ItemId]);

  const render = (status) => {
    return (
      <Spinner full={true} offset={props.hooks.offset + 52} status={status} />
    );
  };

  var focus_bounds = props.focus_bounds;

  React.useEffect(() => {
    if (map && !window.searchCount && !loaded) {
      //setLoaded(true);

      var bounds = map.getBounds();

      if (!bounds) {
        window.google.maps.event.addListenerOnce(map, "idle", () => {
          if (map) {
            bounds = map.getBounds();
            if (bounds) {
              var ne = bounds.getNorthEast();
              var sw = bounds.getSouthWest();
              load(ne, sw);
            }
          }
        });
      } else {
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        load(ne, sw);
      }
      setLoaded(true);
    }
  }, [
    map,
    loaded,
    load,
    params.ItemId,
    setMarkers,
    setLoaded,
    setLoader,
    props.center,
    filters.search_term,
    focus_bounds,
  ]);

  return (
    <Wrapper apiKey={process.env.REACT_APP_GOOGLE_API_KEY} render={render}>
      {props.item ? <Display /> : null}
      {props.display.show === "list" ? props.list : null}
      <Map
        setMarkers={props.setMarkers}
        setLoaded={setLoaded}
        loaded={loaded}
        center={props.center}
        pos={props.pos}
        zoom={zoom}
        offset={props.hooks.offset}
        mapMarkers={props.mapMarkers}
        setMap={setMap}
        map={map}
        hooks={props.hooks}
        load={load}
        auth={props.auth}
        user={props.user}
        setLoader={setLoader}
        theme={props.theme}
      />
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
  "markers",
  "filters",
  "theme",
]);
