import React from "react";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useTheme from "@mui/material/styles/useTheme";
import { Icon } from "@mdi/react";
import { mdiDiameterVariant, mdiChartBellCurve, mdiArrowExpandVertical } from "@mdi/js";
import { mdiPoll, mdiSortAlphabeticalAscending, mdiFilter } from "@mdi/js";
import { CTreeItem } from "../../Components/CTreeItem";
import { CTreeView } from "../../Components/CTreeView";
import { IndicatorsSubMenu, IndicatorCategoryType } from "./IndicatorsSubMenu";
import uniqid from "uniqid";
import * as T from "../../Types";
import { defaultIndicators } from "../../Indicators/DefaultIndicators";
import { CChartMenuStateType } from "../ChartMenu";

const categorys: { name: IndicatorCategoryType; icon: string }[] = [
  { name: "Average", icon: mdiDiameterVariant },
  { name: "Oszillator", icon: mdiChartBellCurve },
  { name: "Volatility", icon: mdiArrowExpandVertical },
  { name: "Volume", icon: mdiPoll },
];

export const IndicatorsAdd = (props: {
  subcharts: T.ChartState["subcharts"];
  onNavigate: (target: CChartMenuStateType["location"]) => void;
  location: CChartMenuStateType["location"];
  Dispatch: T.ChartController["Dispatch"];
  settings?: T.UseChartControllerProps["settings"];
  data: T.ChartState["data"];
  fullscreen: boolean;
}) => {
  const { subcharts, onNavigate, location, Dispatch, settings, data, fullscreen } = props;
  const [DisableGrouping, setDisableGrouping] = React.useState(false);
  const [SelectedGraph, setSelectedGraph] = React.useState(0);
  const amtIndicators = data.filter((val) => val.type === "indicator").length;

  const theme = useTheme();
  const indicators = React.useMemo(
    () => (settings?.indicators ? settings.indicators : defaultIndicators),
    [settings?.indicators]
  );

  const srcGraphs = subcharts
    .map((subchart, subchartIdx) =>
      subchart.yaxis
        .map((yaxi, yaxisIdx) =>
          yaxi.graphs
            .map((graph, graphIdx) => {
              const dataGraph = data.find((val) => val.id === graph.dataId);
              const subGraphs = dataGraph?.type === "indicator" ? dataGraph.indicator.graphTypes : null;
              const amtLines = subGraphs ? subGraphs.length : 1;

              return Array(amtLines)
                .fill(0)
                .map((x, xIdx) => {
                  const subGraph = subGraphs?.[xIdx];
                  const subGraphNameSuffix = subGraph?.name ? " - " + subGraph.name : "";
                  return {
                    name: dataGraph?.name ?? "Graph No." + graphIdx,
                    subchartIdx,
                    yaxisIdx,
                    graphIdx,
                    graphLineIdx: xIdx,
                    fullName: dataGraph?.type === "indicator" ? dataGraph.fullName + subGraphNameSuffix + "" : null,
                    type: graph.type,
                    dataId: graph.dataId,
                  };
                })
                .flat();
            })
            .flat()
        )
        .flat()
    )
    .flat();
  const filteredIndicators = indicators.filter(
    (indi) =>
      (srcGraphs?.[SelectedGraph]?.type === "indicator" && indi.indicatorFnType === "dataSeries") ||
      srcGraphs?.[SelectedGraph]?.type === "chart"
  );

  return (
    <React.Fragment>
      {amtIndicators > 0 && (
        <IndicatorsSubMenu
          location={location}
          onNavigate={onNavigate}
          theme={theme}
          amtIndicators={amtIndicators}
          submenuContent={
            <React.Fragment>
              <TextField
                select
                SelectProps={{
                  SelectDisplayProps: {
                    style: { padding: 8, paddingRight: 32, paddingLeft: 16 },
                  },
                  MenuProps: { disablePortal: fullscreen },
                }}
                variant="outlined"
                InputProps={{ sx: { borderRadius: "18px" } }}
                label={<Typography color="text.secondary">Source Graph</Typography>}
                value={SelectedGraph}
                onChange={(e) => {
                  const val = typeof e.target.value === "number" ? e.target.value : parseInt(e.target.value, 10);
                  if (isNaN(val)) return;
                  setSelectedGraph(val);
                }}
              >
                {srcGraphs.map((srcGraph, gIdx) => (
                  <MenuItem value={gIdx} key={"srcGraph-" + gIdx}>
                    {srcGraph?.fullName ?? srcGraph.name}
                  </MenuItem>
                ))}
              </TextField>
              <IconButton
                size="small"
                sx={{ border: "1px solid #fff", margin: "0px 5px 0px 0px" }}
                onClick={() => setDisableGrouping((current) => !current)}
              >
                <Icon
                  path={!DisableGrouping ? mdiSortAlphabeticalAscending : mdiFilter}
                  size={1}
                  color={theme.palette.primary.contrastText}
                />
              </IconButton>
            </React.Fragment>
          }
        />
      )}
      <CTreeView>
        {!DisableGrouping
          ? categorys.map((cat, catIdx) => {
              const indicatorsPerCat = filteredIndicators.filter((indi) => indi.category === cat.name);
              return (
                indicatorsPerCat.length > 0 && (
                  <CTreeItem
                    key={`cat-${catIdx}`}
                    nodeId={catIdx.toString()}
                    labelText={cat.name}
                    bgColorSelected={theme.palette.primary.light}
                    color={"#ff0000"}
                    labelIcon={
                      <div
                        style={{
                          border: "1px solid #666",
                          borderRadius: 5,
                          marginRight: 10,
                          background: theme.palette.secondary.main,
                          minWidth: 32,
                          height: 32,
                        }}
                      >
                        <Icon path={cat.icon} size={"32px"} color={theme.palette.secondary.contrastText} />
                      </div>
                    }
                  >
                    {indicatorsPerCat
                      .sort((a, b) => (a.name > b.name ? 1 : -1))
                      .map((indi, indiIdx) => (
                        <CTreeItem
                          key={`cat-${catIdx}-indi-${indiIdx}`}
                          nodeId={((catIdx + 1) * 100 + (indiIdx + 1)).toString()}
                          labelText={indi.name}
                          typographyVariant="body1"
                          onClick={() => {
                            const dataGraph = data.find((val) => val.id === srcGraphs[SelectedGraph]?.dataId);
                            if (!dataGraph) return;
                            const dataSeries = dataGraph.data ?? [];
                            const graphName = dataGraph.name ?? "Graph No." + srcGraphs?.[SelectedGraph].graphIdx;
                            if (indi?.default.newSubchart) {
                              Dispatch({
                                task: "addSubchart",
                                params: {
                                  dataSeries,
                                  graphName,
                                  indicator: indi,
                                  indSrcId: dataGraph.id,
                                  id: uniqid(),
                                },
                              });
                            } else {
                              Dispatch({
                                task: "addGraph",
                                params: {
                                  dataSeries,
                                  graphName,
                                  id: uniqid(),
                                  indicator: indi,
                                  subchartIdx: srcGraphs?.[SelectedGraph].subchartIdx,
                                  indSrcId: dataGraph.id,
                                  indSrcLineIdx: srcGraphs?.[SelectedGraph].graphLineIdx,
                                },
                              });
                            }
                          }}
                        />
                      ))}
                  </CTreeItem>
                )
              );
            })
          : filteredIndicators
              .sort((a, b) => (a.name > b.name ? 1 : -1))
              .map((indi, indiIdx) => (
                <CTreeItem
                  key={`cat-indi-${indiIdx}`}
                  nodeId={(indiIdx + 1).toString()}
                  labelText={indi.name}
                  typographyVariant="body1"
                  onClick={() => {
                    const dataGraph = data.find((val) => val.id === srcGraphs[SelectedGraph]?.dataId);
                    if (!dataGraph) return;
                    const dataSeries = dataGraph.data ?? [];
                    const graphName = dataGraph.name ?? "Graph No." + srcGraphs?.[SelectedGraph].graphIdx;
                    if (indi?.default.newSubchart) {
                      Dispatch({
                        task: "addSubchart",
                        params: {
                          dataSeries,
                          graphName,
                          indicator: indi,
                          indSrcId: dataGraph.id,
                          id: uniqid(),
                        },
                      });
                    } else {
                      Dispatch({
                        task: "addGraph",
                        params: {
                          dataSeries,
                          graphName,
                          id: uniqid(),
                          indicator: indi,
                          subchartIdx: srcGraphs?.[SelectedGraph].subchartIdx,
                          indSrcId: dataGraph.id,
                          indSrcLineIdx: srcGraphs?.[SelectedGraph].graphLineIdx,
                        },
                      });
                    }
                  }}
                />
              ))}
      </CTreeView>
    </React.Fragment>
  );
};
