import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import Highcharts from 'highcharts'
import HighchartsVue from 'highcharts-vue'
import HighchartsMore from 'highcharts/highcharts-more'
import SolidGauge from 'highcharts/modules/solid-gauge'
import EventBus from "@/events";

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

HighchartsMore(Highcharts)
SolidGauge(Highcharts)

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
	year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'
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

Vue.config.errorHandler = function (err, vm, info) {
	EventBus.$emit("error", `Vue Error - ${err} - ${info}`);
	console.log(err)
}

window.onerror = function (msg, url, line, col, error) {
	EventBus.$emit("error", `Window Error - ${msg} - ${line} - ${col} - ${error}`);
}

new Vue({
	router,
	store,
	vuetify,
	render: h => h(App)
}).$mount('#app')
