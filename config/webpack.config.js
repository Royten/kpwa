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
    output: {
      path: PATHS.build,
      filename: '[chunkhash:8].js',
      chunkFilename: "[chunkhash:8].js",
      //publicPath: '/webpack-demo/',
    },
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
  const pages = [
    parts.page({
      title: 'Webpack Demo',
      entry: { app: PATHS.src },
    }),
    parts.page({
      title: 'Another demo',
      path: 'another',
      entry: {
        another: path.join(PATHS.src, 'another.js'),
      },
    }),
  ]
  const config = env === 'production'
    ? prodConfig
    : devConfig

  return pages.map(page => merge(commonConfig, config, page))
}
