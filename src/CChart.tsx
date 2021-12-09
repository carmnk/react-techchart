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

export const CChart = React.forwardRef((props: T.CChartProps, ref: any) => {
  const { settings, ChartState, Dispatch, rtTicks = [], ContainerRef } = props.Controller;
  const { disableTheme, appendElement } = settings;

  const Settings = React.useRef<T.ChartStateProps["settings"]>(settings);
  const [ChartMenu2Open, setChartMenu2Open] = React.useState<CChartMenuStateType>({
    location: null,
    expandedSetting: [],
  });

  const handleRequestMenuOpen = React.useCallback(() => {
    setChartMenu2Open((current) => ({ ...current, location: "menu" }));
  }, []);

  const handleRequestMenuClose = React.useCallback(() => {
    setChartMenu2Open((current) => ({ ...current, location: null }));
  }, []);

  const handleRequestMenuNavigation = React.useCallback((target) => {
    setChartMenu2Open((current) => ({ ...current, location: target }));
  }, []);

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
      setChartMenu2Open({
        location: "settings",
        expandedSetting: [`graph-sub-${subchartIdx}-y-0-graph-${graphIdx}`, `sub-${subchartIdx}`],
      });
    },
    []
  );

  const darkMode = ChartState.options.isDarkMode;
  const mainGraph = ChartState?.subCharts?.[0]?.yaxis?.[0]?.graphs?.[0] as T.ChartGraphState;
  const MainChart = mainGraph?.chartType === "candles" ? CCandleChart : CLineChart;
  const isContainerInit = ChartState.containerSize.init;
  const { heightXAxis } = ChartState.options.xaxis;
  const containerWidth = ChartState.containerSize.width - 1;
  const containerHeight = ChartState.containerSize.height - 1;

  // console.log("appendElement", appendElement);
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
          style={{ background: ChartState.options.backgroundColor }}
        >
          {!mainGraph || !MainChart || !isContainerInit ? (
            <div
              style={{
                height: "100%",
                background: ChartState.options.backgroundColor,
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
                {/*  basic 'static' layer - update only on containerResize, subchartResize and if style changes */}
                <Layer listening={false}>
                  <Rect
                    name="xaxis-rect"
                    listening={false}
                    x={0 + 0.5}
                    y={containerHeight - heightXAxis + 0.5}
                    width={containerWidth}
                    height={heightXAxis}
                    fill={ChartState.options.xaxis.fillColor}
                    stroke={ChartState.options.borderColor}
                    strokeWidth={1}
                  />
                  {ChartState.subCharts.map((subchart, subchartIdx) => (
                    <React.Fragment key={`subchart-border-${subchartIdx}`}>
                      <Rect
                        name={"subchart rect " + subchartIdx}
                        listening={false}
                        x={0 + 0.5}
                        y={subchart.top + 0.5}
                        width={containerWidth}
                        height={subchart.bottom - subchart.top}
                        stroke={ChartState.options.borderColor}
                        strokeWidth={1}
                      />
                    </React.Fragment>
                  ))}
                </Layer>
                {/*  chart and axis layer - update when subCharts, data, containerSize, style, calc.xaxis, calc.subcharts, calc.yToPix, calc.pixToY changes*/}
                <Layer listening={false}>
                  {0 in ChartState.subCharts ? (
                    <MainChart
                      subCharts={ChartState.subCharts}
                      calcXaxis={ChartState.calc.xaxis}
                      calcSubcharts={ChartState.calc.subcharts}
                      yToPix={ChartState.calc.yToPix}
                      pixToY={ChartState.calc.pixToY}
                      subchartIdx={0}
                      yaxisIdx={0}
                      graphIdx={0}
                    />
                  ) : null}
                  {ChartState.subCharts.map((subchart, subchartIdx) =>
                    subchart.yaxis.map((singleYaxis, yaxisIdx) =>
                      singleYaxis.graphs.map((graph, graphIdx) => {
                        // const a = ChartState.calc.subcharts[subchartIdx].yaxis[yaxisIdx].graphs[graphIdx]?.curTicks;
                        // const b = !!a ? a.length : 0;
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
                            // if (dataGraph.indicator.name === "MACD") console.log("MACD", !CanvasChart);
                            if (!CanvasChart) return null;
                            const areaTresholdPropIdx = dataGraph.indicator.default?.graphProps?.findIndex(
                              (val) => val.name === "areaTresholds"
                            );
                            const addLineAreaParams =
                              indicatorType === "line" && !isNullish(areaTresholdPropIdx) && areaTresholdPropIdx !== -1
                                ? {
                                    areaTresholds: dataGraph.indicator.default?.graphProps?.[areaTresholdPropIdx].val,
                                  }
                                : {};

                            return (
                              <CanvasChart
                                key={`${indicatorType}-chart-s${subchartIdx}-y0-g${graphIdx}-l${indiLineIdx}`}
                                subCharts={ChartState.subCharts}
                                subchartIdx={subchartIdx}
                                yaxisIdx={0}
                                graphIdx={graphIdx}
                                indSeriesIdx={indiLineIdx}
                                calcXaxis={ChartState.calc.xaxis}
                                calcSubcharts={ChartState.calc.subcharts}
                                yToPix={ChartState.calc.yToPix}
                                pixToY={ChartState.calc.pixToY}
                                {...(addLineAreaParams as any)} // not affecting memo? because areaTreshold's value doesn't change (acc. Object.is())?
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
                    style={ChartState.options}
                  />
                  <Yaxis
                    calcSubcharts={ChartState.calc.subcharts}
                    containerSize={ChartState.containerSize}
                    style={ChartState.options}
                    subcharts={ChartState.subCharts}
                  />
                </Layer>
                <Layer listening={false}>
                  <Marker
                    rtTicks={rtTicks}
                    style={ChartState.options}
                    containerSize={ChartState.containerSize}
                    xaxis={ChartState.calc.xaxis}
                  />
                  {ChartState.subCharts.map((subchart, sIdx) =>
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
                                subCharts={ChartState.subCharts}
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
                              subCharts={ChartState.subCharts}
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
                    ChartState.subCharts.map((subchart, subchartIdx) =>
                      subchart.yaxis.map((yaxis, yaxisIdx) =>
                        yaxis.tools.map((tool, toolIdx) => {
                          const toolModel = defaultTools.find((defTool) => defTool.type === tool.type);
                          const additionalProps: { [key: string]: any } = {};
                          tool.params?.forEach((param: any) => {
                            additionalProps[param.name] = param.val;
                          });
                          const Tool = toolModel ? toolModel.component : null;
                          return !Tool || !toolModel ? null : (
                            <Tool
                              key={`trendline-sub-0-y-0-tool-${toolIdx}`}
                              // tool={toolState}
                              subcharts={ChartState.subCharts}
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
                {/*  crosshair and draw layer - update when subcharts, data, containerSize, pointer, draw, calcPointer, calcXaxis, style, */}
                <Layer listening={false}>
                  {!!ChartState.calc.pointer.isHovering &&
                  !Settings.current.disablePointerEvents &&
                  ChartState.options.crosshair.useCrosshair ? (
                    <Crosshair
                      subcharts={ChartState.subCharts}
                      data={ChartState.data}
                      containerSize={ChartState.containerSize}
                      calcPointer={ChartState.calc.pointer}
                      calcXaxis={ChartState.calc.xaxis}
                      style={ChartState.options}
                      pixToY={ChartState.calc.pixToY}
                      rtTicks={rtTicks}
                      calcSubcharts={ChartState.calc.subcharts}
                    />
                  ) : null}
                  <DrawTool
                    subcharts={ChartState.subCharts}
                    containerSize={ChartState.containerSize}
                    draw={ChartState.draw}
                    calc={ChartState.calc}
                    drawStyle={ChartState.options.draw}
                  />
                </Layer>
              </Stage>
              <ChartLabels
                data={ChartState.data}
                subcharts={ChartState.subCharts}
                calcPointer={ChartState.calc.pointer}
                calcSubcharts={ChartState.calc.subcharts}
                onGraphLabelClick={handleChartLabelClick}
              />
              <ChartMenuButton
                bottomY={ChartState.subCharts?.[ChartState.subCharts.length - 1]?.bottom ?? 0}
                onOpenClick={handleRequestMenuOpen}
              />
              {appendElement}
              <CChartMenu
                ChartMenuState={ChartMenu2Open}
                onClose={handleRequestMenuClose}
                onNavigate={handleRequestMenuNavigation}
                subCharts={ChartState.subCharts}
                xaxis={ChartState.calc.xaxis}
                style={ChartState.options}
                fullscreen={ChartState.fullscreen}
                Dispatch={Dispatch}
                onSettingsExpand={handleToggleExpanded}
                settings={Settings.current}
                data={ChartState.data}
              />
            </React.Fragment>
          )}
        </div>
      </ConditionalMuiThemeProvider>
    </React.Fragment>
  );
});
CChart.displayName = "CChart";
