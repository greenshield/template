/*
//set
props.set("temp", "hello world")

//thunk set with callback
props.callback("temp", { callback: "tried" }, (cb) => {
console.log(cb);
});

//custom action "test"
props.actions("temp", "hello world", "test")
*/

import Moment from "moment-timezone";

const schema = {
  temp: {
    reducer: (state = {}, action) => {
      switch (action.type) {
        case "SET_TEMP":
          return action.temp;
        case "TEST_TEMP":
          return Object.assign({}, state, {
            test: action.text,
          });
        default:
          return state;
      }
    },
    action: (temp) => ({
      type: "SET_TEMP",
      temp,
    }),
    actions: {
      test: (temp) => ({
        type: "TEST_TEMP",
        text: temp,
      }),
    },
  },
  mem: {
    reducer: (state = {}, action) => {
      switch (action.type) {
        case "SET_MEM":
          return action.mem;
        case "TEST_MEM":
          return Object.assign({}, state, {
            test: action.text,
          });
        default:
          return state;
      }
    },
    action: (mem) => ({
      type: "SET_MEM",
      mem,
    }),
  },
  users: {
    reducer: (state = { data: [], total: 0 }, action) => {
      switch (action.type) {
        case "SET_USERS":
          return action.users;
        default:
          return state;
      }
    },
    action: (users) => ({
      type: "SET_USERS",
      users,
    }),
  },
  menu: {
    reducer: (state = false, action) => {
      switch (action.type) {
        case "SET_MENU":
          return action.menu;
        default:
          return state;
      }
    },
    action: (menu) => {
      return {
        type: "SET_MENU",
        menu,
      };
    },
  },
  small: {
    reducer: (state = true, action) => {
      switch (action.type) {
        case "SET_SMALL":
          return action.small;
        default:
          return state;
      }
    },
    action: (small) => {
      return {
        type: "SET_SMALL",
        small,
      };
    },
  },
  test: {
    reducer: (state = false, action) => {
      switch (action.type) {
        case "SET_TEST":
          return action.test;
        default:
          return state;
      }
    },
    action: (test) => {
      return {
        type: "SET_TEST",
        test,
      };
    },
  },
  theme: {
    reducer: (
      state = localStorage.getItem("mode")
        ? localStorage.getItem("mode")
        : "light",
      action
    ) => {
      switch (action.type) {
        case "SET_THEME":
          localStorage.setItem("mode", action.theme);
          return action.theme;
        default:
          return state;
      }
    },
    action: (theme) => {
      return {
        type: "SET_THEME",
        theme,
      };
    },
  },
  alert: {
    reducer: (state = {}, action) => {
      switch (action.type) {
        case "SET_ALERT":
          var new_alert = {
            open: action.alert.open,
            severity: action.alert.severity
              ? action.alert.severity
              : state.severity,
            message: action.alert.message,
            vertical: action.alert.vertical ? action.alert.vertical : null,
            horizontal: action.alert.horizontal
              ? action.alert.horizontal
              : null,
            no_alert: action.alert.no_alert,
            key: action.alert.key
              ? action.alert.key
              : action.alert.message
              ? Moment().valueOf().toString()
              : null,
          };
          return new_alert;
        default:
          return state;
      }
    },
    action: (alert) => ({
      type: "SET_ALERT",
      alert,
    }),
  },
  user: {
    reducer: (state = null, action) => {
      switch (action.type) {
        case "SET_USER":
          if (action.user && action.user.token) {
            localStorage.setItem("token", action.user.token);
          }
          return action.user;
        case "SET_USER_SOCKET":
          return Object.assign({}, state, {
            socket: action.socket,
          });
        case "SIGN_OUT":
          localStorage.removeItem("mode");
          localStorage.removeItem("token");
          return null;
        default:
          return state;
      }
    },
    action: (user) => ({
      type: "SET_USER",
      user,
    }),
    actions: {
      socket: (socket) => ({
        type: "SET_USER_SOCKET",
        socket,
      }),
    },
  },
  auth: {
    reducer: (state = { token: false, checked: false }, action) => {
      switch (action.type) {
        case "SET_AUTH":
          return action.auth;
        default:
          return state;
      }
    },
    action: (auth) => ({
      type: "SET_AUTH",
      auth,
    }),
  },
  hooks: {
    reducer: (state = {}, action) => {
      switch (action.type) {
        case "SET_HOOKS":
          return action.hooks;
        default:
          return state;
      }
    },
    action: (hooks) => ({
      type: "SET_HOOKS",
      hooks,
    }),
  },
  map: {
    reducer: (state = { visible: false, stretch: true }, action) => {
      switch (action.type) {
        case "SET_MAP":
          return action.map;
        default:
          return state;
      }
    },
    action: (map) => ({
      type: "SET_MAP",
      map,
    }),
  },
  item: {
    reducer: (state = null, action) => {
      switch (action.type) {
        case "SET_ITEM":
          return action.item;
        default:
          return state;
      }
    },
    action: (item) => ({
      type: "SET_ITEM",
      item,
    }),
  },
  socket: {
    reducer: (state = null, action) => {
      switch (action.type) {
        case "SET_SOCKET":
          return action.socket;
        default:
          return state;
      }
    },
    action: (socket) => ({
      type: "SET_SOCKET",
      socket,
    }),
  },
  notifications: {
    reducer: (state = [], action) => {
      switch (action.type) {
        case "SET_NOTIFICATIONS":
          return action.notifications;
        default:
          return state;
      }
    },
    action: (notifications) => {
      return {
        type: "SET_NOTIFICATIONS",
        notifications,
      };
    },
  },
  snack: {
    reducer: (state = false, action) => {
      switch (action.type) {
        case "SET_SNACK":
          return action.snack;
        default:
          return state;
      }
    },
    action: (snack) => {
      return {
        type: "SET_SNACK",
        snack,
      };
    },
  },
  filters: {
    reducer: (state = { open: false, saved: false }, action) => {
      switch (action.type) {
        case "SET_FILTERS":
          return action.filters;
        default:
          return state;
      }
    },
    action: (filters) => ({
      type: "SET_FILTERS",
      filters,
    }),
  },

  searches: {
    reducer: (state = [], action) => {
      switch (action.type) {
        case "SET_SEARCHES":
          return action.searches;
        default:
          return state;
      }
    },
    action: (searches) => ({
      type: "SET_SEARCHES",
      searches,
    }),
  },

  company: {
    reducer: (state = null, action) => {
      switch (action.type) {
        case "SET_COMPANY":
          return action.company;
        default:
          return state;
      }
    },
    action: (company) => ({
      type: "SET_COMPANY",
      company,
    }),
  },

  entries: {
    reducer: (state = [], action) => {
      switch (action.type) {
        case "SET_ENTRIES":
          return action.entries;
        default:
          return state;
      }
    },
    action: (entries) => ({
      type: "SET_ENTRIES",
      entries,
    }),
  },

  display: {
    reducer: (state = { show: "map" }, action) => {
      switch (action.type) {
        case "SET_DISPLAY":
          return action.display;
        default:
          return state;
      }
    },
    action: (display) => ({
      type: "SET_DISPLAY",
      display,
    }),
  },

  markers: {
    reducer: (state = [], action) => {
      switch (action.type) {
        case "SET_MARKERS":
          return action.markers;
        default:
          return state;
      }
    },
    action: (markers) => ({
      type: "SET_MARKERS",
      markers,
    }),
  },
  steps: {
    reducer: (state = {}, action) => {
      switch (action.type) {
        case "SET_STEPS":
          return action.steps;
        default:
          return state;
      }
    },
    action: (steps) => ({
      type: "SET_STEPS",
      steps,
    }),
  },
  sell: {
    reducer: (state = {}, action) => {
      switch (action.type) {
        case "SET_SELL":
          return action.sell;
        default:
          return state;
      }
    },
    action: (sell) => ({
      type: "SET_SELL",
      sell,
    }),
  },
  intent: {
    reducer: (state = {}, action) => {
      switch (action.type) {
        case "SET_INTENT":
          return action.intent;
        default:
          return state;
      }
    },
    action: (intent) => ({
      type: "SET_INTENT",
      intent,
    }),
  },
};

export default schema;
