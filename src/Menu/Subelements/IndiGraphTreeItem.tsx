import React from "react";
import IconButton from "@mui/material/IconButton";
import useTheme from "@mui/material/styles/useTheme";
import { mdiChartBellCurve, mdiClose, mdiBorderColor } from "@mdi/js";
import { mdiApplicationVariableOutline, mdiDatabaseExportOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { CIcon } from "../../Components/CIcon";
import { CTreeItem } from "../../Components/CTreeItem";
import * as T from "../../Types";
import { isCircularIndicatorDependency } from "../../ChartState/Factory/IndicatorDataFactory";
import { CMColorPropTreeItem } from "./CMColorPropTreeItem";
import { CMNumberPropTreeItem } from "./CMNumberPropTreeItem";
import { CMSelectPropTreeItem } from "./CMSelectPropTreeItem";

export const ChartMenuIndiGraphTreeItemComponent = (props: {
  subchartIdx: number;
  yaxisIdx: number;
  graphIdx: number;
  graphs: T.GraphState[];
  Dispatch: T.ChartController["Dispatch"];
  handleToggleExpanded?: (id: string) => void;
  data: T.ChartState["data"];
  fullscreen: boolean;
}) => {
  const { subchartIdx, yaxisIdx, graphIdx, graphs, Dispatch, handleToggleExpanded, data, fullscreen } = props;
  const graph = graphs[graphIdx];
  const theme = useTheme();
  const dataGraph = data.find((val) => val.id === graph?.dataId) as T.IndicatorData;
  const initParams = dataGraph.indicator.params;
  const initParamVals = initParams.map((param) => param.val);

  const modifyNumericParam = React.useCallback(
    (dataId: string, paramIdx: number) => (newValue: number | string) => {
      Dispatch({
        task: "modifyIndicatorData",
        params: { dataId, newParam: { paramIdx, newValue } },
      });
    },
    [Dispatch]
  );

  if (!T.isIndicatorGraph(graph)) return null;
  if (!graph || dataGraph?.type !== "indicator") return null;

  return (
    <CTreeItem
      key={`settings-treeitem-indiGraph-s${subchartIdx}-y${yaxisIdx}-g${graphIdx}`}
      nodeId={`settings-treeitem-indiGraph-s${subchartIdx}-y${yaxisIdx}-g${graphIdx}`}
      bgColorSelected={theme.palette.primary.light}
      onClick={() => {
        const id = `settings-treeitem-indiGraph-s${subchartIdx}-y${yaxisIdx}-g${graphIdx}`;
        handleToggleExpanded?.(id);
      }}
      labelIcon={
        <CIcon
          path={mdiChartBellCurve}
          size={"32px"}
          color={theme.palette.secondary.contrastText}
          background={theme.palette.primary.main}
        />
      }
      labelText={dataGraph.fullName}
      labelInfo={
        subchartIdx !== 0 || graphIdx !== 0 ? (
          <IconButton
            size="small"
            onClick={(e: any) => {
              e.preventDefault();
              const action: T.ReducerAction<"removeGraph"> = {
                task: "removeGraph",
                params: { subchartIdx, yaxisIdx: 0, graphIdx },
              };
              Dispatch(action);
            }}
          >
            <Icon path={mdiClose} size={1} color={theme.palette.mode === "light" ? "#333" : "#fff"} />
          </IconButton>
        ) : undefined
      }
    >
      {["dataSeries", "chartSeries"].includes(dataGraph.indicator.indicatorFnType) && (
        <CMSelectPropTreeItem
          nodeId={`settings-treeitem-indiGraph-src-s${subchartIdx}-y${yaxisIdx}-g${graphIdx}`}
          labelIcon={<CIcon path={mdiDatabaseExportOutline} size={"24px"} color={theme.palette.text.primary} />}
          labelText="Source"
          value={dataGraph.indSrcId}
          fullscreen={fullscreen}
          options={(!dataGraph.indicator.default.newSubchart
            ? data.filter((dat) => graphs.map((graph) => graph.dataId).includes(dat.id))
            : dataGraph.indicator.indicatorFnType === "dataSeries"
            ? data
            : dataGraph.indicator.indicatorFnType === "chartSeries"
            ? data.filter((dat) => dat.type === "chart")
            : []
          )
            .filter((dat) => dat.id !== dataGraph.id && !isCircularIndicatorDependency(data, dataGraph.id, dat.id))
            .map((dat) => ({ value: dat.id, text: dat.name }))}
          onChangeConfirmed={(newValue) => {
            if (typeof newValue !== "string") return;
            Dispatch({ task: "modifyIndicatorData", params: { dataId: dataGraph.id, newIndSrcId: newValue } });
          }}
        />
      )}

      {dataGraph.indicator.graphTypes.map((gType, gtIdx) => {
        const colors = graph.style.strokeColor;
        return (
          <CMColorPropTreeItem
            nodeId={`settings-treeitem-indiGraph-clrProps-${subchartIdx}-y${yaxisIdx}-g${graphIdx}-gt${gtIdx}`}
            key={`settings-treeitem-indiGraph-clrProps-${subchartIdx}-y${yaxisIdx}-g${graphIdx}-gt${gtIdx}`}
            color={graphs[graphIdx].style?.strokeColor?.[gtIdx]}
            iconPath={mdiBorderColor}
            text="line stroke color"
            fullscreen={fullscreen}
            onColorSelected={(color) => {
              Dispatch({
                task: "setGraphProp",
                params: {
                  subchartIdx,
                  yaxisIdx: 0,
                  graphIdx,
                  newValue: [...colors.slice(0, gtIdx), color, ...colors.slice(gtIdx + 1)],
                  prop: "strokeColor",
                },
              });
            }}
          />
        );
      })}
      {initParams.map((param, paramIdx) => {
        const defParam = dataGraph.indicator.default?.params?.find((defParam) => defParam?.name === param?.name);
        const srcData = data?.find((dat) => dat.id === dataGraph.indSrcId);
        return defParam?.type === "number" ? (
          <CMNumberPropTreeItem
            key={`sub-${subchartIdx}-yaxis-${yaxisIdx}-graph-${graphIdx}-${paramIdx}`}
            nodeId={`sub-${subchartIdx}-yaxis-${yaxisIdx}-graph-${graphIdx}-${paramIdx}`}
            labelText={param.name}
            labelIcon={<CIcon path={mdiApplicationVariableOutline} size={"24px"} color={theme.palette.text.primary} />}
            onChangeConfirmed={modifyNumericParam?.(dataGraph.id, paramIdx)}
            value={initParamVals?.[paramIdx] as number}
          />
        ) : defParam?.type === "select" || defParam?.type === "applyOn" ? (
          <CMSelectPropTreeItem
            key={`sub-${subchartIdx}-yaxis-${yaxisIdx}-graph-${graphIdx}-${paramIdx}`}
            nodeId={`sub-${subchartIdx}-yaxis-${yaxisIdx}-graph-${graphIdx}-${paramIdx}`}
            labelText={param.name}
            labelIcon={<CIcon path={mdiApplicationVariableOutline} size={"24px"} color={theme.palette.text.primary} />}
            fullscreen={fullscreen}
            value={
              defParam?.type === "applyOn" && srcData?.type === "chart" && typeof initParamVals?.[paramIdx] === "number"
                ? "close"
                : initParamVals?.[paramIdx]
            }
            onChangeConfirmed={modifyNumericParam?.(dataGraph.id, paramIdx)}
            options={
              defParam?.type === "applyOn" && srcData?.type === "indicator"
                ? new Array(srcData?.indicator?.graphTypes?.length).fill(0).map((v, idx) => idx.toString())
                : defParam?.type === "applyOn" && srcData?.type === "chart"
                ? ["open", "high", "low", "close"]
                : defParam?.type === "select"
                ? defParam?.options
                : []
            }
          />
        ) : null;
      })}
    </CTreeItem>
  );
};
export const ChartMenuIndiGraphTreeItem = React.memo(ChartMenuIndiGraphTreeItemComponent);
