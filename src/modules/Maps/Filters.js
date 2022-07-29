import * as React from "react";
import Drawer from "@mui/material/Drawer";
import control, { set } from "../../reducers";
import { Box, Button, Grid, Typography, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FilterIcon from "@mui/icons-material/Check";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import Slider from "@mui/material/Slider";
import OutlinedInput from "@mui/material/OutlinedInput";
import Switch from "@mui/material/Switch";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import CheckedFavoriteIcon from "@mui/icons-material/FavoriteOutlined";

function Filters(props) {
  const [tempFilters, setTempFilters] = React.useState(props.filters);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (props.temp.refresh_filters) {
      setTempFilters(props.filters);

      var temp = Object.assign({}, props.temp, {
        refresh_filters: false,
      });
      set("temp", temp);
    }
  }, [props.temp.refresh_filters, props.filters, props.temp]);

  function valuetext(price_label) {
    if (price_label === 20) {
    } else if (price_label < 11) {
      price_label = price_label * 100000;
    } else {
      var count = price_label - 10;
      var total = 1000000 * count;

      var _total = total + 1000000;
      price_label = _total;
    }

    if (price_label < 1000000) {
      var rounded = price_label / 1000;
      rounded = parseInt(Math.floor(rounded));
      var title = rounded + "K";
    } else {
      rounded = price_label / 1000000;
      rounded = rounded.toFixed(1);
      title = rounded + "M";
    }

    if (price_label === 20) {
      title = "10M+";
    }

    return title;
  }

  var updateFilter = (filter, value) => {
    var _tempFilters = Object.assign({}, tempFilters);
    _tempFilters[filter] = value;
    setTempFilters(_tempFilters);
  };

  return (
    <div>
      <React.Fragment>
        <Drawer
          anchor={"right"}
          open={props.filters.open ? true : false}
          onClose={() => {
            props.set("filters", { ...props.filters, open: false });
            setTempFilters({ ...props.filters, open: false });
          }}
          PaperProps={{
            sx: {
              backgroundColor:
                props.theme === "dark"
                  ? "#000000 !important"
                  : "#ffffff !important",
              backgroundImage: "none",
            },
          }}
        >
          <Box
            sx={{
              width: "300px",
              padding: 1,
              display: "flex",
              justifyContent: "space-between",
              backgroundColor: props.theme === "dark" ? "#000000" : "#ffffff",
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                var _filters = {
                  ...tempFilters,
                  open: false,
                  saved: false,
                };
                props.set("filters", _filters);
                props.loadSearch(_filters);
              }}
              startIcon={<FilterIcon />}
              size="small"
              color="brand"
            >
              Apply Filters
            </Button>
            <Button
              onClick={() => {
                props.set("filters", { ...props.filters, open: false });
                setTempFilters({ ...props.filters, open: false });
              }}
              startIcon={<CloseIcon />}
              size="small"
              color="tableicon"
            >
              Close
            </Button>
          </Box>
          {props.filters ? (
            <Box
              sx={{
                width: "300px",
                padding: 2,
                backgroundColor: props.theme === "dark" ? "#000000" : "#ffffff",
              }}
            >
              <Grid
                container
                item
                spacing={2}
                sx={{ width: "100%", margin: 0, padding: 0 }}
              >
                <Grid
                  item
                  xs={12}
                  sx={{ pl: "0px !important", mt: 0, pt: "0 !important" }}
                >
                  <TextField
                    fullWidth
                    value={
                      tempFilters.search_text ? tempFilters.search_text : ""
                    }
                    placeholder="keywords (green, local, etc)"
                    size="small"
                    onChange={(e) => {
                      updateFilter("search_text", e.target.value);
                    }}
                  />
                </Grid>

                {props.user ? (
                  <Grid item xs={12} sx={{ pl: "0px !important" }}>
                    <FormControlLabel
                      sx={{
                        ml: 0,
                      }}
                      control={
                        <Switch
                          className="shadowed"
                          checked={tempFilters.favorites ? true : false}
                          onChange={() => {
                            updateFilter("favorites", !tempFilters.favorites);
                          }}
                        />
                      }
                      label={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          Favorites Only
                          <div
                            style={{
                              marginLeft: "8px",
                              alignItems: "center",
                              display: "flex",
                            }}
                          >
                            {tempFilters.favorites ? (
                              <CheckedFavoriteIcon color="brand" />
                            ) : (
                              <FavoriteIcon color="brand" />
                            )}
                          </div>
                        </div>
                      }
                    />
                  </Grid>
                ) : null}

                <Grid
                  item
                  xs={12}
                  sx={{
                    textAlign: "center",
                    p: 2,
                    pt: 0 + " !important",
                    pb: 0,
                  }}
                >
                  <Typography variant="caption" gutterBottom>
                    Price Range
                  </Typography>
                  <Slider
                    getAriaLabel={() => "Price Range"}
                    value={[
                      tempFilters.price ? tempFilters.price[0] : 0,
                      tempFilters.price ? tempFilters.price[1] : 10000000,
                    ]}
                    onChange={(e, nv) => {
                      updateFilter("price", nv);
                    }}
                    step={1}
                    min={0}
                    max={20}
                    scale={(v) => {
                      //console.log(v);
                      if (v > 10) {
                        var val = v;
                      } else {
                        val = v;
                      }

                      return val;
                    }}
                    valueLabelFormat={valuetext}
                    valueLabelDisplay="auto"
                    disableSwap
                    marks={[
                      {
                        value: 0,
                        label: "0",
                      },
                      {
                        value: 5,
                        label: "500K",
                      },
                      {
                        value: 10,
                        label: "1M",
                      },
                      {
                        value: 14,
                        label: "5M",
                      },
                      {
                        value: 20,
                        label: "10M+",
                      },
                    ]}
                  />
                </Grid>

                <Grid item xs={12} sx={{ pl: "0px !important" }}>
                  <FormControl fullWidth>
                    <InputLabel size="small">Item Type</InputLabel>
                    <Select
                      label="Item Type"
                      size="small"
                      fullWidth
                      value={tempFilters.ItemType ? tempFilters.ItemType : 0}
                      onChange={(e) => {
                        updateFilter("ItemType", e.target.value);
                      }}
                    >
                      <MenuItem value={0}>Any</MenuItem>
                      <MenuItem value={"product"}>Product</MenuItem>
                      <MenuItem value={"service"}>Service</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sx={{ pl: "0px !important" }}>
                  <FormControl fullWidth>
                    <InputLabel size="small">Category</InputLabel>
                    <Select
                      onOpen={() => {
                        setOpen(true);
                      }}
                      open={open}
                      size="small"
                      multiple
                      onClose={() => {
                        setOpen(false);
                      }}
                      value={tempFilters.category ? tempFilters.category : []}
                      onChange={(event) => {
                        const {
                          target: { value },
                        } = event;
                        var val =
                          typeof value === "string" ? value.split(",") : value;
                        updateFilter(
                          "category",
                          // On autofill we get a stringified value.
                          val
                        );
                        setOpen(false);
                      }}
                      input={<OutlinedInput label="Item Category" />}
                      renderValue={(selected) => selected.length + " selected"}
                    >
                      <MenuItem value={"consumer"}>
                        <Checkbox
                          checked={
                            tempFilters.category &&
                            tempFilters.category.indexOf("consumer") > -1
                              ? true
                              : false
                          }
                        />
                        <ListItemText primary={"Consumer"} />
                      </MenuItem>

                      <MenuItem value={"commercial"}>
                        <Checkbox
                          checked={
                            tempFilters.category &&
                            tempFilters.category.indexOf("commercial") > -1
                              ? true
                              : false
                          }
                        />
                        <ListItemText primary={"Commercial"} />
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sx={{ pl: "0px !important" }}>
                  <FormControlLabel
                    sx={{
                      ml: 0,
                    }}
                    control={
                      <Switch
                        className="shadowed"
                        checked={tempFilters.highlighted ? true : false}
                        onChange={() => {
                          updateFilter("highlighted", !tempFilters.highlighted);
                        }}
                      />
                    }
                    label="Highlighted"
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sx={{ pl: "0px !important", mt: 0, pt: "4px !important" }}
                >
                  <FormControlLabel
                    sx={{
                      ml: 0,
                    }}
                    control={
                      <Switch
                        className="shadowed"
                        checked={tempFilters.deleted ? true : false}
                        onChange={() => {
                          updateFilter("deleted", !tempFilters.deleted);
                        }}
                      />
                    }
                    label="Deleted Only"
                  />
                </Grid>
              </Grid>
            </Box>
          ) : null}
        </Drawer>
      </React.Fragment>
    </div>
  );
}

export default control(Filters, ["theme", "menu", "temp", "filters", "user"]);
