<template>
	<article class="covid-page">
		<div class="covid-sheet">
			<header>
				<div class="covid-country--title">
					<img :src="country.flag" width="36" class="mr-3" />
					<h1>{{country.countryName}}</h1>
				</div>
			</header>
			<ul class="covid-country--info">
				<li class="mr-3">
					<label>Population</label>
					<div>{{country.population | number(0)}}</div>
				</li>
				<li class="mr-3" v-if="country.series.provinces.length > 0">
					<label>Provinces</label>
					<div>{{country.series.provinces.length | number(0)}}</div>
				</li>
				<li class="mr-3">
					<label>Confirmed</label>
					<div>
						{{country.latestConfirmed | number(0)}}
						<span>{{country.latestConfirmedRate | number(2)}}%</span>
					</div>
				</li>
				<li class="mr-3">
					<label>Recovered</label>
					<div>
						{{country.latestRecovered | number(0)}}
						<span>{{country.latestRecoveryRate | number(2)}}%</span>
					</div>
				</li>
				<li class="mr-3">
					<label>Fatalities</label>
					<div>
						{{country.latestFatalities | number(0)}}
						<span>{{country.latestFatalityRate | number(2)}}%</span>
					</div>
				</li>
			</ul>
			<div class="covid-country--info__select">
				<CountrySelect :country="country" @compareChange="compareChange" />
			</div>
			<SingleCountry v-if="comparisions.length === 0" :country="country" />
			<CompareCountry v-else :country="country" :comparisions="comparisions" />
		</div>
	</article>
</template>

<script>
import { mapGetters } from "vuex";
import BasicChart from "./BasicChart";
import CountrySelect from "./CountrySelect";
import SingleCountry from "./SingleCountry";
import CompareCountry from "./CompareCountry";

export default {
	data() {
		return {
			country: {
				series: {
					data: [],
					provinces: []
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
		BasicChart,
		CountrySelect,
		SingleCountry,
		CompareCountry
	},
	props: {
		countryCode: {
			type: String,
			default: ""
		}
	},
	computed: {
		...mapGetters(["findCountry"])
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
			this.country = this.findCountry(this.countryCode);
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

			this.percentRecovered =
				(this.country.latestRecovered /
					(this.country.latestConfirmed -
						this.country.latestFatalities)) *
				100;
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
	justify-content: flex-start;
	margin: 0 0 36px 0;
}
ul.covid-country--info {
	display: flex;
	margin: 0 0 16px 0;
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
</style>