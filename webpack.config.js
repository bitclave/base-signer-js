const Path = require('path');
const TSLintPlugin = require('tslint-webpack-plugin');

module.exports = {
    entry: './src/Signer.ts',
    devtool: 'source-map',
    mode: 'development',
    node: {
        fs: 'empty',
        child_process: 'empty'
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                use: [
                    {loader: 'babel-loader'},
                    {loader: 'ts-loader'},
                ],
                exclude: /node_modules/
            },
        ]
    },
    resolve: {
        modules: [Path.resolve('./node_modules'), Path.resolve('./src')],
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: 'Signer.js',
        path: Path.resolve(__dirname, 'build'),
        library: 'Signer',
        libraryTarget: "umd2",
        umdNamedDefine: true
    },
    plugins: [
        new TSLintPlugin({
            waitForLinting: true,
            warningsAsError: true,
            config: './tslint.json',
            files: ['./src/**/*.ts', "./test/**/*.ts"]
        }),
    ]
};
