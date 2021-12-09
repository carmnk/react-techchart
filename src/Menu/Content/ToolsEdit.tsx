import React from "react";
import { ChartMenuToolTreeItem } from "../Subelements/ToolTreeItem";
import * as T from "../../Types";
import { CChartMenuStateType } from "../ChartMenu";
import { CTreeView } from "../../Components/CTreeView";
import useTheme from "@mui/material/styles/useTheme";
import { ToolsSubMenu } from "./ToolsSubMenu";

export const ToolsEdit = (props: {
  subCharts: T.ChartState["subCharts"];
  Dispatch: T.ChartStateHook["Dispatch"];
  onNavigate: (target: CChartMenuStateType["location"]) => void;
}) => {
  const { subCharts, Dispatch, onNavigate } = props;
  const theme = useTheme();
  return (
    <React.Fragment>
      <ToolsSubMenu subCharts={subCharts} location="editTool" onNavigate={onNavigate} theme={theme} />
      <CTreeView>
        {subCharts.map((subchart, subchartIdx) =>
          subchart.yaxis.map((yaxis, yaxisIdx) =>
            yaxis.tools.map((tool, toolIdx) => (
              <ChartMenuToolTreeItem
                key={`editIndicator-sub-${subchartIdx}-yaxis-${yaxisIdx}-graph-${toolIdx}`}
                subCharts={subCharts}
                Dispatch={Dispatch}
                subchartIdx={subchartIdx}
                yaxisIdx={yaxisIdx}
                toolIdx={toolIdx}
              />
            ))
          )
        )}
      </CTreeView>
    </React.Fragment>
  );
};
