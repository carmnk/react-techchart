import React from "react";
import List from "@mui/material/List";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import useTheme from "@mui/material/styles/useTheme";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import { mdiWeb, mdiFileDelimitedOutline, mdiArrowRightThick, mdiClose } from "@mdi/js";
import { Icon } from "@mdi/react";
import uniqid from "uniqid";
import { ChartMenuListItem } from "../Subelements/CMListItem";
import { parseCsvFileObj } from "../../utils/Csv";
import * as T from "../../Types";

export const CMChart = (props: {
  Dispatch: T.ChartController["Dispatch"];
  events: T.UseChartControllerProps["events"] | undefined;
  settings: T.UseChartControllerProps["settings"] | undefined;
}) => {
  const { Dispatch, events, settings } = props;
  const theme = useTheme();
  const HiddenInputRef: React.RefObject<HTMLInputElement> = React.useRef(null);
  const [ShowUrlTextfield, setShowUrlTextfield] = React.useState(false);
  const [CsvUrl, setCsvUrl] = React.useState("");

  const handleInputFileChange = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    const files = evt.target.files;
    if (!files) return;
    if (files.length > 0) {
      try {
        const dataSeries = await parseCsvFileObj(files[0]);
        const graphName = files[0].name.substring(0, files[0].name.lastIndexOf("."));
        const id = uniqid();
        Dispatch({ task: "addSnackbarMessage", params: { text: "Graph successfully loaded", type: "success" } });
        events?.onDataChange?.({ data: dataSeries, name: graphName, id, type: "chart" });
      } catch (err) {
        console.error("Error - could not parse provided local file", err);
        Dispatch({ task: "addSnackbarMessage", params: { text: "Error - " + err, type: "error" } });
      }
    }
  };
  // evt handler for KeyUp evt of Input/Textfield -> Callback onEnter
  async function fetchCsvFromURL() {
    try {
      if (!CsvUrl) throw new Error("url not provided");
      const resp = await fetch(CsvUrl);
      if (!resp) throw new Error("cant download file from url");
      const file = resp as unknown as File;
      const dataSeries = await parseCsvFileObj(file);
      const graphName = CsvUrl.substring(CsvUrl.lastIndexOf("/") + 1, CsvUrl.lastIndexOf("."));
      const id = uniqid();
      setShowUrlTextfield(false);
      Dispatch({ task: "addSnackbarMessage", params: { text: "Graph successfully loaded", type: "success" } });
      events?.onDataChange?.({ data: dataSeries, name: graphName, id, type: "chart" });
    } catch (err) {
      console.error("Error - could not download file from URL or File could not be parsed", err);
      Dispatch({ task: "addSnackbarMessage", params: { text: "Error - " + err, type: "error" } });
    }
  }
  const HandleOnKeyUp = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.type === "keyup") fetchCsvFromURL();
  };
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
      <input //hidden, just used to load local files
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
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => setCsvUrl(e.target.value)}
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
