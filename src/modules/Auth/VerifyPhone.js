import React, { useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import axios from "axios";
import control from "../../reducers";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

function Verify(props) {
  const navigate = useNavigate();
  const params = useParams();
  const [verifyToken] = React.useState(params.verifyPhoneToken);

  const { action, user, temp } = props;

  useEffect(() => {
    var loadUser = () => {
      if (!user || user) {
        axios
          .post("/remote/auth/verifyphone", {
            verifyToken: verifyToken,
            removeToken: false,
          })
          .then((result) => {
            if (result.data.error) {
              action("alert", {
                open: true,
                severity: "error",
                message: result.data.error,
              });

              //navigate("signout");
            } else {
              if (!user || result.data.token !== user.token) {
                action("user", result.data);
              }

              var _temp = Object.assign({}, temp, {
                verified: true,
              });

              action("temp", _temp);

              navigate("/auth/verified");
              action("alert", {
                open: true,
                severity: "success",
                message: "Account Verified",
              });
            }
          });
      }
    };

    loadUser();
  }, [action, navigate, user, temp, verifyToken]);

  return props.user ? null : (
    <Container component="main" maxWidth="xs" disableGutters>
      <CssBaseline />
      <div
        sx={{
          marginTop: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ marginTop: "8px" }}>
          <Typography component="h1" variant="h5" align="center">
            Verifying...
          </Typography>
        </div>
      </div>
    </Container>
  );
}

export default control(Verify, ["user", "alert", "temp"]);
