import React from "react";
import { ChartMenuIndiGraphTreeItem } from "../Subelements/IndiGraphTreeItem";
import { CTreeView } from "../../Components/CTreeView";
import * as T from "../../Types";
import { IndicatorsSubMenu } from "./IndicatorsSubMenu";
import useTheme from "@mui/material/styles/useTheme";
import { CChartMenuStateType } from "../ChartMenu";

export const IndicatorsEditComponent = (props: {
  subcharts: T.ChartState["subcharts"];
  onNavigate: (target: CChartMenuStateType["location"]) => void;
  location: CChartMenuStateType["location"];
  Dispatch: T.ChartController["Dispatch"];
  settings?: T.UseChartControllerProps["settings"];
  data: T.ChartState["data"];
  fullscreen: boolean;
}) => {
  const { subcharts, Dispatch, data, location, onNavigate, fullscreen } = props;
  const theme = useTheme();
  const amtIndicators = data.filter((val) => val.type === "indicator").length;

  return (
    <React.Fragment>
      <IndicatorsSubMenu location={location} onNavigate={onNavigate} theme={theme} amtIndicators={amtIndicators} />
      <CTreeView>
        {subcharts.map((subchart, subchartIdx) =>
          subchart.yaxis.map((yaxis, yaxisIdx) =>
            yaxis.graphs.map((graph, graphIdx) =>
              T.isIndicatorGraph(graph) ? (
                <ChartMenuIndiGraphTreeItem
                  key={`editIndicator-sub-${subchartIdx}-yaxis-${yaxisIdx}-graph-${graphIdx}`}
                  graphs={subcharts?.[subchartIdx]?.yaxis?.[0]?.graphs}
                  Dispatch={Dispatch}
                  subchartIdx={subchartIdx}
                  yaxisIdx={yaxisIdx}
                  graphIdx={graphIdx}
                  data={data}
                  fullscreen={fullscreen}
                />
              ) : null
            )
          )
        )}
      </CTreeView>
    </React.Fragment>
  );
};
export const IndicatorsEdit = React.memo(IndicatorsEditComponent);
