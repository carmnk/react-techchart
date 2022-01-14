import React, { ReactNode } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import useTheme from "@mui/material/styles/useTheme";

import { mdiHome, mdiFullscreenExit, mdiFullscreen, mdiClose, mdiBroom, mdiThemeLightDark } from "@mdi/js";
import { defaultLightTheme, defaultDarkTheme } from "../ChartState/Defaults";
import { CChartMenuStateType } from "./ChartMenu";
import * as T from "../Types";
import Icon from "@mdi/react";

export const ChartMenuLayout = (props: {
  isDesktop: boolean;
  onClose: () => void;
  onNavigate: (target: CChartMenuStateType["location"]) => void;
  Dispatch: T.ChartController["Dispatch"];
  fullscreen: boolean;
  location: CChartMenuStateType["location"];
  headerText?: string;
  settings: T.UseChartControllerProps["settings"];
  content: ReactNode;
  events: T.UseChartControllerProps["events"];
}) => {
  const { isDesktop, onClose, location, fullscreen, headerText, onNavigate, Dispatch, settings, content, events } =
    props;

  const theme = useTheme();
  const [ThemeAnchorEl, setThemeAnchorEl] = React.useState<HTMLElement | null>(null);
  const [ClearAnchorEl, setClearAnchorEl] = React.useState<HTMLElement | null>(null);

  const themes = React.useMemo(
    () =>
      settings?.themes ?? [
        { ...defaultLightTheme, name: "light" },
        { ...defaultDarkTheme, name: "dark" },
      ],
    // settings are frozen
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const goHome = React.useCallback(() => {
    onNavigate("menu");
  }, [onNavigate]);
  const toggleFullscreen = React.useCallback(() => {
    if (!fullscreen) events?.onFullscreen?.();
    else events?.onFullscreenExit?.();
    Dispatch({
      task: "setGeneralProp",
      params: { prop: "toggleFullscreen" },
    });
  }, [Dispatch, fullscreen, events]);
  const openFooterMenu = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, menuName: "theme" | "clear") => {
      if (menuName === "theme") setThemeAnchorEl(event.currentTarget);
      if (menuName === "clear") setClearAnchorEl(event.currentTarget);
    },
    []
  );
  const closeFooterMenu = React.useCallback(() => {
    setThemeAnchorEl(null);
    setClearAnchorEl(null);
  }, []);

  const selectTheme = React.useCallback(
    (themeName: string) => {
      setThemeAnchorEl(null);
      const selectedTheme = (themes as { name: string }[])?.find((theme) => theme.name === themeName);
      // console.log("Theme selected", selectedTheme);
      if (!selectedTheme) return;
      Dispatch({ task: "setTheme", params: { theme: selectedTheme } });
    },
    [Dispatch, themes]
  );
  // const iOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
  return (
    <Drawer
      // disableBackdropTransition={!iOS}
      // disableDiscovery={iOS}

      anchor={isDesktop ? "left" : "bottom"}
      open={!!location}
      disablePortal={fullscreen}
      onBackdropClick={onClose}
      onClose={onClose}
      PaperProps={{
        sx: isDesktop
          ? {
              border: "1px solid #666",
              borderBottomRightRadius: 10,
              borderTopRightRadius: 10,
              minWidth: 300,
              height: "100%",
            }
          : {
              border: "1px solid #666",
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              maxHeight: "75%",
              minHeight: "33%",
            },
      }}
    >
      <Box sx={{ position: "relative", top: 0, height: "100%" }}>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            height: 48,
            width: "100%",
            bgcolor: "primary.main",
            p: 1,
            boxSizing: "border-box",
            zIndex: 1,
          }}
        >
          {/* Drawer Header */}
          <Stack
            direction="row"
            sx={{
              height: 32,
              justifyItems: "center",
              justifyContent: "center",
              verticalAlign: "middle",
            }}
          >
            <Typography
              component="div"
              variant="h5"
              color={theme.palette.primary.contrastText}
              sx={{ flexGrow: 1, pr: 1 }}
            >
              {headerText || ""}
            </Typography>
            <Box sx={{ margin: "-5px" }}>
              {!!location && location !== "menu" && (
                <IconButton size="small" onClick={goHome}>
                  <Icon path={mdiHome} size={"32px"} color={theme.palette.primary.contrastText}></Icon>
                </IconButton>
              )}
              {!window.navigator.userAgent.match(/(iPad|iPhone|iPod)/i) && (
                <IconButton size="small" onClick={toggleFullscreen}>
                  <Icon
                    path={fullscreen ? mdiFullscreenExit : mdiFullscreen}
                    size={"32px"}
                    color={theme.palette.primary.contrastText}
                  />
                </IconButton>
              )}
              <IconButton size="small" onClick={onClose}>
                <Icon path={mdiClose} size={"32px"} color={theme.palette.primary.contrastText}></Icon>
              </IconButton>
            </Box>
          </Stack>
        </Box>
        <Box
          sx={{
            position: "relative",
            top: 0,
            mb: isDesktop ? "48px" : "96px",
            height: isDesktop ? "calc(100% - 96px)" : "auto",
            overflowY: "auto",
            p: 1,
          }}
        >
          {content}
        </Box>
        <Box
          sx={{
            position: isDesktop ? "absolute" : "fixed",
            bottom: 0,
            height: 48,
            width: "100%",
            bgcolor: "primary.main",
          }}
        >
          <Stack direction="row" sx={{ alignItems: "center", alignContent: "center", pt: 0.5 }}>
            <Box sx={{ flexGrow: 1 }}></Box>
            <IconButton
              id="clearMenuButton"
              size="small"
              onClick={(e) => {
                openFooterMenu?.(e, "clear");
              }}
            >
              <Icon path={mdiBroom} size={"32px"} color={theme.palette.primary.contrastText} />
            </IconButton>
            <Menu
              id="clear-menu"
              anchorEl={ClearAnchorEl}
              disablePortal={fullscreen}
              anchorOrigin={{ horizontal: "center", vertical: "top" }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              open={Boolean(ClearAnchorEl)}
              onClose={closeFooterMenu}
              MenuListProps={{
                "aria-labelledby": "clearMenuButton",
              }}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{
                  textAlign: "center",
                  pb: 1,
                  pl: 1,
                  pr: 1,
                  color: "primary.main",
                }}
              >
                Clear Chart
              </Typography>
              <Divider />
              {["all", "indicators", "tools"].map((mode, mIdx) => (
                <MenuItem
                  key={`clearMenuItem-${mIdx}`}
                  onClick={() => {
                    Dispatch({
                      task: "clearChart",
                      params: { mode: mode as T.ReducerAction<"clearChart">["params"]["mode"] },
                    });
                  }}
                >
                  {mode}
                </MenuItem>
              ))}
            </Menu>
            <IconButton
              id="themeMenuButton"
              size="small"
              onClick={(e) => {
                openFooterMenu?.(e, "theme");
              }}
            >
              <Icon path={mdiThemeLightDark} size={"32px"} color={theme.palette.primary.contrastText}></Icon>
            </IconButton>
            <Menu
              id="theme-menu"
              disablePortal={fullscreen}
              anchorEl={ThemeAnchorEl}
              anchorOrigin={{ horizontal: "center", vertical: "top" }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              open={Boolean(ThemeAnchorEl)}
              onClose={closeFooterMenu}
              MenuListProps={{
                "aria-labelledby": "themeMenuButton",
              }}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{
                  textAlign: "center",
                  pb: 1,
                  pl: 1,
                  pr: 1,
                  color: "primary.main",
                }}
              >
                Set Theme
              </Typography>
              <Divider />
              {themes.map((themeItem, tIdx) => (
                <MenuItem
                  key={`themeMenuItem-${tIdx}`}
                  onClick={() => {
                    selectTheme(themeItem.name);
                  }}
                >
                  {themeItem.name}
                </MenuItem>
              ))}
            </Menu>

            <IconButton
              size="small"
              onClick={() => {
                onClose?.();
              }}
            >
              <Icon path={mdiClose} size={"32px"} color={theme.palette.primary.contrastText}></Icon>
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};
