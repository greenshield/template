import * as React from "react";
import { Route, Routes } from "react-router-dom";
import control from "../../reducers";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Change from "./Change";
import Forgot from "./Forgot";
import Reset from "./Reset";
import Verify from "./Verify";
import VerifyPhone from "./VerifyPhone";
import Update from "./Update";
import Verified from "./Verified";
import Address from "./Address";
import Container from "@mui/material/Container";

function Auth(props) {
  return (
    <Container maxWidth="xl">
      <Routes>
        <Route path={`/`} exact element={<SignIn />} />
        <Route path={`/signup`} element={<SignUp />} />
        <Route path={`/change`} element={<Change />} />
        <Route path={`/forgot`} element={<Forgot />} />
        <Route path={`/update`} element={<Update />} />
        <Route path={`/address`} element={<Address />} />
        <Route path={`/reset/:resetToken`} element={<Reset />} />
        <Route path={`/verified`} element={<Verified />} />
        <Route path={`/verify/:verifyToken`} element={<Verify />} />
        <Route
          path={`/verifyphone/:verifyPhoneToken`}
          element={<VerifyPhone />}
        />
      </Routes>
    </Container>
  );
}

export default control(Auth, ["theme", "menu", "temp"]);
