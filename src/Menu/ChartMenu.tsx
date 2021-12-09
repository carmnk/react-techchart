import React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Home } from "./Content/Home";
import { CMSettings } from "./Content/CMSettings";
import { CMChart } from "./Content/CMChart";
import { IndicatorsAdd } from "./Content/IndicatorsAdd";
import * as T from "../Types";
import { ChartMenuLayout } from "./ChartMenuLayout";
import { IndicatorsEdit } from "./Content/IndicatorsEdit";
import { ToolsAdd } from "./Content/ToolsAdd";
import { ToolsEdit } from "./Content/ToolsEdit";

export type CChartMenuStateType = {
  location: "menu" | "chart" | "indicators" | "tools" | "settings" | "quickys" | "editIndicator" | "editTool" | null;
  expandedSetting: string[];
};

export const CChartMenuComponent = (props: {
  ChartMenuState: CChartMenuStateType;
  onClose: () => void;
  subCharts: T.ChartState["subCharts"];
  xaxis: T.ChartState["calc"]["xaxis"];
  fullscreen: T.ChartState["fullscreen"];
  style: T.ChartState["options"];
  onNavigate: (target: CChartMenuStateType["location"]) => void;
  Dispatch: T.ChartStateHook["Dispatch"];
  onSettingsExpand: (id: string) => void;
  settings: T.ChartStateProps["settings"];
  data: T.ChartState["data"];
}) => {
  const {
    onClose,
    ChartMenuState,
    subCharts,
    style,
    onNavigate,
    Dispatch,
    onSettingsExpand,
    fullscreen,
    settings,
    data,
  } = props;

  const isDesktop = useMediaQuery("(min-width:600px)");
  const contentPages = [
    { location: "menu", headerText: "Chart Menu", component: () => <Home onNavigate={onNavigate} /> },
    { location: "chart", headerText: "Chart", component: () => <CMChart Dispatch={Dispatch} /> },
    {
      location: "indicators",
      headerText: "Add Indicator",
      component: () => (
        <IndicatorsAdd
          subCharts={subCharts}
          onNavigate={onNavigate}
          location={ChartMenuState.location}
          Dispatch={Dispatch}
          settings={settings}
          data={data}
        />
      ),
    },
    {
      location: "editIndicator",
      headerText: "Edit Indicator",
      component: () => (
        <IndicatorsEdit
          subCharts={subCharts}
          onNavigate={onNavigate}
          location={ChartMenuState.location}
          Dispatch={Dispatch}
          settings={settings}
          data={data}
        />
      ),
    },
    {
      location: "tools",
      headerText: "Add Tool",
      component: () => <ToolsAdd subCharts={subCharts} Dispatch={Dispatch} onNavigate={onNavigate} />,
    },
    {
      location: "editTool",
      headerText: "Edit Tool",
      component: () => <ToolsEdit subCharts={subCharts} Dispatch={Dispatch} onNavigate={onNavigate} />,
    },
    {
      location: "settings",
      headerText: "Settings",
      component: () => (
        <CMSettings
          ChartMenuState={ChartMenuState}
          subCharts={subCharts}
          style={style}
          Dispatch={Dispatch}
          onNavigate={onNavigate}
          onSettingsExpand={onSettingsExpand}
          data={data}
        />
      ),
    },
  ];

  const contentPage = contentPages.find((page) => page.location === ChartMenuState.location);
  if (!ChartMenuState.location || !contentPage) return null;
  const ContentPageComponent = contentPage.component;
  const headerText = contentPage.headerText;
  console.log("Chartmenu renders");
  return (
    <ChartMenuLayout
      headerText={headerText}
      isDesktop={isDesktop}
      settings={settings}
      location={ChartMenuState.location}
      onNavigate={onNavigate}
      Dispatch={Dispatch}
      fullscreen={fullscreen}
      onClose={onClose}
      content={<ContentPageComponent />}
    />
  );
};

export const CChartMenu = React.memo(CChartMenuComponent);
