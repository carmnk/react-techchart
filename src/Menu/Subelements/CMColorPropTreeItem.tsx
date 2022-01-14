import React from "react";
import useTheme from "@mui/material/styles/useTheme";
import { CIcon } from "../../Components/CIcon";
import { Colorpicker } from "../../Components/Colorpicker";
import { CTreeItem } from "../../Components/CTreeItem";

export const CMColorPropTreeItem = (props: {
  nodeId: string;
  color: string | string[];
  iconPath: string;
  text: string;
  onColorSelected: (color: string) => void;
  iconBorder?: string;
  fullscreen: boolean;
}) => {
  const { nodeId, onColorSelected, color, iconPath, text, fullscreen } = props;
  const theme = useTheme();
  return (
    <CTreeItem
      key={nodeId}
      nodeId={nodeId}
      labelText={text}
      typographyVariant="body1"
      labelIcon={
        <CIcon
          path={iconPath}
          size={"24px"}
          color={theme.palette.text.primary}
          border={theme.palette.mode === "dark" ? undefined : "1px solid #bbb"}
        />
      }
      labelInfo={
        <Colorpicker
          color={typeof color === "string" ? color : color[0]}
          onColorSelected={onColorSelected}
          fullscreen={fullscreen}
        />
      }
    />
  );
};
