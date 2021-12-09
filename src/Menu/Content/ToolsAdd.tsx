import IconButton from "@mui/material/IconButton";
import useTheme from "@mui/material/styles/useTheme";
import { mdiCrop, mdiFilter, mdiRuler, mdiRulerSquareCompass, mdiSortAlphabeticalAscending } from "@mdi/js";
import Icon from "@mdi/react";
import React from "react";
import { CTreeItem } from "../../Components/CTreeItem";
import { CChartMenuStateType } from "../ChartMenu";
import * as T from "../../Types";
import { ToolsSubMenu } from "./ToolsSubMenu";
import { CTreeView } from "../../Components/CTreeView";

export type ToolCategoryType = "Lines" | "Upcoming" | "Measure";
const categorys: { name: ToolCategoryType; icon: string }[] = [
  { name: "Lines", icon: mdiRuler },
  { name: "Measure", icon: mdiCrop },
  { name: "Upcoming", icon: mdiRulerSquareCompass },
];
const tools: {
  name: string;
  type: NonNullable<T.ChartState["draw"]["type"]>;
  category: ToolCategoryType;
}[] = [
  { name: "trendline", type: "trendline", category: "Lines" },
  { name: "horizontal", type: "hline", category: "Lines" },
  { name: "vertical", type: "vline", category: "Lines" },
];

const onToolLabelClick = (Dispatch: T.ChartStateHook["Dispatch"], type: NonNullable<T.ChartState["draw"]["type"]>) => {
  const subchartIdx = 0;
  const action: T.ReducerAction<"draw"> = {
    task: "draw",
    params: { type, subchartIdx },
  };

  Dispatch(action);
};

export const ToolsAdd = (props: {
  subCharts: T.ChartState["subCharts"];
  onNavigate: (target: CChartMenuStateType["location"]) => void;
  Dispatch: T.ChartStateHook["Dispatch"];
}) => {
  const { Dispatch, onNavigate, subCharts } = props;
  const [DisableGrouping, setDisableGrouping] = React.useState(false);
  const theme = useTheme();

  // console.log(tools);
  return (
    <React.Fragment>
      <ToolsSubMenu
        subCharts={subCharts}
        location="tools"
        onNavigate={onNavigate}
        theme={theme}
        submenuContent={
          <React.Fragment>
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
      <CTreeView>
        {!DisableGrouping
          ? categorys.map((cat, catIdx) => (
              <CTreeItem
                key={`cat-${catIdx}`}
                nodeId={catIdx.toString()}
                labelText={cat.name}
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
                bgColorSelected={theme.palette.primary.light}
              >
                {tools
                  .filter((tool) => tool.category === cat.name)
                  .sort((a, b) => (a.name > b.name ? 1 : -1))
                  .map((tool, toolIdx) => {
                    // console.log(tool);
                    return (
                      <CTreeItem
                        key={`cat-${catIdx}-tool-${toolIdx}`}
                        nodeId={((catIdx + 1) * 100 + (toolIdx + 1)).toString()}
                        labelText={tool.name}
                        typographyVariant="body1"
                        onClick={() => {
                          onToolLabelClick(Dispatch, tool.type);
                          onNavigate?.(null);
                        }}
                      />
                    );
                  })}
              </CTreeItem>
            ))
          : tools
              .sort((a, b) => (a.name > b.name ? 1 : -1))
              .map((tool, toolIdx) => (
                <CTreeItem
                  key={`cat-tool-${toolIdx}`}
                  nodeId={(toolIdx + 1).toString()}
                  labelText={tool.name}
                  typographyVariant="body1"
                  onClick={() => {
                    onToolLabelClick(Dispatch, tool.type);
                    onNavigate?.(null);
                  }}
                />
              ))}
      </CTreeView>
    </React.Fragment>
  );
};
