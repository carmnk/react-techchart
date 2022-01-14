import { ChartController } from "./useChartController";

export type ChartProps = {
  Controller: ChartController;
  children?: React.ReactNode;
};

export type Chart = React.ForwardRefExoticComponent<ChartProps & React.RefAttributes<HTMLDivElement>>;
