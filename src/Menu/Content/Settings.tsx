import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import useTheme from "@mui/material/styles/useTheme";
import { Theme } from "@mui/material/styles/createTheme";
import { Icon } from "@mdi/react";
import { mdiFileChartOutline, mdiWater, mdiBorderColor, mdiFormatText, mdiGrid } from "@mdi/js";
import { mdiArrowUpDownBold, mdiCrosshairs, mdiArrowExpandRight, mdiArrowExpandUp } from "@mdi/js";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { SubchartTreeItem } from "../Subelements/SubchartTreeItem";
import { CChartMenuStateType } from "../ChartMenu";
import { CTreeItem } from "../../Components/CTreeItem";
import { Colorpicker } from "../../Components/Colorpicker";
import { CTreeView } from "../../Components/CTreeView";
import { CIcon } from "../../Components/CIcon";
import * as T from "../../Types";

export type ToolCategoryType = "Lines" | "Upcoming";

export const SettingsIcon = (props: { iconPath: string; theme: Theme }) => (
  <CIcon
    path={props.iconPath}
    size={"24px"}
    color={props.theme.palette.text.primary}
    style={{ marginLeft: props.theme.spacing(1) }}
    border={props.theme.palette.mode === "light" ? "1px solid #bbb" : undefined}
  />
);

const generalSettingsCategorys: { category?: string; icon?: string }[] = [
  { category: undefined },
  { category: "xaxis", icon: mdiArrowExpandRight },
  { category: "yaxis", icon: mdiArrowExpandUp },
  { category: "grid", icon: mdiGrid },
  { category: "crosshair", icon: mdiCrosshairs },
];

