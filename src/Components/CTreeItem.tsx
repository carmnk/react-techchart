import React from "react";
import TreeItem, { TreeItemProps, treeItemClasses } from "@mui/lab/TreeItem";
import Typography, { TypographyProps } from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import styled from "@mui/material/styles/styled";

declare module "react" {
  interface CSSProperties {
    "--tree-view-color"?: string;
    "--tree-view-bg-color"?: string;
  }
}
const CSTreeItem = styled(TreeItem)(({ theme }) => ({
  [`& .${treeItemClasses.content}`]: {
    boxSizing: "border-box",
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingRight: theme.spacing(2),
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused": {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: "var(--tree-view-color)",
    },
    [`& .${treeItemClasses.label}`]: {
      color: "inherit",
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: theme.spacing(1),

    [`& .${treeItemClasses.content}`]: {
      paddingLeft: theme.spacing(1),
      // pr: 0
      // paddingLeft: 2,
    },
  },
}));

type CTreeItemProps = TreeItemProps & {
  bgColorSelected?: string;
  colorSelected?: string;
  labelIcon?: JSX.Element;
  labelInfo?: JSX.Element;
  labelText: string;
  typographyVariant?: TypographyProps["variant"];
};

export const CTreeItem = React.forwardRef((props: CTreeItemProps, ref: any) => {
  const {
    bgColorSelected,
    colorSelected,
    labelIcon: LabelIcon,
    labelInfo,
    labelText,
    typographyVariant,
    ...other
  } = props;

  return (
    <CSTreeItem
      ref={ref}
      label={
        <Stack
          direction="row"
          sx={{ alignItems: "center", alignContent: "center" }}
        >
          <Box component="span" sx={{ mr: 1, lineHeight: 0 }}>
            {LabelIcon}
          </Box>
          <Typography
            variant={typographyVariant ?? "h6"}
            component="div"
            sx={{ flexGrow: 1 }}
          >
            {labelText}
          </Typography>
          <Typography variant="caption" component="div">
            {labelInfo}
          </Typography>
        </Stack>
      }
      sx={{ color: "text.primary" }}
      style={{
        "--tree-view-color": colorSelected,
        "--tree-view-bg-color": bgColorSelected,
      }}
      {...other}
    />
  );
});
CTreeItem.displayName = "CTreeItem";
