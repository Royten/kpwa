const webpack = require('webpack')
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
      filename: '[chunkhash:8].js',
      chunkFilename: "[chunkhash:8].js",
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Webpack Learning',
        minify: {
          html5: true,
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
          minifyURLs: true,
          removeComments: true,
        },
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
    {
      name: 'manifest',
      minChunks: Infinity,
    },
  ]),
  parts.standardLint(),
  parts.loadFonts(),
])

const prodConfig = merge([
  {
    performance: {
      hints: 'warning',
      maxEntrypointSize: 100000,
      maxAssetSize: 450000,
    },
    plugins: [
      new webpack.HashedModuleIdsPlugin(),
    ],
    recordsPath: path.join(__dirname, 'records.json'),
  },
  parts.clean(PATHS.build),
  parts.minifyJS(),
  parts.attachRevision(),
  parts.extractCSS(),
  parts.purifyCSS({
    paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true })
  }),
  parts.loadImages({
    options: {
      name: './images/[hash:8].[ext]'
    }
  }),
  parts.loadJavascript({ include: PATHS.src }),
  parts.setFreeVariable(
    'process.env.NODE_ENV',
    'production'
  ),
])

const devConfig = merge([
  parts.devServer({
    host: process.env.HOST,
    port: process.env.PORT,
  }),
  parts.loadCSS(),
  parts.loadImages({
    options: {
      name: './images/[hash:8].[ext]'
    }
  }),
  parts.generateSourceMaps({ type: 'inline-source-map' }),
])

module.exports = (env) => {
  if (env === 'production') {
    return merge(commonConfig, prodConfig)
  } else {
    return merge(commonConfig, devConfig)
  }
}
