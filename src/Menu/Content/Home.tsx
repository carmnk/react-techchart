import React from "react";
import List from "@mui/material/List";
import useTheme from "@mui/material/styles/useTheme";
import { mdiChartLine, mdiChartBellCurve, mdiPencilRuler, mdiTune } from "@mdi/js";
import { ChartMenuListItem } from "../Subelements/CMListItem";
import { CChartMenuStateType } from "../ChartMenu";
import * as T from "../../Types";

export const Home = (props: {
  onNavigate: (target: CChartMenuStateType["location"]) => void;
  events: T.UseChartControllerProps["events"] | undefined;
}) => {
  const { onNavigate, events } = props;
  const theme = useTheme();

  const handleNavChart = React.useCallback(() => {
    onNavigate?.("chart");
  }, [onNavigate]);
  const handleNavIndicators = React.useCallback(() => {
    onNavigate?.("indicators");
  }, [onNavigate]);
  const handleNavTools = React.useCallback(() => {
    onNavigate?.("tools");
  }, [onNavigate]);
  const handleNavSettings = React.useCallback(() => {
    onNavigate?.("settings");
  }, [onNavigate]);

  return (
    <List sx={{ pt: 4 }}>
      <ChartMenuListItem
        id="0"
        text="Chart"
        iconPath={mdiChartLine}
        textColor="text.primary"
        iconColor={theme.palette.secondary.contrastText}
        onClick={handleNavChart}
      />
      <ChartMenuListItem
        text="Indicators"
        id="1"
        iconPath={mdiChartBellCurve}
        textColor="text.primary"
        iconColor={theme.palette.secondary.contrastText}
        onClick={handleNavIndicators}
      />
      <ChartMenuListItem
        id="2"
        text="Tools"
        iconPath={mdiPencilRuler}
        textColor="text.primary"
        iconColor={theme.palette.secondary.contrastText}
        onClick={handleNavTools}
      />
      <ChartMenuListItem
        id="3"
        text="Settings"
        iconPath={mdiTune}
        textColor="text.primary"
        iconColor={theme.palette.secondary.contrastText}
        onClick={handleNavSettings}
      />
    </List>
  );
};
