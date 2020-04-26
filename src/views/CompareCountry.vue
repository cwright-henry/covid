<template>
	<div class="covid-country-compare">
		<h1>Daily Confirmed</h1>
		<StackedChart :series="series" />
		<ul>
			<li
				v-for="country of countries"
				:key="country.country.countryCode"
				class="covid-country-compare"
				:class="getWidth()"
			>
				<header class="ml-3">
					<div class="covid-country-compare--title">
						<img :src="country.country.flag" width="20" class="mr-1" />
						<h2>{{country.country.countryName}}</h2>
					</div>
					<div class="covid-country-compare--latest">
						Latest
						<span>{{country.latestConfirmed | number(0)}}</span>
					</div>
				</header>
				<BasicChart
					:ts="country.confirmedDailySeries"
					chartType="bar"
					:color="country.color"
					:height="'200'"
					:name="`${country.country.countryName} Confirmed Daily Change`"
				/>
			</li>
		</ul>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import BasicChart from "./BasicChart";
import StackedChart from "./StackedChart";
import { findColor } from "@/utils";

export default {
	props: {
		comparisions: {
			type: Array,
			default: () => []
		},
		country: {
			type: Object,
			default: () => {}
		}
	},
	components: {
		BasicChart,
		StackedChart
	},
	data() {
		return {
			countries: [],
			series: []
		};
	},
	computed: {
		...mapGetters(["findCountry"])
	},
	watch: {
		comparisions: {
			handler() {
				this.loadData();
			},
			deep: true
		}
	},
	mounted() {
		this.loadData();
	},
	methods: {
		loadData() {
			this.countries = [];
			this.series = [];
			let colorIndex = 0;
			this.countries.push({
				country: this.country,
				type: "line",
				color: findColor(colorIndex++)
			});
			for (const countryCode of this.comparisions) {
				this.countries.push({
					country: this.findCountry(countryCode),
					type: "line",
					color: findColor(colorIndex++)
				});
			}

			for (const country of this.countries) {
				const series = country.country.series.data;

				// Confirmed
				const confirmedSeries = [];
				for (const { confirmed, date } of series) {
					confirmedSeries.push([date, confirmed]);
				}

				country.confirmedDailySeries = [];
				for (let i = 1; i < confirmedSeries.length; i++) {
					const date = confirmedSeries[i][0];
					const diff =
						confirmedSeries[i][1] - confirmedSeries[i - 1][1];
					country.confirmedDailySeries.push([date, diff]);
				}
				if (country.confirmedDailySeries.length > 0) {
					country.latestConfirmed =
						country.confirmedDailySeries[
							country.confirmedDailySeries.length - 1
						][1];
				}

				this.series.push({
					ts: country.confirmedDailySeries,
					name: country.country.countryName,
					type: country.type,
					color: country.color
				});
			}
		},

		getWidth() {
			return `li-${this.countries.length}	`;
		}
	}
};
</script>

<style lang="less" scoped>
.covid-country-compare {
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0 0 6px;
		.covid-country-compare--title {
			display: flex;
			align-items: center;
			h2 {
				font-size: 14px;
				text-transform: uppercase;
				font-weight: 300;
				color: #fff;
			}
		}
		.covid-country-compare--latest {
			margin: 0 16px 0 0;
			font-size: 12px;
			color: #e0e0e0;
			span {
				margin: 0 0 0 2px;
				font-size: 14px;
				color: #fff;
			}
		}
	}
	h1 {
		font-size: 16px;
		text-transform: uppercase;
		font-weight: 300;
		color: var(--section-header-color);
		margin: 0 0 8px 12px;
	}
	ul {
		display: flex;
		justify-content: flex-start;
		flex-wrap: wrap;
		margin: 24px 0 0 0;
		li {
			width: 20%;
			&.li-2 {
				width: 50%;
			}
			&.li-3 {
				width: 33%;
			}
			&.li-4 {
				width: 25%;
			}
		}
	}
}
</style>