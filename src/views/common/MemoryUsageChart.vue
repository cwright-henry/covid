<template>
	<div class="covid-memory">
		<highcharts :options="options" :ref="ref"></highcharts>
		<div class="covid-memory-info ml-2">
			<span>Memory</span>
			<span>
				{{data[1] | number(1)}}
				<span>MB</span>
			</span>
		</div>
	</div>
</template>

<script>
import { uuid } from "@/utils";

const options = (vm) => {
	return {
		chart: {
			backgroundColor: vm._props.backgroundColor,
			borderWidth: 0,
			type: "areaspline",
			margin: [4, 0, 4, 0],
			width: 90,
			height: 48,
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
			type: "datetime",
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
			enabled: false,
		},
		series: [
			{
				id: "memorySeries",
				data: (function () {
					// generate an array of random data
					var data = [],
						time = new Date().getTime(),
						i;

					for (i = -19; i <= 0; i += 1) {
						data.push({
							x: time + i * 1000,
							y: 0,
						});
					}
					return data;
				})(),
			},
		],
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
					enabled: false,
				},
				fillOpacity: 0.15,
				borderColor: "#fff",
			},
		},
	};
};

export default {
	props: {
		data: {
			type: Array,
			default: () => [],
		},
		backgroundColor: {
			type: String,
			default: "rgba(100, 0, 0, 0)",
		},
	},
	data() {
		return {
			options: options(this),
			ref: `covid-memory-chart-${uuid()}`,
		};
	},
	watch: {
		data() {
			this.render();
		},
	},
	mounted() {
		this.render();
	},
	methods: {
		render() {
			const chart = this.$refs[this.ref].chart;
			chart.get("memorySeries").addPoint(this.data, true, true);
		},
	},
};
</script>

<style lang="less" scoped>
.covid-memory {
	display: flex;
	.covid-memory-info {
		display: flex;
		flex-direction: column;
		span {
			font-size: 12px;
			color: #e0e0e0;
		}
	}
}
</style>