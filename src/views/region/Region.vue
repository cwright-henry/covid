<template>
	<article class="covid-page">
		<router-link to="/world" class="covid-link">
			<v-icon class="mb-2">mdi-arrow-left</v-icon>
		</router-link>
		<div class="covid-region covid-sheet">
			<h1>{{ regionCode }}</h1>
			<RegionStats :region="region" hasProgress/>
			<div class="covid-region--charts">
				<div class="covid-region--charts__chart mt-5">
					<ColumnChart :regions="slices" name="Latest Confirmed" />
				</div>
				<div class="covid-region--charts__chart pl-4">
					<h1>
						Daily Confirmed
						<div>
							Latest
							<span>{{
								region.stats.latestConfirmed | number(0)
							}}</span>
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
			<h2>Daily Confirmed Cases</h2>
			<ul class="covid-world--subregions">
				<li
					v-for="(country, index) of scrollableCountries"
					:key="country.uuid"
				>
					<header>
						<h1>
							<img
								:src="country.flag"
								width="20"
								height="14"
								class="mr-2"
							/>{{ country.countryName }}
						</h1>
						<div>
							<div>
								<label>Per Capita Per 100,000</label>
								<nobr>
									<label>Total</label>
									<span>{{
										country.series.stats.totalConfirmed14Day
											| number(0)
									}}</span>
									<label class="ml-3">Last 14 Days</label>
									<span>{{
										country.series.stats
											.latestConfirmed14Day | number(0)
									}}</span>
								</nobr>
							</div>
							<div>
								<router-link
									:to="`/country/${country.countryCode}`"
									:title="country.countryName"
									class="country-link"
								>
									<div>
										<label>Latest</label>
										<span>{{
											country.series.stats.latestConfirmed
												| number(0)
										}}</span>
									</div>
									<v-icon
										size="18"
										color="linkColor"
										class="ml-2"
										>mdi-arrow-right-bold</v-icon
									>
								</router-link>
							</div>
						</div>
					</header>
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
import ColumnChart from "@/views/common/ColumnChart";
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
		ColumnChart,
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
	h2 {
		font-size: 16px;
		text-transform: uppercase;
		font-weight: 300;
		color: var(--section-header-color);
		margin: 0 0 8px 16px;
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
				margin: 0 0 4px 0;
				display: flex;
				justify-content: space-between;
				align-items: baseline;
				div {
					margin: 0 2px 0 0;
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
		justify-content: flex-start;
		li {
			width: 33%;
			padding: 12px 16px;
			header {
				margin: 0 0 8px;
				h1 {
					font-weight: 400;
					margin: 0 0 8px 0;
					font-size: 16px;
					display: flex;
					align-items: center;
				}
				> div {
					display: flex;
					justify-content: space-between;
					width: 100%;
					> div {
						display: flex;
						flex-direction: column;
						> label {
							font-weight: 300;
							margin: 0 0 1px 0;
							font-size: 11px;
							text-transform: uppercase;
						}
						nobr {
							label {
								font-size: 9px;
								margin: 0 8px 0 0;
								text-transform: uppercase;
							}
						}
						.country-link {
							display: flex;
							justify-content: space-between;
							text-decoration: none;
							> div {
								display: flex;
								flex-direction: column;
								justify-content: flex-start;
								align-items: flex-end;
								label {
									font-size: 11px;
									font-weight: 300;
									margin: 0 0 0 0;
									text-transform: uppercase;
									color: #e0e0e0;
									cursor: pointer;
								}
							}
							font-size: 16px;
							color: #fff;
						}
					}
				}
			}
		}
	}
}
</style>