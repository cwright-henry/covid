<template>
	<highcharts :options="options" :ref="ref"></highcharts>
</template>

<script>
import { mapState } from "vuex";
import { uuid } from "@/utils";

const options = (vm) => {
	return {
		chart: {
			height: vm._props.height,
			backgroundColor: vm._props.backgroundColor,
			spacingRight: 12,
			plotShadow: false,
			type: "pie",
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
		tooltip: {
			pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
		},
		series: [],
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: "pointer",
				dataLabels: {
					enabled: true,
					format: "<b>{point.name}</b>: {point.percentage:.1f} %",
					style: {
						color: "#fff",
						textOutline: "",
					},
				},
			},
		},
	};
};

export default {
	props: {
		regions: {
			type: Array,
			default: () => {
				return [];
			},
		},
		name: {
			type: String,
			default: "Series",
		},
		height: {
			type: String,
			default: "295",
		},
		backgroundColor: {
			type: String,
			default: "rgba(0, 0, 0, 0)",
		},
	},
	data() {
		return {
			options: options(this),
			ref: `covid-piechart-${uuid()}`,
		};
	},
	mounted() {
		this.render();
	},
	methods: {
		render() {
			const chart = this.$refs[this.ref].chart;
			if (this.regions.length > 0) {
				this.clearSeries();
				setTimeout(() => {
					const slices = this.regions.map((item) => ({
						name: item.name,
						y: item.value,
						color: item.color,
					}));
					chart.addSeries({
						data: slices,
						name: this.name,
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

