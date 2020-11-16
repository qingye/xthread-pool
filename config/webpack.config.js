'use strict';

const path = require('path');

module.exports = {
    mode: 'production',
    devtool: "source-map",
    entry: './src/index.js',
    output: {
        filename: "xthread-pool.js",
        library: "xthread-pool",
        libraryTarget: "umd",
        libraryExport: 'default',
        path: path.resolve(__dirname, '../dist')
    },
    resolve: {
        enforceExtension: false,
        extensions: [".js", ".jsx"]
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {loader: "babel-loader"}
            }
        ]
    },
    externals: {
        "react": {
            root: 'React',
            commonjs2: 'react',
            commonjs: 'react',
            amd: 'react'
        }
    }
};