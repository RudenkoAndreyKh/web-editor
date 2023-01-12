import * as webpack from 'webpack';
import { CustomWebpackBrowserSchema, TargetOptions } from '@angular-builders/custom-webpack';
const path = require("path");
const MONACO_DIR = path.join(__dirname, "node_modules/monaco-editor");
const ASSETS_DIR = path.join(__dirname, "src/assets");

// module.exports = {
//     entry: './src/main.ts',
//     output: {
//         path: path.resolve(__dirname, 'dist'),
//         filename: '[name].[fullhash:8].js',
//         sourceMapFilename: '[name].[fullhash:8].map',
//         chunkFilename: '[id].[fullhash:8].js'
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.css$/,
//                 use: ['style-loader', 'css-loader']
//             },
//             {
//                 test: /\.ttf$/,
//                 use: ['file-loader']
//             }
//         ]
//     },
//     plugins: [new MonacoWebpackPlugin()]
// };

const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const rules = [
    {
        test: /\.css$/,
        include: MONACO_DIR,
        use: ["style-loader", {
            "loader": "css-loader",
            "options": {
                "url": false,
            },
        }],
    },
    {
        test: /\.(jpg|jpeg|png|svg)$/,
        include: ASSETS_DIR,
        use: ['file-loader']
    },
    {
        test: /\.ttf$/,
        include: MONACO_DIR,
        use: ["file-loader", {
            "loader": "file-loader",
            "options": {
                "url": false,
            },
        }],
    },
];

const plugins = [
    new MonacoWebpackPlugin(),
];

export default (
    config: webpack.Configuration,
    options: CustomWebpackBrowserSchema,
    targetOptions: TargetOptions
) => {
    //adding rules
    rules.map(rule => {
        if (config.module && config.module.rules) {
            config.module.rules.push(rule);
        }
    });

    //adding plugins
    plugins.map(plugin => {
        if (config.plugins) {
            config.plugins.push(plugin);
        }
    });

    return config;
};