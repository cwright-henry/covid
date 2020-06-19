<template>
	<article class="covid-page">
		<div class="covid-world covid-sheet">
			<div class="mb-6">
				<WorldMapView :coverage="coverage" />
			</div>
			<div class="covid-world--charts">
				<h1>
					World Daily Confirmed
					<div>
						Latest
						<span>{{coverage.stats.latestConfirmed | number(0)}}</span>
					</div>
				</h1>
				<div class="covid-world--charts__chart">
					<div>
						<ColumnChart :regions="regionData.confirmed" name="Total Confirmed" />
					</div>
					<div>
						<BasicChart
							:ts="coverage.ts.confirmedDailySeries"
							chartType="bar"
							showSMA
							name="World Daily Change"
						/>
					</div>
				</div>
			</div>
			<div class="covid-world--charts">
				<h1>
					World Daily Recovered
					<div>
						Latest
						<span>{{coverage.stats.latestRecovered | number(0)}}</span>
					</div>
				</h1>
				<div class="covid-world--charts__chart">
					<div>
						<ColumnChart :regions="regionData.recovered" name="Total Recovered" />
					</div>
					<div>
						<BasicChart
							:ts="coverage.ts.recoveredDailySeries"
							chartType="bar"
							showSMA
							name="World Daily Change"
						/>
					</div>
				</div>
			</div>
			<div class="covid-world--charts">
				<h1>
					World Daily Fatalities
					<div>
						Latest
						<span>{{coverage.stats.latestDeaths | number(0)}}</span>
					</div>
				</h1>
				<div class="covid-world--charts__chart">
					<div>
						<ColumnChart :regions="regionData.fatalities" name="Total Fatalities" />
					</div>
					<div>
						<BasicChart
							:ts="coverage.ts.deathDailySeries"
							chartType="bar"
							showSMA
							name="`World Daily Change"
						/>
					</div>
				</div>
			</div>
			<h1 class="mt-4 ml-1">Continents</h1>
			<ul class="covid-world--regions">
				<li v-for="region of regions" :key="region.uuid">
					<div class="covid-world--charts">
						<h1>
							{{region.name}} Daily Confirmed
							<div>
								Latest
								<span>{{region.stats.latestConfirmed | number(0)}}</span>
							</div>
						</h1>
						<div class="covid-world--charts__chart">
							<div>
								<ColumnChart :regions="getSubRegionData(region)" name="Total Confirmed" />
							</div>
							<div>
								<BasicChart
									:ts="region.ts.confirmedDailySeries"
									chartType="bar"
									showSMA
									:name="`${region.name} Deaths Daily Changge`"
								/>
							</div>
						</div>
						<ul class="covid-world--subregions">
							<li v-for="(subregion, index) of region.subRegions" :key="subregion.uuid">
								<h2>
									{{subregion.subRegion}}
									<div>
										Latest
										<span>{{subregion.stats.latestConfirmed | number(0)}}</span>
									</div>
								</h2>
								<BasicChart
									:ts="subregion.ts.confirmedDailySeries"
									chartType="bar"
									height="250"
									:color="findAColor(index)"
									showSMA
									:name="`${region.name} Deaths Daily Changge`"
								/>
							</li>
						</ul>
					</div>
				</li>
			</ul>
		</div>
	</article>
</template>

<script>
import { mapState } from "vuex";
import WorldMapView from "./WorldMapView";
import BasicChart from "@/views/common/BasicChart";
import ColumnChart from "@/views/common/ColumnChart";
import { findColor, objectSorter } from "@/utils";

const valueSorter = objectSorter("value", "asc");

export default {
	components: {
		BasicChart,
		WorldMapView,
		ColumnChart
	},
	computed: {
		...mapState(["coverage", "data", "regions"]),
		regionData() {
			const confirmed = [];
			const recovered = [];
			const fatalities = [];

			for (const region of this.regions) {
				confirmed.push({
					name: region.name,
					value: region.stats.latestConfirmed
				});
				recovered.push({
					name: region.name,
					value: region.stats.latestRecovered
				});
				fatalities.push({
					name: region.name,
					value: region.stats.latestDeaths
				});
			}

			confirmed.sort(valueSorter);
			recovered.sort(valueSorter);
			fatalities.sort(valueSorter);

			return { confirmed, recovered, fatalities };
		}
	},
	methods: {
		findAColor(index) {
			return findColor(index + 1);
		},

		getSubRegionData(region) {
			const confirmed = [];

			for (const region of region.subRegions) {
				confirmed.push({
					name: region.subRegion,
					value: region.stats.latestConfirmed
				});
			}

			confirmed.sort(valueSorter);

			return confirmed;
		}
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
	h1 {
		color: var(--section-header-color);
		font-size: 18px;
		text-transform: uppercase;
		font-weight: 300;
	}
	.covid-world--charts {
		display: flex;
		flex-direction: column;
		margin: 16px 0;
		border: 1px solid #424242;
		border-radius: 4px;
		h1 {
			font-size: 16px;
			text-transform: uppercase;
			font-weight: 300;
			color: var(--section-header-color);
			padding: 8px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid #424242;
			background-color: #424242;
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
			display: flex;
			padding: 16px;
			> div:nth-child(1) {
				width: 40%;
			}
			> div:nth-child(2) {
				width: 60%;
			}
		}
	}

	ul.covid-world--regions {
		ul.covid-world--subregions {
			display: flex;
			flex-wrap: wrap;
			li {
				width: 25%;
				padding: 12px;
				h2 {
					font-size: 13px;
					text-transform: uppercase;
					font-weight: 300;
					color: #fff;
					margin: 0 0 4px 12px;
					display: flex;
					justify-content: space-between;
					align-items: baseline;
					div {
						margin: 0 16px 0 0;
						font-size: 12px;
						color: #e0e0e0;
						span {
							margin: 0 0 0 2px;
							font-size: 14px;
							color: var(--section-header-color);
						}
					}
				}
			}
		}
	}
}
</style>