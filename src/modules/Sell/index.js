import * as React from "react";
import { Route, Routes } from "react-router-dom";
import control from "../../reducers";
import Sell from "./Sell";
import Container from "@mui/material/Container";
//import { useNavigate } from "react-router-dom";
import axios from "axios";

function Primary(props) {
  var { sell } = props;

  //const navigate = useNavigate();

  var submit = (e) => {
    e.preventDefault();

    if (sell.password !== sell.confirm_password) {
      props.set("alert", {
        open: true,
        severity: "error",
        message: "Passwords do not match",
      });

      return false;
    }

    axios
      .post("/remote/auth/signup", {
        email: sell.email,
        password: sell.password,
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

          var _sell = Object.assign({}, sell);
          _sell.email = "";
          _sell.password = "";
          _sell.confirm_password = "";
          props.set("sell", _sell);
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
          path={`/`}
          element={
            props.user.selling ? (
              <Sell submit={submit} update={update} />
            ) : (
              <Sell submit={submit} update={update} />
            )
          }
        />
      </Routes>
    </Container>
  );
}

export default control(Primary, ["theme", "menu", "temp", "sell", "user"]);
