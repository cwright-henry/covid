<template>
	<highcharts :options="options" :ref="ref"></highcharts>
</template>

<script>
import { uuid } from "@/utils";

const options = (vm) => {
	return {
		chart: {
			backgroundColor: vm._props.backgroundColor,
			borderWidth: 0,
			type: "area",
			margin: [4, 0, 4, 0],
			width: 220,
			height: 64,
			style: {
				overflow: "visible",
			},
			skipClone: true,
		},
		title: {
			text: "",
		},
		credits: {
			enabled: false,
		},
		xAxis: {
			labels: {
				enabled: false,
			},
			title: {
				text: null,
			},
			lineWidth: 0,
			startOnTick: false,
			endOnTick: false,
			tickPositions: [],
		},
		yAxis: {
			endOnTick: false,
			startOnTick: false,
			labels: {
				enabled: false,
			},
			title: {
				text: null,
			},
			tickPositions: [],
		},
		legend: {
			enabled: false,
		},
		tooltip: {
			animation: true,
			enabled: true,
			pointFormat: '<span style="color:{series.color}">{point.y:,.0f}',
			split: true,
			backgroundColor: "#212121",
			style: {
				color: "#ffffff",
			},
		},
		plotOptions: {
			series: {
				animation: false,
				lineWidth: 1,
				shadow: false,
				states: {
					hover: {
						lineWidth: 1,
					},
				},
				color: "#2196F3",
				marker: {
					radius: 1,
					states: {
						hover: {
							radius: 2,
						},
					},
				},
				fillOpacity: 0.15,
				borderColor: "#fff",
			},
			column: {
				negativeColor: "#910000",
				borderColor: "#fff",
			},
		},
	};
};

export default {
	props: {
		ts: {
			type: Array,
			default: () => [],
		},
		backgroundColor: {
			type: String,
			default: "rgba(0, 0, 0, 0)",
		},
	},
	data() {
		return {
			options: options(this),
			ref: `covid-columnchart-${uuid()}`,
		};
	},
	watch: {
		ts() {
			this.render();
		},
	},
	mounted() {
		this.render();
	},
	methods: {
		render() {
			const chart = this.$refs[this.ref].chart;
			if (this.ts.length > 0) {
				this.clearSeries();
				setTimeout(() => {
					chart.addSeries({
						data: this.ts,
					});

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
	},
};
</script>