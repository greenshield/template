import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Drop from "../../components/Drop";
import Address from "./Address";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { set } from "../../reducers";

export default function VerticalLinearStepper(props) {
  const navigate = useNavigate();
  const [preview, setPreview] = React.useState(null);

  var store = {
    user: useSelector((s) => s.user),
    temp: useSelector((s) => s.temp),
    alert: useSelector((s) => s.alert),
    sell: useSelector((s) => s.sell),
  };

  React.useEffect(() => {
    if (store.user.sell_address) {
      set("sell", store.user.sell_address);
    }
  }, [store.user, navigate]);

  const sell = [
    {
      label: "Item Address",
      description: <Address />,
    },
    {
      label: "Photos",
      description: (
        <Drop
          compact={true}
          submit={props.submit}
          max={store.user.selling ? null : 1}
          message={
            store.user.selling
              ? "Tap here to choose photos"
              : "Tap here to choose a photo"
          }
          setPreview={setPreview}
        />
      ),
      nextText: store.user ? "Continue" : "Continue",
    },

    {
      label: "Review And Save",
      description: (
        <Grid container>
          <Grid item xs={12}>
            {store.sell.address1 ? store.sell.address1 : null}
          </Grid>
          <Grid item xs={12}>
            {store.sell.address2 ? store.sell.address2 : null}
          </Grid>
          <Grid item xs={12}>
            {store.sell.city ? store.sell.city : null}
            {store.sell.city && store.sell.state ? "," : ""}{" "}
            {store.sell.state ? store.sell.state : null}
            {"  "}
            {store.sell.zipcode ? store.sell.zipcode : null}
          </Grid>

          {preview ? (
            <Grid item xs={12}>
              <img
                alt="preview"
                src={preview.thumb_path}
                style={{ width: "100%" }}
              />
            </Grid>
          ) : null}
        </Grid>
      ),
    },
  ];

  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = async (e) => {
    if (!store.user && activeStep === 0) {
      await props.submit(e);
    }

    if (activeStep === 0) {
    }

    if (activeStep === 2) {
      //save here

      await props.update({
        selling: true,
        sell_address: {
          address1: store.sell.address1,
          address2: store.sell.address2,
          city: store.sell.city,
          state: store.sell.state,
          zipcode: store.sell.zipcode,
        },
      });
      var _user = Object.assign({}, store.user);
      _user.sell_address = {
        address1: store.sell.address1,
        address2: store.sell.address2,
        city: store.sell.city,
        state: store.sell.state,
        zipcode: store.sell.zipcode,
      };
      set("user", _user);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {sell.map((step, index) => (
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
                  >
                    {index === sell.length - 1
                      ? "Save Item"
                      : step.nextText
                      ? step.nextText
                      : "Continue"}
                  </Button>
                  {index > 0 ? (
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
      {activeStep === sell.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>
            Your item is saved! You can now edit your item by tapping the "My
            Items" option in the menu.
          </Typography>
          {!store.user.company_price ? (
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                navigate("/payment/choose");
              }}
              sx={{ mt: 1, mr: 1 }}
            >
              Choose Company Now
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                setActiveStep(0);
              }}
              sx={{ mt: 1, mr: 1 }}
            >
              Edit My Item
            </Button>
          )}
        </Paper>
      )}
    </Box>
  );
}
