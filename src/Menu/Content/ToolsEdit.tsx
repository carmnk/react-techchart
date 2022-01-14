import React from "react";
import { ChartMenuToolTreeItem } from "../Subelements/ToolTreeItem";
import * as T from "../../Types";
import { CChartMenuStateType } from "../ChartMenu";
import { CTreeView } from "../../Components/CTreeView";
import useTheme from "@mui/material/styles/useTheme";
import { ToolsSubMenu } from "./ToolsSubMenu";

export const ToolsEdit = (props: {
  subcharts: T.ChartState["subcharts"];
  Dispatch: T.ChartController["Dispatch"];
  onNavigate: (target: CChartMenuStateType["location"]) => void;
  fullscreen: boolean;
}) => {
  const { subcharts, Dispatch, onNavigate, fullscreen } = props;
  const theme = useTheme();
  return (
    <React.Fragment>
      <ToolsSubMenu subcharts={subcharts} location="editTool" onNavigate={onNavigate} theme={theme} />
      <CTreeView>
        {subcharts.map((subchart, subchartIdx) =>
          subchart.yaxis.map((yaxis, yaxisIdx) =>
            yaxis.tools.map((tool, toolIdx) => (
              <ChartMenuToolTreeItem
                key={`editIndicator-sub-${subchartIdx}-yaxis-${yaxisIdx}-graph-${toolIdx}`}
                subcharts={subcharts}
                Dispatch={Dispatch}
                subchartIdx={subchartIdx}
                yaxisIdx={yaxisIdx}
                toolIdx={toolIdx}
                fullscreen={fullscreen}
              />
            ))
          )
        )}
      </CTreeView>
    </React.Fragment>
  );
};
