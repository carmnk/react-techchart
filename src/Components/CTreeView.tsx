import * as React from "react";
import TreeView, { TreeViewProps } from "@mui/lab/TreeView";
import { mdiMenuDown, mdiMenuRight } from "@mdi/js";
import Icon from "@mdi/react";
import useTheme from "@mui/material/styles/useTheme";

export const CTreeViewComponent: React.FC<TreeViewProps> = (props) => {
  const { ...other } = props;
  const theme = useTheme();
  return (
    <TreeView
      aria-label="treeview"
      defaultCollapseIcon={
        <Icon path={mdiMenuDown} size={1} color={theme.palette.mode === "light" ? "#333" : "#fff"} />
      }
      defaultExpandIcon={<Icon path={mdiMenuRight} size={1} color={theme.palette.mode === "light" ? "#333" : "#fff"} />}
      defaultEndIcon={<div style={{ width: 24 }} />}
      sx={{ overflowY: "auto", pt: 1, pb: 1 }}
      {...other}
    >
      {props.children}
    </TreeView>
  );
};
export const CTreeView = React.memo(CTreeViewComponent);
