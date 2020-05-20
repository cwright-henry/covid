<template>
	<article class="covid-page">
		<div class="covid-sheet">
			<header>
				<div class="covid-country--title">
					<img :src="country.flag" width="36" class="mr-3" />
					<h1>{{country.countryName}}</h1>
				</div>
				<v-spacer></v-spacer>
				<v-btn
					v-if="country.series.provinces.length > 0"
					color="linkColor"
					outlined
					small
					:to="`/country/${countryCode}/provinces`"
				>
					{{country.series.provinces.length | number(0)}} {{local.provinceName}}
					<v-icon size="20" right>mdi-arrow-right-bold-circle</v-icon>
				</v-btn>
				<v-btn class="ml-8" color="linkColor" outlined small :to="`/country/${countryCode}/provinces`">
					Compare To
					<v-icon size="20" right>mdi-arrow-right-bold-circle</v-icon>
				</v-btn>
			</header>
			<ul class="covid-country--info">
				<li class="mr-3">
					<label>Population</label>
					<div>{{country.population | number(0)}}</div>
				</li>
				<li class="mr-3">
					<label>Population Density</label>
					<div>
						{{country.population / country.area | number(0)}}
						<span>
							per km
							<sup>2</sup>
						</span>
					</div>
				</li>
				<li class="mr-3">
					<label>Confirmed</label>
					<div>
						{{country.latestConfirmed | number(0)}}
						<span>{{(country.latestConfirmed / country.population) * 100 | number(2)}}%</span>
					</div>
				</li>
				<li class="mr-3">
					<label>Recovered</label>
					<div>
						{{country.latestRecovered | number(0)}}
						<span>{{(country.latestRecovered / country.latestConfirmed) * 100 | number(2)}}%</span>
					</div>
				</li>
				<li class="mr-3">
					<label>Fatalities</label>
					<div>
						{{country.latestFatalities | number(0)}}
						<span>{{(country.latestFatalities / country.latestConfirmed) * 100 | number(2)}}%</span>
					</div>
				</li>
			</ul>
			<div class="covid-country--charts">
				<div class="covid-country--charts__chart">
					<h1>
						Cumulative Confirmed
						<div>
							Latest
							<span>{{country.series.stats.totalConfirmed | number(0)}}</span>
						</div>
					</h1>
					<BasicChart
						:ts="country.series.ts.confirmedSeries"
						chartType="line"
						:name="`${country.countryName} Confirmed`"
					/>
				</div>
				<div class="covid-country--charts__chart">
					<h1>
						Daily Confirmed
						<div>
							Latest
							<span>{{country.series.stats.latestConfirmed | number(0)}}</span>
						</div>
					</h1>
					<BasicChart
						:ts="country.series.ts.confirmedDailySeries"
						chartType="bar"
						:name="`${country.countryName} Confirmed Daily Change`"
					/>
				</div>
			</div>
			<div class="covid-country--charts">
				<div class="covid-country--charts__chart">
					<h1>
						Cumulative Recovered
						<div>
							Latest
							<span>{{country.series.stats.totalRecovered | number(0)}}</span>
						</div>
					</h1>
					<BasicChart
						:ts="country.series.ts.recoveredSeries"
						chartType="line"
						:name="`${country.countryName} Recovered`"
					/>
				</div>
				<div class="covid-country--charts__chart">
					<h1>
						Daily Recovered
						<div>
							Latest
							<span>{{country.series.stats.latestRecovered | number(0)}}</span>
						</div>
					</h1>
					<BasicChart
						:ts="country.series.ts.recoveredDailySeries"
						chartType="bar"
						:name="`${country.countryName} Recovered Daily Changge`"
					/>
				</div>
			</div>
			<div class="covid-country--charts">
				<div class="covid-country--charts__chart">
					<h1>
						Cumulative Fatalities
						<div>
							Latest
							<span>{{country.series.stats.totalDeaths | number(0)}}</span>
						</div>
					</h1>
					<BasicChart
						:ts="country.series.ts.deathSeries"
						chartType="line"
						:name="`${country.countryName} Deaths`"
					/>
				</div>
				<div class="covid-country--charts__chart">
					<h1>
						Daily Fatalities
						<div>
							Latest
							<span>{{country.series.stats.latestDeaths | number(0)}}</span>
						</div>
					</h1>
					<BasicChart
						:ts="country.series.ts.deathDailySeries"
						chartType="bar"
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
import { getLocalProvince } from "@/utils";

export default {
	data() {
		return {
			country: {
				series: {
					data: [],
					provinces: [],
					ts: {},
					stats: {},
					geojson: {}
				}
			},
			confirmed: 0,
			recovered: 0,
			deaths: 0,
			deathRate: 0,
			comparisions: []
		};
	},
	components: {
		BasicChart
	},
	props: {
		countryCode: {
			type: String,
			default: ""
		}
	},
	computed: {
		...mapGetters(["findCountry"]),

		hasProvinces() {
			return this.country.series.provinces.length > 0;
		},

		local() {
			return getLocalProvince(this.countryCode);
		}
	},
	mounted() {
		this.loadData();
	},
	watch: {
		countryCode() {
			this.loadData();
		}
	},
	methods: {
		compareChange(values) {
			this.comparisions = values;
		},

		loadData() {
			this.$store.commit("setCurrentCountryCode", this.countryCode);
			this.country = Object.freeze(this.findCountry(this.countryCode));
			const series = this.country.series.data;
			if (series.length > 1) {
				const lastest = series[series.length - 1];
				const previous = series[series.length - 2];
				this.confirmed = lastest.confirmed;
				this.recovered = lastest.recovered;
				this.deaths = lastest.deaths;

				if (this.confirmed) {
					this.deathRate = (this.deaths / this.confirmed) * 100;
				}
			}
		}
	}
};
</script>

<style lang="less" scoped>
header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin: 0 0 12px 0;
	.covid-country--title {
		display: flex;
		align-items: center;
		h1 {
			font-size: 24px;
			font-weight: 400;
		}
	}
}
.covid-country--info__select {
	display: flex;
	justify-content: space-between;
	margin: 0 0 36px 0;
}
ul.covid-country--info {
	display: flex;
	margin: 0 0 32px 0;
	li {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		border-radius: 4px;
		background-color: #424242;
		padding: 8px 16px;
		min-width: 170px;
		border: 1px solid #616161;
		label {
			font-size: 14px;
			color: var(--app-header-color);
		}
		div {
			font-size: 18px;
			span {
				margin: 0 0 0 4px;
				font-size: 13px;
			}
		}
	}
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
</style>