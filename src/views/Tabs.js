import * as React from "react";
import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import { TabContext, TabPanel, TabList } from "@mui/lab";
import { set } from "../reducers";
import { useSelector } from "react-redux";
import Moment from "moment-timezone";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";

export default function ColorTabs(props) {
  var store = {
    user: useSelector((s) => s.user),
    temp: useSelector((s) => s.temp),
    alert: useSelector((s) => s.alert),
    entries: useSelector((s) => s.entries),
  };

  const [value, setValue] = React.useState("documents");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  var deletefile = async (_id) => {
    axios
      .post("/remote/users/deleteentry", {
        _id,
        token: store.user.token,
      })
      .then((results) => {
        set("entries", results.data);
      })
      .catch((e) => null);
  };

  var _entries = {
    documents: [],
    tasks: [],
    viewings: [],
    entry: [],
    notifications: [],
  };

  _entries.documents = store.entries
    .filter((a) => {
      return a.type === "document";
    })
    .map((a, i) => {
      return (
        <Accordion key={i}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            sx={{
              ".Mui-expanded": {
                margin: "12px 0px !important",
              },
            }}
          >
            <Typography>
              {a.description}

              <br />

              {Moment(a.date).format("MM/DD/YYYY hh:mm:ss A")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              justifyContent: "space-between",
              display: "flex",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                props.details(a.ownerEntryId, a.documentId);
              }}
            >
              Open
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                var temp = Object.assign({}, store.temp);
                temp.confirm = {
                  title: "Are you sure?",
                  cancel_text: "No",
                  text: "Do you want to delete this document?",
                  confirm_text: "Yes, Delete",
                  callback_color: "error",
                  callback: () => {
                    deletefile(a._id);
                  },
                };
                set("temp", temp);
              }}
            >
              Delete
            </Button>
          </AccordionDetails>
        </Accordion>
      );
    });

  _entries.tasks = store.entries
    .filter((a) => {
      return a.type === "task";
    })
    .map((a, i) => {
      return (
        <Accordion key={i}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            sx={{
              ".Mui-expanded": {
                margin: "12px 0px !important",
              },
            }}
          >
            <Typography>
              {a.description}

              <br />

              {Moment(a.date).format("MM/DD/YYYY hh:mm:ss A")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              justifyContent: "space-between",
              display: "flex",
            }}
          >
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                var temp = Object.assign({}, store.temp);
                temp.confirm = {
                  title: "Are you sure?",
                  cancel_text: "No",
                  text: "Do you want to delete this task?",
                  confirm_text: "Yes, Delete",
                  callback_color: "error",
                  callback: () => {
                    deletefile(a._id);
                  },
                };
                set("temp", temp);
              }}
            >
              Delete
            </Button>
          </AccordionDetails>
        </Accordion>
      );
    });

  _entries.entry = store.entries
    .filter((a) => {
      return a.type === "entry";
    })
    .map((a, i) => {
      return (
        <Accordion key={i}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            sx={{
              ".Mui-expanded": {
                margin: "12px 0px !important",
              },
            }}
          >
            <Typography>
              {a.description}

              <br />

              {Moment(a.date).format("MM/DD/YYYY hh:mm:ss A")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              justifyContent: "space-between",
              display: "flex",
            }}
          >
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                var temp = Object.assign({}, store.temp);
                temp.confirm = {
                  title: "Are you sure?",
                  cancel_text: "No",
                  text: "Do you want to delete this entry?",
                  confirm_text: "Yes, Delete",
                  callback_color: "error",
                  callback: () => {
                    deletefile(a._id);
                  },
                };
                set("temp", temp);
              }}
            >
              Delete
            </Button>
          </AccordionDetails>
        </Accordion>
      );
    });

  var classes = {
    none: {
      padding: 2,
    },
    tab: {
      //fontSize: 10,
      padding: 0,
      paddingLeft: 1,
      paddingRight: 1,
      minWidth: 0,
    },
  };

  return (
    <Box sx={{ width: "100%" }}>
      <TabContext value={value}>
        <TabList
          sx={{
            "& .MuiTabs-scroller div": {
              justifyContent: "space-between !important",
            },
          }}
          variant="scrollable"
          scrollButtons="auto"
          onChange={handleChange}
          textColor="secondary"
          indicatorColor="secondary"
          aria-label="Entries"
        >
          <Tab value="documents" label="Documents" sx={classes.tab} />
          <Tab value="tasks" label="Tasks" sx={classes.tab} />
          {/*<Tab value="viewings" label="Viewings" sx={classes.tab} />*/}
          <Tab value="entry" label="Entries" sx={classes.tab} />
          {/*<Tab value="notifications" label="Notifications" sx={classes.tab} />*/}
        </TabList>

        <TabPanel value="documents" sx={{ p: 0 }}>
          {_entries.documents.length ? (
            <List sx={{ width: "100%", p: 0, mt: 1 }}>
              {_entries.documents}
            </List>
          ) : (
            <div style={classes.none}>No Documents</div>
          )}
        </TabPanel>
        <TabPanel value="tasks" sx={{ p: 0 }}>
          {_entries.tasks.length ? (
            <List sx={{ width: "100%", p: 0, mt: 1 }}>{_entries.tasks}</List>
          ) : (
            <div style={classes.none}>No Tasks</div>
          )}
        </TabPanel>

        <TabPanel value="entry" sx={{ p: 0 }}>
          {_entries.entry.length ? (
            <List sx={{ width: "100%", p: 0, mt: 1 }}>{_entries.entry}</List>
          ) : (
            <div style={classes.none}>No Entries</div>
          )}
        </TabPanel>
      </TabContext>
    </Box>
  );
}
