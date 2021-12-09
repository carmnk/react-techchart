import React from "react";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import useTheme from "@mui/material/styles/useTheme";

import {
  mdiBorderColor,
  mdiBullseye,
  mdiHelp,
  mdiMinus,
  mdiClose,
  mdiArrowSplitHorizontal,
  mdiIframeVariableOutline,
} from "@mdi/js";
import Icon from "@mdi/react";
import { CIcon } from "../../Components/CIcon";
import { CMColorPropTreeItem } from "./CMColorPropTreeItem";
import { CTreeItem } from "../../Components/CTreeItem";
import * as T from "../../Types";
import { defaultTools } from "../../Tools/DefaultTools";

export const ChartMenuToolTreeItem = (props: {
  subchartIdx: number;
  yaxisIdx: number;
  toolIdx: number;
  subCharts: T.ChartState["subCharts"];
  Dispatch: T.ChartStateHook["Dispatch"];
  handleToggleExpanded?: (id: string) => void;
}) => {
  const { subchartIdx, yaxisIdx, toolIdx, subCharts, Dispatch, handleToggleExpanded } = props;
  const toolIn = subCharts?.[subchartIdx]?.yaxis?.[yaxisIdx]?.tools?.[toolIdx];
  const tool = toolIn ? toolIn : null;
  const theme = useTheme();
  if (!tool) return null;

  const toolColorProps = (tool: T.ToolState) => [
    {
      text: "stroke color",
      icon: mdiBorderColor,
      color: tool.style.strokeColor,
      onColorSelected: (color: string) => {
        Dispatch({
          task: "setToolProp",
          params: {
            prop: "strokeColor",
            subchartIdx,
            yaxisIdx: 0,
            toolIdx,
            newValue: color,
          },
        });
      },
    },
    {
      text: "anchor color",
      icon: mdiBullseye,
      color: tool.style.anchorColor,
      onColorSelected: (color: string) => {
        Dispatch({
          task: "setToolProp",
          params: {
            prop: "anchorColor",
            subchartIdx,
            yaxisIdx: 0,
            toolIdx,
            newValue: color,
          },
        });
      },
    },
  ];

  return (
    <CTreeItem
      key={`tool-${toolIdx}`}
      nodeId={`tool-${subchartIdx}-${toolIdx}`}
      labelText={
        tool.type === "hline"
          ? "horizontal line"
          : tool.type === "vline"
          ? "vertical line"
          : tool.type === "trendline"
          ? "Trendline"
          : "Tool"
      }
      typographyVariant="body1"
      labelIcon={
        <div
          style={{
            border: `1px solid ${theme.palette.mode === "light" ? "#333" : "#fff"}`,
            borderRadius: 5,
          }}
        >
          <Icon
            path={tool.type === "hline" || tool.type === "vline" || tool.type === "trendline" ? mdiMinus : mdiHelp}
            size={"24px"}
            color={theme.palette.mode === "light" ? "#333" : "#fff"}
            rotate={tool.type === "trendline" ? -45 : tool.type === "vline" ? 90 : 0}
          />
        </div>
      }
      onClick={() => {
        const id = `tool-${subchartIdx}-${toolIdx}`;
        handleToggleExpanded?.(id);
      }}
      bgColorSelected={theme.palette.primary.light}
      labelInfo={
        <IconButton
          size="small"
          onClick={(e: any) => {
            e.preventDefault();
            const action: T.ReducerAction<"removeTool"> = {
              task: "removeTool",
              params: { subchartIdx, yaxisIdx: 0, toolIdx },
            };
            Dispatch(action);
          }}
        >
          <Icon path={mdiClose} size={1} color={theme.palette.mode === "light" ? "#333" : "#fff"} />
        </IconButton>
      }
    >
      {tool.type === "hline" ? (
        <CTreeItem
          key={`tool-${subchartIdx}-y0-${toolIdx}-hlinelevel`}
          nodeId={`tool-${subchartIdx}-y0-${toolIdx}-hlinelevel`}
          labelText={"Y-Level"}
          typographyVariant="body1"
          labelIcon={
            <CIcon
              path={mdiArrowSplitHorizontal}
              size={"24px"}
              color={theme.palette.mode === "light" ? "#333" : "#fff"}
            />
          }
          labelInfo={
            <TextField
              variant="outlined"
              margin="none"
              size="small"
              inputProps={{ style: { padding: 5, width: 50 } }}
              defaultValue={tool.xy[0][1]}
              onChange={(e: any) => {
                const val = parseFloat(e.target.value);
                if (isNaN(val)) return;
                Dispatch({
                  task: "setToolProp",
                  params: {
                    prop: "hLineYlevel",
                    subchartIdx,
                    yaxisIdx: 0,
                    toolIdx,
                    newValue: val,
                  },
                });
              }}
            />
          }
        />
      ) : null}
      {tool.params
        ? tool.params.map((param: any, paramIdx: number) => {
            const toolParamDefaults = defaultTools.find((defTool) => defTool.type === tool.type)?.default?.params;
            const icon = toolParamDefaults ? toolParamDefaults[paramIdx].icon : mdiIframeVariableOutline;
            return (
              <CTreeItem
                key={`tool-s${subchartIdx}-y0-t${toolIdx}-p${paramIdx}`}
                nodeId={`tool-s${subchartIdx}-y0-t${toolIdx}-p${paramIdx}`}
                labelText={param.name}
                typographyVariant="body1"
                labelIcon={<CIcon path={icon} size={"24px"} color={theme.palette.mode === "light" ? "#333" : "#fff"} />}
                labelInfo={
                  param.type === "select" ? (
                    <Select
                      size="small"
                      margin="none"
                      SelectDisplayProps={{
                        style: { paddingTop: 2, paddingBottom: 2 },
                      }}
                      // inputProps={{ style: { padding: 0, minWidth: 50 } }}
                      value={param.val}
                      onChange={(e: any) => {
                        const newValue = e.target.value;
                        Dispatch({
                          task: "setToolProp",
                          params: {
                            prop: "toolParam",
                            subchartIdx,
                            yaxisIdx,
                            toolIdx,
                            toolParamIdx: paramIdx,
                            newValue,
                          },
                        });
                      }}
                    >
                      {param.vals.map((optionVal: any, optValIdx: number) => (
                        <MenuItem
                          key={`tool-s${subchartIdx}-y0-t${toolIdx}-p${paramIdx}-o${optValIdx}`}
                          value={optionVal}
                        >
                          {optionVal}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : param.type === "number" ? (
                    <TextField
                      variant="outlined"
                      margin="none"
                      size="small"
                      inputProps={{ style: { padding: 5, maxWidth: 80 } }}
                      value={param.val}
                      onChange={(e: any) => {
                        const newValue = parseFloat(e.target.value);
                        if (isNaN(newValue)) return;
                        Dispatch({
                          task: "setToolProp",
                          params: {
                            prop: "toolParam",
                            subchartIdx,
                            yaxisIdx,
                            toolIdx,
                            toolParamIdx: paramIdx,
                            newValue,
                          },
                        });
                      }}
                    />
                  ) : undefined
                }
              />
            );
          })
        : null}
      {toolColorProps(tool).map((toolColorProps, tcIdx) => (
        <CMColorPropTreeItem
          nodeId={`settings-treeitem-tool-clrProp-${subchartIdx}-y${yaxisIdx}-t${toolIdx}-p${tcIdx}`}
          key={`settings-treeitem-tool-clrProp-${subchartIdx}-y${yaxisIdx}-t${toolIdx}-p${tcIdx}`}
          color={toolColorProps.color}
          iconPath={toolColorProps.icon}
          text={toolColorProps.text}
          onColorSelected={toolColorProps.onColorSelected}
        />
      ))}
    </CTreeItem>
  );
};
