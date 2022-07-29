import * as React from "react";
import { Route, Routes } from "react-router-dom";
import control from "../../reducers";
import Default from "./Default";

import Container from "@mui/material/Container";
//import { useNavigate } from "react-router-dom";
import axios from "axios";

function Steps(props) {
  var { steps } = props;

  //const navigate = useNavigate();

  var submit = (e) => {
    e.preventDefault();

    if (steps.password !== steps.confirm_password) {
      props.set("alert", {
        open: true,
        severity: "error",
        message: "Passwords do not match",
      });

      return false;
    }

    axios
      .post("/remote/auth/signup", {
        email: steps.email,
        password: steps.password,
      })
      .then((result) => {
        if (result.data && result.data.error) {
          props.set("alert", {
            open: true,
            severity: "error",
            message: result.data.error,
          });
        } else if (result.data) {
          var user = result.data;

          props.set("user", result.data);

          if (user.mode) {
            props.set("theme", result.data.mode);
          }

          var _steps = Object.assign({}, steps);
          _steps.email = "";
          _steps.password = "";
          _steps.confirm_password = "";
          props.set("steps", _steps);
        } else {
          props.set("alert", {
            open: true,
            severity: "error",
            message: "Invalid credentials",
          });
        }
      })
      .catch((err) => {
        props.set("alert", {
          open: true,
          severity: "error",
          message: `That action can't be performed right now`,
        });
      });
  };

  var update = (updates) => {
    axios
      .post("/remote/users/modify", {
        token: props.user.token,
        updates: updates,
      })
      .then((result) => {
        if (result.data && result.data.error) {
          props.set("alert", {
            open: true,
            severity: "error",
            message: result.data.error,
          });
        } else if (result.data) {
        }
      })
      .catch((err) => {
        props.set("alert", {
          open: true,
          severity: "error",
          message: `That action can't be performed right now`,
        });
      });
  };

  return (
    <Container maxWidth="xs">
      <Routes>
        <Route
          path={`/default`}
          element={<Default submit={submit} update={update} />}
        />
      </Routes>
    </Container>
  );
}

export default control(Steps, ["theme", "menu", "temp", "steps", "user"]);
