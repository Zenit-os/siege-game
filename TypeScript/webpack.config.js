const path = require("path");

module.exports = {
  entry: "./src/siege.ts",
  devtool: "inline-source-map",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "siege.js",
    path: path.resolve(__dirname, "dist"),
  },
};
