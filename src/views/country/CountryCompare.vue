<template>
	<article class="covid-page covid-compare">
		<router-link :to="`/country/${countryCode}`" class="covid-link">
			<v-icon class="mb-2">mdi-arrow-left</v-icon>
		</router-link>
		<div class="covid-sheet">
			<header>
				<div class="covid-country--title">
					<img :src="country.flag" width="36" class="mr-3" />
					<h1>{{country.countryName}}</h1>
				</div>
				<v-spacer></v-spacer>
			</header>
			<section>
				<RegionStats :region="country" />
				<CountryTable class="mt-8" :country="country" :borderedCountries="borderedCountries" />
			</section>
		</div>
	</article>
</template>

<script>
import { mapGetters } from "vuex";
import RegionStats from "@/views/common/RegionStats";
import CountrySelect from "./CountrySelect";
import CountryTable from "./CountryTable";
import { findColor } from "@/utils";

export default {
	data() {
		return {
			country: {
				series: {
					data: [],
					provinces: [],
					ts: {},
					stats: {}
				},
				borders: []
			},
			aggregation: "perCapita",
			dataType: "latestConfirmed",
			borderedCountries: []
		};
	},
	props: {
		countryCode: {
			type: String,
			default: ""
		}
	},
	components: {
		CountrySelect,
		CountryTable,
		RegionStats
	},
	computed: {
		...mapGetters(["findCountry", "findCountry3"])
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
		loadData() {
			this.$store.commit("setCurrentCountryCode", this.countryCode);
			this.country = Object.freeze(this.findCountry(this.countryCode));
			this.borderedCountries = [];
			for (let i = 0; i < this.country.borders.length; i++) {
				const country = this.findCountry3(this.country.borders[i]);
				if (country) {
					this.borderedCountries.push(country);
				}
			}
		}
	}
};
</script>

<style lang="less" scoped>
.covid-compare {
	header {
		display: flex;
		align-items: flex-start;
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
	section {
		.covid-compare--data-filters {
			display: flex;
			justify-content: flex-start;
			> div {
				display: flex;
				flex-direction: column;
				&:nth-child(2) {
					border-left: 1px solid #757575;
					padding: 0 0 0 24px;
					margin: 0 0 0 12px;
				}
				label {
					margin: 0 0 -16px 4px;
					font-weight: 300;
					font-size: 13px;
				}
			}
		}
	}
}
</style>