const path = require('path');
module.exports = {
    mode: 'production',
    optimization: {
        minimize: false
    },
    // devtool: "none",

    entry: './lib/index.js',
    output: {
        path: path.resolve(__dirname, 'test'),
        filename: 'webpack-test.js',
        library: {
            name: 'webpackTest',
            type: 'umd',
        },
        globalObject: 'this',
    },
    module: {
        rules: [
            { test: /.ts$/, use: 'ts-loader' },
            {
                test: /.m?js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            }
        ],
    },
    externals: {
        react: 'react',
        reactDOM: 'react-dom'
    }
};