<template>
	<article class="covid-page">
		<div class="covid-world covid-sheet">
			<WorldMapView :coverage="coverage" />
			<div class="covid-world--charts">
				<div class="covid-world--charts__chart">
					<h1>
						Cumulative Confirmed
						<div>
							Latest
							<span>{{coverage.stats.totalConfirmed | number(0)}}</span>
						</div>
					</h1>
					<BasicChart :ts="coverage.ts.confirmedSeries" chartType="line" name="World Confirmed" />
				</div>
				<div class="covid-world--charts__chart">
					<h1>
						Daily Confirmed
						<div>
							Latest
							<span>{{coverage.stats.latestConfirmed | number(0)}}</span>
						</div>
					</h1>
					<BasicChart
						:ts="coverage.ts.confirmedDailySeries"
						chartType="bar"
						showSMA
						name="World Daily Change"
					/>
				</div>
			</div>
			<div class="covid-world--charts">
				<div class="covid-world--charts__chart">
					<h1>
						Cumulative Recovered
						<div>
							Latest
							<span>{{coverage.stats.totalRecovered | number(0)}}</span>
						</div>
					</h1>
					<BasicChart :ts="coverage.ts.recoveredSeries" chartType="line" name="World Recovered" />
				</div>
				<div class="covid-world--charts__chart">
					<h1>
						Daily Recovered
						<div>
							Latest
							<span>{{coverage.stats.latestRecovered | number(0)}}</span>
						</div>
					</h1>
					<BasicChart
						:ts="coverage.ts.recoveredDailySeries"
						chartType="bar"
						showSMA
						name="World Daily Change"
					/>
				</div>
			</div>
			<div class="covid-world--charts">
				<div class="covid-world--charts__chart">
					<h1>
						Cumulative Fatalities
						<div>
							Latest
							<span>{{coverage.stats.totalDeaths | number(0)}}</span>
						</div>
					</h1>
					<BasicChart :ts="coverage.ts.deathSeries" chartType="line" name="World Recovered" />
				</div>
				<div class="covid-world--charts__chart">
					<h1>
						Daily Fatalities
						<div>
							Latest
							<span>{{coverage.stats.latestDeaths | number(0)}}</span>
						</div>
					</h1>
					<BasicChart
						:ts="coverage.ts.deathDailySeries"
						chartType="bar"
						showSMA
						name="`World Daily Change"
					/>
				</div>
			</div>
		</div>
	</article>
</template>

<script>
import { mapState } from "vuex";
import WorldMapView from "./WorldMapView";
import BasicChart from "@/views/common/BasicChart";

export default {
	components: {
		BasicChart,
		WorldMapView
	},
	computed: {
		...mapState(["coverage", "data"])
	}
};
</script>

<style lang="less">
.covid-radio {
	color: red !important;
}
.covid-world {
	display: flex;
	flex-direction: column;

	.covid-world--charts {
		display: flex;
		flex-direction: row;
		margin: 32px 0;
		h1 {
			font-size: 16px;
			text-transform: uppercase;
			font-weight: 300;
			color: var(--section-header-color);
			margin: 0 0 4px 8px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			div {
				margin: 0 12px 0 0;
				font-size: 12px;
				color: #e0e0e0;
				span {
					margin: 0 0 0 2px;
					font-size: 16px;
					color: var(--section-header-color);
				}
			}
		}
		.covid-world--charts__chart {
			width: 50%;
		}
	}
}
</style>