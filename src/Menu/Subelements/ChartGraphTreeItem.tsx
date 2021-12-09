import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import useTheme from "@mui/material/styles/useTheme";

import { mdiChartLine, mdiClose, mdiBorderColor, mdiSetLeft } from "@mdi/js";
import Icon from "@mdi/react";
import React from "react";
import { CIcon } from "../../Components/CIcon";
import { CMColorPropTreeItem } from "./CMColorPropTreeItem";
import { CTreeItem } from "../../Components/CTreeItem";
import * as T from "../../Types";

export const ChartMenuChartGraphTreeItem = (props: {
  subchartIdx: number;
  yaxisIdx: number;
  graphIdx: number;
  subCharts: T.ChartState["subCharts"];
  Dispatch: T.ChartStateHook["Dispatch"];
  onSettingsExpand: (id: string) => void;
  data: T.ChartState["data"];
}) => {
  const { subchartIdx, yaxisIdx, graphIdx, subCharts, Dispatch, onSettingsExpand, data } = props;
  const graph = subCharts?.[subchartIdx]?.yaxis?.[yaxisIdx]?.graphs?.[graphIdx];
  const theme = useTheme();
  const dataGraph = data.find((val) => val.id === graph?.dataId) as T.ChartData | undefined;

  const graphColorProps = (graph: T.GraphState) =>
    T.isChartGraph(graph) && dataGraph?.type === "chart"
      ? graph.chartType === "candles"
        ? [
            {
              text: "candle up color",
              icon: mdiBorderColor,
              color: graph.style.candleUpColor,
              onColorSelected: (color: string) => {
                Dispatch({
                  task: "setGraphProp",
                  params: {
                    prop: "candleUpColor",
                    subchartIdx,
                    yaxisIdx,
                    graphIdx,
                    newValue: color,
                  },
                });
              },
            },
            {
              text: "candle down color",
              icon: mdiBorderColor,
              color: graph.style.candleDownColor,
              onColorSelected: (color: string) => {
                Dispatch({
                  task: "setGraphProp",
                  params: {
                    prop: "candleDownColor",
                    subchartIdx,
                    yaxisIdx,
                    graphIdx,
                    newValue: color,
                  },
                });
              },
            },
            {
              text: "candle stroke color",
              icon: mdiBorderColor,
              color: graph.style.candleStrokeColor,
              onColorSelected: (color: string) => {
                Dispatch({
                  task: "setGraphProp",
                  params: {
                    prop: "candleStrokeColor",
                    subchartIdx,
                    yaxisIdx,
                    graphIdx,
                    newValue: color,
                  },
                });
              },
            },
            {
              text: "candle wick color",
              icon: mdiBorderColor,
              color: graph.style.candleWickStrokeColor,
              onColorSelected: (color: string) => {
                Dispatch({
                  task: "setGraphProp",
                  params: {
                    prop: "candleWickStrokeColor",
                    subchartIdx,
                    yaxisIdx,
                    graphIdx,
                    newValue: color,
                  },
                });
              },
            },
          ]
        : [
            {
              text: "line stroke color",
              icon: mdiBorderColor,
              color: graph.style.strokeColor,
              onColorSelected: (color: string) => {
                Dispatch({
                  task: "setGraphProp",
                  params: {
                    prop: "strokeColor",
                    subchartIdx,
                    yaxisIdx,
                    graphIdx,
                    newValue: color,
                  },
                });
              },
            },
          ]
      : [];

  return T.isChartGraph(graph) ? (
    <CTreeItem
      onClick={() => {
        const id = `graph-sub-${subchartIdx}-y-${yaxisIdx}-graph-${graphIdx}`;
        onSettingsExpand?.(id);
      }}
      key={`graph-sub-${subchartIdx}-y-${yaxisIdx}-graph-${graphIdx}`}
      nodeId={`graph-sub-${subchartIdx}-y-${yaxisIdx}-graph-${graphIdx}`}
      labelText={dataGraph?.name ?? "Graph No." + graphIdx}
      bgColorSelected={theme.palette.primary.light}
      labelIcon={
        <CIcon
          path={mdiChartLine}
          size={"32px"}
          color={theme.palette.secondary.contrastText}
          background={theme.palette.primary.main}
        />
      }
      labelInfo={
        subchartIdx !== 0 || graphIdx !== 0 ? (
          <IconButton
            size="small"
            onClick={(e: any) => {
              e.preventDefault();
              const action: T.ReducerAction<"removeGraph"> = {
                task: "removeGraph",
                params: { subchartIdx, yaxisIdx, graphIdx },
              };
              Dispatch(action);
            }}
          >
            <Icon path={mdiClose} size={1} color={theme.palette.mode === "light" ? "#333" : "#fff"} />
          </IconButton>
        ) : undefined
      }
    >
      {graph.type === "chart" && dataGraph?.meta.type === "candlechart" ? (
        <CTreeItem
          key={`chart-s${subchartIdx}-y${yaxisIdx}-g${graphIdx}-chartType`}
          nodeId={`chart-s${subchartIdx}-y${yaxisIdx}-g${graphIdx}-chartType`}
          labelText={"chart type"}
          typographyVariant="body1"
          labelIcon={<CIcon path={mdiSetLeft} size={"24px"} color={theme.palette.mode === "light" ? "#333" : "#fff"} />}
          labelInfo={
            <Select
              size="small"
              margin="none"
              SelectDisplayProps={{
                style: { paddingTop: 2, paddingBottom: 2 },
              }}
              // inputProps={{ style: { padding: 0, minWidth: 50 } }}
              value={graph.chartType}
              onChange={(e: any) => {
                const newValue = e.target.value;
                Dispatch({
                  task: "setGraphProp",
                  params: {
                    prop: "chartType",
                    subchartIdx,
                    yaxisIdx,
                    graphIdx,
                    newValue,
                  },
                });
              }}
            >
              {["line", "candles"].map((optionVal: any, optValIdx: number) => (
                <MenuItem
                  key={`chart-s${subchartIdx}-y${yaxisIdx}-g${graphIdx}-chartType-o-${optValIdx}`}
                  value={optionVal}
                >
                  {optionVal}
                </MenuItem>
              ))}
            </Select>
          }
        />
      ) : null}
      {graphColorProps(graph).map((graphColorProp, gcIdx) => (
        <CMColorPropTreeItem
          key={`settings-treeitem-chartGraph-s${subchartIdx}-y${yaxisIdx}-g${graphIdx}-p${gcIdx}`}
          nodeId={`settings-treeitem-chartGraph-s${subchartIdx}-y${yaxisIdx}-g${graphIdx}-p${gcIdx}`}
          text={graphColorProp.text}
          color={graphColorProp.color}
          iconPath={graphColorProp.icon}
          onColorSelected={graphColorProp.onColorSelected}
        />
      ))}
    </CTreeItem>
  ) : null;
};
