import * as T from "../../Types";
import { getIndicatorsDependantIndicatorDatas } from "../Factory/IndicatorDataFactory";

export const getRtTicks = (
  rtData: T.UseChartControllerProps["rtData"] | undefined,
  data: T.ChartState["data"],
  subcharts: T.ChartState["subcharts"],
  calc: T.ChartState["calc"]
) => {
  const maingraphId = subcharts?.[0]?.yaxis?.[0]?.graphs?.[0]?.dataId;
  if (!rtData || !calc.yToPix || !maingraphId) return [];
  const lastTick =
    calc.subcharts?.[0]?.yaxis?.[0]?.graphs?.[0]?.curTicks?.[
      calc.subcharts?.[0]?.yaxis?.[0]?.graphs?.[0]?.curTicks.length - 1
    ];
  const rtChartTicks: T.RealtimeDataTick[] =
    (calc.yToPix &&
      rtData &&
      lastTick &&
      [{ data: rtData, dataId: maingraphId }].reduce<T.RealtimeDataTick[]>((acc, cur) => {
        const dataIdx = data.findIndex((dat) => dat.id === cur.dataId);
        return [
          ...acc,
          {
            data: cur?.data
              ? cur?.data.map((dat, dIdx) => ({
                  ...dat,
                  x: calc.xaxis.xLast + dIdx,
                }))
              : [],
            dataId: data?.[dataIdx]?.id,
            ticks: cur.data.map((dat, dIdx) => ({
              pixX: lastTick.pixX + (dIdx + 0) * calc.xaxis.scaledWidthPerTick,
              pixY: calculatePixYDataset(dat, data?.[dataIdx]?.id, data, subcharts, calc.yToPix),
            })),
          },
        ];
      }, [])) ??
    [];
  const dependantIndicatorIds = rtChartTicks
    .map((rtChart) => getIndicatorsDependantIndicatorDatas(data, rtChart.dataId))
    .flat();
  const rtTicks = dependantIndicatorIds.reduce<T.RealtimeDataTick[]>((acc, curId) => {
    const indicatorData = data.find((d) => d.id === curId && d.type === "indicator");
    if (!indicatorData || indicatorData?.type !== "indicator") return acc;
    const iFn = indicatorData.indicator.indicatorFn as T.DataSeriesIndicatorFn;
    const indSrcId = indicatorData.indSrcId;
    const params = indicatorData.indicator.params;
    const complSrcDataseries = [
      ...(data.find((dat) => dat.id === indSrcId)?.data ?? []),
      ...(acc.find?.((rtTick) => rtTick?.dataId === indSrcId)?.data?.slice(1) ?? []),
    ];
    const completePrevData = [...(indicatorData.data ?? [])] as T.IndicatorDataset[];
    if (!iFn || !complSrcDataseries?.length || !lastTick) return acc;
    const newDataseries = iFn({
      dataseries: complSrcDataseries,
      prev: completePrevData,
      ...params.reduce((accObj, curParam) => ({ ...accObj, [curParam.name]: curParam.val }), {}),
    }).slice(indicatorData.data.length - 1) as T.IndicatorDataset[];

    const newRtDataTick: T.RealtimeDataTick = {
      data: newDataseries.map((dataset, dIdx) => ({
        ...dataset,
        x: completePrevData.length - 1 + dIdx,
      })),
      dataId: curId,
      ticks: newDataseries.map((dataset, dIdx) => ({
        pixX: lastTick.pixX + dIdx * calc.xaxis.scaledWidthPerTick, // lastTick is actually for mainchart !!
        pixY: calculatePixYDataset(dataset, curId, data, subcharts, calc.yToPix),
      })),
    };
    return [...acc, newRtDataTick];
  }, rtChartTicks);
  return rtTicks;
};

