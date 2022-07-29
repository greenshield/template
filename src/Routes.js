import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./views/Home";
import Entries from "./views/Entries";
import UserViews from "./views/users/Users";
import Auth from "./modules/Auth";
//import Map from "./modules/Map";
import Maps from "./modules/Maps";
import { useSelector } from "react-redux";
import Manage from "./modules/User/Manage";
import Files from "./modules/Files/Manage";
import Upload from "./components/Upload";
import Drop from "./components/Drop";
//import Uploader from "./modules/Files/Uploader";
import Checkout from "./modules/Payment/Payment";
import Choose from "./modules/Payment/Choose";
import { useNavigate } from "react-router-dom";
import Steps from "./modules/Steps";
import Sell from "./modules/Sell";

function Routing(props) {
  const navigate = useNavigate();
  React.useEffect(() => {
    window.ReactNativeWebView.postMessage('{"action":"unsplash"}');

    window.doRoute = (web_url) => {
      navigate(web_url);
      window.ReactNativeWebView.postMessage('{"action":"loaded"}');
    };
  }, [navigate]);

  var store = {
    user: useSelector((s) => s.user),
  };

  return (
    <React.Fragment>
      <Routes>
        {store.user && store.user.admin ? (
          <Route path="/" element={<Home />} />
        ) : store.user ? (
          <Route path="/" element={<Home />} />
        ) : (
          <Route path="/" index exact element={<Home />} />
        )}

        <Route path="/account" index exact element={<Home />} />

        {store.user ? (
          <Route path="/entries" index exact element={<Entries />} />
        ) : (
          <Route path="/entries" index exact element={<Navigate to="/" />} />
        )}

        {store.user ? (
          <Route
            path="/favorites"
            index
            exact
            element={<Navigate to="/search" />}
          />
        ) : (
          <Route path="/favorites" index exact element={<Navigate to="/" />} />
        )}

        {store.user ? (
          <React.Fragment>
            <Route path="/users" index exact element={<UserViews />} />
            <Route path="/users/manage" index exact element={<Manage />} />
            <Route path="/files/manage" index exact element={<Files />} />
            <Route
              path="/payment/checkout"
              index
              exact
              element={<Checkout />}
            />
            <Route path="/payment/choose" index exact element={<Choose />} />
          </React.Fragment>
        ) : null}
        {/*
        <Route path="/manage/drop" index exact element={<Drop />} />
        <Route path="/manage/upload" index exact element={<Upload />} />
        <Route path="/manage/uploader" index exact element={<Uploader />} />
*/}
        <Route path="/manage/drop" index exact element={<Drop />} />
        <Route path="/manage/upload" index exact element={<Upload />} />

        <Route path="/steps/*" index element={<Steps />} />

        <Route path="/sell/*" index element={<Sell />} />

        <Route path="/auth/*" index element={<Auth />} />
        <Route
          path="/search/*"
          index
          element={<Maps offset={props.offset} />}
        />

        <Route
          path="/item/:ItemId/*"
          index
          element={<Maps offset={props.offset} />}
        />
        <Route
          path="/item/:ItemId/*"
          index
          element={<Maps offset={props.offset} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Fragment>
  );
}

export default Routing;
