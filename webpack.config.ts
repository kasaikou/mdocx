import { Configuration } from "webpack";

const isDev = process.env.NODE_ENV === "development";
const common: Configuration = {
    mode: isDev ? "development" : "production",
    resolve: {
        extensions: [".js", ".ts", ".jsx", ".tsx", ".json"],
    },
    output: {
        publicPath: "./",
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules|\.test/,
                loader: "ts-loader",
            },
        ],
    },
    watch: false,
    devtool: isDev ? "source-map" : undefined,
}

const main: Configuration = {
    ...common,
    target: "electron-main",
    entry: {
        main: "./typescript/index.ts",
    },
}

export default [main];
