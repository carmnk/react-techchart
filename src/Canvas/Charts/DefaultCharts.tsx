import * as T from "../../Types";
import { CBarChart } from "./CBarChart";
import { CCandleChart } from "./CCandleChart";
import { CLineChart } from "./CLineChart";

export type CanvasChart = {
  name: string;
  type: string;
  //   nPoints: number;
  //   category: string;
  //   params: { name: string; val: any; vals: any[]; type: "select" | "number" }[];
  //   default?: {
  //     params?: { icon: string }[];
  //     // style?: any;
  //   };
  component: (props: {
    subCharts: T.ChartState["subCharts"];
    // containerSize: T.ChartState["containerSize"];
    calcXaxis: T.ChartState["calc"]["xaxis"];
    calcSubcharts: T.ChartState["calc"]["subcharts"];
    yToPix?: (y: number, subchartIdx: number, yaxisIdx: number, translatedY?: number) => number;
    pixToY?: (pixY: number, subchartIdx: number, yaxisIdx: number, translatedY?: number) => number;
    subchartIdx: number;
    yaxisIdx: number;
    graphIdx: number;
    indSeriesIdx?: number;
    [key: string]: any;
  }) => JSX.Element | null;
};

export const defaultCanvasCharts: CanvasChart["component"][] = [CBarChart, CLineChart, CCandleChart];
