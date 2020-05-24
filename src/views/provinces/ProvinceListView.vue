<template>
	<div class="covid-country--charts__provinces">
		<h1>Confirmed Cases By {{local.provinceName}}</h1>
		<transition-group tag="ul" @enter="enter" :css="false" class="covid-country--charts__provinces">
			<li v-for="(province, index) of scrollableProvinces" :key="province.uuid">
				<h1>
					{{province.name}}
					<div>
						Latest
						<span>{{province.stats.latestConfirmed | number(0)}}</span>
					</div>
				</h1>
				<BasicChart
					:ts="province.ts.confirmedDailySeries"
					chartType="bar"
					height="250"
					:color="findAColor(index)"
					:name="`${province.name} Deaths Daily Changge`"
				/>
			</li>
		</transition-group>
		<InfiniteScroll :hasNext="scrollable" @loadmore="loadMore" />
	</div>
</template>

<script>
import BasicChart from "@/views/common/BasicChart";
import { animation } from "@/utils/mixins/animation";
import InfiniteScroll from "@/views/common/InfiniteScroll";
import { findColor, objectSorter } from "@/utils";

const SCROLL_AMOUNT = 8;
const provinceNameSorter = new objectSorter("name");

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
						deathDailySeries: []
					},
					data: [],
					provinces: []
				}
			})
		},
		local: {
			type: Object,
			default: () => {}
		}
	},
	mixins: [animation],
	data() {
		return {
			scrollAmount: SCROLL_AMOUNT,
			ANIMATION_IN: "animate__fadeInUp",
			ANIMATION_TIME: "1.0s"
		};
	},
	components: {
		BasicChart,
		InfiniteScroll
	},
	computed: {
		scrollableProvinces() {
			return this.country.series.provinces.slice(0, this.scrollAmount);
		},

		scrollable() {
			return this.scrollAmount < this.country.series.provinces.length;
		}
	},
	watch: {
		country() {
			this.scrollAmount = SCROLL_AMOUNT;
			this.country.series.provinces.sort(provinceNameSorter);
		}
	},
	methods: {
		loadMore() {
			this.scrollAmount += SCROLL_AMOUNT;
		},

		findAColor(index) {
			return findColor(index);
		}
	}
};
</script>

<style lang="less" scoped>
.covid-country--charts__provinces {
	h1 {
		font-size: 16px;
		text-transform: uppercase;
		font-weight: 300;
		color: var(--section-header-color);
		margin: 0 0 0 12px;
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		li {
			width: 25%;
			padding: 24px 0;
			h1 {
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
</style>