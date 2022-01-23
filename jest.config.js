module.exports = {
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.mjs$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest",
  },
  transformIgnorePatterns: [
    // "node_modules/",
    // "node_modules/(?!react-konva|konva|@mui|@babel)",
    // "node_modules/(?!react-konva|konva|@mui|@babel|@emotion|@mdi|@use-gesture|react-beautiful-dnd|react-resize-detector|react-use)",
  ],
  setupFiles: ["jest-canvas-mock"],
  testEnvironment: "jsdom",
};
