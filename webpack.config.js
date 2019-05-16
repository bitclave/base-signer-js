const Path = require('path');

module.exports = {
    entry: './src/Signer.ts',
    devtool: 'source-map',
    mode: "development",
    node: {
        fs: 'empty',
        child_process: 'empty'
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
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
    plugins: []
};
