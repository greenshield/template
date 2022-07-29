import * as React from "react";
import control, { set } from "../../reducers";
import { PaymentElement } from "@stripe/react-stripe-js";
import axios from "axios";
import LoadingButton from "@mui/lab/LoadingButton";
import { useElements, useStripe } from "@stripe/react-stripe-js";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";

function Checkout(props) {
  const [disabled, setDisabled] = React.useState(true);
  const [succeeded] = React.useState(false);
  const [processing] = React.useState("");

  const [saving, setSaving] = React.useState(false);

  const elements = useElements();

  var stripe = useStripe();

  const navigate = useNavigate();

  const handleChange = async () => {
    setDisabled(false);
  };

  var handleResult = (payment) => {
    axios
      .post("/remote/upgrade", {
        company_price: props.company.price,
        token: props.user.token,
        payment: payment.paymentIntent,
      })
      .then((charged) => {
        var user = Object.assign({}, props.user, {
          upgraded: true,
          company_price: props.company.price,
        });

        set("user", user);

        setSaving(false);

        set("alert", {
          open: true,
          severity: "success",
          message: "Subscription Created",
        });

        navigate("/account");
      })
      .catch((err) => {
        setSaving(false);
      });
  };

  var handleSubmit = async (evt) => {
    evt.preventDefault();

    if (saving) {
      return false;
    }

    setSaving(true);

    if (stripe) {
      //stripe.createToken(cardElement).then(handleResult)

      stripe
        .confirmPayment({
          elements,
          redirect: "if_required",
        })
        .then(function (result) {
          if (result.error) {
            // Display error.message in your UI.

            props.setAlert({
              open: true,
              severity: "error",
              message: "Invalid Payment Method",
            });

            setSaving(false);
          } else {
            // The SetupIntent was successful!
            handleResult(result);
          }
        });
    } else {
      console.log("Stripe.js hasn't loaded yet.");
    }
  };

  return (
    <form>
      <PaymentElement onReady={handleChange} />
      <LoadingButton
        fullWidth
        variant="contained"
        disabled={processing || disabled || succeeded || saving}
        onClick={handleSubmit}
        loading={saving}
        loadingPosition="start"
        startIcon={<LockOutlinedIcon />}
      >
        {saving ? "Processing" : "Subscribe"}
      </LoadingButton>
    </form>
  );
}

export default control(Checkout, [
  "user",
  "theme",
  "menu",
  "temp",
  "hooks",
  "company",
]);
