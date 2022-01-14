import { ToolModel } from "../ToolModel";

export type SubchartState = {
  yaxis: YaxisState[];
  top: number;
  bottom: number;
};

export type YaxisState = {
  graphs: GraphState[];
  tools: ToolState[];
};

export type GraphState = ChartGraphState | IndicatorGraphState;

export type ChartGraphState = GenericGraphState & {
  type: "chart";
  chartType: "line" | "candles"; // | "area";
  style: {
    candleWickStrokeColor: string;
    candleStrokeColor: string;
    candleDownColor: string;
    candleUpColor: string;
    strokeColor: string;
  };
};
export type IndicatorGraphState = GenericGraphState & {
  type: "indicator";
  style: {
    strokeColor: string[];
  };
};

type GenericGraphState = {
  dataId: string;
};

export const isIndicatorGraph = (graph: GraphState): graph is IndicatorGraphState => {
  if (graph.type === "indicator") return true;
  return false;
};
export const isChartGraph = (graph: GraphState): graph is ChartGraphState => {
  if (graph.type === "chart") return true;
  return false;
};

export type ToolState = {
  xy: [number, number][];
  type: "hline" | "vline" | "trendline";
  style: {
    strokeColor: string;
    anchorColor: string;
  };
  params?: ToolModel["params"];
};
