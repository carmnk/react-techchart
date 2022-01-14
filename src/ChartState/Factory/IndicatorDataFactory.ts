import uniq from "lodash/uniq";
import cloneDeep from "lodash/cloneDeep";
import uniqid from "uniqid";
import { isNullish } from "../../utils/Basics";
import * as T from "../../Types";

export const createIndicatorData = (
  chartSeries: T.DataSeries,
  indSrcId: string,
  indicator: T.IndicatorModel,
  indSrcLineIdx?: number,
  id?: string,
  name?: string
): T.IndicatorData => {
  const indicatorCopy = cloneDeep(indicator);
  const seriesKeyParam = indicatorCopy.params.findIndex((param) => param.name === "applyOn");
  if (seriesKeyParam !== -1 && !isNullish(indSrcLineIdx)) indicatorCopy.params[seriesKeyParam].val = indSrcLineIdx;
  const indicatorData: T.IndicatorDataSeries = (indicator.indicatorFn as T.DataSeriesIndicatorFn)?.({
    dataseries: chartSeries,
    prev: [],
    ...indicatorCopy.params.reduce((accObj, curParam) => ({ ...accObj, [curParam.name]: curParam.val }), {}),
  });
  const decimals = indicatorCopy.default.decimals ? indicatorCopy.default.decimals : 2; // 2 decimals if not otherwise provided
  const intId = id ? id : uniqid();
  const nameInt = name ?? indicatorCopy.name;
  return {
    data: indicatorData,
    name: nameInt,
    fullName:
      nameInt +
      "(" +
      indicatorCopy.params
        .map((param) => (param.name !== "applyOn" ? param.val : null))
        .filter((val) => val !== null)
        .join(",") +
      ")",
    type: "indicator" as const,
    decimals,
    indicator: indicatorCopy,
    indSrcId,
    id: intId,
  };
};

// recalc single! indicator dataseries and update indSrcId and params if changed
export const recalcIndicatorData = (
  data: T.ChartState["data"],
  dataId: string,
  updates?: { newIndSrcId?: string; newParams?: T.IndicatorModel["params"] },
  prevData?: T.IndicatorDataSeries
): T.IndicatorData | null => {
  const { newIndSrcId, newParams } = updates ?? {};
  const indicatorData = data.find((d) => d.id === dataId && d.type === "indicator");
  if (indicatorData?.type !== "indicator") return null;
  const iFn = indicatorData.indicator?.indicatorFn as T.DataSeriesIndicatorFn;
  const indSrcId = newIndSrcId ? newIndSrcId : indicatorData.indSrcId;
  const srcDataseries = data.find((dat) => dat.id === indSrcId)?.data;
  if (!iFn || !srcDataseries) return null;
  const params = newParams ? newParams : indicatorData.indicator.params;

  return {
    ...indicatorData,
    data: iFn({
      dataseries: srcDataseries,
      prev: prevData ?? [],
      ...params.reduce((accObj, curParam) => ({ ...accObj, [curParam.name]: curParam.val }), {}),
    }),
    fullName: !newParams
      ? indicatorData.fullName
      : indicatorData.name + "(" + newParams.map((param) => param.val).join(",") + ")",
    indSrcId,
    indicator: { ...indicatorData.indicator, params },
  };
};

// indicator data state itself may depend on other indicator data
export const getIndicatorsCalcDepIndicatorDatas = (
  data: ({ id: string; type: "chart" } | { id: string; type: "indicator"; indSrcId: string })[],
  dataId: string,
  recursionResult?: string[]
): string[] => {
  const recResult = recursionResult ?? [];
  if (recResult.includes(dataId)) return [];
  const indicatorData = data.find((d) => d?.id === dataId && d?.type === "indicator");
  if (indicatorData?.type !== "indicator") return [];
  const child = data.find((d) => d.id === indicatorData.indSrcId);
  return child?.type === "chart"
    ? [indicatorData.id]
    : child?.type === "indicator"
    ? [...getIndicatorsCalcDepIndicatorDatas(data, child.id, [...recResult, indicatorData.id]), indicatorData.id] //childs first!
    : [];
};

// when changing indicator data other indicator data(s) may be affected and to be updated, too
export const getIndicatorsDependantIndicatorDatas = (data: T.ChartState["data"], dataId: string): string[] => {
  return (data.filter((dat) => dat.type === "indicator" && dat.indSrcId === dataId) as T.IndicatorData[])
    .map((dat) => [dat.id, ...getIndicatorsDependantIndicatorDatas(data, dat.id)])
    .flat();
};

export const isCircularIndicatorDependency = (data: T.ChartState["data"], dataId: string, newIndSrcId: string) =>
  getIndicatorsCalcDepIndicatorDatas(data, newIndSrcId).includes(dataId);

export const updateIndicatorData = (
  current: T.ChartState,
  params: {
    dataId: string;
    prevData?: T.IndicatorDataSeries;
    newParam?: { paramIdx: number; newValue: any };
    newIndSrcId?: string;
  }
): T.ChartState["data"] => {
  const { dataId, prevData, newParam, newIndSrcId } = params;
  const dataGraph = current.data.find((dat) => dat.id === dataId);
  if (dataGraph?.type !== "indicator") return current.data;
  const newParams =
    newParam &&
    dataGraph.indicator.params.map((param, pIdx) =>
      pIdx !== newParam?.paramIdx ? param : { ...param, val: newParam.newValue }
    );
  const { data } = current;
  // dismiss circular dependencies
  if (!!newIndSrcId && isCircularIndicatorDependency(data, dataId, newIndSrcId)) return data;
  const dependingDataIndicatorsIds = uniq([dataId, ...getIndicatorsDependantIndicatorDatas(data, dataId)]);
  const dataCopy = [...data];
  dependingDataIndicatorsIds.forEach((id) => {
    const dataIdx = dataCopy.findIndex((dat) => dat.id === id);
    const updatedIndData = recalcIndicatorData(
      dataCopy,
      id,
      id === dataId ? { newIndSrcId, newParams } : undefined,
      prevData ?? []
    );
    if (updatedIndData) dataCopy[dataIdx] = updatedIndData;
  });
  return dataCopy;
};
