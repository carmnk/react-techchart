import IconButton from "@mui/material/IconButton";
import useTheme from "@mui/material/styles/useTheme";
import { Icon } from "@mdi/react";
import { mdiChartAreaspline, mdiClose, mdiPencilRuler } from "@mdi/js";
import React from "react";
import { CIcon } from "../../Components/CIcon";
import { CTreeItem } from "../../Components/CTreeItem";
import { ChartMenuChartGraphTreeItem } from "./ChartGraphTreeItem";
import { ChartMenuIndiGraphTreeItem } from "./IndiGraphTreeItem";
import { ChartMenuToolTreeItem } from "./ToolTreeItem";
import * as T from "../../Types";

export type SubchartTreeItemProps = {
  subchartIdx: number;
  subcharts: T.ChartState["subCharts"];
  data: T.ChartState["data"];
  Dispatch: T.ChartStateHook["Dispatch"];
  onSettingsExpand: (id: string) => void;
  additionalLabelInfo?: JSX.Element | null;
};

export const SubchartTreeItem = React.forwardRef((props: SubchartTreeItemProps, ref: any) => {
  const { subchartIdx, subcharts, data, Dispatch, onSettingsExpand, additionalLabelInfo, ...other } = props;
  const theme = useTheme();
  const subchart = subcharts[subchartIdx];

  return (
    <CTreeItem
      ref={ref}
      {...other}
      key={`sub-${subchartIdx}`}
      nodeId={`sub-${subchartIdx}`}
      labelText={subchartIdx === 0 ? "Mainchart" : `Subchart ${subchartIdx}`}
      bgColorSelected={theme.palette.primary.light}
      onClick={() => {
        const id = `sub-${subchartIdx}`;
        onSettingsExpand?.(id);
      }}
      labelIcon={
        <CIcon
          path={mdiChartAreaspline}
          size={"32px"}
          color={theme.palette.secondary.contrastText}
          background={theme.palette.secondary.main}
        />
      }
      labelInfo={
        subchartIdx !== 0 ? (
          <React.Fragment>
            {additionalLabelInfo}
            <IconButton
              size="small"
              onClick={(e: any) => {
                e.preventDefault();
                const action: T.ReducerAction<"removeSubchart"> = {
                  task: "removeSubchart",
                  params: { subchartIdx },
                };
                Dispatch(action);
              }}
            >
              <Icon path={mdiClose} size={1} color={theme.palette.mode === "light" ? "#333" : "#fff"} />
            </IconButton>
          </React.Fragment>
        ) : undefined
      }
    >
      {subchart.yaxis[0].graphs.map((graph, graphIdx) =>
        T.isIndicatorGraph(graph) ? (
          <ChartMenuIndiGraphTreeItem
            key={`editIndicator-sub-${subchartIdx}-yaxis-${0}-graph-${graphIdx}`}
            subCharts={subcharts}
            Dispatch={Dispatch}
            subchartIdx={subchartIdx}
            yaxisIdx={0}
            graphIdx={graphIdx}
            handleToggleExpanded={onSettingsExpand}
            data={data}
          />
        ) : T.isChartGraph(graph) ? (
          <ChartMenuChartGraphTreeItem
            key={`graph-sub-${subchartIdx}-y-${0}-graph-${graphIdx}-frag`}
            subCharts={subcharts}
            Dispatch={Dispatch}
            subchartIdx={subchartIdx}
            yaxisIdx={0}
            graphIdx={graphIdx}
            onSettingsExpand={onSettingsExpand}
            data={data}
          />
        ) : null
      )}

      {subchart.yaxis[0].tools.length > 0 ? (
        <CTreeItem
          key={`tools-${subchartIdx}-y0`}
          nodeId={`tools-${subchartIdx}-y0`}
          labelIcon={
            <div
              style={{
                background: theme.palette.primary.main,
                width: 32,
                height: 32,
                border: "1px solid #666",
                borderRadius: 5,
                marginRight: 10,
              }}
            >
              <Icon path={mdiPencilRuler} size={"32px"} color={theme.palette.secondary.contrastText} />
            </div>
          }
          labelText="Tools"
          onClick={() => {
            const id = `tools-${subchartIdx}-y0`;
            onSettingsExpand?.(id);
          }}
        >
          {subchart.yaxis[0].tools.map((tool, toolIdx) => (
            <ChartMenuToolTreeItem
              key={`editTool-sub-${subchartIdx}-yaxis-${0}-tool-${toolIdx}`}
              subCharts={subcharts}
              Dispatch={Dispatch}
              subchartIdx={subchartIdx}
              yaxisIdx={0}
              toolIdx={toolIdx}
              handleToggleExpanded={onSettingsExpand}
            />
          ))}
        </CTreeItem>
      ) : null}
    </CTreeItem>
  );
});
SubchartTreeItem.displayName = "SubchartTreeItem";
