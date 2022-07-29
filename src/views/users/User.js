import React from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteForever";
import SoftDeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import SocketIcon from "@mui/icons-material/Power";
import control from "../../reducers";

function User(props) {
  const theme = useTheme();

  const [email, setEmail] = React.useState(
    props.user.email ? props.user.email : ""
  );
  const [name, setName] = React.useState(
    props.user.name ? props.user.name : ""
  );

  React.useEffect(() => {
    setEmail(props.user.email ? props.user.email : "");

    setName(props.user.name ? props.user.name : "");
  }, [props.users, props.user]);

  return (
    <React.Fragment>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <TextField
            sx={
              props.user.deleted
                ? {}
                : {
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
                  }
            }
            color="secondary"
            variant="outlined"
            value={email}
            placeholder={"email"}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            size="small"
            disabled={props.user.deleted}
          />
        </Grid>
        <Grid item>
          <TextField
            sx={
              props.user.deleted
                ? {}
                : {
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
                  }
            }
            color="secondary"
            variant="outlined"
            value={name}
            placeholder={"name"}
            onChange={(e) => {
              setName(e.target.value);
            }}
            size="small"
            disabled={props.user.deleted}
          />
        </Grid>
        <Grid item xs={12} sm={"auto"}>
          <Button
            onClick={() => {
              props.updateUser(props.user._id, email, name);
            }}
            fullWidth
            variant="contained"
            size="medium"
            color="success"
            disabled={props.user.deleted}
            startIcon={<SaveIcon />}
          >
            Update User
          </Button>
        </Grid>
        <Grid item xs={12} sm={"auto"}>
          <Button
            onClick={() => {
              var temp = Object.assign({}, props.temp);
              temp.confirm = {
                title: "Are you sure?",
                cancel_text: "No, Cancel",
                confirm_text: "Yes, Delete",
                callback_color: "warning",
                text: "Do you want to soft delete this user?",
                callback: () => {
                  props.softDeleteUser(props.user._id.toString());
                },
              };
              props.set("temp", temp);
            }}
            fullWidth
            variant="contained"
            startIcon={<SoftDeleteIcon />}
            color="warning"
            size="medium"
            disabled={props.user.deleted}
          >
            Soft Delete
          </Button>
        </Grid>
        <Grid item xs={12} sm={"auto"}>
          <Button
            onClick={() => {
              var temp = Object.assign({}, props.temp);
              temp.confirm = {
                title: "Are you sure?",
                cancel_text: "No, Cancel",
                confirm_text: "Yes, Delete",
                callback_color: "error",
                text: "Do you want to delete this user?",
                callback: () => {
                  props.deleteUser(props.user._id.toString());
                },
              };
              props.set("temp", temp);
            }}
            fullWidth
            variant="contained"
            startIcon={<DeleteIcon />}
            color="error"
            size="medium"
          >
            Full Delete
          </Button>
        </Grid>
        {props.user.socket_id ? (
          <Grid item xs={12} sm={"auto"}>
            <Button
              color="info"
              fullWidth
              variant="contained"
              startIcon={<SocketIcon />}
              onClick={() => {
                props.testSocket(props.user.socket_id);
              }}
            >
              Test Socket
            </Button>
          </Grid>
        ) : null}
      </Grid>
    </React.Fragment>
  );
}

export default control(User, ["temp"]);
