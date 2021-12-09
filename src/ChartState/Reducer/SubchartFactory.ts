import { isNullish } from "../../utils/Basics";
import * as T from "../../Types";
import { getDefaultGraphStyle } from "../Defaults";

export const createSubChartModel = (params: {
  top: T.SubchartState["top"];
  bottom: T.SubchartState["bottom"];
  type: T.GraphState["type"];
  dataId: T.GraphState["dataId"];
  style: T.GraphState["style"];
  indicator?: T.IndicatorModel;
}): T.SubchartState | null => {
  const { top, bottom, ...yaxisParams } = params;
  const yaxis = createYaxisModel(yaxisParams);
  if (!yaxis) return null;
  return {
    yaxis: [yaxis],
    top: top,
    bottom: bottom,
  };
};

export const createYaxisModel = (params: {
  type: T.GraphState["type"];
  dataId: string;
  style: T.GraphState["style"];
  indicator?: T.IndicatorModel;
}): T.YaxisState | null => {
  const { dataId, style, indicator, type } = params;
  if (type === "indicator" && !indicator /*|| !indSrcId*/) return null;
  const graph =
    type === "indicator" && !!indicator //&& !!indSrcId
      ? createIndicatorGraphModel({
          dataId,
          style: style as T.IndicatorGraphState["style"],
        })
      : createChartGraphModel({ dataId, style: style as T.ChartGraphState["style"] });
  return {
    graphs: [graph],
    tools: [],
  };
};

export const createChartGraphModel = (params: {
  dataId: string;
  style: T.ChartGraphState["style"];
}): T.ChartGraphState => {
  const { dataId, style } = params;
  return {
    style,
    type: "chart" as const,
    chartType: "candles",
    dataId,
  };
};

export const createIndicatorGraphModel = (params: {
  dataId: string;
  style: T.IndicatorGraphState["style"];
}): T.IndicatorGraphState => {
  const { dataId, style } = params;
  return {
    // name: indicator.name,
    type: "indicator" as const,
    dataId,
    style,
  };
};

export const swapSubcharts = (
  current: T.ChartState,
  params: T.ReducerAction<"swapSubcharts">["params"]
): T.ChartState => {
  const { subchartIdx1, subchartIdx2 } = params;
  const lowerIdx = subchartIdx1 <= subchartIdx2 ? subchartIdx1 : subchartIdx2;
  const higherIdx = subchartIdx1 > subchartIdx2 ? subchartIdx1 : subchartIdx2;

  const subchart1 = current.subCharts[lowerIdx];
  const subchart2 = current.subCharts[higherIdx];
  const height1 = subchart1.bottom - subchart1.top;
  const height2 = subchart2.bottom - subchart2.top;
  const dHeight21 = height2 - height1;
  return lowerIdx === higherIdx || isNullish(lowerIdx) || isNullish(higherIdx) || higherIdx >= current.subCharts.length
    ? current
    : {
        ...current,
        subCharts: [
          ...current.subCharts.slice(0, lowerIdx),
          { ...subchart2, bottom: subchart1.top + height2, top: subchart1.top },
          ...current.subCharts
            .slice(lowerIdx + 1, higherIdx)
            .map((sub, sIdx) => ({ ...sub, top: sub.top + dHeight21, bottom: sub.bottom + dHeight21 })),
          { ...subchart1, top: subchart2.top + dHeight21, bottom: subchart2.bottom },
          ...current.subCharts.slice(higherIdx + 1),
        ],
      };
};

