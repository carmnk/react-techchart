import React from "react";
import ListItem from "@mui/material/ListItem";
import ListItemIcon, { ListItemIconProps } from "@mui/material/ListItemIcon";
import styled from "@mui/material/styles/styled";
import Typography from "@mui/material/Typography";
import Icon from "@mdi/react";

export const ChartMenuListItemIcon: React.FC<ListItemIconProps> = styled(ListItemIcon)(({ theme }) => ({
  border: "1px solid #666",
  borderRadius: 5,
  marginRight: 10,
  background: theme.palette.secondary.main,
  minWidth: 32,
  height: 32,
  position: "relative",
  top: 0,
}));

export type ChartMenuListItemProps = {
  text: string;
  id: string;
  iconColor?: string;
  iconBgColor?: string;
  textColor?: string;
  iconPath: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  addIcons?: JSX.Element[];
};

export const ChartMenuListItemComponent = (props: ChartMenuListItemProps) => {
  const { text, id, iconPath, onClick, iconColor, textColor, addIcons, iconBgColor } = props;
  const addIconsInt = addIcons ?? [];

  return (
    <ListItem button onClick={onClick} key={id + "_listitem"}>
      <ChartMenuListItemIcon
        sx={{
          background: iconBgColor ?? "secondary.main",
        }}
      >
        <Icon path={iconPath} size={"32px"} color={iconColor ?? "#fff"} />
        {addIconsInt}
      </ChartMenuListItemIcon>
      <Typography variant="h6" component="div" color={textColor ?? "text.primary"}>
        {text}
      </Typography>
    </ListItem>
  );
};
export const ChartMenuListItem = React.memo(ChartMenuListItemComponent);
