import * as React from "react";
import control from "../../reducers";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";

let stripePromise;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISH);
  }

  return stripePromise;
};

function Checkout(props) {
  const [stripe, setStripe] = React.useState(null);

  var load = async () => {
    const load_stripe = await getStripe();
    setStripe(load_stripe);
  };

  const token = props.user.token;
  React.useEffect(() => {
    var loader = async () => {
      var res = await axios.post("/remote/create-checkout-session", {
        token: token,
      });

      console.log(res.data.url);
      console.log(stripe);
      stripe.redirectToCheckout({ sessionId: res.data.id });
    };
    if (stripe) {
      loader();
    } else {
      load();
    }
  }, [token, stripe]);

  return <React.Fragment></React.Fragment>;
}

export default control(Checkout, ["user", "theme", "menu", "temp", "hooks"]);
