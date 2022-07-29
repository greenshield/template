import React from "react";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material";
import TextField from "@mui/material/TextField";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import Typography from "@mui/material/Typography";
import { Container, Grid } from "@mui/material";
import axios from "axios";
import control from "../../reducers";

function Update(props) {
  const theme = useTheme();
  const [token] = React.useState(localStorage.getItem("token") || null);
  const [email, setEmail] = React.useState("");

  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [emailCode, setEmailCode] = React.useState("");

  const [hideVerifyPhone, setHideVerifyPhone] = React.useState("");
  const [hideVerifyEmail, setHideVerifyEmail] = React.useState("");

  var user_email = props.user ? (props.user.email ? props.user.email : "") : "";
  var user_phone = props.user
    ? props.user.phone_number
      ? props.user.phone_number
      : ""
    : "";

  React.useEffect(() => {
    setEmail(user_email);
  }, [user_email]);

  React.useEffect(() => {
    setPhone(user_phone);
  }, [user_phone]);

  var submitChange = (e) => {
    e.preventDefault();
    axios
      .post("/remote/auth/update", {
        token: token,
        email: email,
        phone_number: phone,
      })
      .then((result) => {
        if (result.data.severity === "success") {
          var user = Object.assign({}, props.user, {
            email: email,

            phone_number: phone,
          });

          props.set("user", user);
          setHideVerifyPhone(false);
          setHideVerifyEmail(false);
        }

        props.set("alert", {
          open: true,
          severity: result.data.severity,
          message: result.data.message,
        });
      });
  };

  var reVerify = (field) => {
    axios
      .post("/remote/auth/reverify", {
        token: token,
        field: field,
      })
      .then((result) => {
        props.set("alert", {
          open: true,
          severity: result.data.severity,
          message: result.data.message,
        });
      });
  };

  var verifyPhone = (field) => {
    axios
      .post("/remote/auth/verifycode", {
        token: token,
        code: code,
        removeToken: true,
        field: field,
      })
      .then((result) => {
        if (!result.data.message) {
          var user = Object.assign({}, props.user, {
            verified_phone: true,
            verified_phone_token_link: result.data.verified_phone_token_link,
            verified_phone_token: result.data.verified_phone_token,
          });

          props.set("user", user);

          props.set("alert", {
            open: true,
            severity: "success",
            message: "Phone Number Verified",
          });
        } else {
          props.set("alert", {
            open: true,
            severity: result.data.severity,
            message: result.data.message,
          });
        }
      });
  };

  var verifyEmail = (field) => {
    axios
      .post("/remote/auth/verifyemailcode", {
        token: token,
        code: emailCode,
        removeToken: true,
        field: field,
      })
      .then((result) => {
        if (!result.data.message) {
          var user = Object.assign({}, props.user, {
            verified_email: true,
            verified_phone_token_link: result.data.verified_email_token_link,
            verified_phone_token: result.data.verified_email_token,
          });

          props.set("user", user);

          props.set("alert", {
            open: true,
            severity: "success",
            message: "Email Verified",
          });
        } else {
          props.set("alert", {
            open: true,
            severity: result.data.severity,
            message: result.data.message,
          });
        }
      });
  };

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
        <AccountBoxIcon
          fontSize="large"
          color="primary"
          style={{ marginRight: "8px" }}
        />

        <Typography component="h1" variant="h5">
          Edit Credentials
        </Typography>
      </Grid>

      <form style={{ width: "100%" }} noValidate onSubmit={submitChange}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          placeholder="Email Address"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            if (e.target.value !== user_email) {
              setHideVerifyEmail(true);
            } else {
              setHideVerifyEmail(false);
            }

            setEmail(e.target.value);
          }}
        />

        {props.user &&
        props.user.email &&
        !props.user.verified_email &&
        !hideVerifyEmail ? (
          <React.Fragment>
            <Grid
              container
              alignItems="center"
              spacing={1}
              style={{ marginBottom: "8px" }}
            >
              <Grid item xs={6}>
                <Typography variant="caption">Not Verified</Typography>
              </Grid>

              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    reVerify("email");
                  }}
                >
                  Send Code
                </Button>
              </Grid>
            </Grid>

            <Grid container alignItems="center" spacing={1}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="Verification Code"
                  value={emailCode}
                  onChange={(e) => {
                    setEmailCode(e.target.value);
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    verifyEmail("email");
                  }}
                >
                  Verify
                </Button>
              </Grid>
            </Grid>
          </React.Fragment>
        ) : null}

        <Grid
          container
          sx={{
            mt:
              props.user &&
              props.user.email &&
              !props.user.verified_email &&
              !hideVerifyEmail
                ? theme.spacing(2)
                : 0,
          }}
        >
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            id="phone"
            placeholder="Phone Number"
            name="phone"
            autoComplete="phone"
            value={phone}
            onChange={(e) => {
              if (e.target.value !== user_phone) {
                setHideVerifyPhone(true);
              } else {
                setHideVerifyPhone(false);
              }

              setPhone(e.target.value);
            }}
          />

          {props.user &&
          props.user.phone_number &&
          !props.user.verified_phone &&
          !hideVerifyPhone ? (
            <React.Fragment>
              <Grid
                container
                alignItems="center"
                spacing={1}
                style={{ marginBottom: "8px" }}
              >
                <Grid item xs={6}>
                  <Typography variant="caption" component="p">
                    Not Verified
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      reVerify("phone_number");
                    }}
                  >
                    Send Code
                  </Button>
                </Grid>
              </Grid>
              <Grid container alignItems="center" spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Verification Code"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      verifyPhone("phone");
                    }}
                  >
                    Verify
                  </Button>
                </Grid>
              </Grid>
            </React.Fragment>
          ) : null}
        </Grid>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{
            m: 2,
            ml: 0,
            mr: 0,
          }}
        >
          Save Credentials
        </Button>
      </form>
    </Container>
  );
}

export default control(Update, ["user", "alert", "temp"]);
