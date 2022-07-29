import React, { useState } from "react";
import Container from "@mui/material/Container";
import LockOutlinedIcon from "@mui/icons-material/LockTwoTone";
import Typography from "@mui/material/Typography";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import control from "../../reducers";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";

function Verified(props) {
  const navigate = useNavigate();

  const theme = useTheme();

  const [verified] = useState(props.temp.verified);

  React.useEffect(() => {
    if (verified) {
    } else {
      navigate("/");
    }
  }, [verified, navigate]);

  return (
    <Container component="main" maxWidth="xs">
      <Grid
        container
        justifyContent="center"
        direction="row"
        alignItems="center"
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: theme.spacing(3),
        }}
      >
        <LockOutlinedIcon
          fontSize="large"
          color="primary"
          style={{ marginRight: "8px" }}
        />

        <Typography component="h1" variant="h5">
          Account {verified === true ? "VERIFIED" : "NOT VERIFIED"}
        </Typography>
      </Grid>

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
          <div style={{ marginTop: "16px" }}>
            <Typography align="center">
              <Button
                component={Link}
                to="/"
                variant="contained"
                color="primary"
                type="submit"
              >
                Go to dashboard
              </Button>
            </Typography>
          </div>
        </div>
      </Container>
    </Container>
  );
}

export default control(Verified, ["user", "alert", "temp"]);
