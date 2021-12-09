import Box, { type BoxProps } from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import React from "react";
import { colorNameToRGB, hexToRgb } from "../utils/Color";

// const colors = [
//   "#000", //black to white
//   "#666",
//   "#bbb",
//   "#fff",
//   "#9013fe", //violets
//   "#bd10e0",
//   "#3f51b5", // blues
//   "#0693E3",
//   "#8ED1FC",
//   "#008080", // greens
//   "#00D084",
//   "#7BDCB5",
//   "#b80000", // reds
//   "#f50057",
//   "#f78da7",
//   "#795548", // brown to yellow
//   "#FF6900",
//   "#FCB900",
// ];
const rgbaColor = [
  "0, 0, 0", //black to whites
  "102, 102, 102",
  "187, 187, 187",
  "255, 255, 255",
  "144, 19, 254", // violets
  "189, 16, 224",
  "63, 81, 181", //blues
  "6, 147, 227",
  "142, 209, 252",
  "0, 128, 128", // greens
  "0, 208, 132",
  "123, 220, 181",
  "184, 0, 0", // red
  "245, 0, 87",
  "247, 141, 167",
  "121, 85, 72", // brown to yellow
  "255, 105, 0",
  "252, 185, 0",
];

export const ColorRect = (props: {
  color: React.CSSProperties["background"];
  width?: number;
  height?: number;
  BoxProps?: BoxProps;
}) => {
  const { color, width = 24, height = 24, BoxProps = {} } = props;
  return (
    <Box
      {...BoxProps}
      sx={{
        minWidth: width,
        minHeight: height,
        // height,
        boxSizing: "border-box",
        background: color,
        borderRadius: 1,
        border: "2px solid #000",
        ...BoxProps?.sx,
      }}
    />
  );
};

