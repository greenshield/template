import * as React from "react";
import control from "../../reducers";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ThemeProvider, useTheme } from "@mui/material/styles";

function CreateFeedback(props) {
  const theme = useTheme();

  const [feedbackDetails, setFeedbackDetails] = React.useState(
    props.feedbackDetails
  );

  const updateDetails = (field, value) => {
    var _feedbackDetails = Object.assign({}, feedbackDetails);
    _feedbackDetails[field] = value;
    setFeedbackDetails(_feedbackDetails);

    var _l = Object.assign({}, props.item);
    var _item_user = _l.item_user ? Object.assign({}, _l.item_user) : {};

    if (!_item_user.feedback) {
      _item_user.feedback = Object.assign({}, _feedbackDetails);

      _l._item_user = _item_user;
    }
    props.set("item", _l);
  };

  return (
    <React.Fragment>
      <div style={{ marginBottom: "16px" }}>Please provide feedback.</div>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Stack spacing={3}>
          <ThemeProvider theme={theme}>
            <TextField
              placeholder="Name"
              color="secondary"
              value={feedbackDetails.name}
              onChange={(e) => updateDetails("name", e.target.value)}
            />

            <TextField
              placeholder="Email"
              color="secondary"
              value={feedbackDetails.email}
              onChange={(e) => updateDetails("email", e.target.value)}
            />

            <TextField
              placeholder="Phone"
              color="secondary"
              value={feedbackDetails.phone}
              onChange={(e) => updateDetails("phone", e.target.value)}
            />

            <TextField
              placeholder="Details"
              color="secondary"
              value={feedbackDetails.details}
              onChange={(e) => updateDetails("details", e.target.value)}
            />
          </ThemeProvider>
        </Stack>
      </LocalizationProvider>
    </React.Fragment>
  );
}

export default control(CreateFeedback, ["theme", "menu", "temp"]);