export const isRtDataOutOfRange = (
  rtData: T.UseChartControllerProps["rtData"],
  subcharts: T.ChartState["subcharts"],
  calc: T.ChartState["calc"]
) => {
  let isRtDataOutOfRange = false;
  const maingraphId = subcharts?.[0]?.yaxis?.[0]?.graphs?.[0]?.dataId;
  rtData &&
    rtData.length > 0 &&
    subcharts.length === calc.subcharts.length &&
    calc.xaxis.xUnlimited > calc.xaxis.xLast && // and not rtData.length
    calc.subcharts.forEach((calcSubchart, sIdx) => {
      // const subchart = subcharts[sIdx];
      // const filteredRtData =
      //   [rtData]
      //     ?.filter((rtDat) =>
      //       subchart.yaxis
      //         .map((y) => y.graphs.map((g) => g.dataId))
      //         .flat()
      //         .includes(rtDat.dataId)
      //     )
      //     .map((rtDat) => ({
      //       ...rtDat,
      //       data: rtDat.data.slice(1, calc.xaxis.xUnlimited - calc.xaxis.xLast + 1),
      //     })) ?? [];
      const filteredRtData = [
        { data: rtData.slice(1, calc.xaxis.xUnlimited - calc.xaxis.xLast + 1), dataId: maingraphId },
      ];
      if (sIdx !== 0) return;
      if (filteredRtData.length === 0) return;
      const curMax = Math.max(...calcSubchart.yaxis.map((cyaxis) => cyaxis.yMaxExact));
      const rtMax =
        !filteredRtData || filteredRtData.length === 0
          ? 0
          : Math.max(
              ...filteredRtData
                .map((rtDat) =>
                  rtDat.data.map((dat) => (T.isCandleChartDataset(dat) ? dat.high ?? dat.close : dat.close))
                )
                .flat()
            );
      const curMin = Math.min(...calcSubchart.yaxis.map((cyaxis) => cyaxis.yMinExact));
      const rtMin =
        !filteredRtData || filteredRtData.length === 0
          ? rtMax
          : Math.min(
              ...filteredRtData
                .map((rtDat) =>
                  rtDat.data.map((dat) => (T.isCandleChartDataset(dat) ? dat.low ?? dat.close : dat.close))
                )
                .flat()
            );
      if (filteredRtData && (rtMax > curMax || rtMin < curMin)) {
        isRtDataOutOfRange = true;
      }
    });
  return isRtDataOutOfRange;
};

// only post calculation !
export const calculatePixYDataset = (
  dataset: T.Dataset,
  dataId: string,
  data: T.ChartState["data"],
  subcharts: T.ChartState["subcharts"],
  yToPix: T.ChartState["calc"]["yToPix"]
): T.PixYDataset | null => {
  const paths = subcharts
    .map((subchart, sIdx) =>
      subchart.yaxis
        .map((yaxis, yIdx) =>
          yaxis.graphs.map((graph, gIdx) =>
            graph.dataId === dataId ? { subchartIdx: sIdx, yaxisIdx: yIdx, graphIdx: gIdx } : null
          )
        )
        .flat()
    )
    .flat()
    .filter((val) => val !== null);
  const path = paths?.[0];
  if (!path || !yToPix) return null;
  const yToPixSpec = (price: number) => yToPix(price, path.subchartIdx, path.yaxisIdx);
  const graphTypes = (data.find((dat) => dat.id === dataId && dat.type === "indicator") as T.IndicatorData | undefined)
    ?.indicator?.graphTypes;
  const pixY = T.isIndicatorDataset(dataset)
    ? {
        pixPrices: dataset.prices.map((price, pIdx) =>
          price && ["line", "bars"].includes(graphTypes?.[pIdx]?.type ?? "") ? yToPixSpec(price) : null
        ),
      }
    : T.isCandleChartDataset(dataset)
    ? {
        pixOpen: yToPixSpec(dataset.open),
        pixHigh: yToPixSpec(dataset.high),
        pixLow: yToPixSpec(dataset.low),
        pixClose: yToPixSpec(dataset.close),
      }
    : T.isLineChartDataset(dataset)
    ? { pixClose: yToPixSpec(dataset.close) }
    : null;
  return pixY;
};
