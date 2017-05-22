const webpack = require('webpack')
const path = require('path')

const ExtractTextPlugin   = require('extract-text-webpack-plugin')
const PuriyCSSPlugin      = require('purifycss-webpack')
const CleanWebpackPlugin  = require('clean-webpack-plugin')
const GitRevisionPlugin   = require('git-revision-webpack-plugin')
const BabiliPlugin        = require('babili-webpack-plugin')
const HtmlWebpackPlugin   = require('html-webpack-plugin')

exports.devServer = ({ host, port } = {}) => ({
  devServer: {
    historyApiFallback: true,
    stats: 'errors-only',
    host,
    port,
    overlay: {
      errors: true,
      warnings: true
    }
  }
})

exports.standardLint = ({ exclude, options } = { exclude: /node_modules/, options: { parser: 'babel-eslint' } }) => ({
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.jsx?$/,
        loader: 'standard-loader',
        exclude,
        options
      }
    ]
  }
})

exports.loadCSS = ({ include, exclude } = { exclude: /node_modules/ }) => ({
  module: {
    rules: [
      {
        test: /\.css$/,
        include,
        exclude,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]_[local]',
            }
          },
          exports.autoprefix(),
        ]
      },
      //Load global css files not passing through css modules from node_modules, eg purecss
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.styl$/,
        include,
        exclude,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]_[local]',
            }
          },
          exports.autoprefix(),
          'stylus-loader'
        ]
      }
    ]
  }
})

exports.extractCSS = ({ include, exclude } = { exclude: /node_modules/ }) => {
  const plugin = new ExtractTextPlugin({
    filename: '[contenthash:8].css'
  })

  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          include,
          exclude,
          use: ExtractTextPlugin.extract({
            use: [
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                  localIdentName: '[name]_[local]',
                }
              },
              exports.autoprefix()
            ],
            fallback: 'style-loader'
          })
        },
        //Load global css files not passing through css modules from node_modules, eg purecss
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            use: 'css-loader',
            fallback: 'style-loader'
          })
        },
        {
          test: /\.styl$/,
          include,
          exclude,
          use: ExtractTextPlugin.extract({
            use: [
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                  localIdentName: '[name]_[local]',
                }
              },
              exports.autoprefix(),
              'stylus-loader'
            ],
            fallback: 'style-loader'
          })
        }
      ]
    },
    plugins: [ plugin ]
  }
}

exports.autoprefix = () => ({
  loader: 'postcss-loader',
  options: {
    plugins: () => ([
      require('autoprefixer')
    ])
  }
})

exports.purifyCSS = ({ paths }) => ({
  plugins: [
    new PuriyCSSPlugin({
      paths,
      styleExtensions: ['.css', 'styl'],
      purifyOptions: {
        minify: true,
      },
    }),
  ],
})

exports.loadImages = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
        include,
        exclude,
        use: [
          {
            loader: 'file-loader',
            options,
          },
          {
            loader: 'image-webpack-loader',
            query: {
              progressive: true,
              pngquant: {
                quality: '65-90',
                speed: 4
              },
              mozjpeg: {
                quality: 65
              },
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        include,
        exclude,
        use: [
          {
            loader: 'file-loader',
            options,
          },
          {
            loader: 'svgo-loader',
            options: {
              plugins: [
                { removeTitle: true },
                { convertColors: { shorthex: false } },
                { convertPathData: false },
              ],
            },
          },
        ],
      },
    ],
  },
})

exports.loadFonts = () => ({
  module: {
    rules: [
      {
        test: /\.(ttf|eot|woff2?)(\?v=\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[hash:8].[ext]'
        }
      }
    ]
  }
})

exports.loadJavascript = ({ include, exclude }) => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        include,
        exclude,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        }
      }
    ]
  }
})

exports.generateSourceMaps = ( {type} ) => ({
  devtool: type
})

exports.extractBundles = (bundles) => {
  let plugins = []
  bundles.forEach((bundle) => {
    plugins.push(new webpack.optimize.CommonsChunkPlugin(bundle))
  })
  return { plugins }
}

exports.clean = (p) => ({
  plugins: [
    new CleanWebpackPlugin([p], { root: path.join(__dirname, '..') }),
  ],
})

exports.attachRevision = () => ({
  plugins: [
    new webpack.BannerPlugin({
      banner: new GitRevisionPlugin().version(),
    }),
  ],
})

exports.minifyJS = () => ({
  plugins: [
    new BabiliPlugin(),
  ],
})

exports.setFreeVariable = (key, value) => {
  const env = {}
  env[key] = JSON.stringify(value)

  return {
    plugins: [
      new webpack.DefinePlugin(env),
    ],
  }
}

exports.page = ({
  path = '',
  template = require.resolve(
    'html-webpack-plugin/default_index.ejs'
  ),
  title,
  entry,
} = {}) => ({
  plugins: [
    new HtmlWebpackPlugin({
      filename: `${path && path + '/'}index.html`,
      template,
      title,
    }),
  ],
  entry,
})
