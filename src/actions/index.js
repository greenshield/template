export const setUser = (user) => ({
  type: "SET_USER",
  user,
});

export const setTemp = (temp) => ({
  type: "SET_TEMP",
  temp,
});

export const setAlert = (alert) => ({
  type: "SET_ALERT",
  alert,
});

export const director = (to) => ({
  type: "DIRECTOR",
  to,
});

export const setTheme = (theme) => {
  return {
    type: "SET_THEME",
    theme,
  };
};

export const setMenu = (menu) => {
  return {
    type: "SET_MENU",
    menu,
  };
};
