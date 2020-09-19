<template>
	<article class="covid-page">
		<router-link to="/world" class="covid-link">
			<v-icon class="mb-2">mdi-arrow-left</v-icon>
		</router-link>
		<div class="covid-region covid-sheet">
			<h1>{{regionCode}}</h1>
			<RegionStats :region="region" />
			<div class="covid-region--charts">
				<div class="covid-region--charts__chart">
					<PieChart :regions="slices" name="Latest Confirmed" />
				</div>
				<div class="covid-region--charts__chart">
					<h1>
						Daily Confirmed
						<div>
							Latest
							<span>{{region.stats.latestConfirmed | number(0)}}</span>
						</div>
					</h1>
					<BasicChart
						:ts="region.ts.confirmedDailySeries"
						chartType="bar"
						:smats="region.ts.confirmedSMASeries"
						:name="`${region.name} Confirmed Daily Change`"
					/>
				</div>
			</div>
			<ul class="covid-world--subregions">
				<li v-for="(country, index) of scrollableCountries" :key="country.uuid">
					<h2>
						{{country.countryName}}
						<div>
							Latest
							<span>{{country.series.stats.latestConfirmed | number(0)}}</span>
							<router-link :to="`/country/${country.countryCode}`" title="region">
								<v-icon size="18" color="linkColor">mdi-arrow-right-bold</v-icon>
							</router-link>
						</div>
					</h2>
					<BasicChart
						:ts="country.series.ts.confirmedDailySeries"
						chartType="bar"
						height="240"
						:color="findAColor(index)"
						:smats="country.series.ts.confirmedSMASeries"
						name="Daily Change"
					/>
				</li>
			</ul>
			<InfiniteScroll :hasNext="scrollable" @loadmore="loadMore" />
		</div>
	</article>
</template>

<script>
import { mapGetters } from "vuex";
import RegionStats from "@/views/common/RegionStats";
import BasicChart from "@/views/common/BasicChart";
import PieChart from "@/views/common/PieChart";
import InfiniteScroll from "@/views/common/InfiniteScroll";
import {
	findColor,
	sortCountries,
	lightenDarkenColor,
	objectSorter,
} from "@/utils";

const lastestConfirmedSorter = sortCountries("latestConfirmed", "asc");
const valueSorter = objectSorter("value", "asc");
const SCROLL_AMOUNT = 3;

export default {
	data() {
		return {
			region: null,
			slices: [],
			scrollAmount: 0,
		};
	},
	props: {
		regionCode: {
			type: String,
			default: "",
		},
	},
	components: {
		RegionStats,
		BasicChart,
		PieChart,
		InfiniteScroll,
	},
	computed: {
		...mapGetters(["findRegion"]),
		scrollableCountries() {
			return this.region.countries.slice(0, this.scrollAmount);
		},

		scrollable() {
			return this.scrollAmount < this.region.countries.length;
		},
	},
	watch: {
		regionCode: {
			handler() {
				this.loadData();
			},
			immediate: true,
		},
	},
	methods: {
		loadData() {
			this.region = Object.freeze(this.findRegion(this.regionCode));
			this.region.countries.sort(lastestConfirmedSorter);
			this.slices = [];
			let index = 0;

			for (const country of this.region.countries) {
				this.slices.push({
					name: country.countryName,
					value: country.series.stats.latestConfirmed,
					color: lightenDarkenColor(this.findAColor(index++), -10),
				});
			}

			this.slices.sort(valueSorter);
		},

		findAColor(index) {
			return findColor(index + 1);
		},

		loadMore() {
			this.scrollAmount += SCROLL_AMOUNT;
		},
	},
};
</script>

<style lang="less" scoped>
.covid-region {
	h1 {
		font-size: 24px;
		font-weight: 400;
		margin: 0 0 16px;
	}
	.covid-region--charts {
		display: flex;
		margin: 0 0 24px;
		display: flex;
		padding: 16px;
		> div:nth-child(1) {
			width: 40%;
		}
		> div:nth-child(2) {
			width: 60%;
		}
		.covid-region--charts__chart {
			display: flex;
			flex-direction: column;
			h1 {
				font-size: 16px;
				text-transform: uppercase;
				font-weight: 300;
				color: var(--section-header-color);
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
						font-size: 16px;
						color: var(--section-header-color);
					}
				}
			}
		}
	}

	@media screen and (max-width: 800px) {
		.covid-region--charts {
			display: flex;
			margin: 0 0 24px;
			.covid-region--charts__chart:nth-child(1) {
				display: none;
			}
			.covid-region--charts__chart:nth-child(2) {
				width: 100%;
			}
		}
	}

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
				div {
					margin: 0 8px 0 0;
					font-size: 12px;
					color: #e0e0e0;
					display: flex;
					align-items: center;
					span {
						margin: 0 4px 0 4px;
						font-size: 14px;
						color: var(--section-header-color);
					}
				}
			}
		}
	}
}
</style>