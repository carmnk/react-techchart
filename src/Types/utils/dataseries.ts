// types for single datasets
export type LineChartDataset = {
  date: Date;
  close: number;
  volume?: number;
};

export type CandleChartDataset = LineChartDataset & {
  open: number;
  high: number;
  low: number;
};

export type ChartDataset = LineChartDataset | CandleChartDataset;

export type IndicatorDataset = {
  prices: (number | null)[];
  date: Date;
  priceLabels?: string[];
};

export type Dataset = ChartDataset | IndicatorDataset;

// doesn't exclude datasets with close property (like CandleChartDataset -> e.g. a CandleChartDataset will also return true)
export const isLineChartDataset = (dataset: Dataset): dataset is LineChartDataset => {
  if ("close" in dataset) return true;
  return false;
};
export const isVolumeDataset = (dataset: Dataset): dataset is ChartDataset & { volume: number } => {
  if ("volume" in dataset) return true;
  return false;
};
export const isIndicatorDataset = (dataset: Dataset): dataset is IndicatorDataset => {
  if ("prices" in dataset) return true;
  return false;
};

type LineChartPixYDataset = { pixClose: number };
type CandleChartPixYDataset = { pixClose: number; pixOpen: number; pixHigh: number; pixLow: number };
type ChartPixYDataset = LineChartPixYDataset | CandleChartPixYDataset;
type IndicatorPixYDataset = { pixPrices: (number | null)[] };
export type PixYDataset = ChartPixYDataset | IndicatorPixYDataset;
export type CandleChartPixDataset = { pixX: number; pixY: CandleChartPixYDataset };
export type LineChartPixDataset = { pixX: number; pixY: LineChartPixYDataset };
export type ChartPixDataset = { pixX: number; pixY: ChartPixYDataset };
export type IndicatorPixDataset = { pixX: number; pixY: IndicatorPixYDataset };
export type PixDataset = { pixX: number; pixY: PixYDataset | null };
export const isCandleChartPixDataset = (pixDataset: PixDataset): pixDataset is CandleChartPixDataset =>
  !pixDataset?.pixY
    ? false
    : "pixOpen" in pixDataset.pixY &&
      "pixHigh" in pixDataset.pixY &&
      "pixLow" in pixDataset.pixY &&
      "pixClose" in pixDataset.pixY
    ? true
    : false;
export const isLineChartPixDataset = (pixDataset: PixDataset): pixDataset is LineChartPixDataset =>
  !pixDataset?.pixY ? false : "pixClose" in pixDataset.pixY ? true : false;
export const isIndicatorPixDataset = (pixDataset: PixDataset): pixDataset is IndicatorPixDataset =>
  !pixDataset?.pixY ? false : "pixPrices" in pixDataset.pixY ? true : false;

export const isCandleChartDataset = (dataset: Dataset): dataset is CandleChartDataset => {
  if ("open" in dataset && "high" in dataset && "low" in dataset && "close" in dataset) return true;
  return false;
};

// types for dataseries
export type ChartDataSeries = ChartDataset[];
export type IndicatorDataSeries = IndicatorDataset[];
export type DataSeries = (ChartDataset | IndicatorDataset)[];

export const isIndicatorDataSeries = (dataSeries: DataSeries): dataSeries is IndicatorDataSeries => {
  const iDataSeries = (dataSeries as IndicatorDataSeries)[dataSeries.length - 1];
  return !!iDataSeries.prices && iDataSeries.prices.length > 0;
};
export const isChartDataSeries = (dataSeries: DataSeries): dataSeries is ChartDataSeries => {
  if (!dataSeries) return false;
  const iDataSeries = (dataSeries as ChartDataSeries)[dataSeries.length - 1];
  return !!iDataSeries.close && !!iDataSeries.date;
};
