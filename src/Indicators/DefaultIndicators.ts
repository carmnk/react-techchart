import * as T from "../Types";
import { ATR, iATR } from "./ATR";
import { EMA, iEMA } from "./EMA";
import { MACD, iMACD } from "./MACD";
import { OBV, iOBV } from "./OBV";
import { RSI, iRSI } from "./RSI";
import { SMA, iSMA } from "./SMA";
import { Volume, iVolume } from "./Volume";
import { KAMA, iKAMA } from "./KAMA";
export { iATR, iEMA, iMACD, iOBV, iRSI, iSMA, iVolume, iKAMA, ATR, EMA, MACD, OBV, RSI, SMA, Volume, KAMA };

export const defaultIndicators: T.IndicatorModel[] = [ATR, EMA, MACD, OBV, RSI, SMA, Volume, KAMA];
