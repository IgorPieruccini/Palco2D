
import { resolve } from "path";
import url from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __dirname = url.fileURLToPath(import.meta.url);

export default {
  mode: "development",
  entry: "./src/index.ts",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: resolve(__dirname, "dist"),
    publicPath: "/",
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "WebGL Lab",
      template: "./src/index.html",
    }),
  ],
};
