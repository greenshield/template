import React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import axios from "axios";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material";
import User from "./User";
import Pages from "../../components/Pages";
import Loader from "../../components/Loader";
import { NavLink } from "react-router-dom";
import control from "../../reducers";
import ManageIcon from "@mui/icons-material/ManageAccounts";

const CancelToken = axios.CancelToken;

let source = CancelToken.source();

function Users(props) {
  const theme = useTheme();

  const [search_term, setSearchTerm] = React.useState("");

  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [pagination, setPagination] = React.useState({
    page: 1,
    skip: 0,
    limit: 5,
    max: 5,
  });
  const paginationSearch = async (pagination_settings) => {
    searchUsers(null, pagination_settings);
  };

  const searchUsers = (filter, pagination_settings) => {
    source.cancel("cancelled");
    source = CancelToken.source();

    if (!loading) {
      setLoading(true);
    }

    if (!pagination_settings) {
      pagination_settings = pagination;
    }

    axios
      .post("/remote/users/search", {
        query: {
          search_term: filter && filter === "all" ? "" : search_term,
          page: 0,
          pagination: pagination_settings,
        },
        deleted: true,
      })
      .then((results) => {
        setLoading(false);
        props.set("users", results.data);
        if (filter && filter === "all") {
          setSearchTerm("");
        }
      })
      .catch((err) => {
        if (err && err.message === "cancelled") {
          props.set("alert", {
            open: true,
            severity: "warning",
            message: "previous search replaced",
          });
        } else {
          setLoading(false);
          props.set("alert", {
            open: true,
            severity: "error",
            message: "search error",
          });
        }
      });
  };

  const testSocket = (socket_id) => {
    axios
      .post("/remote/auth/testsocket", { socket: socket_id })
      .catch((err) => {});
  };

  const addUser = () => {
    axios
      .post("/remote/users/create", {
        name: name,
        email: email,
        password: password,
        phone: phone,
        status: "active",
      })
      .then((result) => {
        if (result.data.message === "User added") {
          props.set("alert", {
            open: true,
            severity: "success",
            message: "User added",
          });

          searchUsers();

          setEmail("");
          setName("");
        }
      })
      .catch((err) => {});
  };

  const deleteUser = (_id) => {
    axios
      .post("/remote/users/delete", {
        _id: _id,
      })
      .then((result) => {
        if (result.data.message) {
          searchUsers();

          props.set("alert", {
            open: true,
            severity: result.data.severity,
            message: result.data.message,
          });
        }
      })
      .catch((err) => {});
  };

  const softDeleteUser = (_id) => {
    axios
      .post("/remote/users/soft", {
        _id: _id,
      })
      .then((result) => {
        if (result.data.message) {
          var newUsers = props.users.data.slice();

          var updateUsers = [];

          newUsers.forEach((v, i) => {
            var newUser = v;
            if (v._id.toString() === _id.toString()) {
              newUser.deleted = true;
            }
            updateUsers.push(newUser);
          });

          props.set("users", {
            total: props.users.total,
            data: updateUsers,
          });

          props.set("alert", {
            open: true,
            severity: result.data.severity,
            message: result.data.message,
          });
        }
      })
      .catch((err) => {});
  };

  const updateUser = (_id, user_name, display_name) => {
    axios
      .post("/remote/users/update", {
        _id: _id,
        email: user_name,
        name: display_name,
      })
      .then((result) => {
        if (result.data.status === "updated") {
          var currentUsers = props.users.data.slice();

          var newUsers = [];

          currentUsers.forEach((v, i) => {
            if (v._id.toString() === _id.toString()) {
              v.email = user_name;
              v.name = display_name;
              newUsers.push(v);
            } else {
              newUsers.push(v);
            }
          });

          props.set("users", {
            total: props.users.total,
            data: newUsers.slice(),
          });

          props.set("alert", {
            open: true,
            severity: "success",
            message: "user updated",
          });
        }
      })
      .catch((err) => {});
  };

  var users = props.users;

  if (props.users && props.users.data && props.users.data.length) {
    var userMap = props.users.data.map((v, i) => {
      return (
        <Grid key={"user+" + i} item>
          <User
            testSocket={testSocket}
            user={v}
            updateUser={updateUser}
            users={props.users}
            softDeleteUser={softDeleteUser}
            deleteUser={deleteUser}
          />
        </Grid>
      );
    });
  } else {
    userMap = [];
  }

  var instructions = (
    <div>
      1. Add users to the database with the "Add User" form.
      <br />
      2. Search for users by name or press "Show All" to retrieve a complete
      list.
      <br />
      <br />
    </div>
  );

  return (
    <React.Fragment>
      <Container maxWidth={"xl"}>
        <Grid xs={12} container item spacing={0} flexDirection="column">
          <Grid
            xs={12}
            container
            item
            spacing={2}
            direction={"column"}
            style={{ marginTop: "0px" }}
          >
            <Grid item xs={12} sm={"auto"}>
              <Button
                component={NavLink}
                to="/users/manage"
                variant="contained"
                color="custom"
                fullWidth={props.hooks.isMobile ? true : false}
                startIcon={<ManageIcon />}
              >
                Go To Advanced Management
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md="auto">
                  <TextField
                    sx={{
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
                    fullWidth
                    color="secondary"
                    variant="outlined"
                    value={name}
                    placeholder={"name"}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md="auto">
                  <TextField
                    sx={{
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
                    fullWidth
                    color="secondary"
                    variant="outlined"
                    value={email}
                    placeholder={"email"}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md="auto">
                  <TextField
                    sx={{
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
                    fullWidth
                    color="secondary"
                    variant="outlined"
                    value={phone}
                    placeholder={"phone"}
                    onChange={(e) => {
                      setPhone(e.target.value);
                    }}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md="auto">
                  <TextField
                    sx={{
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
                    fullWidth
                    color="secondary"
                    variant="outlined"
                    value={password}
                    type="password"
                    placeholder={"password"}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md="auto">
                  <Button
                    onClick={() => {
                      addUser();
                    }}
                    fullWidth
                    variant="contained"
                    size="medium"
                    color="success"
                  >
                    Add User
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <TextField
                    sx={{
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
                    color="secondary"
                    variant="outlined"
                    value={search_term}
                    placeholder={"search for users by name"}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
                    size="small"
                  />
                </Grid>
                <Grid item>
                  <Button
                    onClick={() => {
                      searchUsers();
                    }}
                    variant="contained"
                    size="medium"
                    color="info"
                  >
                    Search Users
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid container spacing={2} item xs={12} flexDirection="row">
              <Grid item>
                <Button
                  onClick={() => {
                    searchUsers("all");
                  }}
                  variant="contained"
                  size="medium"
                  color="custom"
                >
                  Show All
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    props.set("users", { data: [], total: 0 });
                  }}
                  variant="contained"
                  size="medium"
                  color="secondary"
                >
                  Clear Results
                </Button>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <div style={{ height: "4px" }}>{loading ? <Loader /> : null}</div>
            </Grid>
            <Grid item xs={12}>
              {instructions}
              {!users ? (
                <Grid container flexDirection="column">
                  Search results will be displayed here.
                </Grid>
              ) : userMap.length ? (
                <Grid container flexDirection="column" spacing={2}>
                  {userMap}
                </Grid>
              ) : (
                <Grid container flexDirection="column">
                  No Matching Users Found
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>

        <div
          style={{
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Pages
            setPagination={setPagination}
            align="left"
            callback={paginationSearch}
            pagination={pagination}
            total={props.users && props.users.total ? props.users.total : 0}
          />
        </div>
      </Container>
    </React.Fragment>
  );
}

export default control(Users, ["user", "alert", "temp", "users", "hooks"]);
