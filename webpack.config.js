const
    webpack = require('webpack'),
    path = require('path'),
    htmlWebpackPlugin = require('html-webpack-plugin'),
    extractTextPlugin = require('extract-text-webpack-plugin'),
    copyWebpackPlugin = require('copy-webpack-plugin'),
    uglifyJsPlugin = require('uglifyjs-webpack-plugin'),
    fs = require('fs')

module.exports = {
    entry: {
        index: './src/index.js'
    },
    stats: {
        children: false
    },
    devtool: false,
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].[chunkhash:4].js'
    },
    devServer: {
        inline: true,
        contentBase: path.join(__dirname, 'dist'),
        noInfo: true,
        watchOptions: {
            poll: 1000,
            ignored: /node_modules/
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['babel-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.less$/,
                loader: extractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader', 'less-loader']
                })
            },
            {
                test: /\.css$/,
                loader: extractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader']
                })
            }
        ]
    },

    plugins: [

        new copyWebpackPlugin([
            {from: 'src/static', to: 'static'}
        ]),

        new webpack.DefinePlugin({
            design: {ratio: 2, width: 667 * 2, height: 375 * 2}
        }),

        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require('./manifest.json')
        }),

        new webpack.ProvidePlugin({
            PIXI: 'pixi.js',
            planck: 'planck-js',
            howler: 'howler'
        }),

        new uglifyJsPlugin(),

        new htmlWebpackPlugin({
            template: './src/index.html',
            hash: false,
            filename: 'index.html',
            inject: 'body',
            minify: {
                collapseWhitespace: true
            }
        }),

        new extractTextPlugin({
            filename: 'index.[chunkhash:4].css',
            allChunks: true
        })
    ]
}