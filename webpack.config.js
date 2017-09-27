const
    webpack = require('webpack'),
    path = require('path'),
    htmlWebpackPlugin = require('html-webpack-plugin'),
    extractTextPlugin = require('extract-text-webpack-plugin'),
    copyWebpackPlugin = require('copy-webpack-plugin'),
    fs = require('fs')

module.exports = {
    entry: {
        index: './src/ui/index.js'
    },
    stats: {
        children: false
    },
    devtool: false,
    output: {
        path: path.join(__dirname, '/dist'),
        filename: '[name].js'
    },
    devServer: {
        inline: true,
        contentBase: path.join(__dirname, '/dist'),
        noInfo: true,
        watchOptions: {
            aggregateTimeout: 1000,
            poll: 1000
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
            },
            {
                test: /\.vue$/,
                use: [{
                    loader: 'vue-loader',
                    options: {
                        extractCSS: true
                    }
                }]
            }
        ]
    },

    plugins: [
        new copyWebpackPlugin([
            {from: 'res', to: 'res'},
            {from: 'lib', to: 'lib'},
        ]),

        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),

        new htmlWebpackPlugin({
            template: './src/ui/index.html',
            hash: true,
            filename: 'index.html',
            inject: 'body',
            minify: {
                collapseWhitespace: true
            }
        }),

        new extractTextPlugin({
            filename: 'index.css',
            allChunks: true
        })
    ]
}