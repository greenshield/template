import primaryColor from "@mui/material/colors/purple";
import { darken } from "@mui/material/styles";

import { createTheme } from "@mui/material/styles";

const palette = {
  mode: "light",
  custom: {
    light: primaryColor[300],
    main: primaryColor[500],
    dark: primaryColor[600],
    contrastText: "#ffffff",
  },
  dropdown: {
    light: primaryColor[300],
    main: primaryColor[500],
    dark: primaryColor[600],
    contrastText: darken(primaryColor[700], 0.5),
  },
  sub: {
    light: primaryColor[300],
    main: primaryColor[500],
    dark: primaryColor[600],
    contrastText: darken(primaryColor[700], 0.5),
  },
};

const overrides = {};

const themeName = "Custom Theme";

var shadows = [];
for (var i = 0; i < 25; i++) {
  shadows[i] = "none";
}

const customTheme = createTheme({
  palette: palette,
  overrides: overrides,
  themeName,
});

export default customTheme;
