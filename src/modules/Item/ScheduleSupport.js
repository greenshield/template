import * as React from "react";
import control from "../../reducers";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import Moment from "moment-timezone";

function ScheduleSupport(props) {
  const [value, setValue] = React.useState(null);

  const theme = useTheme();
  const componentTheme = createTheme({
    palette: {
      mode: props.theme,
      primary: { main: theme.palette.primary.main },
    },
  });

  return (
    <React.Fragment>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Stack spacing={3}>
          <ThemeProvider theme={componentTheme}>
            <MobileDateTimePicker
              value={value}
              ampmInClock={true}
              disablePast={true}
              onChange={(newValue) => {
                setValue(newValue);

                var _l = Object.assign({}, props.item);
                var _item_user = _l.item_user
                  ? Object.assign({}, _l.item_user)
                  : {};

                if (!_item_user.support) {
                  _item_user.support = {
                    status: "pending",
                    scheduled_time: Moment(newValue).valueOf(),
                  };
                  _l._item_user = _item_user;
                }
                props.set("item", _l);
              }}
              renderInput={(params) => (
                <ThemeProvider theme={theme}>
                  <TextField
                    fullWidth
                    color="secondary"
                    variant="outlined"
                    placeholder="Choose Date/Time"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& > fieldset": {
                          borderWidth: "1px !important",
                        },
                      },
                      input: {
                        "&::placeholder": {
                          opacity: 1,
                        },
                      },
                      "& fieldset": {
                        borderColor: theme.palette.secondary.dark,
                      },
                      "& .MuiOutlinedInput-root:hover": {
                        "& > fieldset": {
                          borderColor: theme.palette.secondary.main,
                        },
                      },
                      label: { color: theme.palette.secondary.main },
                    }}
                    {...params}
                  />
                </ThemeProvider>
              )}
              fullWidth
              inputVariant="outlined"
              format="MMM Do YYYY, h:mm a"
            />
          </ThemeProvider>
        </Stack>
      </LocalizationProvider>
    </React.Fragment>
  );
}

export default control(ScheduleSupport, ["theme", "menu", "temp", "item"]);
