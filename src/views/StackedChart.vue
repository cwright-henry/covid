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
			zoomType: "x",
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
		tooltip: {},
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
				lineWidth: 1.5,
				marker: {
					enabled: true,
					radius: 2
				}
			},
			area: {
				stacking: "normal",
				lineColor: "#666666",
				lineWidth: 1,
				opacity: 0.1,
				marker: {
					enabled: false,
					lineWidth: 1,
					lineColor: "#666666"
				}
			}
		}
	};
};

export default {
	props: {
		series: {
			type: Array,
			default: () => []
		},
		height: {
			type: String,
			default: "320"
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
		series() {
			this.update();
		}
	},
	mounted() {
		this.update();
	},
	methods: {
		update() {
			const chart = this.$refs[this.ref].chart;
			if (this.series.length > 0) {
				this.$nextTick(() => {
					this.clearSeries();
					for (let i = 0; i < this.series.length; i++) {
						const series = this.series[i];
						console.log(series);
						chart.addSeries({
							type: series.type,
							data: series.ts,
							name: series.name,
							color: series.color
						});
					}
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

