import React from "react";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { Theme } from "@mui/material/styles/createTheme";
import { CChartMenuStateType } from "../ChartMenu";

export type IndicatorCategoryType = "Average" | "Oszillator" | "Volatility" | "Volume";

export const IndicatorsSubMenu = (props: {
  location: CChartMenuStateType["location"];
  submenuContent?: React.ReactNode;
  theme: Theme;
  onNavigate: (target: CChartMenuStateType["location"]) => void;
  amtIndicators: number;
}) => {
  const { location, submenuContent, theme, onNavigate, amtIndicators } = props;
  return (
    <Stack // menu
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      sx={{ pt: 0.5 }}
    >
      {submenuContent}
      {amtIndicators > 0 ? (
        <ToggleButtonGroup value={"indicatorModifyMode"} exclusive size="small">
          <ToggleButton
            value="addIndicator"
            sx={{
              "&:hover": {
                background: location === "indicators" ? theme.palette.secondary.light : theme.palette.background.paper,
                boxShadow: 3,
                backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15))",
              },
              borderBottomLeftRadius: 50,
              textTransform: "none",
              borderTopLeftRadius: 50,
              background: location === "indicators" ? theme.palette.secondary.light : theme.palette.background.paper,
              backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15))",
            }}
            onClick={() => {
              onNavigate?.("indicators");
            }}
          >
            <Typography> Add</Typography>
          </ToggleButton>
          <ToggleButton
            value="editIndicator"
            sx={{
              "&:hover": {
                background:
                  location === "editIndicator" ? theme.palette.secondary.light : theme.palette.background.paper,
                boxShadow: 3,
                backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15))",
              },
              borderBottomRightRadius: 50,
              borderTopRightRadius: 50,
              background: location === "editIndicator" ? theme.palette.secondary.light : theme.palette.background.paper,
              backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15))",
            }}
            onClick={() => {
              onNavigate?.("editIndicator");
            }}
          >
            Edit
          </ToggleButton>
        </ToggleButtonGroup>
      ) : null}
    </Stack>
  );
};