export type ColorpickerProps = {
  color: React.CSSProperties["background"];
  onColorSelected: (color: string) => void;
};
export const Colorpicker = (props: ColorpickerProps) => {
  const { color, onColorSelected } = props;
  const [Open, setOpen] = React.useState(false);
  const [ColorHover, setColorHover] = React.useState<string | null>(null);

  const InputRef = React.useRef<HTMLButtonElement>(null);

  const isHex = /((^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$))/i.test(color as string);
  const hexToRgbRes =
    !!isHex && typeof color === "string" ? hexToRgb(color) : null;
  const isRgb =
    typeof color === "string"
      ? (color as string).match(
          /^(rgb)(a?)[(]\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*(?:,\s*([\d.]+)\s*)?[)]$/
        )
      : null;
  const isRgba = !!isRgb && 2 in isRgb && isRgb[2] === "a";
  const rgbInternal =
    !!isRgb && 3 in isRgb && 4 in isRgb && 5 in isRgb
      ? [parseFloat(isRgb[3]), parseFloat(isRgb[4]), parseFloat(isRgb[5])]
      : isHex && !!hexToRgbRes
      ? [hexToRgbRes.r, hexToRgbRes.g, hexToRgbRes.b]
      : [];
  if (rgbInternal.length === 0) {
    const colorNameRes = colorNameToRGB(color as string);
    if (colorNameRes)
      rgbInternal.push(colorNameRes.r, colorNameRes.g, colorNameRes.b);
  }

  const alphaProp =
    !!isRgba && !!isRgb && 6 in isRgb ? parseFloat(isRgb[6]) * 100 : 100;
  const [AlphaVal, setAlphaVal] = React.useState(alphaProp);

  return (
    <React.Fragment>
      <IconButton
        color="primary"
        style={{ padding: 0 }}
        onClick={() => {
          setOpen(true);
        }}
        ref={InputRef}
      >
        <ColorRect color={color} />
      </IconButton>
      <Popover
        id={"colorpicker-popover"}
        open={Open}
        anchorEl={InputRef.current}
        onClose={() => {
          setOpen(false);
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{ sx: { width: 300, p: 1 } }}
        // sx={}
      >
        <Grid
          container
          spacing={1}
          sx={{
            alignItems: "center",
            justifyItems: "center",
            alignContent: "center",
            p: 1,
          }}
        >
          {rgbaColor.map((clr, clrIdx) => (
            <Grid item xs={2} key={clrIdx}>
              <IconButton
                color="default"
                style={{ padding: 0 }}
                onMouseOver={(e: any) => {
                  setColorHover(`rgba(${rgbaColor[clrIdx]},${AlphaVal})`);
                }}
                onMouseLeave={() => {
                  setColorHover(null);
                }}
                onClick={() => {
                  onColorSelected(
                    "rgba(" + rgbaColor[clrIdx] + "," + AlphaVal / 100 + ")"
                  );
                }}
              >
                <ColorRect
                  color={"rgba(" + clr + ",1)"}
                  width={24}
                  height={24}
                />
              </IconButton>
            </Grid>
          ))}
          <Grid item xs={3}>
            <Typography>Alpha</Typography>
          </Grid>
          <Grid item xs={6} style={{ padding: "0px 10px" }}>
            <Slider
              value={AlphaVal}
              onChange={(e: any, val: any) => {
                setAlphaVal(Array.isArray(val) ? val[0] : val);
                onColorSelected(
                  `rgba(${rgbInternal[0]},${rgbInternal[1]},${rgbInternal[2]},${
                    (Array.isArray(val) ? val[0] : val) / 100
                  })`
                );
              }}
            ></Slider>
          </Grid>
          <Grid item xs={3}>
            <TextField
              margin="none"
              variant="outlined"
              size="small"
              inputProps={{ style: { padding: "5px 5px 5px 10px" } }}
              value={AlphaVal}
              onChange={(e: any) => {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val)) val = 0;
                if (val < 0 || val > 100) return;
                setAlphaVal(val);
                onColorSelected(
                  `rgba(${rgbInternal[0]},${rgbInternal[1]},${rgbInternal[2]},${
                    val / 100
                  })`
                );
              }}
            />
          </Grid>
        </Grid>

        <Grid
          container
          spacing={1}
          sx={{
            alignItems: "center",
            justifyItems: "center",
            alignContent: "center",
            p: 1,
          }}
        >
          <Grid item xs={2}>
            <Typography component="div" align="center">
              R
            </Typography>
          </Grid>

          <Grid item xs={2}>
            <Typography component="div" align="center">
              G
            </Typography>
          </Grid>

          <Grid item xs={2}>
            <Typography component="div" align="center">
              B
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography component="div" align="center">
              A
            </Typography>
          </Grid>

          <Grid item xs={2} />
          <Grid item xs={2}>
            <ColorRect
              color={ColorHover ? ColorHover : color}
              width={24}
              height={24}
              BoxProps={{ maxWidth: 24, maxHeight: 24 }}
            />
          </Grid>
        </Grid>
        <Grid
          container
          spacing={1}
          sx={{
            alignItems: "center",
            justifyItems: "center",
            alignContent: "center",
            p: 1,
          }}
        >
          <Grid item xs={2}>
            <TextField
              disabled
              value={rgbInternal ? rgbInternal[0] : color}
              margin="none"
              variant="outlined"
              size="small"
              inputProps={{
                style: {
                  padding: 5,
                  background: `rgba(184, 0, 0, ${
                    rgbInternal ? rgbInternal[0] / 255 : 1
                  })`,
                },
              }}
            />
          </Grid>

          <Grid item xs={2}>
            <TextField
              disabled
              value={rgbInternal ? rgbInternal[1] : color}
              margin="none"
              variant="outlined"
              size="small"
              inputProps={{
                style: {
                  padding: 5,
                  background: `rgba(0, 208, 132, ${
                    rgbInternal ? rgbInternal[1] / 255 : 1
                  })`,
                },
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              disabled
              value={rgbInternal ? rgbInternal[2] : color}
              margin="none"
              variant="outlined"
              size="small"
              inputProps={{
                style: {
                  padding: 5,
                  background: `rgba(6, 147, 227, ${
                    rgbInternal ? rgbInternal[2] / 255 : 1
                  })`,
                },
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              disabled
              value={AlphaVal}
              margin="none"
              variant="outlined"
              size="small"
              inputProps={{ style: { padding: 5, background: `#bbb` } }}
            />
          </Grid>
          <Grid item xs={2} />
          <Grid item xs={2}>
            <Button
              color="secondary"
              variant="contained"
              size="small"
              style={{ minWidth: 0 }}
              onClick={() => setOpen(false)}
            >
              OK
            </Button>
          </Grid>
        </Grid>
      </Popover>
    </React.Fragment>
  );
};
