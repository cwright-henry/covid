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
						<StackedChart :series="stackedChartData.confirmed" />
					</div>
					<div>
						<BasicChart
							:ts="coverage.ts.confirmedDailySeries"
							chartType="bar"
							:smats="coverage.ts.confirmedSMASeries"
							name="Daily Change"
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
						<StackedChart :series="stackedChartData.recovered" />
					</div>
					<div>
						<BasicChart
							:ts="coverage.ts.recoveredDailySeries"
							chartType="bar"
							:smats="coverage.ts.recoveredSMASeries"
							name="Daily Change"
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
						<StackedChart :series="stackedChartData.fatalities" />
					</div>
					<div>
						<BasicChart
							:ts="coverage.ts.deathDailySeries"
							chartType="bar"
							:smats="coverage.ts.deathSMASeries"
							name="Daily Change"
						/>
					</div>
				</div>
			</div>
			<h1 class="mt-4 ml-1">Continents</h1>
			<transition-group tag="ul" @enter="enter" :css="false" class="covid-world--regions">
				<li v-for="region of scrollableRegions" :key="region.uuid">
					<div class="covid-world--charts">
						<h1>
							{{region.name}} Daily Confirmed
							<div>
								Latest
								<span>{{region.stats.latestConfirmed | number(0)}}</span>
							</div>
						</h1>
						<RegionStats :region="region" isSlim class="ma-6" />
						<div class="covid-world--charts__chart">
							<div>
								<PieChart :regions="getSubRegionData(region)" name="Total Confirmed" />
							</div>
							<div>
								<BasicChart
									:ts="region.ts.confirmedDailySeries"
									chartType="bar"
									:smats="region.ts.confirmedSMASeries"
									name="Daily Change"
								/>
							</div>
						</div>
						<ul class="covid-world--subregions">
							<li v-for="(subregion, index) of region.subRegions" :key="subregion.uuid">
								<h2>
									{{subregion.subRegion}}
									<router-link :to="`/world/${subregion.subRegion}`" title="Explore Region">
										Latest
										<span>{{subregion.stats.latestConfirmed | number(0)}}</span>
										<v-icon size="18" color="linkColor">mdi-arrow-right-bold</v-icon>
									</router-link>
								</h2>
								<BasicChart
									:ts="subregion.ts.confirmedDailySeries"
									chartType="bar"
									height="240"
									:color="findAColor(index)"
									:smats="subregion.ts.confirmedSMASeries"
									name="Daily Change"
								/>
							</li>
						</ul>
					</div>
				</li>
			</transition-group>
			<InfiniteScroll :hasNext="scrollable" @loadmore="loadMore" />
		</div>
	</article>
</template>

<script>
import { mapState } from "vuex";
import WorldMapView from "./WorldMapView";
import BasicChart from "@/views/common/BasicChart";
import RegionStats from "@/views/common/RegionStats";
import PieChart from "@/views/common/PieChart";
import StackedChart from "@/views/common/StackedChart";
import InfiniteScroll from "@/views/common/InfiniteScroll";
import {
	findColor,
	findContinentColor,
	objectSorter,
	lightenDarkenColor,
	animation,
} from "@/utils";

const valueSorter = objectSorter("value", "asc");
const SCROLL_AMOUNT = 1;