export const CMSettings = (props: {
  ChartMenuState: CChartMenuStateType;
  subcharts: T.ChartState["subcharts"];
  theme: T.ChartState["theme"];
  onNavigate: (target: CChartMenuStateType["location"]) => void;
  Dispatch: T.ChartController["Dispatch"];
  onSettingsExpand: (id: string) => void;
  data: T.ChartState["data"];
  fullscreen: boolean;
}) => {
  const { subcharts, onNavigate, Dispatch, onSettingsExpand, ChartMenuState, theme, data, fullscreen } = props;
  const muiTheme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (target?: CChartMenuStateType["location"]) => {
    setAnchorEl(null);
    if (target) onNavigate?.(target);
  };

  const generalSettings = [
    {
      nodeId: "bgcolor",
      labelText: "background color",
      iconPath: mdiWater,
      labelInfo: (
        <Colorpicker
          color={theme.backgroundColor}
          onColorSelected={(color) => {
            Dispatch({ task: "setGeneralProp", params: { prop: "backgroundColor", newValue: color } });
          }}
          fullscreen={fullscreen}
        />
      ),
    },
    {
      category: "xaxis",
      nodeId: "xaxisFillColor",
      labelText: "fill color",
      iconPath: mdiWater,
      labelInfo: (
        <Colorpicker
          color={theme.xaxis.fillColor}
          onColorSelected={(color) => {
            Dispatch({ task: "setGeneralProp", params: { prop: "xAxisFillColor", newValue: color } });
          }}
          fullscreen={fullscreen}
        />
      ),
    },
    {
      category: "xaxis",
      nodeId: "xaxisStrokeColor",
      labelText: "stroke color",
      iconPath: mdiBorderColor,
      labelInfo: (
        <Colorpicker
          color={theme.xaxis.strokeColor}
          onColorSelected={(color) => {
            Dispatch({ task: "setGeneralProp", params: { prop: "xAxisStrokeColor", newValue: color } });
          }}
          fullscreen={fullscreen}
        />
      ),
    },
    {
      category: "xaxis",
      nodeId: "xaxisTextColor",
      labelText: "text color",
      iconPath: mdiFormatText,
      labelInfo: (
        <Colorpicker
          color={theme.xaxis.fontColor}
          onColorSelected={(color) => {
            Dispatch({ task: "setGeneralProp", params: { prop: "xAxisTextColor", newValue: color } });
          }}
          fullscreen={fullscreen}
        />
      ),
    },
    {
      category: "yaxis",
      nodeId: "yaxisStrokeColor",
      labelText: "stroke color",
      iconPath: mdiBorderColor,
      labelInfo: (
        <Colorpicker
          color={theme.yaxis.strokeColor}
          onColorSelected={(color) => {
            Dispatch({ task: "setGeneralProp", params: { prop: "yAxisStrokeColor", newValue: color } });
          }}
          fullscreen={fullscreen}
        />
      ),
    },
    {
      category: "yaxis",
      nodeId: "yaxisTextColor",
      labelText: "text color",
      iconPath: mdiFormatText,
      labelInfo: (
        <Colorpicker
          color={theme.yaxis.fontColor}
          onColorSelected={(color) => {
            Dispatch({ task: "setGeneralProp", params: { prop: "yAxisTextColor", newValue: color } });
          }}
          fullscreen={fullscreen}
        />
      ),
    },
    {
      category: "grid",
      nodeId: "useXGrid",
      labelText: "use x-axis grid",
      iconPath: mdiGrid,
      labelInfo: (
        <Checkbox
          checked={theme.grid.useGridX}
          size="small"
          style={{ padding: 0, width: 24, height: 24 }}
          onChange={() => {
            Dispatch({ task: "setGeneralProp", params: { prop: "toggleGridX" } });
          }}
        />
      ),
    },
    {
      category: "grid",
      nodeId: "useYGrid",
      labelText: "use y-axis grid",
      iconPath: mdiGrid,
      labelInfo: (
        <Checkbox
          checked={theme.grid.useGridY}
          size="small"
          style={{ padding: 0, width: 24, height: 24 }}
          onChange={() => {
            Dispatch({ task: "setGeneralProp", params: { prop: "toggleGridY" } });
          }}
        />
      ),
    },
    {
      category: "grid",
      nodeId: "gridStrokeColor",
      labelText: "stroke color",
      iconPath: mdiBorderColor,
      labelInfo: (
        <Colorpicker
          color={theme.grid.strokeColor}
          onColorSelected={(color) => {
            Dispatch({ task: "setGeneralProp", params: { prop: "gridStrokeColor", newValue: color } });
          }}
          fullscreen={fullscreen}
        />
      ),
    },
    {
      category: "crosshair",
      nodeId: "useCrosshair",
      labelText: "use crosshair",
      iconPath: mdiCrosshairs,
      labelInfo: (
        <Checkbox
          checked={theme.crosshair.useCrosshair}
          size="small"
          style={{ padding: 0, width: 24, height: 24 }}
          onChange={() => {
            Dispatch({ task: "setGeneralProp", params: { prop: "toggleCrosshair" } });
          }}
        />
      ),
    },
    {
      category: "crosshair",
      nodeId: "crosshairStrokeColor",
      labelText: "stroke color",
      iconPath: mdiBorderColor,
      labelInfo: (
        <Colorpicker
          color={theme.crosshair.strokeColor}
          onColorSelected={(color) => {
            Dispatch({ task: "setGeneralProp", params: { prop: "crosshairStrokeColor", newValue: color } });
          }}
          fullscreen={fullscreen}
        />
      ),
    },
    {
      category: "crosshair",
      nodeId: "crosshairXMarkerBackground",
      labelText: "x-marker background",
      iconPath: mdiWater,
      labelInfo: (
        <Colorpicker
          color={theme.crosshair.xMarkerBackgroundColor}
          onColorSelected={(color) => {
            Dispatch({ task: "setGeneralProp", params: { prop: "crosshairXmarkerBackgroundColor", newValue: color } });
          }}
          fullscreen={fullscreen}
        />
      ),
    },
    {
      category: "crosshair",
      nodeId: "crosshairXMarkerStrokeColor",
      labelText: "x-marker stroke color",
      iconPath: mdiBorderColor,
      labelInfo: (
        <Colorpicker
          color={theme.crosshair.xMarkerStrokeColor}
          onColorSelected={(color) => {
            Dispatch({ task: "setGeneralProp", params: { prop: "crosshairXmarkerStrokeColor", newValue: color } });
          }}
          fullscreen={fullscreen}
        />
      ),
    },
    {
      category: "crosshair",
      nodeId: "crosshairXMarkerTextColor",
      labelText: "x-marker text color",
      iconPath: mdiFormatText,
      labelInfo: (
        <Colorpicker
          color={theme.crosshair.xMarkerTextColor}
          onColorSelected={(color) => {
            Dispatch({ task: "setGeneralProp", params: { prop: "crosshairXmarkerTextColor", newValue: color } });
          }}
          fullscreen={fullscreen}
        />
      ),
    },
    {
      category: "crosshair",
      nodeId: "crosshairYMarkerBackground",
      labelText: "y-marker background",
      iconPath: mdiWater,
      labelInfo: (
        <Colorpicker
          color={theme.crosshair.yMarkerBackgroundColor}
          onColorSelected={(color) => {
            Dispatch({ task: "setGeneralProp", params: { prop: "crosshairYmarkerBackgroundColor", newValue: color } });
          }}
          fullscreen={fullscreen}
        />
      ),
    },
    {
      category: "crosshair",
      nodeId: "crosshairYMarkerStrokeColor",
      labelText: "y-marker stroke color",
      iconPath: mdiBorderColor,
      labelInfo: (
        <Colorpicker
          color={theme.crosshair.yMarkerStrokeColor}
          onColorSelected={(color) => {
            Dispatch({ task: "setGeneralProp", params: { prop: "crosshairYmarkerStrokeColor", newValue: color } });
          }}
          fullscreen={fullscreen}
        />
      ),
    },
    {
      category: "crosshair",
      nodeId: "crosshairYMarkerTextColor",
      labelText: "y-marker text color",
      iconPath: mdiFormatText,
      labelInfo: (
        <Colorpicker
          color={theme.crosshair.yMarkerTextColor}
          onColorSelected={(color) => {
            Dispatch({ task: "setGeneralProp", params: { prop: "crosshairYmarkerTextColor", newValue: color } });
          }}
          fullscreen={fullscreen}
        />
      ),
    },
  ];

  return (
    <React.Fragment>
      <Stack // menu
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        sx={{ pt: 0.5 }}
      >
        <Button
          style={{
            border: "1px solid #666",
            borderRadius: 50,
            padding: 5,
            textTransform: "none",
            background: muiTheme.palette.secondary.light,
            color: muiTheme.palette.secondary.contrastText,
          }}
          onClick={handleClick}
        >
          <Typography> Add...</Typography>
        </Button>
        <Menu
          id="quick-add"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={() => handleClose(undefined)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          disablePortal={fullscreen}
        >
          <MenuItem onClick={() => handleClose("indicators")}>Indicator</MenuItem>
          <MenuItem onClick={() => handleClose("tools")}>Tool</MenuItem>
        </Menu>
      </Stack>
      <CTreeView expanded={ChartMenuState.expandedSetting}>
        <CTreeItem
          nodeId="1"
          labelText="General"
          labelIcon={
            <CIcon
              path={mdiFileChartOutline}
              size={"32px"}
              color={muiTheme.palette.secondary.contrastText}
              background={muiTheme.palette.secondary.main}
            />
          }
          bgColorSelected={muiTheme.palette.primary.light}
          typographyVariant="h6"
          onClick={() => {
            const id = "1";
            onSettingsExpand?.(id);
          }}
        >
          {generalSettingsCategorys.map((cat, cIdx) =>
            !cat.category ? (
              generalSettings
                .filter((setting) => setting.category === cat.category)
                .map((setting) => (
                  <CTreeItem
                    key={`settings-treeitem-general-cat-${cIdx}-${setting.nodeId}`}
                    nodeId={`settings-treeitem-general-cat-${cIdx}-${setting.nodeId}`}
                    labelText={setting.labelText}
                    typographyVariant="body1"
                    labelInfo={setting.labelInfo}
                    labelIcon={<SettingsIcon iconPath={setting.iconPath} theme={muiTheme} />}
                  />
                ))
            ) : (
              <CTreeItem
                nodeId={`settings-treeitem-general-cat-${cIdx}`}
                key={`settings-treeitem-general-cat-${cIdx}`}
                labelText={cat.category ?? ""}
                labelIcon={
                  <CIcon
                    path={cat.icon as string}
                    size={"32px"}
                    color={muiTheme.palette.secondary.contrastText}
                    background={muiTheme.palette.primary.main}
                  />
                }
                onClick={() => {
                  onSettingsExpand?.(`settings-treeitem-general-cat-${cIdx}`);
                }}
              >
                {generalSettings
                  .filter((setting) => setting.category === cat.category)
                  .map((setting) => (
                    <CTreeItem
                      key={`settings-treeitem-general-cat-${cIdx}-${setting.nodeId}`}
                      nodeId={`settings-treeitem-general-cat-${cIdx}-${setting.nodeId}`}
                      labelText={setting.labelText}
                      typographyVariant="body1"
                      labelInfo={setting.labelInfo}
                      labelIcon={<SettingsIcon iconPath={setting.iconPath} theme={muiTheme} />}
                    />
                  ))}
              </CTreeItem>
            )
          )}
        </CTreeItem>
        <SubchartTreeItem
          subcharts={subcharts}
          data={data}
          subchartIdx={0}
          Dispatch={Dispatch}
          onSettingsExpand={onSettingsExpand}
          fullscreen={fullscreen}
        />
        <DragDropContext
          onDragEnd={(res) => {
            if (!res.destination?.index) return;
            Dispatch({
              task: "swapSubcharts",
              params: {
                subchartIdx1: res.source.index,
                subchartIdx2: res.destination.index,
              },
            });
          }}
        >
          <Droppable droppableId="droppable">
            {(provided: any, snapshot: any) => (
              <Box
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{
                  background: snapshot.isDraggingOver ? muiTheme.palette.primary.light : "transparent",
                  borderTopRightRadius: muiTheme.spacing(2),
                  borderBottomRightRadius: muiTheme.spacing(2),
                }}
              >
                {subcharts.slice(1).map((subchart, subchartIdxShifted) => {
                  const subchartIdx = subchartIdxShifted + 1;
                  return (
                    <Draggable key={`sub-${subchartIdx}`} draggableId={`sub-${subchartIdx}`} index={subchartIdx}>
                      {(provided, snapshot) => {
                        return (
                          <SubchartTreeItem
                            subcharts={subcharts}
                            data={data}
                            subchartIdx={subchartIdx}
                            Dispatch={Dispatch}
                            onSettingsExpand={onSettingsExpand}
                            ref={provided.innerRef}
                            fullscreen={fullscreen}
                            {...provided.draggableProps}
                            additionalLabelInfo={
                              <IconButton size="small" {...provided.dragHandleProps}>
                                <Icon
                                  path={mdiArrowUpDownBold}
                                  size={1}
                                  color={muiTheme.palette.mode === "light" ? "#333" : "#fff"}
                                />
                              </IconButton>
                            }
                          />
                        );
                      }}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </CTreeView>
    </React.Fragment>
  );
};
