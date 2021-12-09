import { ChartState } from "./ChartState";
import { ToolState } from "./ChartStateSubchart";

export type ToolModel = {
  name: string;
  type: string;
  nPoints: number;
  category: string;
  params: { name: string; val: any; vals: any[]; type: "select" | "number" }[];
  default?: {
    params?: { icon: string }[];
    // style?: any;
  };
  component: (props: {
    subcharts: ChartState["subCharts"];
    subchartIdx: number;
    // yaxisIdx: number;
    // toolIdx: number;
    xy: [number, number][];
    drawPixXy?: [number, number][];
    containerSize: ChartState["containerSize"];
    // draw: ChartState["draw"];
    style: ToolState["style"];
    calcXaxis: ChartState["calc"]["xaxis"];
    calcSubcharts: ChartState["calc"]["subcharts"];
    yToPix?: (y: number, subchartIdx: number, yaxisIdx: number, translatedY?: number) => number;
    pixToY?: (pixY: number, subchartIdx: number, yaxisIdx: number, translatedY?: number) => number;
    [key: string]: any;
  }) => JSX.Element | null;
}; 
