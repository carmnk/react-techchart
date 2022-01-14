import React from "react";
import { CTreeItem, type CTreeItemProps } from "../../Components/CTreeItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

export type CMSelectPropTreeItemProps = CTreeItemProps & {
  nodeId: string;
  labelIcon: JSX.Element;
  labelText: React.ReactNode;
  value: string | number;
  options: (number | string)[] | { text: string; value: number | string }[];
  onChangeConfirmed: (val: number | string) => void;
  fullscreen: boolean;
};

export const CMSelectPropTreeItem = (props: CMSelectPropTreeItemProps) => {
  const { nodeId, labelIcon, labelText, onChangeConfirmed, value, options, fullscreen } = props;
  return (
    <CTreeItem
      key={nodeId}
      nodeId={nodeId}
      labelText={labelText}
      typographyVariant="body1"
      labelIcon={labelIcon}
      labelInfo={
        <Select<number | string>
          size="small"
          margin="none"
          SelectDisplayProps={{
            style: { paddingTop: 2, paddingBottom: 2 },
          }}
          MenuProps={{ disablePortal: fullscreen }}
          value={value}
          onChange={(e: SelectChangeEvent<number | string>) => {
            const newValue = e.target.value;
            onChangeConfirmed?.(newValue);
          }}
        >
          {options.map((option, oIdx) => {
            const txt = typeof option === "object" && "text" in option ? option?.text : option;
            const val = typeof option === "object" && "value" in option ? option?.value : option;
            return (
              <MenuItem key={`menu-${nodeId}-o-${oIdx}`} value={val}>
                {txt}
              </MenuItem>
            );
          })}
        </Select>
      }
    />
  );
};
