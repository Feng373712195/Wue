const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const __distDirname = path.resolve(process.cwd(), 'dist');

const webpackConfig = {
  mode: 'development',
  entry: './view/index.js',
  output: {
    filename: 'wue.js',
    path: __distDirname,
  },
  module: {
    rules: [
      //  暂时屏蔽 贼痛苦
      // {
      //     test: /\.js$/,
      //     loader: 'eslint-loader',
      //     enforce: "pre",
      //     include: [path.resolve(process.cwd(), 'src')], // 指定检查的目录
      //     options: { // 这里的配置项参数将会被传递到 eslint 的 CLIEngine
      //         formatter: require('eslint-friendly-formatter') // 指定错误报告的格式规范
      //     }
      // }
      {
        test: /\.(js)/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            query: {
              presets: ['es2015'],
            },
          },
        ],
      },
    ],
  },
  devServer: {
    host: 'localhost',
    hot: true,
    contentBase: __distDirname,
    publicPath: '/',
    port: 8080,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
};

if (process.env.NODE_ENV !== 'production') {
  webpackConfig.plugins.push(
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, 'template.html'),
    }),
  );
}


module.exports = webpackConfig;
