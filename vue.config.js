module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/covid/' : '/',
  "transpileDependencies": [
    "vuetify"
  ],
  configureWebpack: (config) => {
    config.module.rules = [
      {
        test: /\.worker\.js$/i,
        use: [
          {
            loader: 'comlink-loader',
            options: {
              singleton: true
            }
          }
        ]
      },
      ...config.module.rules
    ]
  }
}