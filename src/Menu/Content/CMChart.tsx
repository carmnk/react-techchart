import List from "@mui/material/List";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import useTheme from "@mui/material/styles/useTheme";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import { AlertProps } from "@mui/material/Alert";
import { mdiWeb, mdiFileDelimitedOutline, mdiArrowRightThick, mdiClose } from "@mdi/js";
import { Icon } from "@mdi/react";
import React from "react";
import { CSnackBar } from "../../Components/CSnackbar";
import { ChartMenuListItem } from "../Subelements/ChartMenuListItem";
import * as T from "../../Types";
import uniqid from "uniqid";
import parse from "csv-parse/lib/sync";
// const parse = require("csv-parse/lib/sync");

export async function parseCsvFileObj(data: File) {
  const res: any = await data.text().then((dataString) => {
    const rowDelimiter = [
      { chars: "\n", amt: dataString.match(/\n/gm)?.length ?? 0 },
      { chars: "\r", amt: dataString.match(/\r/gm)?.length ?? 0 },
      { chars: "\r\n", amt: dataString.match(/\r\n/gm)?.length ?? 0 },
    ];
    const rowDelimiterAmts = rowDelimiter.map((val) => val.amt);
    const maxAmtRowDelimiterIdx = rowDelimiterAmts.indexOf(Math.max(...rowDelimiterAmts));
    const guessedRowDelimiter = rowDelimiter[maxAmtRowDelimiterIdx].chars;
    const rows = dataString.split(guessedRowDelimiter);

    // only first line is checked for delimiter
    const delimiter = [
      { chars: ",", amt: rows[0].match(/,/gm)?.length ?? 0 },
      { chars: ";", amt: rows[0].match(/;/gm)?.length ?? 0 },
    ];
    const delimiterAmts = delimiter.map((del) => del.amt);
    const maxAmtDelimiterIdx = delimiterAmts.indexOf(Math.max(...delimiterAmts));
    const guessedDelimiter = delimiter[maxAmtDelimiterIdx].chars;

    // last delimiter is likely decimal delimiter
    const amtDecDel = { dots: 0, commas: 0 };
    rows.forEach((row) => {
      row.split(guessedDelimiter).forEach((val) => {
        const lastDot = val.lastIndexOf(".");
        const lastComma = val.lastIndexOf(",");
        if (lastDot !== -1 && lastComma !== -1) {
          if (lastDot > lastComma) amtDecDel.dots++;
          else amtDecDel.commas++;
        } else if (lastDot !== -1 && lastComma === -1) amtDecDel.dots++;
        else if (lastDot === -1 && lastComma !== -1) amtDecDel.commas++;
      });
    });
    const isCommaDecDel = amtDecDel.dots < amtDecDel.commas;
    const isCommaDigitSeparator = amtDecDel.dots > amtDecDel.commas && amtDecDel.commas > 0;

    const newDataString = isCommaDecDel
      ? dataString.replaceAll(".", "").replaceAll(",", ".")
      : isCommaDigitSeparator
      ? dataString.replaceAll(",", "")
      : dataString;

    const parseRes = parse(newDataString.trim(), {
      delimiter: guessedDelimiter,
      record_delimiter: guessedRowDelimiter,
      cast: true,
      trim: true,
      cast_date: true,
    }).map((dataset: any[]) => ({
      date: dataset[0],
      open: dataset[1],
      high: dataset[2],
      low: dataset[3],
      close: dataset[4],
      volume: dataset[5],
    }));
    parseRes.shift();
    return parseRes;
  });
  return res;
}

