import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { mdiMenu } from "@mdi/js";
import { Icon } from "@mdi/react";
import React from "react";

export type ChartMenuButtonProps = {
  bottomY: number;
  onOpenClick: () => void;
};
export const ChartMenuButtonComponent = (props: ChartMenuButtonProps) => {
  const { bottomY, onOpenClick } = props;

  return (
    <Box sx={{ position: "absolute", top: bottomY - 48 - 10, left: 10 }}>
      <Button
        color="primary"
        variant="contained"
        onClick={onOpenClick}
        sx={{
          width: 48,
          minWidth: 48,
          // background: "primary.main",
          height: 48,
          textTransform: "none",
          borderRadius: 2,
          opacity: 0.8,
          padding: 0,
        }}
      >
        <Icon path={mdiMenu} size="48px" color="#fff" />
      </Button>
    </Box>
  );
};

export const ChartMenuButton = React.memo(ChartMenuButtonComponent);
