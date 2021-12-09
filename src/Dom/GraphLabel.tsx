import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { mdiChartBellCurve, mdiChartLine } from "@mdi/js";
import Icon from "@mdi/react";
import React from "react";
import * as T from "../Types";

export const GraphLabel = (props: {
  name: string;
  dataset: T.Dataset;
  decimals?: number;
  onClick: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    graphIdx: number,
    subchartIdx: number
  ) => any;
  subchartIdx: number;
  graphIdx: number;
  graphTypes?: T.IndicatorModel["graphTypes"];
}) => {
  const {
    dataset,
    name,
    decimals,
    onClick,
    subchartIdx,
    graphIdx,
    graphTypes,
  } = props;
  const handleClick = React.useCallback(
    (e) => {
      onClick?.(e, subchartIdx, graphIdx);
    },
    [onClick, subchartIdx, graphIdx]
  );
  if (!dataset) return null;

  return (
    <Button
      style={{ textTransform: "none", textAlign: "left" }}
      onClick={handleClick}
      startIcon={
        <Icon
          path={
            T.isIndicatorDataset(dataset) ? mdiChartBellCurve : mdiChartLine
          }
          size={1.0}
        />
      }
    >
      {T.isIndicatorDataset(dataset) ? (
        <Typography variant="body2">{`${name}:${
          dataset.prices
            .map((price, pIdx) =>
              price &&
              decimals &&
              ["line", "bars"].includes(graphTypes?.[pIdx]?.type ?? "")
                ? price?.toFixed(decimals)
                : null
            )
            .filter((val) => val !== null)
            .join(", ") || ""
        }`}</Typography>
      ) : (
        <Typography variant="body2">
          {T.isCandleChartDataset(dataset)
            ? `${name}
                O:${dataset.open.toFixed(decimals)}
                H:${dataset.high.toFixed(decimals)}
                L:${dataset.low.toFixed(decimals)}
                C:${dataset.close.toFixed(decimals)}`
            : `${name}
                C:${dataset.close.toFixed(decimals)}`}
        </Typography>
      )}
    </Button>
  );
};
