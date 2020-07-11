<template>
	<highcharts v-resize="onResize" :options="options" :ref="ref"></highcharts>
</template>

<script>
import { mapState } from "vuex";
import { uuid } from "@/utils";

/**
 * Create a per capita timeseries
 *
 * @param {*} arr
 * @param {*} population
 */
export const createPerCapita = (arr, population) => {
	if (population) {
		return arr.map(item => {
			return [item[0], (item[1] / population) * 100000];
		});
	}
	return arr;
};

const options = vm => {
	return {
		chart: {
			height: vm._props.height,
			backgroundColor: vm._props.backgroundColor,
			zoomType: "x",
			spacingRight: 12,
			animation: true
		},
		title: {
			text: null
		},
		credits: {
			enabled: false
		},
		legend: {
			enabled: true,
			itemStyle: {
				color: "#fff"
			}
		},
		tooltip: {
			pointFormat:
				'<span style="color:{series.color}">{series.name}</span>: {point.y:,.0f} per 100,000<br/>',
			split: true,
			backgroundColor: "#212121",
			style: {
				color: "#ffffff"
			}
		},
		xAxis: {
			title: {
				text: ""
			},
			alignTicks: true,
			type: "datetime",
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
			title: {
				text: ""
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
		series: [],
		plotOptions: {
			line: {
				lineWidth: 2,
				color: "#2196F3",
				marker: {
					enabled: false,
					radius: 3
				},
				tooltip: {
					valueDecimals: 0
				}
			},
			area: {
				lineWidth: 1,
				stacking: "normal",
				fillOpacity: 0.5,
				tooltip: {
					valueDecimals: 0
				}
			}
		}
	};
};

const MIN_HEIGHT = 200;
const MAX_HEIGHT = 300;

export default {
	props: {
		country: {
			type: Object,
			default: () => {}
		},
		color: {
			type: String,
			default: "#2196F3"
		},
		height: {
			type: String,
			default: "420"
		},
		backgroundColor: {
			type: String,
			default: "rgba(0, 0, 0, 0)"
		},
		dataAggregation: {
			type: String,
			default: null
		},
		dataType: {
			type: String,
			default: null
		},
		comparisions: {
			type: Array,
			default: () => []
		}
	},
	data() {
		return {
			ref: `covid-fancychart-${uuid()}`,
			options: options(this)
		};
	},
	watch: {
		country() {
			this.render();
		},
		dataAggregation() {
			this.render();
		},
		dataType() {
			this.render();
		}
	},
	mounted() {
		this.render();
		this.onResize();
	},
	methods: {
		render() {
			const chart = this.$refs[this.ref].chart;
			if (this.country.countryName) {
				this.clearSeries();
				setTimeout(() => {
					let series = this.getSeries();
					chart.addSeries({
						type: "area",
						color: this.color,
						data: series,
						name: this.country.countryName,
						lineWidth: 4
					});

					for (const { country, color } of this.comparisions) {
						series = this.getSeries(country);
						chart.addSeries({
							type: "area",
							color: color,
							data: series,
							name: country.countryName
						});
					}
					chart.reflow();
				}, 400); // Synchronize with transitions else main thread will be blocked
			}
		},

		clearSeries() {
			const chart = this.$refs[this.ref].chart;
			while (chart.series.length > 0) {
				chart.series[0].remove(false);
			}
		},

		getSeries(country) {
			const thiscountry = country || this.country;
			if (this.dataType === "perCapita") {
				switch (this.dataAggregation) {
					case "latestConfirmed":
						return createPerCapita(
							thiscountry.series.ts.confirmedSeries,
							thiscountry.population
						);
					case "latestRecovered":
						return createPerCapita(
							thiscountry.series.ts.recoveredSeries,
							thiscountry.population
						);
					case "latestFatalities":
						return createPerCapita(
							thiscountry.series.ts.deathSeries,
							thiscountry.population
						);
					default:
						return createPerCapita(
							thiscountry.series.ts.confirmedSeries,
							thiscountry.population
						);
				}
			} else {
				switch (this.dataAggregation) {
					case "latestConfirmed":
						return thiscountry.series.ts.confirmedDailySeries;
					case "latestRecovered":
						return thiscountry.series.ts.recoveredDailySeries;
					case "latestFatalities":
						return thiscountry.series.ts.deathDailySeries;
					default:
						return thiscountry.series.ts.confirmedDailySeries;
				}
			}
		},

		onResize() {
			const chart = this.$refs[this.ref].chart;
			if (window.innerWidth < 1000) {
				chart.setSize(null, MIN_HEIGHT, true);
			} else {
				chart.setSize(
					null,
					this.height ? parseInt(this.height) : MAX_HEIGHT,
					true
				);
			}
		}
	}
};
</script>

