import { ChartState } from "./chartstate/chartstate";
import { ChartGraphState } from "./chartstate/subcharts";
import { ChartStateDispatch } from "./Reducer";
import { IndicatorModel } from "./IndicatorModel";
import { ChartDataSeries, Dataset, PixDataset } from "./utils/dataseries";
import { DeepPartial } from "./utils/utils";

// useChartController Hook type
export type UseChartController = (props: UseChartControllerProps) => ChartController;

// ChartController (returned by useChartController)
export type ChartController = {
  ChartState: ChartState;
  Dispatch: ChartStateDispatch;
  ContainerRef: React.RefObject<HTMLDivElement>;
  PointerContainerRef: React.RefObject<HTMLDivElement>;
  settings: UseChartControllerProps["settings"] | undefined;
  events: UseChartControllerProps["events"] | undefined;
  rtTicks: RealtimeDataTick[] | undefined;
};

// useChartController Prop object type
export type UseChartControllerProps = {
  data: ChartInputData;
  rtData?: ChartDataSeries;
  width?: number;
  height?: number;
  settings?: {
    containerMode?: "static" | "responsive";
    disableCrosshair?: boolean;
    disableLabels?: boolean;
    disableMenu?: boolean;
    disableTheme?: boolean;
    indicators?: IndicatorModel[];
    initialIndicators?: IndicatorInputData[];
    initialTheme?: ChartTheme;
    maxUpdatesPerSec?: number;
    themes?: (ChartTheme & { name: "string" })[];
  };
  events?: {
    disablePointerEvents?: boolean;
    onDataChange?: (newData: ChartInputData) => void;
    onFullscreen?: () => void;
    onFullscreenExit?: () => void;
  };
};

export type InputData = ChartInputData | IndicatorInputData;

export type ChartInputData = {
  data: ChartDataSeries;
  name: string;
  type: "chart";
  id: string;
  graphProps?: {
    chartType?: ChartGraphState["chartType"];
    style?: DeepPartial<ChartGraphState["style"]>;
  };
};

export type IndicatorInputData = {
  type: "indicator";
  indicator: IndicatorModel;
  name?: string;
  id?: string; // or default id is assigned
  indSrcId?: string; // default -> mainchart id
  graphProps?: {
    subchartIdx?: number;
    yaxisIdx?: number;
    graphIdx?: number;
    style?: {
      strokeColor: string[];
    };
  };
};

export type ChartTheme = DeepPartial<ChartState["theme"]>;

export type RealtimeDataTick = {
  data: (Dataset & { x: number })[];
  dataId: string;
  ticks: PixDataset[] | null;
};
