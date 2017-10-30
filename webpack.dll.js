const
    path = require('path'),
    webpack = require('webpack'),
    uglifyJsPlugin = require('uglifyjs-webpack-plugin')


module.exports = {
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        library: '[name]'
    },

    entry: {
        lib: ['pixi.js', 'pixi-filters', 'howler', 'planck-js']
    },

    plugins: [
        new webpack.DllPlugin({
            context: __dirname,
            name: '[name]',
            path: path.join(__dirname, 'manifest.json')
        }),

        new uglifyJsPlugin()
    ]
}