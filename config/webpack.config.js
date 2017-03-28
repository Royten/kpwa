const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const merge = require('webpack-merge')

const glob = require('glob')

const parts = require('./webpack.parts')

const PATHS = {
  src: path.join(__dirname, '../src'),
  build: path.join(__dirname, '../build'),
}
process.traceDeprecation = true
const commonConfig = merge([
  {
    entry: {
      app: PATHS.src,
    },
    output: {
      path: PATHS.build,
      filename: '[chunkhash].js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Webpack Demo',
      }),
    ],
  },
  parts.extractBundles([
    {
      name: 'vendor',
      minChunks: ({ resource }) => (
        resource &&
        resource.indexOf('node_modules') >= 0 &&
        resource.match(/\.js$/)
      ),
    },
  ]),
  parts.standardLint(),
  parts.loadFonts(),
])

const prodConfig = merge([
  parts.clean(PATHS.build),
  parts.attachRevision(),
  parts.extractCSS(),
  parts.purifyCSS({
    paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true })
  }),
  parts.loadImages({
    options: {
      name: './images/[hash].[ext]'
    }
  }),
  parts.loadJavascript({ include: PATHS.src }),
])

const devConfig = merge([
  parts.devServer({
    host: process.env.HOST,
    port: process.env.PORT,
  }),
  parts.loadCSS(),
  parts.loadImages(),
  parts.generateSourceMaps({ type: 'inline-source-map' }),
])

module.exports = (env) => {
  if (env === 'production') {
    return merge(commonConfig, prodConfig)
  } else {
    return merge(commonConfig, devConfig)
  }
}
