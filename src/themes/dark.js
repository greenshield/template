import { createTheme } from "@mui/material/styles";
import primaryColor from "@mui/material/colors/amber";
import secondaryColor from "@mui/material/colors/grey";
import customColor from "@mui/material/colors/blueGrey";
import dangerColor from "@mui/material/colors/orange";
import infoColor from "@mui/material/colors/blue";
import successColor from "@mui/material/colors/green";
import errorColor from "@mui/material/colors/red";
import { darken, lighten } from "@mui/material/styles";

var shadows = [];
for (var i = 0; i < 25; i++) {
  shadows[i] = "none";
}

const darkTheme = createTheme({
  components: {
    MuiTableRow: {
      styleOverrides: {
        root: {
          backgroundColor: secondaryColor[800],
          ".MuiTableCell-root": {
            backgroundColor: secondaryColor[800],
          },
          "&:hover": {
            backgroundColor: secondaryColor[700],
            ".MuiTableCell-root": {
              backgroundColor: secondaryColor[700],
            },
          },
        },
        "&.Mui-selected": {
          backgroundColor: "#424242",
          ".MuiTableCell-root": {
            backgroundColor: "#424242",
          },
          "&:hover": {
            backgroundColor: "#424242 !important",
            ".MuiTableCell-root": {
              backgroundColor: "#424242 !important",
            },
          },
        },
      },
    },
    MUIDataTableToolbarSelect: {
      styleOverrides: {
        root: {
          height: "64px;",
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          backgroundColor: "#212121 !important",
          ".MuiToolbar-root": {
            backgroundColor: "#212121 !important",
          },
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: secondaryColor[500],
            color: "#ffffff",
            "&.MuiPaginationItem-ellipsis": {
              backgroundColor: secondaryColor[900] + " !important",
              color: secondaryColor[500],
            },
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#000000",
          color: "#ffffff",
          borderRadius: "0px",
        },
        input: {
          "&::placeholder": {
            opacity: 0.75,
            textOverflow: "ellipsis !important",
            color: secondaryColor[700],
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#404040",
          boxShadow: "none",
          borderRadius: "0px !important",
          color: secondaryColor[500],
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          "&::-webkit-scrollbar": {},
          "&::-webkit-scrollbar-thumb": {},
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "0px !important",
        },
        contained: {
          color: "#ffffff",
        },
        containedPrimary: {
          color: "#ffffff",
        },
        containedSecondary: {
          color: "#ffffff",
        },
      },
    },
    MuiAutocomplete: {
      option: {
        '&[data-focus="true"]': {
          backgroundColor: "#ff0000 !important",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          colorScheme: "dark",
        },
        "*": {
          ".edit-row": {
            backgroundColor: secondaryColor[800] + "!important",
          },
          ".editing-row": {
            backgroundColor: secondaryColor[800] + "!important",
          },
          "&::-webkit-scrollbar": {
            width: "8px !important",
            height: "8px !important",
          },
          "&::-webkit-scrollbar-track": {},
          "&::-webkit-scrollbar-thumb": {
            //border: 'none !important',
            //borderRadius: '0px !important',
            borderColor: secondaryColor[500] + " !important",
            backgroundColor: secondaryColor[500] + " !important",
          },
          "&::-webkit-scrollbar-thumb:hover": {},
        },
        ".MuiAutocomplete-inputRoot": {
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: secondaryColor[500] + " !important",
          },
        },
        ".MuiAutocomplete-root": {
          ".MuiInputLabel-shrink": {
            color: secondaryColor[500] + " !important",
          },
        },
        ".MuiAutocomplete-option.Mui-focused": {
          backgroundColor: secondaryColor[800] + " !important",
        },

        "& .MuiOutlinedInput-root": {
          "& > fieldset": {
            borderColor: secondaryColor[500],
          },
        },

        "& .MuiOutlinedInput-root:hover": {
          "& > fieldset": {
            borderColor: secondaryColor[500] + " !important",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff !important",
          },
        },

        ".Mui-focused": {
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff !important",
          },
        },

        "::-webkit-scrollbar-corner": {
          backgroundColor: "#494949 !important",
        },

        ".MuiTableCell-root": {
          ".MuiButtonBase-root": {
            padding: "8px !important",
          },
        },
        ".editing-row .MuiTableCell-root": {
          backgroundColor: secondaryColor[900] + "!important",
        },
        ".disabled-row": {
          backgroundColor: "#424242 !important",
          ".MuiTableCell-root": {
            backgroundColor: "#424242 !important",
          },
          "&:hover": {
            backgroundColor: "#424242 !important",
            ".MuiTableCell-root": {
              backgroundColor: "#424242 !important",
            },
          },
        },
        ".MuiTableCell-head": {
          backgroundColor: "#212121 !important",
        },
        ".filler-rows": {
          backgroundColor: "#424242 !important",
          ".MuiTableCell-root": {
            backgroundColor: "#424242 !important",
          },
          "&:hover": {
            backgroundColor: "#424242 !important",
            ".MuiTableCell-root": {
              backgroundColor: "#424242 !important",
            },
          },
        },
        ".top-toolbar": {
          ".MuiButton-root": {
            borderRadius: "4px !important",
            paddingLeft: "16px",
            paddingRight: "16px",
            "&:hover": {
              backgroundColor: primaryColor[500],
            },
          },
        },
        ".filepond--drop-label": {
          backgroundColor: darken(secondaryColor[700], 0.5) + " !important",
          color: secondaryColor[500] + " !important",
          "&:hover": {
            backgroundColor: secondaryColor[800] + " !important",
            color: "#ffffff !important",
          },
        },
        '.filepond--hopper[data-hopper-state="drag-over"] .filepond--drop-label':
          {
            borderColor: "#2196f3",
            backgroundColor: secondaryColor[800] + " !important",
            color: "#ffffff !important",
          },
        ".MuiTablePagination-displayedRows": {
          display: "block !important",
          width: "120px",
          textAlign: "center",
          margin: 0,
        },
        ".MuiButtonBase-root": {
          "&.MuiTableSortLabel-root": {
            padding: "0px !important",
          },
        },
        ".photo-gallery": {
          zIndex: 7700 + " !important",
        },
        ".image-gallery-content": {
          zIndex: 7700 + " !important",
        },
        ".MuiStepIcon-text": {
          fill: "#ffffff !important",
        },
      },
    },
  },
  shadows: shadows,
  palette: {
    mode: "dark",
    error: {
      light: errorColor[300],
      main: errorColor[400],
      dark: errorColor[700],
      contrastText: darken(errorColor[500], 0.3),
    },
    danger: {
      light: dangerColor[300],
      main: dangerColor[400],
      dark: dangerColor[700],
      contrastText: darken(dangerColor[500], 0.3),
    },
    prime: {
      light: lighten(process.env.REACT_APP_PRIMARY_COLOR_DARK, 0.5),
      main: lighten(process.env.REACT_APP_PRIMARY_COLOR_DARK, 0.35),
      dark: lighten(process.env.REACT_APP_PRIMARY_COLOR_DARK, 0.9),
      contrastText: lighten(process.env.REACT_APP_PRIMARY_COLOR_DARK, 1),
    },
    primary: {
      light: primaryColor[300],
      main: primaryColor[500],
      dark: primaryColor[600],
      contrastText: darken(primaryColor[500], 0.3),
    },
    primarymono: {
      light: lighten(process.env.REACT_APP_PRIMARY_COLOR_LIGHT, 0.5),
      main: lighten(process.env.REACT_APP_PRIMARY_COLOR_LIGHT, 0.35),
      dark: lighten(process.env.REACT_APP_PRIMARY_COLOR_LIGHT, 0.9),
      contrastText: lighten(process.env.REACT_APP_PRIMARY_COLOR_LIGHT, 1),
    },
    custom: {
      light: customColor[300],
      main: customColor[800],
      dark: customColor[500],
      contrastText: darken(customColor[600], 0.5),
    },
    dropdown: {
      light: secondaryColor[300],
      main: "#000000",
      dark: secondaryColor[600],
      contrastText: darken(secondaryColor[700], 0.5),
    },
    sub: {
      light: secondaryColor[300],
      main: secondaryColor[500],
      dark: secondaryColor[600],
      contrastText: darken(secondaryColor[700], 0.5),
    },
    info: {
      light: infoColor[300],
      main: infoColor[800],
      dark: infoColor[500],
      contrastText: darken(infoColor[600], 0.5),
    },
    success: {
      light: successColor[300],
      main: successColor[800],
      dark: successColor[500],
      contrastText: darken(successColor[600], 0.5),
    },
    table: {
      light: secondaryColor[600],
      main: secondaryColor[700],
      dark: secondaryColor[600],
      contrastText: darken(secondaryColor[700], 0.5),
    },
    search: {
      light: "#ffffff",
      main: secondaryColor[800],
      dark: "#212121",
      contrastText: darken(secondaryColor[700], 0.5),
    },
    tableicon: {
      light: secondaryColor[600],
      main: "#ffffff",
      dark: secondaryColor[800],
      contrastText: secondaryColor[600],
    },
    secondary: {
      light: secondaryColor[300],
      main: secondaryColor[500],
      dark: secondaryColor[600],
      contrastText: "#ffffff",
    },
    brand: {
      light: lighten("#ffc107", 0.3),
      main: "#ffc107",
      dark: darken("#ffc107", 0.5),
      contrastText: "#ffffff",
      pale: darken("#ffc107", 0.2),
      top: "#ffffff",
    },
    button: {
      light: "#ffffff",
      main: "#ffffff",
      dark: darken("#ffc107", 0.5),
      contrastText: "#ffffff",
    },
    background: {
      default: secondaryColor[900],
      tiled: secondaryColor[700],
      bar: secondaryColor[700],
    },
    text: {
      primary: secondaryColor[500],
    },
  },
});

export default darkTheme;
