module.exports = {
  plugins: ["@babel/plugin-proposal-class-properties", "babel-plugin-dynamic-import-node"],
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
        modules: "cjs",
      },
    ],
    ["@babel/preset-react", {
      runtime: "automatic"
      // pragma: "dom"
    }],

    "@babel/preset-typescript",
  ],
};
