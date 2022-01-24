# react-techchart <br/> [![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://github.com) [![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://github.com) <img src="https://img.shields.io/github/package-json/v/carmnk/react-techchart" alt="Version Badge" /> <img src="https://img.shields.io/github/license/carmnk/react-techchart.svg" alt="Licence Badge" /> ![Known Vulnerabilities](https://snyk.io/test/github/carmnk/react-techchart/badge.svg) ![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/react-techchart) ![Coverage Badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/carmnk/5a8b9a18eb4d26236cd6a8e753f3b122/raw/react-techchart__heads_main.json)

<p align="center">
<img src="https://github.com/carmnk/resources/raw/main/icons/logo512.png" alt="react-techchart-logo" height="128px" width="128px"/> <br/>an interactive and extensible react charting tool designed for technical analysis.
<br/>
<span style="color: red;">experimental release</span>
</p>

---

## Installation

```javascript
    npm i react-techchart
```

## Usage

`react-techchart` is a canvas based charting tool with various different interactive features. In order to conveniently access and control the chart from outside (your implementing react component) the calculation logic is outsourced to a custom react-hook called `useChartController`.

The `useChartController` hook returns the ChartController - an object containing all necessary data and interfaces to display the chart, to access and change the current state.

The
`<Chart>`
component provides the logic to display the chart (draws hook data on multiple canvas-layers), render the labels and the menu incl. opening button.

```typescript
import React from "react";
import { useChartController, Chart, iRSI, EMA, KAMA, defaultDarkTheme, Types as T } from "react-techchart";

// optional definition of initial indicators
const initialIndicators = [
  {
    id: "kama_01",
    type: "indicator",
    indicator: KAMA,
    graphProps: {
      style: {
        strokeColor: ["#0693E3"],
      },
    },
  },

  { type: "indicator", indicator: iRSI(5), id: "rsi_01" },
  {
    id: "ema_rsi_01",
    type: "indicator",
    indSrcId: "rsi_01",
    indicator: EMA,
    graphProps: {
      style: {
        strokeColor: ["#0693E3"],
      },
    },
  },
];

// optional settings (for useChartController and Chart component)
const settings = {
  initialTheme: defaultDarkTheme,
  initialIndicators: initialIndicators,
  // maxUpdatesPerSec: 40, default is 15
};

// an OHLC-dataseries is required - replace with your dataseries
export const exampleDataseries = [
  {
    date: "2021-10-04T00:00:00.000Z",
    open: 335.529999,
    high: 335.940002,
    low: 322.700012,
    close: 326.230011,
    volume: 42885000, // optional
  },
  {
    date: "2021-10-05T00:00:00.000Z",
    open: 328.579987,
    high: 335.179993,
    low: 326.160004,
    close: 332.959991,
    volume: 35377900, // optional
  },
  // ...
];

// your page component
export const MyPage = () => {
  const [Data, setData] = React.useState({
    // data: array's objects require a date property of type Date (not string)
    data: exampleDataseries.map((dat) => ({ ...dat, date: new Date(dat.date) })),
    name: "Your Chart",
    type: "chart", // a string literal
    id: "mainchart", // arbitrary but unique id
  });

  const Controller = useChartController({
    data: Data,
    settings,
    events: {
      onDataChange: (newData) => {
        setData(newData);
      },
    },
  });

  // optional - to access or control the component from outside
  const {
    ChartState, // ➜ current ChartState
    Dispatch, // ➜ Dispatch to modify ChartState (reducer-dispatch)
  } = Controller;

  return (
    <div style={{ height: 400 }}>
      <CChart Controller={Controller} />
    </div>
  );
};
```

[see full API docs](https://carmnk.github.io/react-techchart/)
