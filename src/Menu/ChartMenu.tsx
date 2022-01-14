import React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Home } from "./Content/Home";
import { CMSettings } from "./Content/Settings";
import { CMChart } from "./Content/Chart";
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
  subcharts: T.ChartState["subcharts"];
  xaxis: T.ChartState["calc"]["xaxis"];
  fullscreen: T.ChartState["fullscreen"];
  theme: T.ChartState["theme"];
  onNavigate: (target: CChartMenuStateType["location"]) => void;
  Dispatch: T.ChartController["Dispatch"];
  onSettingsExpand: (id: string) => void;
  settings: T.UseChartControllerProps["settings"];
  data: T.ChartState["data"];
  events: T.UseChartControllerProps["events"] | undefined;
}) => {
  const {
    onClose,
    ChartMenuState,
    subcharts,
    theme,
    onNavigate,
    Dispatch,
    onSettingsExpand,
    fullscreen,
    settings,
    data,
    events,
  } = props;

  const isDesktop = useMediaQuery("(min-width:600px)");
  const contentPages = [
    {
      location: "menu",
      headerText: "Chart Menu",
      component: () => <Home onNavigate={onNavigate} events={events} />,
    },
    {
      location: "chart",
      headerText: "Chart",
      component: () => <CMChart Dispatch={Dispatch} events={events} settings={settings} />,
    },
    {
      location: "indicators",
      headerText: "Add Indicator",
      component: () => (
        <IndicatorsAdd
          subcharts={subcharts}
          onNavigate={onNavigate}
          location={ChartMenuState.location}
          Dispatch={Dispatch}
          settings={settings}
          data={data}
          fullscreen={fullscreen}
        />
      ),
    },
    {
      location: "editIndicator",
      headerText: "Edit Indicator",
      component: () => (
        <IndicatorsEdit
          subcharts={subcharts}
          onNavigate={onNavigate}
          location={ChartMenuState.location}
          Dispatch={Dispatch}
          settings={settings}
          data={data}
          fullscreen={fullscreen}
        />
      ),
    },
    {
      location: "tools",
      headerText: "Add Tool",
      component: () => <ToolsAdd subcharts={subcharts} Dispatch={Dispatch} onNavigate={onNavigate} />,
    },
    {
      location: "editTool",
      headerText: "Edit Tool",
      component: () => (
        <ToolsEdit subcharts={subcharts} Dispatch={Dispatch} onNavigate={onNavigate} fullscreen={fullscreen} />
      ),
    },
    {
      location: "settings",
      headerText: "Settings",
      component: () => (
        <CMSettings
          key="cm-settings"
          ChartMenuState={ChartMenuState}
          subcharts={subcharts}
          theme={theme}
          Dispatch={Dispatch}
          onNavigate={onNavigate}
          onSettingsExpand={onSettingsExpand}
          data={data}
          fullscreen={fullscreen}
        />
      ),
    },
  ];
  const contentPage = contentPages.find((page) => page.location === ChartMenuState.location);
  if (!ChartMenuState.location || !contentPage) return null;
  const ContentPageComponent = contentPage.component;
  const headerText = contentPage.headerText;

  // console.log("Chartmenu renders");
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
      events={events}
    />
  );
};

export const CChartMenu = React.memo(CChartMenuComponent);
