<template>
	<highcharts v-resize="onResize" :options="options" :ts="ts" :ref="ref"></highcharts>
</template>

<script>
import { uuid } from "@/utils";

/**
 * Taking the forward and backward 3 seems to be the way to
 * Taking the previous 7 presents a lag
 */
const SMA_AVG = (data) => {
	const moveMean = [];

	for (var i = 3; i < data.length - 3; i++) {
		var mean =
			(data[i][1] +
				data[i - 1][1] +
				data[i - 2][1] +
				data[i - 3][1] +
				data[i + 1][1] +
				data[i + 2][1] +
				data[i + 3][1]) /
			7.0;
		moveMean.push([data[i][0], mean]);
	}

	return moveMean;
};

const options = (vm) => {
	return {
		chart: {
			height: vm._props.height,
			backgroundColor: vm._props.backgroundColor,
			zoomType: "x",
			spacingRight: 12,
			animation: true,
		},
		title: {
			text: null,
		},
		credits: {
			enabled: false,
		},
		legend: {
			enabled: false,
		},
		tooltip: {},
		xAxis: {
			title: {
				text: "",
			},
			alignTicks: true,
			type: "datetime",
			gridLineColor: "#707073",
			labels: {
				style: {
					color: "#E0E0E3",
				},
			},
			lineColor: "#707073",
			minorGridLineColor: "#505053",
			tickColor: "#707073",
			tickWidth: 1,
		},
		yAxis: {
			title: {
				text: "",
			},
			labels: {
				align: "right",
			},
			offset: 0,
			gridLineColor: "#707073",
			labels: {
				style: {
					color: "#E0E0E3",
				},
			},
			lineColor: "#707073",
			minorGridLineColor: "#505053",
			tickColor: "#707073",
			tickWidth: 1,
			min: 0,
		},
		series: [],
		plotOptions: {
			line: {
				lineWidth: 1,
				color: "#2196F3",
				marker: {
					enabled: true,
					radius: 3,
				},
			},
			bar: {
				opacity: 0.5,
			},
		},
	};
};

const MIN_HEIGHT = 200;
const MAX_HEIGHT = 300;

export default {
	props: {
		ts: {
			type: Array,
			default: () => {
				return [];
			},
		},
		chartType: {
			type: String,
			default: "line",
		},
		color: {
			type: String,
			default: "#2196F3",
		},
		showSMA: {
			type: Boolean,
			default: false,
		},
		name: {
			type: String,
			default: "",
		},
		height: {
			type: String,
			default: "320",
		},
		backgroundColor: {
			type: String,
			default: "rgba(0, 0, 0, 0)",
		},
	},
	data() {
		return {
			ref: `covid-basicchart-${uuid()}`,
			options: options(this),
		};
	},
	watch: {
		ts() {
			this.render();
		},
	},
	mounted() {
		this.render();
		this.onResize();
	},
	methods: {
		render() {
			const chart = this.$refs[this.ref].chart;
			if (this.ts.length > 0) {
				this.clearSeries();
				setTimeout(() => {
					chart.addSeries({
						type: this.chartType,
						color: this.color,
						data: this.ts,
						name: this.name,
					});

					if (this.showSMA) {
						const movingAvg = SMA_AVG(this.ts);
						chart.addSeries({
							type: "line",
							data: movingAvg,
							name: `7 Day Moving Average`,
							lineWidth: 3,
							color: this.color,
							marker: {
								enabled: false,
							},
							tooltip: {
								valueDecimals: 0,
							},
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
		},
	},
};
</script>

