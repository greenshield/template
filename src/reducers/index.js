import { configureStore, applyMiddleware } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import { connect } from "react-redux";
import reducers from "./schema";

var r = {};
Object.keys(reducers).forEach((v, i) => {
  r[v] = reducers[v].reducer;
});

var a = {};
Object.keys(reducers).forEach((v, i) => {
  a[v] = reducers[v].action;
});
const control = (key) => {
  if (key === "keyMap") {
    return keyMap;
  }

  if (key === "props") {
    return props;
  }

  if (key === "wrap") {
    return wrap;
  }

  if (key === "dispatcher") {
    return dispatcher;
  }

  return reducers[key].action;
};

export const actions = (key) => {
  return reducers[key].actions;
};

export const keyMap = (keys, state) => {
  var s = {};
  keys.forEach((k, i) => {
    s[k] = state[k];
  });
  return s;
};

export const wrap = (obj, keys) => {
  return connect((state) => {
    return control("props")(state, keys);
  }, control("dispatcher"))(obj);
};

export const props = (state, keys) => {
  return keyMap(keys, state);
};

export const set = async (type, payload) => {
  store.dispatch(control(type)(payload));
};

export const get = (type) => {
  return store.getState()[type];
};

export const dispatcher = (dispatch) => ({
  action: (key, value) => dispatch(control(key)(value)),
  set: async (key, value) => dispatch(control(key)(value)),
  get: (key) => store.getState()[key],
  actions: (key, value, trigger) => dispatch(actions(key)[trigger](value)),
  callback: (key, value, callback) => {
    dispatch((dispatch) => {
      callback(dispatch(control(key)(value))[key], true);
    });
  },
});

export const store = configureStore(
  {
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types
          ignoredActions: ["SET_TEMP"],
          // Ignore these field paths in all actions
          ignoredActionPaths: ["callback", "alt_callback"],
          // Ignore these paths in the state
          ignoredPaths: ["temp.confirm"],
        },
      }),
    reducer: r,
  },
  applyMiddleware(thunk)
);

export default wrap;
