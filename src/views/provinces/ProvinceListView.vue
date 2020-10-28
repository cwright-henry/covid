<template>
	<div class="covid-country--charts__provinces">
		<h1>Confirmed Cases By {{ local.provinceName }}</h1>
		<transition-group
			tag="ul"
			@enter="enter"
			:css="false"
			class="covid-country--charts__provinces"
		>
			<li
				v-for="(province, index) of scrollableProvinces"
				:key="province.uuid"
			>
				<header class="population" v-if="province.population">
					<label>{{ province.name }}</label>
					<div>
						<div>
							<label>Per Capita Per 100,000</label>
							<nobr>
								<label>Total</label>
								<span>{{
									province.stats.totalConfirmed14Day
										| number(0)
								}}</span>
								<label class="ml-3">Last 14 Days</label>
								<span>{{
									province.stats.latestConfirmed14Day
										| number(0)
								}}</span>
							</nobr>
						</div>
						<div>
							<label>Latest</label>
							<span>{{
								province.stats.latestConfirmed | number(0)
							}}</span>
						</div>
					</div>
				</header>
				<header v-else>
					<label>{{ province.name }}</label>
					<div>
						Latest
						<span>{{
							province.stats.latestConfirmed | number(0)
						}}</span>
					</div>
				</header>
				<BasicChart
					:ts="province.ts.confirmedDailySeries"
					chartType="bar"
					height="240"
					:color="findAColor(index)"
					:smats="province.ts.confirmedSMASeries"
					:name="`${province.name} Deaths Daily Changge`"
				/>
			</li>
		</transition-group>
		<InfiniteScroll :hasNext="scrollable" @loadmore="loadMore" />
	</div>
</template>

<script>
import BasicChart from "@/views/common/BasicChart";
import { animation } from "@/utils";
import InfiniteScroll from "@/views/common/InfiniteScroll";
import { findColor, sortCountriesStats } from "@/utils";

const SCROLL_AMOUNT = 6;
const latestConfirmedSorter = new sortCountriesStats("latestConfirmed", "asc");

export default {
	props: {
		country: {
			type: Object,
			default: () => ({
				series: {
					ts: {
						confirmedSeries: [],
						recoveredSeries: [],
						deathSeries: [],
						confirmedDailySeries: [],
						recoveredDailySeries: [],
						deathDailySeries: [],
					},
					data: [],
					provinces: [],
				},
			}),
		},
		local: {
			type: Object,
			default: () => {},
		},
	},
	mixins: [animation],
	data() {
		return {
			scrollAmount: SCROLL_AMOUNT,
			ANIMATION_IN: "animate__fadeInUp",
			ANIMATION_TIME: "1.0s",
		};
	},
	components: {
		BasicChart,
		InfiniteScroll,
	},
	computed: {
		scrollableProvinces() {
			return this.country.series.provinces.slice(0, this.scrollAmount);
		},

		scrollable() {
			return this.scrollAmount < this.country.series.provinces.length;
		},
	},
	watch: {
		country() {
			this.scrollAmount = SCROLL_AMOUNT;
			this.country.series.provinces.sort(latestConfirmedSorter);
		},
	},
	methods: {
		loadMore() {
			this.scrollAmount += SCROLL_AMOUNT;
		},

		findAColor(index) {
			return findColor(index);
		},
	},
};
</script>

<style lang="less" scoped>
.covid-country--charts__provinces {
	h1 {
		font-size: 16px;
		text-transform: uppercase;
		font-weight: 300;
		color: var(--section-header-color);
		margin: 0 0 0 8px;
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		li {
			width: 33%;
			padding: 24px 24px 12px 8px;
			header {
				font-size: 13px;
				font-weight: 300;
				color: #fff;
				margin: 0 0 4px 0px;
				display: flex;
				justify-content: space-between;
				align-items: baseline;
				label {
					font-weight: 400;
					font-size: 16px;
					color:#fff;
				}
				div {
					font-size: 12px;
					color: #e0e0e0;
					label {
						text-transform: uppercase;
					}
					span {
						margin: 0 0 0 2px;
						font-size: 16px;
						color: #fff;
						font-weight: 400;
					}
				}
				&.population {
					display: flex;
					flex-direction: column;
					> label {
						font-weight: 400;
						margin: 0 0 6px 0;
						font-size: 16px;
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
							}
							nobr {
								label {
									font-size: 9px;
									margin: 0 4px 0 0;
								}
							}
							&:nth-child(2) {
								text-align: right;
							}
						}
					}
				}
			}
		}
	}
}
@media screen and (max-width: 1000px) {
	.covid-country--charts__provinces {
		ul {
			li {
				width: 50%;
				padding: 12px 0;
			}
		}
	}
}
@media screen and (max-width: 500px) {
	.covid-country--charts__provinces {
		ul {
			li {
				width: 100%;
				padding: 24px 0;
			}
		}
	}
}
</style>