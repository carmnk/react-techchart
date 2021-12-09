import Icon from "@mdi/react";
import { IconProps } from "@mdi/react/dist/IconProps";
import React from "react";

export const CIcon = (props: IconProps & { background?: React.CSSProperties["background"]; border?: string }) => {
  const { path, size, style, background, border, ...other } = props;
  return (
    <Icon
      path={path}
      size={size}
      {...other}
      style={{
        background,
        border: border ?? "1px solid #666",
        borderRadius: 5,
        marginRight: 10,
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
};
