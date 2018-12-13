const path = require("path");
const fs = require("fs");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const IconfontPlugin = require('iconfont-plugin-webpack');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');


// Before importing imagemin plugin make sure you add it in `package.json` (`dependencies`) and install
const imageminMozjpeg  = require("imagemin-mozjpeg");


function generateHtmlPlugins(templateDir) {
    const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
    return templateFiles.map(item => {
        const parts = item.split(".");
        const name = parts[0];
        const extension = parts[1];
        return new HtmlWebpackPlugin({
            filename: `${name}.html`,
            template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
            inject: false
        });
    });
}

const htmlPlugins = generateHtmlPlugins("./src/html/views");

const config = {
    entry: ["./src/js/index.js", "./src/scss/style.scss"],
    output: {
        filename: "./js/bundle.js"
    },
    devtool: "source-map",
    mode: "production",
    optimization: {
        minimizer: [
            new TerserPlugin({
                sourceMap: true,
                extractComments: true
            })
        ]
    },
    module: {
        rules: [
            {
                test: /\.(sass|scss)$/,
                include: path.resolve(__dirname, "src/scss"),
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {}
                    },
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                            url: false
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            ident: "postcss",
                            sourceMap: true,
                            plugins: () => [
                                require("cssnano")({
                                    preset: [
                                        "default",
                                        {
                                            discardComments: {
                                                removeAll: true
                                            }
                                        }
                                    ]
                                }),
                                require("autoprefixer")({
                                    browsers:['ie >= 10', 'last 4 version']
                                }),


                            ]
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: /\.html$/,
                include: path.resolve(__dirname, "src/html/includes"),
                use: ["raw-loader"]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "./css/style.bundle.css"
        }),

        new CopyWebpackPlugin([{
            from: "./src/img",
            to: "./img"
        }]),
        new ImageminPlugin({
            pngquant: ({quality: '70'}),
            plugins: [imageminMozjpeg({quality: '70',
                progressive: true})]
        }),new CopyWebpackPlugin([
            {
                from: "./src/fonts",
                to: "./fonts"
            }
        ]),
        new IconfontPlugin({
            src: './src/iconfont', // required - directory where your .svg files are located
            family: 'iconfont', // optional - the `font-family` name. if multiple iconfonts are generated, the dir names will be used.
            dest: {
                font: './src/fonts/[family].[type]', // required - paths of generated font files
                css: './src/scss/_iconfont_[family].scss' // required - paths of generated css files
            },
            watch: {
                pattern: 'src/iconfont/**/*.svg', // required - watch these files to reload
                cwd: undefined // optional - current working dir for watching
            }
        }),
        new FaviconsWebpackPlugin({
            // Your source logo
            logo: './src/favicon/favicon.png',
            // The prefix for all image files (might be a folder or a name)
            prefix: 'favicon/',
            // Emit all stats of the generated icons
            emitStats: false,
            // Generate a cache file with control hashes and
            // don't rebuild the favicons until those hashes change
            persistentCache: true,
            // Inject the html into the html-webpack-plugin
            inject: true,
            // favicon background color (see https://github.com/haydenbleasel/favicons#usage)
            background: '#fff',
            // which icons should be generated (see https://github.com/haydenbleasel/favicons#usage)
            icons: {
                android: true,
                appleIcon: true,
                appleStartup: false,
                coast: true,
                favicons: true,
                firefox: true,
                opengraph: false,
                twitter: true,
                yandex: true,
                windows: false
            }
        }),

    ].concat(htmlPlugins)
};

module.exports = (env, argv) => {
    if (argv.mode === "production") {
        config.plugins.push(new CleanWebpackPlugin("dist"));
    }
    return config;
};