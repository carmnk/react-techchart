import { mdiCheck } from "@mdi/js";
import Icon from "@mdi/react";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import React from "react";
import { CTreeItem, type CTreeItemProps } from "../../Components/CTreeItem";

export type CMNumberPropTreeItemProps = CTreeItemProps & {
  nodeId: string;
  labelIcon: JSX.Element;
  labelText: React.ReactNode;
  value: number;
  onChangeConfirmed: (val: number) => void;
};

export const CMNumberPropTreeItem = (props: CMNumberPropTreeItemProps) => {
  const { nodeId, labelIcon, labelText, onChangeConfirmed, value } = props;
  const [TempParam, setTempParam] = React.useState<number | string>(value);

  return (
    <CTreeItem
      key={nodeId}
      nodeId={nodeId}
      labelIcon={labelIcon}
      labelText={labelText}
      typographyVariant="body1"
      labelInfo={
        <Stack direction="row">
          <TextField
            variant="outlined"
            margin="none"
            size="small"
            inputProps={{ style: { padding: 5, width: 50 } }}
            value={TempParam || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
              const val = e.target.value;
              const num = parseFloat(e.target.value);
              if (isNaN(num) && e.target.value !== "") return;
              setTempParam(num || val || "");
            }}
            onKeyUp={(e: React.KeyboardEvent) => {
              if (e.code === "Enter") {
                const val = TempParam;
                const num = typeof val === "string" ? parseInt(val) : val;
                if (typeof num === "number" && isNaN(num)) return;
                onChangeConfirmed?.(num);
              }
            }}
          />
          {typeof TempParam === "number" && value !== TempParam && (
            <IconButton
              size="small"
              onClick={() => {
                const val = TempParam;
                const num = typeof val === "string" ? parseInt(val) : val;
                if (typeof num === "number" && isNaN(num)) return;
                onChangeConfirmed?.(num);
              }}
            >
              <Icon path={mdiCheck} size={1}></Icon>
            </IconButton>
          )}
        </Stack>
      }
    />
  );
};
