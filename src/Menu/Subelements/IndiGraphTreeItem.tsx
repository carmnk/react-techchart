import React from "react";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import useTheme from "@mui/material/styles/useTheme";
import {
  mdiChartBellCurve,
  mdiClose,
  mdiBorderColor,
  mdiIframeVariableOutline,
  mdiDatabaseExportOutline,
} from "@mdi/js";
import Icon from "@mdi/react";
import { CIcon } from "../../Components/CIcon";
import { CTreeItem } from "../../Components/CTreeItem";
import * as T from "../../Types";
import { isCircularIndicatorDependency } from "../../ChartState/Reducer/DataFactory";
import { CMColorPropTreeItem } from "./CMColorPropTreeItem";

export const ChartMenuIndiGraphTreeItem = (props: {
  subchartIdx: number;
  yaxisIdx: number;
  graphIdx: number;
  subCharts: T.ChartState["subCharts"];
  Dispatch: T.ChartStateHook["Dispatch"];
  handleToggleExpanded?: (id: string) => void;
  data: T.ChartState["data"];
}) => {
  const { subchartIdx, yaxisIdx, graphIdx, subCharts, Dispatch, handleToggleExpanded, data } = props;
  const graphGeneric = subCharts[subchartIdx].yaxis[yaxisIdx].graphs[graphIdx];
  const graph = T.isIndicatorGraph(graphGeneric) ? graphGeneric : null;
  const theme = useTheme();
  const dataGraph = data.find((val) => val.id === graph?.dataId) as T.IndicatorData;
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
      <CTreeItem
        key={`settings-treeitem-indiGraph-src-s${subchartIdx}-y${yaxisIdx}-g${graphIdx}`}
        nodeId={`settings-treeitem-indiGraph-src-s${subchartIdx}-y${yaxisIdx}-g${graphIdx}`}
        labelIcon={<CIcon path={mdiDatabaseExportOutline} size={"24px"} color={theme.palette.text.primary} />}
        labelText="Source"
        typographyVariant="body1"
        labelInfo={
          <Select
            size="small"
            margin="none"
            SelectDisplayProps={{ style: { paddingTop: 2, paddingBottom: 2 } }}
            value={dataGraph.indSrcId}
            onChange={(e: any) => {
              const newValue = e.target.value;
              Dispatch({
                task: "modifyIndicatorData",
                params: {
                  dataId: dataGraph.id,
                  newIndSrcId: newValue,
                },
              });
            }}
          >
            {["dataSeries", "chartSeries"].includes(dataGraph.indicator.indicatorFnType)
              ? (() => {
                  const subchartDataIds = subCharts[subchartIdx].yaxis[yaxisIdx].graphs.map((graph) => graph.dataId);
                  const filteredIndDatas = !dataGraph.indicator.default.newSubchart
                    ? data.filter((dat) => subchartDataIds.includes(dat.id))
                    : dataGraph.indicator.indicatorFnType === "dataSeries"
                    ? data
                    : dataGraph.indicator.indicatorFnType === "chartSeries"
                    ? data.filter((dat) => dat.type === "chart")
                    : [];
                  return filteredIndDatas.map((dat) =>
                    dat.id !== dataGraph.id && !isCircularIndicatorDependency(data, dataGraph.id, dat.id) ? (
                      <MenuItem
                        key={`settings-treeitem-indiGraph-src-menuitem-s${subchartIdx}-y${yaxisIdx}-g${graphIdx}-${dat.id}`}
                        value={dat.id}
                      >
                        {dat.name}
                      </MenuItem>
                    ) : null
                  );
                })()
              : null}
          </Select>
        }
      />

      {dataGraph.indicator.graphTypes.map((gType, gtIdx) => {
        const colors = graph.style.strokeColor;

        return (
          <CMColorPropTreeItem
            nodeId={`settings-treeitem-indiGraph-clrProps-${subchartIdx}-y${yaxisIdx}-g${graphIdx}-gt${gtIdx}`}
            key={`settings-treeitem-indiGraph-clrProps-${subchartIdx}-y${yaxisIdx}-g${graphIdx}-gt${gtIdx}`}
            color={subCharts[subchartIdx].yaxis[0].graphs[graphIdx].style?.strokeColor?.[gtIdx]}
            iconPath={mdiBorderColor}
            text="line stroke color"
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
      {dataGraph.indicator.params.map((param, paramIdx) => (
        <CTreeItem
          key={`sub-${subchartIdx}-yaxis-${yaxisIdx}-graph-${graphIdx}-${paramIdx}`}
          nodeId={`${2 + subchartIdx}00-${graphIdx}-${paramIdx}`}
          labelIcon={<CIcon path={mdiIframeVariableOutline} size={"24px"} color={theme.palette.text.primary} />}
          labelText={param.name}
          typographyVariant="body1"
          labelInfo={
            <TextField
              variant="outlined"
              margin="none"
              size="small"
              inputProps={{ style: { padding: 5, width: 50 } }}
              value={param.val}
              onChange={(e: any) => {
                const val = parseFloat(e.target.value);
                if (isNaN(val)) return;
                Dispatch({
                  task: "modifyIndicatorData",
                  params: {
                    dataId: dataGraph.id,
                    newParam: { paramIdx, newValue: val },
                  },
                });
              }}
            />
          }
        />
      ))}
    </CTreeItem>
  );
};
