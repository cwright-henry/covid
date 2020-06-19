<template>
	<highcharts :options="options" :ref="ref"></highcharts>
</template>

<script>
import { mapState } from "vuex";
import { uuid } from "@/utils";

const options = vm => {
	return {
		chart: {
			height: vm._props.height,
			backgroundColor: vm._props.backgroundColor,
			spacingRight: 12,
			type: "bar"
		},
		title: {
			text: null
		},
		credits: {
			enabled: false
		},
		legend: {
			enabled: false
		},
		tooltip: {},
		xAxis: {
			title: {
				text: ""
			},
			alignTicks: true,
			type: "category",
			gridLineColor: "#707073",
			labels: {
				style: {
					color: "#fff"
				},
				overflow: "justify"
			},
			lineColor: "#707073",
			minorGridLineColor: "#505053",
			tickColor: "#707073",
			tickWidth: 1
		},
		yAxis: {
			visible: false
		},
		series: [],
		plotOptions: {
			bar: {
				opacity: 0.5,
				pointWidth: 25,
				dataLabels: {
					enabled: true,
					style: {
						color: "#fff",
						textOutline: ""
					}
				}
			},
			series: {
				borderColor: "#64B5F6",
				color: "#424242"
			}
		}
	};
};

export default {
	props: {
		regions: {
			type: Array,
			default: () => {
				return [];
			}
		},
		name: {
			type: String,
			default: "Series"
		},
		height: {
			type: String,
			default: "295"
		},
		backgroundColor: {
			type: String,
			default: "rgba(0, 0, 0, 0)"
		}
	},
	data() {
		return {
			options: options(this),
			ref: `covid-chart-${uuid()}`
		};
	},
	watch: {
		regions() {
			this.render();
		}
	},
	mounted() {
		this.render();
	},
	methods: {
		render() {
			const chart = this.$refs[this.ref].chart;
			if (this.regions.length > 0) {
				this.$nextTick(() => {
					this.clearSeries();
					const categories = this.regions.map(item => item.name);
					const values = this.regions.map(item => item.value);
					chart.xAxis[0].setCategories(categories);
					chart.addSeries({
						data: values,
						name: this.name
					});
					chart.reflow();
				});
			}
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

