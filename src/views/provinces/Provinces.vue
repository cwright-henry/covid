<template>
	<article class="covid-page covid-provinces">
		<router-link :to="`/country/${countryCode}`" class="covid-link">
			<v-icon class="mb-2">mdi-arrow-left</v-icon>
		</router-link>
		<div class="covid-sheet">
			<header>
				<div class="covid-provinces--title">
					<img :src="country.flag" width="36" class="mr-3" />
					<h1>{{country.countryName}}</h1>
				</div>
			</header>
			<ul class="covid-provinces--info">
				<li class="mr-3">
					<label>Population</label>
					<div>{{country.population | number(0)}}</div>
				</li>
				<li class="mr-3">
					<label>Confirmed</label>
					<div>
						{{country.series.stats.totalConfirmed | number(0)}}
						<span>{{(country.series.stats.totalConfirmed / country.population) * 100 | number(2)}}%</span>
					</div>
				</li>
				<li class="mr-3">
					<label>Recovered</label>
					<div>
						{{country.series.stats.totalRecovered | number(0)}}
						<span>{{(country.series.stats.totalRecovered / country.series.stats.totalConfirmed) * 100 | number(2)}}%</span>
					</div>
				</li>
				<li class="mr-3">
					<label>Fatalities</label>
					<div>
						{{country.series.stats.totalDeaths | number(0)}}
						<span>{{(country.series.stats.totalDeaths / country.series.stats.totalConfirmed) * 100 | number(2)}}%</span>
					</div>
				</li>h
			</ul>
			<ProvinceMapView :coverage="country" :local="local" class="mb-8" />
			<ProvinceListView :country="country" :local="local" />
		</div>
	</article>
</template>

<script>
import { mapGetters } from "vuex";
import ProvinceMapView from "./ProvinceMapView";
import { getLocalProvince } from "@/utils";
import ProvinceListView from "./ProvinceListView";

export default {
	props: {
		countryCode: {
			type: String,
			default: ""
		}
	},
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
		ProvinceMapView,
		ProvinceListView
	},
	computed: {
		...mapGetters(["findCountry"]),

		local() {
			return getLocalProvince(this.countryCode);
		}
	},
	watch: {
		countryCode() {
			this.loadData();
		}
	},
	mounted() {
		this.loadData();
	},
	methods: {
		loadData() {
			this.country = Object.freeze(this.findCountry(this.countryCode));
		}
	}
};
</script>

<style lang="less">
.covid-provinces {
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0 0 12px 0;
		.covid-provinces--title {
			display: flex;
			align-items: center;
			h1 {
				font-size: 24px;
				font-weight: 400;
			}
		}
	}
	ul.covid-provinces--info {
		display: flex;
		margin: 0 0 24px 0;
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
}
</style>