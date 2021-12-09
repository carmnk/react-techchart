import * as T from "../Types";
import { iATR } from "./ATR";
import { iEMA } from "./EMA";
import { iMACD } from "./MACD";
import { iOBV } from "./OBV";
import { iRSI } from "./RSI";
import { iSMA } from "./SMA";
import { iVolume } from "./Volume";
import { iKAMA } from "./KAMA";
export { iATR, iEMA, iMACD, iOBV, iRSI, iSMA, iVolume, iKAMA };

export const defaultIndicators: T.IndicatorModel[] = [iSMA, iEMA, iRSI, iMACD, iATR, iVolume, iOBV, iKAMA];
