import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import SignUp from "./SignUp";
import Address from "./Address";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import terms from "./Terms";
import { set } from "../../reducers";

export default function VerticalLinearStepper(props) {
  const navigate = useNavigate();

  var store = {
    user: useSelector((s) => s.user),
    temp: useSelector((s) => s.temp),
    alert: useSelector((s) => s.alert),
    steps: useSelector((s) => s.steps),
  };

  React.useEffect(() => {
    if (store.user && store.user.terms) {
      navigate("/account");
    }
  }, [store.user, navigate]);

  const steps = [
    {
      label: "Sign Up Information",
      description: <SignUp compact={true} submit={props.submit} />,
      nextText: store.user ? "Continue" : "Sign Up & Continue",
    },
    {
      label: "Your Address",
      description: <Address />,
    },
    {
      label: "Agree To Terms",
      description: (
        <div style={{ height: "200px", overflowY: "auto" }}>{terms}</div>
      ),
    },
  ];

  const [activeStep, setActiveStep] = React.useState(store.user ? 1 : 0);

  const handleNext = async (e) => {
    if (!store.user && activeStep === 0) {
      await props.submit(e);
    }

    if (activeStep === 1) {
      await props.update({
        address: {
          address1: store.steps.address1,
          address2: store.steps.address2,
          city: store.steps.city,
          state: store.steps.state,
          zipcode: store.steps.zipcode,
        },
      });
      var _user = Object.assign({}, store.user);
      _user.address = {
        address1: store.steps.address1,
        address2: store.steps.address2,
        city: store.steps.city,
        state: store.steps.state,
        zipcode: store.steps.zipcode,
      };
      set("user", _user);
    }

    if (activeStep === 2) {
      await props.update({
        terms: true,
      });
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={
                index === 2 ? (
                  <Typography variant="caption">Final Step</Typography>
                ) : null
              }
            >
              {step.label}
            </StepLabel>
            <StepContent>
              {step.description}
              <Box sx={{ mb: 2 }}>
                <div>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                    disabled={
                      !store.user &&
                      (!store.steps.email ||
                        !store.steps.password ||
                        !store.steps.confirm_password)
                    }
                  >
                    {index === steps.length - 1
                      ? "Finish"
                      : step.nextText
                      ? step.nextText
                      : "Continue"}
                  </Button>
                  {index > 0 && (index !== 1 || !store.user) ? (
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
                  ) : null}
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>You're all done!</Typography>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              window.ReactNativeWebView.postMessage('{"action":"wallet"}');
            }}
            sx={{ mt: 1, mr: 1 }}
          >
            Open Wallet
          </Button>
        </Paper>
      )}
    </Box>
  );
}
