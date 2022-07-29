import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { HashRouter as BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./reducers";
import { createBrowserHistory } from "history";

export const history = createBrowserHistory();

const root = ReactDOM.createRoot(document.getElementById("root"));

if (!window.ReactNativeWebView) {
  window.ReactNativeWebView = {};
  window.ReactNativeWebView.postMessage = (message, obj) => {
    return true;
  };
}

root.render(
  <BrowserRouter history={history}>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
);