export const resizeSubcharts = (params: {
  subchartsHeight: number;
  subCharts: T.ChartState["subCharts"];
  addSubchart?: { data: T.Data; darkMode: boolean };
  removeSubchartIdx?: number;
}) => {
  const { subCharts, removeSubchartIdx, addSubchart, subchartsHeight } = params;
  const defaultMainHeight = 250;
  const defaultSubHeight = 150;

  const newData = addSubchart?.data;
  const subchartsDeleted = isNullish(removeSubchartIdx)
    ? subCharts
    : [...subCharts.slice(0, removeSubchartIdx), ...subCharts.slice(removeSubchartIdx + 1)];

  const amtNewSubcharts = subchartsDeleted.length + (addSubchart ? 1 : 0);
  const initFullfillFactor = subchartsHeight / (defaultMainHeight + (amtNewSubcharts - 1) * defaultSubHeight);
  const currentSubchartHeights = subchartsDeleted.map((subchart, sIdx) =>
    subchart.bottom - subchart.top > 0
      ? subchart.bottom - subchart.top
      : initFullfillFactor >= 1
      ? sIdx === 0
        ? subchartsHeight - (amtNewSubcharts - 1) * defaultSubHeight
        : defaultSubHeight
      : sIdx === 0
      ? subchartsHeight - (amtNewSubcharts - 1) * Math.floor(defaultSubHeight * initFullfillFactor)
      : Math.floor(defaultSubHeight * initFullfillFactor)
  );

  const curComplSubchartHeights = addSubchart ? [...currentSubchartHeights, defaultSubHeight] : currentSubchartHeights;
  const curSecondarySubHeight = curComplSubchartHeights.slice(1).reduce((acc, cur) => acc + cur, 0);
  const optHeight = defaultMainHeight + curSecondarySubHeight;

  if (subchartsHeight >= optHeight) {
    const distributable = subchartsHeight - curComplSubchartHeights[0] - curSecondarySubHeight;
    const refillables = curComplSubchartHeights.map((h, hIdx) =>
      Math.max((hIdx === 0 ? defaultMainHeight : defaultSubHeight) - h, 0)
    );
    const refillableHeight = refillables.reduce((acc, cur) => acc + cur, 0);
    const fulfillFactor =
      refillableHeight === 0 ? 0 : distributable >= refillableHeight ? 1 : distributable / refillableHeight;
    const refilledHeights = curComplSubchartHeights.map((h, hIdx) => h + Math.floor(fulfillFactor * refillables[hIdx]));
    const sumRefilledSecondaryHeights = refilledHeights.slice(1).reduce((acc, cur) => acc + cur, 0);
    const resizedSubcharts = subchartsDeleted.reduce<T.ChartState["subCharts"]>(
      (acc, cur, idx) =>
        idx === 0
          ? [{ ...cur, top: 0, bottom: subchartsHeight - sumRefilledSecondaryHeights }]
          : [
              ...acc,
              {
                ...cur,
                top: acc[acc.length - 1].bottom,
                bottom: acc[acc.length - 1].bottom + refilledHeights[idx],
              },
            ],
      []
    );
    const indicatorLines = !!newData && newData.type === "indicator" ? newData.indicator.graphTypes.length : undefined;
    const newSubchart = (
      !newData || resizedSubcharts.length === 0
        ? []
        : [
            createSubChartModel({
              top: resizedSubcharts[resizedSubcharts.length - 1].bottom,
              bottom: subchartsHeight,
              dataId: newData.id,
              style: getDefaultGraphStyle(newData.type, addSubchart.darkMode, undefined, indicatorLines),
              indicator: newData.type === "indicator" ? newData.indicator : undefined,
              type: newData.type,
            }),
          ]
    ).filter((val) => val !== null) as T.SubchartState[];
    return [...resizedSubcharts, ...newSubchart];
  } else {
    const shrink = subchartsHeight / (curComplSubchartHeights[0] + curSecondarySubHeight); // /optHeight;
    const shrinkedSecondarySubHeights = curComplSubchartHeights
      .slice(1)
      .map((height) => Math.min(Math.floor(height * shrink), 150));
    const sumShrinkedSecSubHeights = shrinkedSecondarySubHeights.reduce((acc, cur) => acc + cur);
    const resizedSubcharts = subchartsDeleted.reduce<T.ChartState["subCharts"]>(
      (acc, cur, idx) =>
        idx === 0
          ? [
              {
                ...cur,
                top: 0,
                bottom: subchartsHeight - sumShrinkedSecSubHeights,
              },
            ]
          : [
              ...acc,
              {
                ...cur,
                top: acc[acc.length - 1].bottom,
                bottom: acc[acc.length - 1].bottom + shrinkedSecondarySubHeights[idx - 1],
              },
            ],
      []
    );
    const indicatorLines = !!newData && newData.type === "indicator" ? newData.indicator.graphTypes.length : undefined;
    const newSubchart = (
      !newData || resizedSubcharts.length === 0
        ? []
        : [
            createSubChartModel({
              top: resizedSubcharts[resizedSubcharts.length - 1].bottom,
              bottom: subchartsHeight,
              dataId: newData.id,
              style: getDefaultGraphStyle(newData.type, addSubchart.darkMode, undefined, indicatorLines),
              indicator: newData.type === "indicator" ? newData.indicator : undefined,
              type: newData.type,
            }),
          ]
    ).filter((val) => val !== null) as T.SubchartState[];
    return [...resizedSubcharts, ...newSubchart];
  }
};
