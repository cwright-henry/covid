<template>
	<article class="covid-page">
		<div class="covid-sheet">
			<header>
				<div class="covid-country--title">
					<img :src="country.flag" width="36" class="mr-2" />
					<h1>{{ country.countryName }}</h1>
				</div>
				<v-spacer></v-spacer>
				<div class="covid-country--nav-btns">
					<div
						class="covid-country--nav-btn mr-4"
						v-if="country.series.provinces.length > 0"
					>
						<router-link
							:to="`/country/${countryCode}/provinces`"
							class="covid-link"
						>
							<label class="mr-1"
								>{{
									country.series.provinces.length | number(0)
								}}
								{{ local.provinceName }}</label
							>
							<v-icon color="linkColor"
								>mdi-arrow-right-bold</v-icon
							>
						</router-link>
					</div>
					<div
						class="covid-country--nav-btn"
						v-if="country.borders.length > 0"
					>
						<router-link
							:to="`/country/${countryCode}/compare`"
							class="covid-link"
						>
							<label class="mr-1"
								>{{
									country.borders.length | number(0)
								}}
								Bordered Countries</label
							>
							<v-icon color="linkColor"
								>mdi-arrow-right-bold</v-icon
							>
						</router-link>
					</div>
				</div>
			</header>
			<div class="covid-country--stats">
				<RegionStats :region="country" />
				<div class="covid-country--stats-progress">
					<v-progress-circular
						:size="72"
						:width="10"
						:value="country.vaccinations.percent"
						color="#4CAF50"
					>
						{{ country.vaccinations.percent | number(0) }}%
					</v-progress-circular>
					<label>Vaccinated</label>
				</div>
			</div>
			<div class="covid-country--charts">
				<div class="covid-country--charts__chart pr-8">
					<h1>
						Daily Vaccinations
						<div>
							Total
							<span>{{
								country.vaccinations.total | number(0)
							}}</span>
						</div>
					</h1>
					<BasicChart
						:ts="country.vaccinations.data"
						color="#1976D2"
						chartType="bar"
						:name="`${country.countryName} Vaccinated`"
					/>
				</div>
				<div class="covid-country--charts__chart">
					<h1>
						Daily Confirmed
						<div>
							Latest
							<span>{{
								country.series.stats.latestConfirmed | number(0)
							}}</span>
						</div>
					</h1>
					<BasicChart
						:ts="country.series.ts.confirmedDailySeries"
						chartType="bar"
						:smats="country.series.ts.confirmedSMASeries"
						:name="`${country.countryName} Confirmed Daily Change`"
					/>
				</div>
			</div>
			<div class="covid-country--charts">
				<div class="covid-country--charts__chart pr-8">
					<h1>
						Daily Recovered
						<div>
							Latest
							<span>{{
								country.series.stats.latestRecovered | number(0)
							}}</span>
						</div>
					</h1>
					<BasicChart
						:ts="country.series.ts.recoveredDailySeries"
						chartType="bar"
						:smats="country.series.ts.recoveredSMASeries"
						:name="`${country.countryName} Recovered Daily Changge`"
					/>
				</div>
				<div class="covid-country--charts__chart">
					<h1>
						Daily Fatalities
						<div>
							Latest
							<span>{{
								country.series.stats.latestDeaths | number(0)
							}}</span>
						</div>
					</h1>
					<BasicChart
						:ts="country.series.ts.deathDailySeries"
						chartType="bar"
						:smats="country.series.ts.deathSMASeries"
						:name="`${country.countryName} Deaths Daily Changge`"
					/>
				</div>
			</div>
		</div>
	</article>
</template>

<script>
import { mapGetters } from "vuex";
import BasicChart from "@/views/common/BasicChart";
import RegionStats from "@/views/common/RegionStats";
import { getLocalProvince } from "@/utils";

export default {
	data() {
		return {
			country: {
				borders: [],
				series: {
					data: [],
					provinces: [],
					ts: {},
					stats: {},
					geojson: {},
				},
			},
		};
	},
	components: {
		BasicChart,
		RegionStats,
	},
	props: {
		countryCode: {
			type: String,
			default: "",
		},
	},
	computed: {
		...mapGetters(["findCountry"]),

		hasProvinces() {
			return this.country.series.provinces.length > 0;
		},

		local() {
			return getLocalProvince(this.countryCode);
		},

		lastUpdate() {
			if (
				this.country.series.ts.confirmedSeries &&
				this.country.series.ts.confirmedSeries.length > 0
			) {
				return this.country.series.ts.confirmedSeries[
					this.country.series.ts.confirmedSeries.length - 1
				][0];
			}
			return "";
		},
	},
	mounted() {
		this.loadData();
	},
	watch: {
		countryCode() {
			this.loadData();
		},
	},
	methods: {
		loadData() {
			this.$store.commit(
				"setCurrentCountryCode",
				this.countryCode
			); /* Used by Navigation */
			this.country = Object.freeze(this.findCountry(this.countryCode));
		},
	},
};
</script>

<style lang="less" scoped>
.covid-country--nav-btns {
	display: flex;
	align-items: center;
	.covid-country--nav-btn {
		display: flex;
		align-items: center;
		label {
			font-size: 13px;
			margin: 2px 0 0 0;
			color: #e0e0e0;
			cursor: pointer;
		}
		&:first-child {
			border-right: 1px solid #616161;
			padding: 0 12px 0 0;
		}
	}
}
header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin: 0 0 4px 0;
	.covid-country--title {
		display: flex;
		align-items: center;
		margin: 0 0 4px;
		h1 {
			font-size: 24px;
			font-weight: 400;
			span {
				margin: 0 0 0 8px;
				font-size: 11px;
				font-weight: 400;
			}
		}
	}
}
.covid-country--stats {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 0 12px 24px 0;
	.covid-country--stats-progress {
		display: flex;
		flex-direction: column;
		align-items: center;
		label {
			font-size: 13px;
			margin: 2px 0 0 0;
			font-weight: 300;
		}
	}
}
.covid-country--info__select {
	display: flex;
	justify-content: space-between;
	margin: 0 0 36px 0;
}
.covid-country--charts {
	display: flex;
	margin: 0 0 24px;
	.covid-country--charts__chart {
		width: 50%;
		display: flex;
		flex-direction: column;
		h1 {
			font-size: 16px;
			text-transform: uppercase;
			font-weight: 300;
			color: var(--section-header-color);
			margin: 0 0px 4px 0px;
			display: flex;
			justify-content: space-between;
			align-items: baseline;
			div {
				margin: 0 0px 0 0;
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
	.covid-country--charts {
		display: flex;
		margin: 0 0 24px;
		.covid-country--charts__chart:nth-child(1) {
			display: none;
		}
		.covid-country--charts__chart:nth-child(2) {
			width: 100%;
		}
	}
}
</style>