import * as T from "../Types";
import { isNullish } from "../utils/Basics";

export const getAppliedPriceKeys = (applyOn?: number | "open" | "high" | "low" | "close") => {
  const chartPriceKey =
    typeof applyOn === "string" && ["open", "high", "low", "close"].includes(applyOn)
      ? applyOn
      : typeof applyOn === "undefined" || applyOn === 0
      ? "close"
      : null;
  const parseddataSeriesKey = typeof applyOn === "string" ? parseFloat(applyOn) : applyOn;
  const indPriceIdx =
    typeof parseddataSeriesKey === "number" && !isNaN(parseddataSeriesKey)
      ? parseddataSeriesKey
      : typeof applyOn === "undefined"
      ? 0
      : null;
  return { chartPriceKey, indPriceIdx }; // better to infer datasrc type ("chart" | "indicator") for each dataset
};

export const getPriceToApply = (
  dataset: T.Dataset,
  chartPriceKey: keyof Omit<T.CandleChartDataset, "date" | "volume"> | null,
  indPriceIdx: number | null
) => {
  return T.isLineChartDataset(dataset) && chartPriceKey
    ? chartPriceKey in dataset
      ? (dataset as T.CandleChartDataset)[chartPriceKey]
      : dataset["close"]
    : T.isIndicatorDataset(dataset) && !isNullish(indPriceIdx)
    ? dataset.prices?.[indPriceIdx] || 0
    : 0;
};
