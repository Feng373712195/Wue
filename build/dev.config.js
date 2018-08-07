const path = require('path')
const webpack = require('webpack')
const __distDirname = path.resolve(process.cwd(),'dist')

module.exports = {
    mode:'development',
    entry:'./src/index.js',
    output:{
        filename:'wue.js',
        path:__distDirname
    },
    module:{
        rules:[
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
                test:/\.(js)/,
                exclude: /node_modules/,
                use: [
                    {
                      loader: 'babel-loader',
                      query:{
                        "presets": ["es2015"],
                      }
                    }
                ]       
            }
        ]
    },
    devServer:{
        host:'localhost',
        hot:true,
        contentBase:__distDirname,
        publicPath: "/dist/",
        port:8081,
        proxy:{
            '/distributor': {    //将www.exaple.com印射为/apis
                target: 'http://192.168.1.56',  // 接口域名
                secure: false,  // 如果是https接口，需要配置这个参数
                changeOrigin: true,  //是否跨域
                pathRewrite: {
                    '^/distributor': ''   //需要rewrite的,
                }             
            }
        }
    },
    plugins:[
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"',
        }),
        new webpack.HotModuleReplacementPlugin()
    ]
}