import React from "react";
import { ChartMenuIndiGraphTreeItem } from "../Subelements/IndiGraphTreeItem";
import { CTreeView } from "../../Components/CTreeView";
import * as T from "../../Types";
import { IndicatorsSubMenu } from "./IndicatorsSubMenu";
import useTheme from "@mui/material/styles/useTheme";
import { CChartMenuStateType } from "../ChartMenu";

export const IndicatorsEdit = (props: {
  subCharts: T.ChartState["subCharts"];
  onNavigate: (target: CChartMenuStateType["location"]) => void;
  location: CChartMenuStateType["location"];
  Dispatch: T.ChartStateHook["Dispatch"];
  settings?: T.ChartStateProps["settings"];
  data: T.ChartState["data"];
}) => {
  const { subCharts, Dispatch, data, location, onNavigate } = props;
  const theme = useTheme();
  const amtIndicators = data.filter((val) => val.type === "indicator").length;

  return (
    <React.Fragment>
      <IndicatorsSubMenu location={location} onNavigate={onNavigate} theme={theme} amtIndicators={amtIndicators} />
      <CTreeView>
        {subCharts.map((subchart, subchartIdx) =>
          subchart.yaxis.map((yaxis, yaxisIdx) =>
            yaxis.graphs.map((graph, graphIdx) =>
              T.isIndicatorGraph(graph) ? (
                <ChartMenuIndiGraphTreeItem
                  key={`editIndicator-sub-${subchartIdx}-yaxis-${yaxisIdx}-graph-${graphIdx}`}
                  subCharts={subCharts}
                  Dispatch={Dispatch}
                  subchartIdx={subchartIdx}
                  yaxisIdx={yaxisIdx}
                  graphIdx={graphIdx}
                  data={data}
                />
              ) : null
            )
          )
        )}
      </CTreeView>
    </React.Fragment>
  );
};
