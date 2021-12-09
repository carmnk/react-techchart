import Box from "@mui/material/Box";
import React from "react";
import * as T from "../Types";
import { GraphLabel } from "./GraphLabel";

export const ChartLabels = (props: {
  data: T.ChartState["data"];
  subcharts: T.ChartState["subCharts"];
  calcPointer: T.ChartState["calc"]["pointer"];
  calcSubcharts: T.ChartState["calc"]["subcharts"];
  onGraphLabelClick: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    subchartIdx: number,
    graphIdx: number
  ) => void;
}) => {
  const { data, calcPointer, calcSubcharts, subcharts, onGraphLabelClick } =
    props;
  return (
    <React.Fragment>
      {subcharts.map((subchart, sIdx) => (
        <Box
          key={`chart-label-subarea-${sIdx}`}
          sx={{
            position: "absolute",
            top: subchart.top,
          }}
        >
          {subchart.yaxis[0].graphs.map((graph, gIdx) => {
            const graphData = data.find((val) => val.id === graph.dataId);
            const graphDataSeries = graphData?.data ?? [];
            const graphDecimals = graphData?.decimals ?? 0;
            const calcGraph = calcSubcharts?.[sIdx]?.yaxis?.[0]?.graphs?.[gIdx];
            if (!calcGraph?.lastDataset || !graphData) return null;
            const name =
              T.isIndicatorGraph(graph) &&
              graphData.type === "indicator" &&
              graphData.indicator.params.length > 0
                ? `${graphData.indicator.name}(${graphData.indicator.params[0].val})`
                : T.isIndicatorGraph(graph) &&
                  graphData.type === "indicator" &&
                  graphData.indicator.params.length === 0
                ? `${graphData.indicator.name}`
                : graphData.name;
            const tmpDataset: T.Dataset =
              (calcPointer.isHovering &&
              sIdx === calcPointer?.move.subchartIdx &&
              calcPointer?.move.snapDatasets?.[0]?.graphIdx === gIdx
                ? calcPointer?.move?.snapDatasets?.[0]?.data
                : calcPointer.isHovering && calcPointer.move.x !== null
                ? graphDataSeries[calcPointer?.move.x]
                : calcGraph.lastDataset.data) || calcGraph.lastDataset.data;

            return (
              <GraphLabel
                key={`chart-label-${sIdx}-${gIdx}`}
                onClick={onGraphLabelClick}
                subchartIdx={sIdx}
                graphIdx={gIdx}
                name={name}
                dataset={tmpDataset}
                decimals={
                  T.isIndicatorGraph(graph) &&
                  graphData.type === "indicator" &&
                  graphData.indicator.default.decimals !== undefined
                    ? graphData.indicator.default.decimals
                    : graphDecimals
                }
                graphTypes={
                  graphData?.type === "indicator"
                    ? graphData?.indicator?.graphTypes
                    : undefined
                }
              />
            );
          })}
        </Box>
      ))}
    </React.Fragment>
  );
};
