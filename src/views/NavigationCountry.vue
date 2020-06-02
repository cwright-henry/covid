<template>
	<ul class="covid-nav-countries">
		<li v-for="(country, index) of countries" :key="country.uuid" :ref="country.countryCode">
			<router-link
				:to="`/country/${country.countryCode}`"
				class="covid-link covid-nav-countries--country"
			>
				<div class="covid-nav-countries--rank">
					<img :src="country.flag" width="28" height="14" class="mx-2" />
					<span v-if="hasRank">{{index + 1}}</span>
				</div>
				<div class="covid-nav-countries--country__info">
					<h2 :title="country.countryName">
						{{country.countryName}}
						<span>{{filterType === 'totals' ? "Total" : "Latest"}}</span>
					</h2>
					<ul>
						<li class="mr-3">
							<label>Population</label>
							<span :class="{isHighlighted : isPopulationSelected}">{{country.population | number(0)}}</span>
						</li>
						<li class="mr-3">
							<label>Confirmed</label>
							<span
								:class="{isHighlighted : isConfirmedSelected}"
							>{{filterType === 'totals' ? country.series.stats.totalConfirmed : country.series.stats.latestConfirmed | number(0)}}</span>
						</li>
						<li class="mr-3">
							<label>Recovered</label>
							<span
								:class="{isHighlighted : isRecoveredSelected}"
							>{{filterType === 'totals' ? country.series.stats.totalRecovered : country.series.stats.latestRecovered | number(0)}}</span>
						</li>
						<li>
							<label>Fatalities</label>
							<span
								:class="{isHighlighted : isFatalitiesSelected}"
							>{{filterType === 'totals' ? country.series.stats.totalDeaths : country.series.stats.latestDeaths | number(0)}}</span>
						</li>
					</ul>
				</div>
			</router-link>
		</li>
	</ul>
</template>

<script>
import { mapState } from "vuex";
import EventBus from "@/events";

export default {
	props: {
		countries: {
			type: Array,
			default: () => []
		},
		scroll: {
			type: Boolean,
			default: false
		},
		filter: {
			type: String,
			default: null
		},
		search: {
			type: String,
			default: null
		}
	},
	computed: {
		...mapState(["currentCountryCode"]),

		filterType() {
			switch (this.filter) {
				case "region":
				case "subregion":
				case "population":
				case "totalConfirmed":
				case "totalRecovered":
				case "totalFatalities":
					return "totals";
				case "latestConfirmed":
				case "latestRecovered":
				case "latestFatalities":
					return "latest";
			}
			return "totals";
		},

		hasRank() {
			if (this.search) {
				return false;
			}
			switch (this.filter) {
				case "region":
				case "subregion":
					return false;
				case "population":
				case "totalConfirmed":
				case "totalRecovered":
				case "totalFatalities":
				case "latestConfirmed":
				case "latestRecovered":
				case "latestFatalities":
					return true;
			}
			return true;
		},

		isPopulationSelected() {
			return this.filter === "population";
		},
		isConfirmedSelected() {
			return (
				this.filter === "totalConfirmed" ||
				this.filter === "latestConfirmed"
			);
		},
		isRecoveredSelected() {
			return (
				this.filter === "totalRecovered" ||
				this.filter === "latestRecovered"
			);
		},
		isFatalitiesSelected() {
			return (
				this.filter === "totalFatalities" ||
				this.filter === "latestFatalities"
			);
		}
	},
	watch: {
		scroll: {
			handler: function() {
				this.scrollIntoView();
			}
		}
	},
	methods: {
		scrollIntoView() {
			/**
			 * Let the navigation render
			 */
			this.$nextTick(() => {
				const current = this.$refs[this.currentCountryCode];
				if (current && current[0]) {
					current[0].scrollIntoView({
						behavior: "smooth",
						block: "center",
						inline: "nearest"
					});
				}
			});
		}
	}
};
</script>

<style lang="less" scoped>
ul.covid-nav-countries {
	li {
		margin: 12px 0;
		.covid-nav-countries--rank {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: flex-start;
			margin: 6px 0 0 0;
			span {
				font-size: 11px;
				font-weight: 300;
				text-transform: uppercase;
				display: inline-block;
				margin: 8px 0 0 0;
			}
		}
		.covid-nav-countries--country {
			display: flex;
			align-items: flex-start;
			color: #fff;
			.covid-nav-countries--country__info {
				h2 {
					font-size: 18px;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					width: 220px;
					margin: 0 0 2px 0;
					font-weight: 500;
					span {
						font-size: 9px;
						font-weight: 300;
						text-transform: uppercase;
						display: inline-block;
						margin: 0 0 0 2px;
					}
				}
				ul {
					display: flex;
					font-size: 11px;
					li {
						display: flex;
						flex-direction: column;
						align-items: flex-start;
						margin: 0;
						&:first-child {
							width: 70px;
						}
						span.isHighlighted {
							color: #FFF9C4;
						}
					}
				}
			}
		}
	}
}
</style>