import React from "react";
import createTheme, { Theme } from "@mui/material/styles/createTheme";
import responsiveFontSizes from "@mui/material/styles/responsiveFontSizes";
import ThemeProvider from "@mui/material/styles/ThemeProvider";

export const ConditionalMuiThemeProvider: React.FC<{
  disableTheme?: boolean;
  theme: Theme;
}> = (props) => {
  const { disableTheme, theme } = props;

  return (
    <React.Fragment>
      {!disableTheme ? (
        <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
      ) : (
        props.children
      )}
    </React.Fragment>
  );
};

export const muiTheme = responsiveFontSizes(
  createTheme({
    palette: {
      primary: {
        main: "#009688",
      },
      secondary: {
        main: "#f50057",
      },
      mode: "light",
    },
    typography: {
      body1: {
        lineHeight: 1.75,
        fontSize: "1.1rem",
      },
      body2: {
        lineHeight: 1.75,
      },
      h1: {
        fontWeight: 600,
        fontSize: "3rem",
        lineHeight: 1.75,
        fontFamily: "'Work Sans',Roboto,Helvetica,Arial,sans-serif",
      },
      h2: {
        fontWeight: 600,
        fontSize: "2.5rem",
        lineHeight: 1.75,
        fontFamily: "'Work Sans',Roboto,Helvetica,Arial,sans-serif",
      },
      h3: {
        fontWeight: 600,
        fontSize: "2.1rem",
        lineHeight: 1.75,
        fontFamily: "'Work Sans',Roboto,Helvetica,Arial,sans-serif",
      },
      h4: {
        fontWeight: 600,
        fontSize: "1.8rem",
        lineHeight: 1.75,
        fontFamily: "'Work Sans',Roboto,Helvetica,Arial,sans-serif",
      },
      h5: {
        fontWeight: 600,
        fontSize: "1.44rem",
        lineHeight: 1.75,
        fontFamily: "'Work Sans',Roboto,Helvetica,Arial,sans-serif",
      },
      h6: {
        fontWeight: 600,
        fontSize: "1.25rem",
        lineHeight: 1.75,
        fontFamily: "'Work Sans',Roboto,Helvetica,Arial,sans-serif",
      },
      fontFamily: "'Quattrocento Sans',Roboto,Helvetica,Arial,sans-serif",
    },
  })
);

export const muiDarkTheme = responsiveFontSizes(
  createTheme({
    palette: {
      primary: {
        main: "#009688",
      },
      secondary: {
        main: "#f50057",
      },
      mode: "dark",
      background: {
        paper: "#424242",
      },
    },
    typography: {
      body1: {
        lineHeight: 1.75,
        fontSize: "1.1rem",
      },
      body2: {
        lineHeight: 1.75,
      },
      h1: {
        fontWeight: 600,
        fontSize: "3rem",
        lineHeight: 1.75,
        fontFamily: "'Work Sans',Roboto,Helvetica,Arial,sans-serif",
      },
      h2: {
        fontWeight: 600,
        fontSize: "2.5rem",
        lineHeight: 1.75,
        fontFamily: "'Work Sans',Roboto,Helvetica,Arial,sans-serif",
      },
      h3: {
        fontWeight: 600,
        fontSize: "2.1rem",
        lineHeight: 1.75,
        fontFamily: "'Work Sans',Roboto,Helvetica,Arial,sans-serif",
      },
      h4: {
        fontWeight: 600,
        fontSize: "1.8rem",
        lineHeight: 1.75,
        fontFamily: "'Work Sans',Roboto,Helvetica,Arial,sans-serif",
      },
      h5: {
        fontWeight: 600,
        fontSize: "1.44rem",
        lineHeight: 1.75,
        fontFamily: "'Work Sans',Roboto,Helvetica,Arial,sans-serif",
      },
      h6: {
        fontWeight: 600,
        fontSize: "1.25rem",
        lineHeight: 1.75,
        fontFamily: "'Work Sans',Roboto,Helvetica,Arial,sans-serif",
      },
      fontFamily: "'Quattrocento Sans',Roboto,Helvetica,Arial,sans-serif",
    },
  })
);
