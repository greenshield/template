import * as React from "react";
import control from "../../reducers";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Container } from "@mui/material";
import CheckoutForm from "./CheckoutForm";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISH);

function Checkout(props) {
  //const token = props.user.token;

  const [intent, setIntent] = React.useState(null);

  const navigate = useNavigate();

  React.useEffect(() => {
    if (!props.company || !props.company.price) {
      navigate("/payment/choose");
      return;
    }

    const getIntent = () => {
      axios
        .post("/remote/intent", {
          token: props.user.token,
          priceId: props.company.price,
        })
        .then((intent) => {
          //console.log(intent.data);
          setIntent(intent.data);
        });
    };

    getIntent();
  }, [props.company, props.user.token, navigate]);
  const options = {
    // passing the client secret obtained from the server
    clientSecret: intent && intent.clientSecret ? intent.clientSecret : null,
    loader: "always",
  };

  var formatter = (amount) => {
    var converter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });

    return converter.format(amount);
  };

  return (
    <Container sx={{ padding: 2 }} maxWidth="xs">
      {props.company?.name}
      <br />
      Amount: <strong>{formatter(props.company?.plan.amount / 100)}</strong>
      {!options.clientSecret ? (
        <div style={{ marginTop: "8px" }}>
          <Box sx={{ width: "100%" }}>
            Loading secure payment form...
            <LinearProgress />
          </Box>
        </div>
      ) : null}
      {options.clientSecret ? (
        <div style={{ marginTop: "8px" }}>
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm clientSecret={options.clientSecret} />
          </Elements>
        </div>
      ) : null}
    </Container>
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
