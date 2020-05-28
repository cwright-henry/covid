import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'animate.css'
import vuetify from './plugins/vuetify';
import Highcharts from 'highcharts'
import HighchartsVue from 'highcharts-vue'
import { GA } from "@/utils";

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

const dateOptionsLong = {
	year: 'numeric', month: 'short', day: '2-digit',
	hour: '2-digit', minute: '2-digit', second: '2-digit',
	hour12: false,
	timeZone: 'UTC',
	timeZoneName: 'short'
};

const dateOptionsCompact = {
	year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC'
};

const dateOptionsDayOnly = {
	day: '2-digit'
};

Vue.filter('number', function (value, precision) {
	if (value !== null && !isNaN(value)) {
		precision = precision !== undefined ? precision : 3;
		return new Intl.NumberFormat(navigator.language, { maximumFractionDigits: precision, minimumFractionDigits: precision }).format(value);
	}
	return value;
});

Vue.filter('date-long', function (value) {
	if (value && !isNaN(value))
		return new Intl.DateTimeFormat(navigator.language, dateOptionsLong).format(value);
	return value
});

Vue.filter('date-short', function (value) {
	if (value && !isNaN(value))
		return new Intl.DateTimeFormat(navigator.language, dateOptionsCompact).format(value);
	return value;
});

Vue.filter('date-day', function (value) {
	if (value && !isNaN(value))
		return new Intl.DateTimeFormat(navigator.language, dateOptionsDayOnly).format(value);
	return value;
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
