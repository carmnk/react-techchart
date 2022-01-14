import React from "react";
import { ConditionalMuiThemeProvider, muiDarkTheme, muiTheme } from "./MuiTheme";
import Backdrop from "@mui/material/Backdrop";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { Stage, Layer, Rect } from "react-konva";
import { CCandleChart, CLineChart, CBarChart, Crosshair, Xaxis, Yaxis, Marker } from "./Canvas";
import { CChartMenu, CChartMenuStateType } from "./Menu/ChartMenu";
import { ChartMenuButton } from "./Menu/ChartMenuButton";
import { isNullish } from "./utils/Basics";
import { defaultTools } from "./Tools/DefaultTools"; // currently not expandable
import { ChartLabels } from "./Dom/ChartLabels";
import { DrawTool } from "./Tools/DrawTool";
import * as T from "./Types";
import { css, Global } from "@emotion/react";
import dequal from "lodash/isEqual";
import { mergeRefs } from "./utils/React";
import { Box, Portal } from "@mui/material";
import { CSnackBar } from "./Components/CSnackbar";

export const Chart = React.forwardRef<HTMLDivElement, T.ChartProps>((props, ref) => {
  const { settings, ChartState, Dispatch, rtTicks = [], ContainerRef, events } = props.Controller;
  const { disableTheme } = settings || {};

  const Settings = React.useRef<T.UseChartControllerProps["settings"]>(settings);
  const [ChartMenu2Open, setChartMenu2Open] = React.useState<CChartMenuStateType>({
    location: null,
    expandedSetting: [],
  });

  React.useEffect(() => {
    if (!ContainerRef) return;
    mergeRefs([ContainerRef, ref]);
  }, [ContainerRef, ref]);

  const handleRequestMenuOpen = React.useCallback(() => {
    Dispatch({
      task: "setPointerEventsIntern",
      params: { disablePointerEvents: true },
    });
    setChartMenu2Open((current) => ({ ...current, location: "menu" }));
  }, [Dispatch]);

  const handleRequestMenuClose = React.useCallback(() => {
    Dispatch({
      task: "setPointerEventsIntern",
      params: { disablePointerEvents: false },
    });
    setChartMenu2Open((current) => ({ ...current, location: null }));
  }, [Dispatch]);

  const handleRequestMenuNavigation = React.useCallback(
    (target) => {
      if (!target)
        Dispatch({
          task: "setPointerEventsIntern",
          params: { disablePointerEvents: false },
        });
      setChartMenu2Open((current) => ({ ...current, location: target }));
    },
    [Dispatch]
  );

  const handleToggleExpanded = React.useCallback((id: string) => {
    setChartMenu2Open((current) =>
      current.expandedSetting.includes(id)
        ? {
            ...current,
            expandedSetting: current.expandedSetting.filter((val) => val !== id),
          }
        : { ...current, expandedSetting: [...current.expandedSetting, id] }
    );
  }, []);

  const handleChartLabelClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, subchartIdx: number, graphIdx: number) => {
      if (isNullish(subchartIdx) || isNullish(graphIdx)) return;
      Dispatch({
        task: "setPointerEventsIntern",
        params: { disablePointerEvents: true },
      });
      setChartMenu2Open({
        location: "settings",
        expandedSetting: [`graph-sub-${subchartIdx}-y-0-graph-${graphIdx}`, `sub-${subchartIdx}`],
      });
    },
    [Dispatch]
  );

  const handleSnackbarClose = React.useCallback(() => {
    // setIsError((current) => (current.length === 1 ? [] : current.splice(1)));
    Dispatch({ task: "removeSnackbarMessage" } as T.ReducerAction<"removeSnackbarMessage">);
  }, [Dispatch]);

  const darkMode = ChartState.theme.isDarkMode;
  const mainGraph = ChartState?.subcharts?.[0]?.yaxis?.[0]?.graphs?.[0] as T.ChartGraphState;
  const MainChart = mainGraph?.chartType === "candles" ? CCandleChart : CLineChart;
  const isContainerInit = ChartState.containerSize.init;
  const { heightXAxis } = ChartState.theme.xaxis;
  const containerWidth = ChartState.containerSize.width - 1;
  const containerHeight = ChartState.containerSize.height - 1;
  const sizelessSubcharts = ChartState.subcharts.map((sub) => ({ yaxis: sub.yaxis }));
  const SizelessSubcharts = React.useRef(sizelessSubcharts);
  if (!dequal(SizelessSubcharts.current, sizelessSubcharts)) SizelessSubcharts.current = sizelessSubcharts;

  return (
    <React.Fragment>
      <Global
        styles={css`
          .ChartContainer {
            box-sizing: border-box;
            position: relative;
            top: 0;
            z-index: 1000;
            width: 100%;
            height: 100%;
          }
          .ChartKonvaStage {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
          }
        `}
      />
      <ConditionalMuiThemeProvider theme={darkMode ? muiDarkTheme : muiTheme} disableTheme={disableTheme}>
        <div //responsive container
          ref={ContainerRef}
          className="ChartContainer"
          style={{
            background: ChartState.theme.backgroundColor,
            touchAction: "none",
          }}
        >
          {!mainGraph || !MainChart || !isContainerInit ? (
            <div
              style={{
                height: "100%",
                background: ChartState.theme.backgroundColor,
              }}
            >
              <Backdrop sx={{ color: "primary.main" }} open={true} invisible>
                <Typography variant="h6" component="div">
                  Chart data is loaded..
                </Typography>
                <CircularProgress color="inherit" />
              </Backdrop>
            </div>
          ) : (
            <React.Fragment>
              <Stage //konva container
                width={ChartState.containerSize.width}
                height={ChartState.containerSize.height}
                className="ChartKonvaStage"
                listening={false}
              >
                {/*  basic 'static' layer - update only on containerResize, subchartResize and if theme changes */}
                <Layer listening={false}>
                  <Rect
                    name="xaxis-rect"
                    listening={false}
                    x={0 + 0.5}
                    y={containerHeight - heightXAxis + 0.5}
                    width={containerWidth}
                    height={heightXAxis}
                    fill={ChartState.theme.xaxis.fillColor}
                    stroke={ChartState.theme.borderColor}
                    strokeWidth={1}
                  />
                  {ChartState.subcharts.map((subchart, subchartIdx) => (
                    <React.Fragment key={`subchart-border-${subchartIdx}`}>
                      <Rect
                        name={"subchart rect " + subchartIdx}
                        listening={false}
                        x={0 + 0.5}
                        y={subchart.top + 0.5}
                        width={containerWidth}
                        height={subchart.bottom - subchart.top}
                        stroke={ChartState.theme.borderColor}
                        strokeWidth={1}
                      />
                    </React.Fragment>
                  ))}
                </Layer>
                {/*  chart and axis layer - update when subcharts, data, containerSize, theme, calc.xaxis, calc.subcharts, calc.yToPix, calc.pixToY changes*/}
                <Layer listening={false}>
                  {0 in ChartState.subcharts ? (
                    <MainChart
                      subcharts={ChartState.subcharts}
                      calcXaxis={ChartState.calc.xaxis}
                      calcSubcharts={ChartState.calc.subcharts}
                      yToPix={ChartState.calc.yToPix}
                      pixToY={ChartState.calc.pixToY}
                      subchartIdx={0}
                      yaxisIdx={0}
                      graphIdx={0}
                    />
                  ) : null}
                  {ChartState.subcharts.map((subchart, subchartIdx) =>
                    subchart.yaxis.map((singleYaxis) =>
                      singleYaxis.graphs.map((graph, graphIdx) => {
                        const dataGraph = ChartState.data.find((val) => val.id === graph.dataId);
                        if (
                          T.isIndicatorGraph(graph) &&
                          dataGraph?.type === "indicator" &&
                          (dataGraph?.data?.length ?? 0) > 0
                        ) {
                          const indicatorLines = dataGraph?.data[(dataGraph?.data?.length ?? 0) - 1]?.prices ?? [];

                          return indicatorLines.map((indiLine, indiLineIdx) => {
                            const indicatorType = dataGraph.indicator.graphTypes?.[indiLineIdx]?.type ?? "line";
                            const CanvasChart =
                              indicatorType === "line" ? CLineChart : indicatorType === "bars" ? CBarChart : null;

                            if (!CanvasChart) return null;
                            // approach to implement areas -> to be reviewed, maybe separate component
                            // const areaTresholdPropIdx = dataGraph.indicator.default?.graphProps?.findIndex(
                            //   (val) => val.name === "areaTresholds"
                            // );
                            // const addLineAreaParams =
                            //   indicatorType === "line" && !isNullish(areaTresholdPropIdx) && areaTresholdPropIdx !== -1
                            //     ? {
                            //         areaTresholds: dataGraph.indicator.default?.graphProps?.[areaTresholdPropIdx].val,
                            //       }
                            //     : {};

                            return (
                              <CanvasChart
                                key={`${indicatorType}-chart-s${subchartIdx}-y0-g${graphIdx}-l${indiLineIdx}`}
                                subcharts={ChartState.subcharts}
                                subchartIdx={subchartIdx}
                                yaxisIdx={0}
                                graphIdx={graphIdx}
                                indSeriesIdx={indiLineIdx}
                                calcXaxis={ChartState.calc.xaxis}
                                calcSubcharts={ChartState.calc.subcharts}
                                yToPix={ChartState.calc.yToPix}
                                pixToY={ChartState.calc.pixToY}
                                // {...addLineAreaParams}
                              />
                            );
                          });
                        }
                        return null;
                      })
                    )
                  )}
                  <Xaxis
                    calcXaxis={ChartState.calc.xaxis}
                    containerSize={ChartState.containerSize}
                    theme={ChartState.theme}
                  />
                  <Yaxis
                    calcSubcharts={ChartState.calc.subcharts}
                    containerSize={ChartState.containerSize}
                    theme={ChartState.theme}
                    subcharts={ChartState.subcharts}
                  />
                </Layer>
                <Layer listening={false}>
                  <Marker
                    rtTicks={rtTicks}
                    theme={ChartState.theme}
                    containerSize={ChartState.containerSize}
                    xaxis={ChartState.calc.xaxis}
                  />
                  {ChartState.subcharts.map((subchart, sIdx) =>
                    subchart.yaxis.map((yaxis, yIdx) =>
                      yaxis.graphs.map((graph, gIdx) => {
                        if (graph.type === "indicator") {
                          const dataGraph = ChartState.data.find((val) => val.id === graph.dataId);
                          const rtIdx = rtTicks.findIndex((rtTick) => rtTick.dataId === dataGraph?.id);
                          if (rtIdx === -1) return null;
                          if (dataGraph?.type !== "indicator" || (dataGraph?.data?.length ?? 0) === 0) return null;
                          const indicatorLines = dataGraph?.indicator?.graphTypes;

                          return indicatorLines.map((line, lIdx) => {
                            const indicatorType = dataGraph.indicator.graphTypes?.[lIdx]?.type ?? "line";
                            const CanvasChart =
                              indicatorType === "line" ? CLineChart : indicatorType === "bars" ? CBarChart : null;
                            if (!CanvasChart) return null;
                            return (
                              <CanvasChart
                                key={`rtBars-s${sIdx}-y${yIdx}-g${gIdx}-l${lIdx}`}
                                subcharts={ChartState.subcharts}
                                subchartIdx={sIdx}
                                yaxisIdx={yIdx}
                                graphIdx={gIdx}
                                indSeriesIdx={lIdx}
                                calcXaxis={ChartState.calc.xaxis}
                                calcSubcharts={ChartState.calc.subcharts}
                                yToPix={ChartState.calc.yToPix}
                                pixToY={ChartState.calc.pixToY}
                                rtTicks={rtTicks?.[rtIdx]?.ticks ?? undefined}
                              />
                            );
                          });
                        } else if (graph.type === "chart") {
                          const CanvasChart =
                            graph.chartType === "candles"
                              ? CCandleChart
                              : graph.chartType === "line"
                              ? CLineChart
                              : null;
                          if (!CanvasChart) return null;
                          return (
                            <CanvasChart
                              key={`rtBars-s${sIdx}-y${yIdx}-g${gIdx}`}
                              subcharts={ChartState.subcharts}
                              subchartIdx={sIdx}
                              yaxisIdx={yIdx}
                              graphIdx={gIdx}
                              calcXaxis={ChartState.calc.xaxis}
                              calcSubcharts={ChartState.calc.subcharts}
                              rtTicks={rtTicks?.[0]?.ticks ?? undefined}
                            />
                          );
                        }
                        return null;
                      })
                    )
                  )}
                </Layer>
                {/*  tool layer - update when subcharts, containerSize, calcXaxis, calcSubcharts, yToPix, pixToY changes*/}
                <Layer listening={false}>
                  {ChartState.calc.xaxis?.xToPix &&
                    !!ChartState.calc.yToPix &&
                    ChartState.subcharts.map((subchart, subchartIdx) =>
                      subchart.yaxis.map((yaxis) =>
                        yaxis.tools.map((tool, toolIdx) => {
                          const toolModel = defaultTools.find((defTool) => defTool.type === tool.type);
                          const additionalProps: { [key: string]: any } = {};
                          tool.params?.forEach((param) => {
                            additionalProps[param.name] = param.val;
                          });
                          const Tool = toolModel ? toolModel.component : null;
                          return !Tool || !toolModel ? null : (
                            <Tool
                              key={`trendline-sub-0-y-0-tool-${toolIdx}`}
                              // tool={toolState}
                              subcharts={ChartState.subcharts}
                              // draw={ChartState.draw}
                              subchartIdx={subchartIdx}
                              // yaxisIdx={0}
                              // toolIdx={toolIdx}
                              xy={tool.xy}
                              containerSize={ChartState.containerSize}
                              calcXaxis={ChartState.calc.xaxis}
                              calcSubcharts={ChartState.calc.subcharts}
                              yToPix={ChartState.calc.yToPix}
                              pixToY={ChartState.calc.pixToY}
                              style={tool.style}
                              {...additionalProps}
                            />
                          );
                        })
                      )
                    )}
                </Layer>
                {/*  crosshair and draw layer - update when subcharts, data, containerSize, pointer, draw, calcPointer, calcXaxis, theme, */}
                <Layer listening={false}>
                  {!!ChartState?.calc?.pointer?.isHovering &&
                  !events?.disablePointerEvents &&
                  !settings?.disableCrosshair &&
                  ChartState.theme.crosshair.useCrosshair ? (
                    <Crosshair
                      subcharts={ChartState.subcharts}
                      data={ChartState.data}
                      containerSize={ChartState.containerSize}
                      calcPointer={ChartState.calc.pointer}
                      calcXaxis={ChartState.calc.xaxis}
                      theme={ChartState.theme}
                      pixToY={ChartState.calc.pixToY}
                      rtTicks={rtTicks}
                      calcSubcharts={ChartState.calc.subcharts}
                    />
                  ) : null}
                  <DrawTool
                    subcharts={ChartState.subcharts}
                    containerSize={ChartState.containerSize}
                    draw={ChartState.draw}
                    calc={ChartState.calc}
                    drawTheme={ChartState.theme.draw}
                  />
                </Layer>
              </Stage>
              <Box
                ref={props?.Controller?.PointerContainerRef}
                sx={{
                  width: "100%",
                  height: "100%",
                  background: "transparent",
                  position: "relative",
                  top: 0,
                  left: 0,
                  touchAction: "none",
                }}
              ></Box>
              {!settings?.disableLabels && (
                <ChartLabels
                  data={ChartState.data}
                  subcharts={ChartState.subcharts}
                  calcPointer={ChartState.calc.pointer}
                  calcSubcharts={ChartState.calc.subcharts}
                  onGraphLabelClick={handleChartLabelClick}
                />
              )}
              {!settings?.disableMenu && (
                <React.Fragment>
                  <ChartMenuButton
                    bottomY={ChartState.subcharts?.[ChartState.subcharts.length - 1]?.bottom ?? 0}
                    onOpenClick={handleRequestMenuOpen}
                  />
                  {props.children}
                  <CChartMenu
                    ChartMenuState={ChartMenu2Open}
                    onClose={handleRequestMenuClose}
                    onNavigate={handleRequestMenuNavigation}
                    subcharts={SizelessSubcharts.current as any}
                    xaxis={ChartState.calc.xaxis}
                    theme={ChartState.theme}
                    fullscreen={ChartState.fullscreen}
                    Dispatch={Dispatch}
                    onSettingsExpand={handleToggleExpanded}
                    settings={Settings.current}
                    data={ChartState.data}
                    events={events}
                  />
                </React.Fragment>
              )}
              {ChartState.menu.snackbars.length > 0 ? (
                <Portal key={`snackbar-portal`}>
                  {ChartState.menu.snackbars.map((msg, msgIdx) => {
                    return (
                      <CSnackBar
                        key={`msg-${msgIdx}`}
                        autoHideDuration={8000}
                        type={msg.type ?? "error"}
                        open={ChartState.menu.snackbars.length > 0}
                        onClose={handleSnackbarClose}
                        content={msg.text}
                        msgIdx={msgIdx}
                      />
                    );
                  })}
                </Portal>
              ) : null}
            </React.Fragment>
          )}
        </div>
      </ConditionalMuiThemeProvider>
    </React.Fragment>
  );
});
Chart.displayName = "Chart";