export const CMChart = (props: { Dispatch: T.ChartStateHook["Dispatch"] }) => {
  const { Dispatch } = props;
  const [IsError, setIsError] = React.useState<{ text: string; type: AlertProps["severity"] }[]>([]);

  const theme = useTheme();
  const HiddenInputRef: React.RefObject<HTMLInputElement> = React.useRef(null);
  const [ShowUrlTextfield, setShowUrlTextfield] = React.useState(false);
  const [CsvUrl, setCsvUrl] = React.useState("");

  async function handleInputFileChange(evt: React.ChangeEvent<HTMLInputElement>) {
    const files = evt.target.files;
    if (!files) return;
    if (files.length > 0) {
      try {
        const chartSeries = await parseCsvFileObj(files[0]);
        const chartName = files[0].name.substr(0, files[0].name.lastIndexOf("."));

        Dispatch({
          task: "addSubchart",
          params: { chartSeries, chartName, reset: true, id: uniqid() },
        });
        setIsError((current) => [...current, { type: "success", text: "Graph successfully loaded" }]);
      } catch (err) {
        console.error("Error - could not parse provided local file", err);
        setIsError((current) => [
          ...current,
          {
            type: "error",
            text: "Error - could not parse provided local file",
          },
        ]);
      }
    }
  }

  // evt handler for KeyUp evt of Input/Textfield -> Callback onEnter
  const HandleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && e.type === "keyup") {
      fetchCsvFromURL();
    }
  };
  async function fetchCsvFromURL() {
    try {
      // if (!methods) throw new Error("chart not initialized yet");
      if (!CsvUrl) throw new Error("url not provided");
      const resp = await fetch(CsvUrl);
      if (!resp) throw new Error("cant download file from url");
      const file = resp as unknown as File;
      const chartSeries = await parseCsvFileObj(file);
      const chartName = CsvUrl.substring(CsvUrl.lastIndexOf("/") + 1, CsvUrl.lastIndexOf("."));
      // methods.addSubchart(res, fileName, undefined, true);
      Dispatch({
        task: "addSubchart",
        params: { chartSeries, chartName, reset: true, id: uniqid() },
      });
      setIsError((current) => [...current, { type: "success", text: "Graph successfully loaded" }]);
      setShowUrlTextfield(false);
    } catch (err) {
      console.error("Error - could not download file from URL or File could not be parsed", err);
      setIsError((current) => [...current, { type: "error", text: "Error - " + err }]);
    }
    // const data = fetch(CsvUrl).then((response) => {
    //   return await parseCsvFileObj(response);
    // });
  }

  const handleShowUrlTooltip = React.useCallback(() => {
    setShowUrlTextfield(true);
  }, [setShowUrlTextfield]);
  const handleHideUrlTooltip = React.useCallback(() => {
    setShowUrlTextfield(false);
  }, [setShowUrlTextfield]);
  const handleOpenFile = React.useCallback(() => {
    HiddenInputRef?.current?.click?.();
  }, [HiddenInputRef]);

  return (
    <React.Fragment>
      {IsError.length > 0
        ? IsError.map((msg, msgIdx) => {
            return (
              <CSnackBar
                key={`msg-${msgIdx}`}
                autoHideDuration={5000}
                type={msg.type ?? "error"}
                open={IsError.length > 0}
                onClose={() => setIsError((current) => (current.length === 1 ? [] : current.splice(1)))}
                content={msg.text}
                msgIdx={msgIdx}
              />
            );
          })
        : null}

      <input
        type="file"
        style={{
          visibility: "hidden",
          position: "absolute",
          top: 0,
          height: 0,
          width: 0,
        }}
        ref={HiddenInputRef}
        onChange={handleInputFileChange}
      />
      <List sx={{ pt: 4 }}>
        <ChartMenuListItem
          text="CSV from device"
          id="1"
          iconPath={mdiFileDelimitedOutline}
          iconColor={theme.palette.secondary.contrastText}
          onClick={handleOpenFile}
        />
        <ChartMenuListItem
          text="CSV from URL"
          id="2"
          iconPath={mdiWeb}
          iconColor={theme.palette.secondary.contrastText}
          onClick={handleShowUrlTooltip}
        />
        {ShowUrlTextfield ? (
          <div>
            <TextField
              helperText="Enter/Paste URL"
              fullWidth
              onKeyUp={HandleOnKeyUp}
              value={CsvUrl}
              onChange={(e: any) => setCsvUrl(e.target.value)}
              sx={{ p: 1, pt: 2, boxSizing: "border-box" }}
              InputProps={{
                sx: { boxSizing: "border-box", pr: 0 },
                endAdornment: (
                  <InputAdornment position="end">
                    <Stack direction="row">
                      <IconButton onClick={fetchCsvFromURL} size="small">
                        <Icon path={mdiArrowRightThick} size={1} />
                      </IconButton>
                      <IconButton onClick={handleHideUrlTooltip}>
                        <Icon path={mdiClose} size={1} />
                      </IconButton>
                    </Stack>
                  </InputAdornment>
                ),
              }}
            />
          </div>
        ) : null}
      </List>
    </React.Fragment>
  );
};
