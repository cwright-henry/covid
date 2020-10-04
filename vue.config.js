module.exports = {
	publicPath: process.env.NODE_ENV === 'production' ? '/covid/' : '/',
	"transpileDependencies": [
		"vuetify"
	],
	devServer: {
		proxy: {
			"/covid/api": {
				target: `http://localhost:3000/`
			}
		}
	},
	configureWebpack: (config) => {
		config.module.rules = [
			{
				test: /\.worker\.(c|m)?js$/i,
				use: [
					{
						loader: 'worker-loader',
					},
					{
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'],
						},
					},
				],
			},
			...config.module.rules
		]
	}
}