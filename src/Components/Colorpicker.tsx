import Box, { type BoxProps } from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import React from "react";
import { hexToRgb, colorNameToRGB } from "../utils/Color";

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
  fullscreen: boolean;
};
export const Colorpicker = (props: ColorpickerProps) => {
  const { color: color1, onColorSelected, fullscreen } = props;
  const [Open, setOpen] = React.useState(false);
  const [TempColor, setTempColor] = React.useState(color1);

  const InputRef = React.useRef<HTMLButtonElement>(null);

  const isHex = /((^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$))/i.test(TempColor as string);
  const hexToRgbRes = !!isHex && typeof TempColor === "string" ? hexToRgb(TempColor) : null;
  const isRgb =
    typeof TempColor === "string"
      ? (TempColor as string).match(
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
    const colorNameRes = colorNameToRGB(TempColor as string);
    if (colorNameRes) rgbInternal.push(colorNameRes.r, colorNameRes.g, colorNameRes.b);
  }

  const alphaProp = !!isRgba && !!isRgb && 6 in isRgb ? parseFloat(isRgb[6]) * 100 : 100;
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
        <ColorRect color={TempColor} />
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
        disablePortal={fullscreen}
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
                // onMouseOver={() => {
                //   setColorHover(`rgba(${rgbaColor[clrIdx]},${AlphaVal})`);
                // }}
                // onMouseLeave={() => {
                //   setColorHover(null);
                // }}
                onClick={() => {
                  // onColorSelected("rgba(" + rgbaColor[clrIdx] + "," + AlphaVal / 100 + ")");
                  setTempColor("rgba(" + rgbaColor[clrIdx] + "," + AlphaVal / 100 + ")");
                }}
              >
                <ColorRect color={"rgba(" + clr + ",1)"} width={24} height={24} />
              </IconButton>
            </Grid>
          ))}
          <Grid item xs={3}>
            <Typography>Alpha</Typography>
          </Grid>
          <Grid item xs={6} style={{ padding: "0px 10px" }}>
            <Slider
              value={AlphaVal}
              onChange={(e: Event, val: number | number[]) => {
                setAlphaVal(Array.isArray(val) ? val[0] : val);
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
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val)) val = 0;
                if (val < 0 || val > 100) return;
                setAlphaVal(val);
                onColorSelected(`rgba(${rgbInternal[0]},${rgbInternal[1]},${rgbInternal[2]},${val / 100})`);
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
              color={`rgba(${rgbInternal[0]},${rgbInternal[1]},${rgbInternal[2]},${AlphaVal / 100})`}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const red = parseInt(e.target.value);
                if (typeof red !== "number" || isNaN(red)) return;
                const redAdjusted = Math.min(Math.max(red, 0), 255);
                setTempColor(`rgba(${redAdjusted},${rgbInternal[1]},${rgbInternal[2]},${AlphaVal / 100})`);
              }}
              value={rgbInternal ? rgbInternal[0] : TempColor}
              margin="none"
              variant="outlined"
              size="small"
              inputProps={{
                style: {
                  padding: 5,
                  background: `rgba(184, 0, 0, ${rgbInternal ? rgbInternal[0] / 255 : 1})`,
                },
              }}
            />
          </Grid>

          <Grid item xs={2}>
            <TextField
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const green = parseInt(e.target.value);
                if (typeof green !== "number" || isNaN(green)) return;
                const greenAdjusted = Math.min(Math.max(green, 0), 255);
                setTempColor(`rgba(${rgbInternal[0]},${greenAdjusted},${rgbInternal[2]},${AlphaVal / 100})`);
              }}
              value={rgbInternal ? rgbInternal[1] : TempColor}
              margin="none"
              variant="outlined"
              size="small"
              inputProps={{
                style: {
                  padding: 5,
                  background: `rgba(0, 208, 132, ${rgbInternal ? rgbInternal[1] / 255 : 1})`,
                },
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const blue = parseInt(e.target.value);
                if (typeof blue !== "number" || isNaN(blue)) return;
                const blueAdjusted = Math.min(Math.max(blue, 0), 255);
                setTempColor(`rgba(${rgbInternal[0]},${rgbInternal[1]},${blueAdjusted},${AlphaVal / 100})`);
              }}
              value={rgbInternal ? rgbInternal[2] : TempColor}
              margin="none"
              variant="outlined"
              size="small"
              inputProps={{
                style: {
                  padding: 5,
                  background: `rgba(6, 147, 227, ${rgbInternal ? rgbInternal[2] / 255 : 1})`,
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
              onClick={() => {
                setOpen(false);
                onColorSelected(`rgba(${rgbInternal[0]},${rgbInternal[1]},${rgbInternal[2]},${AlphaVal / 100})`);
              }}
            >
              OK
            </Button>
          </Grid>
        </Grid>
      </Popover>
    </React.Fragment>
  );
};
