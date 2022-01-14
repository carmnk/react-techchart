import React, { ReactNode } from "react";
import Stack from "@mui/material/Stack";
import { Theme } from "@mui/material/styles/createTheme";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Typography from "@mui/material/Typography";
import { CChartMenuStateType } from "../ChartMenu";
import * as T from "../../Types";

export type ToolCategoryType = "Lines" | "Upcoming";

export const ToolsSubMenu = (props: {
  subcharts: T.ChartState["subcharts"];
  location: CChartMenuStateType["location"];
  submenuContent?: ReactNode;
  theme: Theme;
  onNavigate: (target: CChartMenuStateType["location"]) => void;
}) => {
  const { location, submenuContent, theme, onNavigate, subcharts } = props;
  const amtTools = subcharts
    .map((subchart) => subchart.yaxis.map((yaxis) => yaxis.tools.length))
    .flat()
    .reduce((acc, cur) => acc + cur);

  return (
    <Stack // menu
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      sx={{ pt: 0.5 }}
    >
      {submenuContent}
      {amtTools > 0 ? (
        <ToggleButtonGroup value={"toolModifyMode"} exclusive size="small">
          <ToggleButton
            value="addTool"
            sx={{
              "&:hover": {
                background: location === "tools" ? theme.palette.secondary.light : theme.palette.background.paper,
                boxShadow: 3,
                backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15))",
              },
              borderBottomLeftRadius: 50,
              textTransform: "none",
              borderTopLeftRadius: 50,
              background: location === "tools" ? theme.palette.secondary.light : theme.palette.background.paper,
              backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15))",
            }}
            onClick={() => {
              onNavigate?.("tools");
            }}
          >
            <Typography> Add</Typography>
          </ToggleButton>
          <ToggleButton
            value="editTool"
            sx={{
              "&:hover": {
                background: location === "editTool" ? theme.palette.secondary.light : theme.palette.background.paper,
                boxShadow: 3,
                backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15))",
              },
              borderBottomRightRadius: 50,
              borderTopRightRadius: 50,
              background: location === "editTool" ? theme.palette.secondary.light : theme.palette.background.paper,
              backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15))",
            }}
            onClick={() => {
              onNavigate?.("editTool");
            }}
          >
            Edit
          </ToggleButton>
        </ToggleButtonGroup>
      ) : null}
    </Stack>
  );
};
