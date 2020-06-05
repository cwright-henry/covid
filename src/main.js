import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'animate.css'
import vuetify from './plugins/vuetify';
import Highcharts from 'highcharts'
import HighchartsVue from 'highcharts-vue'
import { GA, numberFormat, dateShortFormat, dateLongFormat, dateDayFormat } from "@/utils";

Highcharts.createElement('link', {
	href: 'https://fonts.googleapis.com/css?family=Unica+One',
	rel: 'stylesheet',
	type: 'text/css'
}, null, document.getElementsByTagName('head')[0]);


Highcharts.setOptions({
	global: {
		useUTC: true
	}
});

Vue.use(HighchartsVue)

Vue.config.productionTip = false;

const dateOptionsDayOnly = {
	day: '2-digit'
};

Vue.filter('number', function (value, precision) {
	return numberFormat(value, precision);
});

Vue.filter('date-long', function (value) {
	return dateLongFormat(value);
});

Vue.filter('date-short', function (value) {
	return dateShortFormat(value);
});

Vue.filter('date-day', function (value) {
	return dateDayFormat(value);
});

Vue.config.errorHandler = function (err, vm, info) {
	GA.methods.gaExperience("Vue Error Handler", `Vue Error - ${err} - ${info}`);
	console.log(err)
}

window.onerror = function (msg, url, line, col, error) {
	GA.methods.gaExperience("Window Error Handler", `Window Error - ${msg} - ${line} - ${col} - ${error}`);
	console.log(error)
}

new Vue({
	mixins: [GA],
	router,
	store,
	vuetify,
	render: h => h(App)
}).$mount('#app')
