import * as React from "react";
import axios from "axios";
import control from "../reducers";
import { useNavigate } from "react-router-dom";
import { useMatch } from "react-router-dom";

function Auth(props) {
  const navigate = useNavigate();

  let resetToken = useMatch("/auth/reset/:resetToken")?.params?.resetToken;

  const { action, user, temp, auth } = props;

  React.useEffect(() => {
    const load = (token) => {
      if (resetToken && temp.user) {
        return false;
      }

      if (!resetToken && auth.failed) {
        return false;
      }

      axios
        .post("/remote/auth/load", {
          token: token,
          resetToken: resetToken,
        })
        .then(async (result) => {
          if (result.data) {
            if (result.data.status === "signedout") {
              action(
                "auth",
                Object.assign({}, auth, { checked: true, failed: true })
              );
              action("user", null);

              localStorage.removeItem("token");
              localStorage.removeItem("mode");

              action("alert", {
                open: true,
                severity: "error",
                message: result.data.message,
              });
              return false;
            }

            if (result.data.status === "error") {
              action("auth", Object.assign({}, auth, { checked: true }));
              action("user", null);

              action("alert", {
                open: true,
                severity: "error",
                message: result.data.message,
              });
              return false;
            }

            var user = result.data;

            if (user.status) {
              if (resetToken) {
                var _temp = Object.assign({}, temp);
                _temp.user = user;
                action("temp", _temp);
                if (result.data.mode) {
                  action("theme", result.data.mode);
                }

                var storedToken = localStorage.getItem("token");

                if (storedToken && storedToken === result.data.token) {
                  action("user", result.data);
                }
              } else {
                action("auth", Object.assign({}, auth, { checked: true }));

                action("user", result.data);

                if (user.mode) {
                  action("theme", result.data.mode);
                }

                //navigate("/");
              }
            } else {
              action("alert", {
                open: true,
                severity: "error",
                message: "Invalid credentials",
              });
            }
          } else {
            action("alert", {
              open: true,
              severity: "error",
              message: "Invalid credentials",
            });
          }
        })
        .catch((err) => {
          if (!auth.checked) {
            action(
              "auth",
              Object.assign({}, auth, { checked: true, failed: true })
            );
          }
          action("alert", {
            open: true,
            severity: "error",
            message: `That action can't be performed right now`,
          });
        });
    };

    var t = localStorage.getItem("token");

    if ((t && !user) || resetToken) {
      load(t);
    } else {
      if (!auth.checked) {
        action("auth", Object.assign({}, auth, { checked: true }));
      }
    }
  }, [navigate, action, user, resetToken, temp, auth]);

  return <React.Fragment></React.Fragment>;
}

export default control(Auth, [
  "theme",
  "menu",
  "alert",
  "user",
  "temp",
  "auth",
]);
