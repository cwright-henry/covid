<template>
	<highcharts :options="options" :ref="ref"></highcharts>
</template>

<script>
import { mapState } from "vuex";
import { uuid } from "@/utils";

const options = vm => {
	return {
		chart: {
			type: "bubble",
			backgroundColor: vm._props.backgroundColor,
			height: vm._props.height,
			zoomType: "xy"
		},
		legend: {
			enabled: false
		},
		title: {
			text: null
		},
		credits: {
			enabled: false
		},
		xAxis: {
			gridLineWidth: 1,
			title: {
				text: "Population",
				style: {
					color: "#fff"
				}
			},
			alignTicks: true,
			gridLineColor: "#707073",
			labels: {
				style: {
					color: "#E0E0E3"
				}
			},
			lineColor: "#707073",
			minorGridLineColor: "#505053",
			tickColor: "#707073",
			tickWidth: 1
		},
		yAxis: {
			startOnTick: false,
			endOnTick: false,
			title: {
				text: "Cases per 100,000",
				style: {
					color: "#fff"
				}
			},
			labels: {
				align: "right"
			},
			offset: 0,
			gridLineColor: "#707073",
			labels: {
				style: {
					color: "#E0E0E3"
				}
			},
			lineColor: "#707073",
			minorGridLineColor: "#505053",
			tickColor: "#707073",
			tickWidth: 1,
			min: 0
		},
		tooltip: {
			useHTML: true,
			headerFormat: "<table>",
			pointFormat:
				'<tr><th colspan="2"><h3>{point.country}</h3></th></tr>' +
				"<tr><th>Population:</th><td>{point.x:,.0f}</td></tr>" +
				"<tr><th>Cases per 100,000:</th><td>{point.y:,.0f}</td></tr>" +
				"<tr><th>Latest Confirmed:</th><td>{point.z:,.0f}</td></tr>",
			footerFormat: "</table>",
			followPointer: true
		},
		plotOptions: {
			series: {
				dataLabels: {
					enabled: true,
					format: "{point.name}"
				}
			}
		}
	};
};

export default {
	props: {
		height: {
			type: String,
			default: "420"
		},
		backgroundColor: {
			type: String,
			default: "rgba(0, 0, 0, 0)"
		},
		color: {
			type: String,
			default: "#2196F3"
		},
		country: {
			type: Object,
			default: () => {}
		},
		borderedCountries: {
			type: Array,
			default: () => []
		}
	},
	data() {
		return {
			options: options(this),
			ref: `covid-columnchart-${uuid()}`
		};
	},
	watch: {
		country() {
			this.render();
		}
	},
	mounted() {
		this.render();
	},
	methods: {
		render() {
			const chart = this.$refs[this.ref].chart;
			if (this.country.countryName) {
				this.clearSeries();
				setTimeout(() => {
					let series = this.getSeries();
					chart.addSeries({
						data: series
					});

					chart.reflow();
				}, 400); // Synchronize with transitions else main thread will be blocked
			}
		},

		getSeries() {
			const series = [];
			series.push(this.createBubbleData(this.country, this.color));
			for (const { country, color } of this.borderedCountries) {
				series.push(this.createBubbleData(country, color));
			}
			return series;
		},

		createBubbleData(country, color) {
			return {
				x: country.population,
				y:
					(country.series.stats.totalConfirmed / country.population) *
					100000,
				z: country.series.stats.latestConfirmed,
				name: country.countryCode,
				color,
				country: country.countryName
			};
		},

		clearSeries() {
			const chart = this.$refs[this.ref].chart;
			while (chart.series.length > 0) {
				chart.series[0].remove(false);
			}
		}
	}
};
</script>