export default {
	data() {
		return {
			scrollAmount: 0,
			ANIMATION_IN: "animate__fadeInUp",
			ANIMATION_TIME: "0.5s",
		};
	},
	components: {
		BasicChart,
		WorldMapView,
		RegionStats,
		PieChart,
		StackedChart,
		InfiniteScroll,
	},
	mixins: [animation],
	computed: {
		...mapState(["coverage", "data", "regions"]),
		regionData() {
			const confirmed = [];
			const recovered = [];
			const fatalities = [];

			for (const region of this.regions) {
				confirmed.push({
					name: region.name,
					value: region.stats.latestConfirmed,
				});
				recovered.push({
					name: region.name,
					value: region.stats.latestRecovered,
				});
				fatalities.push({
					name: region.name,
					value: region.stats.latestDeaths,
				});
			}

			confirmed.sort(valueSorter);
			recovered.sort(valueSorter);
			fatalities.sort(valueSorter);

			return { confirmed, recovered, fatalities };
		},
		stackedChartData() {
			const confirmed = [];
			const recovered = [];
			const fatalities = [];

			for (let i = 0; i < this.regions.length; i++) {
				const region = this.regions[i];
				const color = findContinentColor(i);
				const name = region.name;
				confirmed.push({
					name,
					ts: region.ts.confirmedSMASeries,
					color,
				});
				recovered.push({
					name,
					ts: region.ts.recoveredSMASeries,
					color,
				});
				fatalities.push({
					name,
					ts: region.ts.deathSMASeries,
					color,
				});
			}

			return { confirmed, recovered, fatalities };
		},
		scrollableRegions() {
			if (this.scrollAmount === 0) {
				return [];
			}
			return this.regions.slice(0, this.scrollAmount);
		},
		scrollable() {
			return this.scrollAmount < this.regions.length;
		},
	},
	beforeRouteLeave(to, from, next) {
		if (from.name === "world" && to.name === "region") {
			from.meta.yPos = document.documentElement.scrollTop;
		} else {
			from.meta.yPos = 0;
		}
		next();
	},
	methods: {
		findAColor(index) {
			return findColor(index + 1);
		},

		getSubRegionData(region) {
			const confirmed = [];
			let index = 0;

			for (const region of region.subRegions) {
				confirmed.push({
					name: region.subRegion,
					value: region.stats.latestConfirmed,
					color: lightenDarkenColor(this.findAColor(index++), -10),
				});
			}

			return confirmed.sort(valueSorter);
		},

		loadMore() {
			this.scrollAmount += SCROLL_AMOUNT;
		},
	},
};
</script>

<style lang="less">
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
				margin: 0 8px 0 0;
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
				width: 33%;
				padding: 12px;
				h2 {
					font-size: 13px;
					text-transform: uppercase;
					font-weight: 300;
					color: #fff;
					margin: 0 0 4px 12px;
					display: flex;
					justify-content: space-between;
					align-items: center;
					a {
						margin: 0 8px 0 0;
						font-size: 12px;
						color: #e0e0e0;
						display: flex;
						align-items: center;
						text-decoration: none;
						span {
							margin: 0 4px 0 6px;
							font-size: 14px;
							color: var(--section-header-color);
						}
					}
				}
			}
		}
	}
}
@media screen and (max-width: 1000px) {
	.covid-world {
		.covid-world--charts {
			.covid-world--charts__chart {
				display: flex;
				padding: 16px;
				> div:nth-child(1) {
					display: none;
				}
				> div:nth-child(2) {
					width: 100%;
					height: auto;
				}
			}
		}
		ul.covid-world--regions {
			ul.covid-world--subregions {
				display: flex;
				flex-wrap: wrap;
				li {
					width: 50%;
				}
			}
		}
	}
}

@media screen and (max-width: 700px) {
	.covid-world {
		h1 {
			font-size: 16px;
		}
		.covid-world--charts {
			h1 {
				font-size: 13px;
				color: var(--section-header-color);
				padding: 4px 8px;
				div {
					margin: 0 12px 0 0;
					font-size: 11px;
					color: #e0e0e0;
					span {
						margin: 0 0 0 2px;
						font-size: 13px;
						color: var(--section-header-color);
					}
				}
			}
		}
		ul.covid-world--regions {
			ul.covid-world--subregions {
				display: flex;
				flex-wrap: wrap;
				li {
					h2 {
						font-size: 11px;
						margin: 0 0 2px 8px;
						div {
							display: none;
						}
					}
				}
			}
		}
	}
}

@media screen and (max-width: 440px) {
	.covid-world {
		ul.covid-world--regions {
			ul.covid-world--subregions {
				li {
					width: 100%;
				}
			}
		}
	}
}
</style>