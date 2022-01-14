import React from "react";
import IconButton from "@mui/material/IconButton";
import useTheme from "@mui/material/styles/useTheme";
import { mdiBorderColor, mdiBullseye, mdiHelp, mdiMinus } from "@mdi/js";
import { mdiClose, mdiArrowSplitHorizontal, mdiApplicationVariableOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { CIcon } from "../../Components/CIcon";
import { CMColorPropTreeItem } from "./CMColorPropTreeItem";
import { CTreeItem } from "../../Components/CTreeItem";
import * as T from "../../Types";
import { defaultTools } from "../../Tools/DefaultTools";
import { CMNumberPropTreeItem } from "./CMNumberPropTreeItem";
import { CMSelectPropTreeItem } from "./CMSelectPropTreeItem";

export const ChartMenuToolTreeItem = (props: {
  subchartIdx: number;
  yaxisIdx: number;
  toolIdx: number;
  subcharts: T.ChartState["subcharts"];
  Dispatch: T.ChartController["Dispatch"];
  handleToggleExpanded?: (id: string) => void;
  fullscreen: boolean;
}) => {
  const { subchartIdx, yaxisIdx, toolIdx, subcharts, Dispatch, handleToggleExpanded, fullscreen } = props;
  const toolIn = subcharts?.[subchartIdx]?.yaxis?.[yaxisIdx]?.tools?.[toolIdx];
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
          params: { prop: "strokeColor", subchartIdx, yaxisIdx: 0, toolIdx, newValue: color },
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
          params: { prop: "anchorColor", subchartIdx, yaxisIdx: 0, toolIdx, newValue: color },
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
        <CMNumberPropTreeItem
          key={`tool-${subchartIdx}-y0-${toolIdx}-hlinelevel`}
          nodeId={`tool-${subchartIdx}-y0-${toolIdx}-hlinelevel`}
          labelText={"Y-Level"}
          value={tool.xy[0][1]}
          labelIcon={
            <CIcon
              path={mdiArrowSplitHorizontal}
              size={"24px"}
              color={theme.palette.mode === "light" ? "#333" : "#fff"}
            />
          }
          onChangeConfirmed={(val) => {
            Dispatch({
              task: "setToolProp",
              params: { prop: "hLineYlevel", subchartIdx, yaxisIdx: 0, toolIdx, newValue: val },
            });
          }}
        />
      ) : null}
      {tool.params &&
        tool.params.map((param, paramIdx) => {
          const toolParamDefaults = defaultTools.find((defTool) => defTool.type === tool.type)?.default?.params;
          const icon = toolParamDefaults ? toolParamDefaults[paramIdx].icon : mdiApplicationVariableOutline;
          return param.type === "number" ? (
            <CMNumberPropTreeItem
              key={`tool-s${subchartIdx}-y0-t${toolIdx}-p${paramIdx}`}
              nodeId={`tool-s${subchartIdx}-y0-t${toolIdx}-p${paramIdx}`}
              labelText={param.name}
              labelIcon={<CIcon path={icon} size={"24px"} color={theme.palette.mode === "light" ? "#333" : "#fff"} />}
              value={param.val}
              onChangeConfirmed={(newValue) => {
                Dispatch({
                  task: "setToolProp",
                  params: { prop: "toolParam", subchartIdx, yaxisIdx, toolIdx, toolParamIdx: paramIdx, newValue },
                });
              }}
            />
          ) : param.type === "select" ? (
            <CMSelectPropTreeItem
              key={`tool-s${subchartIdx}-y0-t${toolIdx}-p${paramIdx}`}
              nodeId={`tool-s${subchartIdx}-y0-t${toolIdx}-p${paramIdx}`}
              labelText={param.name}
              labelIcon={<CIcon path={icon} size={"24px"} color={theme.palette.mode === "light" ? "#333" : "#fff"} />}
              value={param.val}
              fullscreen={fullscreen}
              options={param.vals}
              onChangeConfirmed={(newValue) => {
                Dispatch({
                  task: "setToolProp",
                  params: { prop: "toolParam", subchartIdx, yaxisIdx, toolIdx, toolParamIdx: paramIdx, newValue },
                });
              }}
            />
          ) : null;
        })}

      {toolColorProps(tool).map((toolColorProps, tcIdx) => (
        <CMColorPropTreeItem
          nodeId={`settings-treeitem-tool-clrProp-${subchartIdx}-y${yaxisIdx}-t${toolIdx}-p${tcIdx}`}
          key={`settings-treeitem-tool-clrProp-${subchartIdx}-y${yaxisIdx}-t${toolIdx}-p${tcIdx}`}
          color={toolColorProps.color}
          iconPath={toolColorProps.icon}
          text={toolColorProps.text}
          fullscreen={fullscreen}
          onColorSelected={toolColorProps.onColorSelected}
        />
      ))}
    </CTreeItem>
  );
};
