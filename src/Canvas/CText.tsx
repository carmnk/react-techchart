import React from "react";
import { Shape } from "react-konva";

export type CTextProps = {
  text: string;
  x: number;
  y: number;
  name?: string;
  listening?: boolean;
  fontSize?: number;
  fontName?: string;
  fontColor?: string;
  halign?: "right" | "left" | "center";
  valign?: "middle" | "top" | "bottom";
};

export const CTextComponent = (props: CTextProps) => {
  const { valign, halign, text, x, y, fontColor, fontSize, fontName, name } = props;

  const drawText = React.useCallback(
    (context, shape) => {
      const ctx = context._context;
      ctx.font = (fontSize ?? 12) + "px " + (fontName ?? "Arial");
      ctx.fillStyle = fontColor ?? "black";
      ctx.textAlign = halign ?? "left";
      ctx.textBaseline = valign ?? "middle";
      ctx.fillText(
        text,
        x, //- widthYAxis + widthTickmarkLines + 5 +
        y // additional 5px distance to end of tickmark
      );
      // (!) Konva specific method, it is very important
      context.fillStrokeShape(shape);
    },
    [fontName, fontColor, fontSize, halign, valign, x, y, text]
  );

  return <Shape name={name} listening={false} sceneFunc={drawText} />;
};

export const CText = React.memo(CTextComponent);
