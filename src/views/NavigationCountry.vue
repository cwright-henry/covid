<template>
	<transition-group
		tag="ul"
		@enter="enter"
		:css="false"
		@before-leave="beforeLeave"
		class="covid-nav-countries"
	>
		<li v-for="(country, index) of countries" :key="country.uuid" :ref="country.countryCode">
			<router-link
				:to="`/country/${country.countryCode}`"
				class="covid-link covid-nav-countries--country"
			>
				<div class="covid-nav-countries--rank">
					<img :src="country.flag" width="28" height="14" class="mx-2" />
					<span v-if="hasRank">{{index + 1}}</span>
					<v-icon :class="{'up': isCovidIncreasing(country), 'pad': !hasRank}">mdi-play</v-icon>
				</div>
				<div class="covid-nav-countries--country__info">
					<h2 :title="country.countryName">
						{{country.countryName}}
						<span>{{filterType === 'totals' ? "Total" : "Latest"}}</span>
					</h2>
					<ul>
						<li class="mr-2">
							<label>Population</label>
							<span :class="{isHighlighted : isPopulationSelected}">{{country.population | number(0)}}</span>
						</li>
						<li class="mr-2">
							<label>Confirmed</label>
							<span
								:class="{isHighlighted : isConfirmedSelected}"
							>{{filterType === 'totals' ? country.series.stats.totalConfirmed : country.series.stats.latestConfirmed | number(0)}}</span>
						</li>
						<li class="mr-2">
							<label>Fatalities</label>
							<span
								:class="{isHighlighted : isFatalitiesSelected}"
							>{{filterType === 'totals' ? country.series.stats.totalDeaths : country.series.stats.latestDeaths | number(0)}}</span>
						</li>
						<li>
							<label>Per Capita Confirmed</label>
							<span :class="{isHighlighted : isPerCapitaelected}">
								{{filterType === 'totals' ? country.series.stats.totalConfirmed14Day : country.series.stats.latestConfirmed14Day | number(0)}}
								<span>{{filterType === 'totals' ? '/ 100,000' : '/ 100,000 / last 14 Days'}}</span>
							</span>
						</li>
					</ul>
				</div>
			</router-link>
		</li>
	</transition-group>
</template>

<script>
import { mapState } from "vuex";
import EventBus from "@/events";
import { animation } from "@/utils";

export default {
	props: {
		countries: {
			type: Array,
			default: () => [],
		},
		scroll: {
			type: Boolean,
			default: false,
		},
		filter: {
			type: String,
			default: null,
		},
		search: {
			type: String,
			default: null,
		},
	},
	mixins: [animation],
	computed: {
		...mapState(["currentCountryCode"]),

		filterType() {
			switch (this.filter) {
				case "region":
				case "subregion":
				case "population":
				case "totalConfirmed":
				case "totalConfirmed14Day":
				case "totalFatalities":
					return "totals";
				case "latestConfirmed":
				case "latestConfirmed14Day":
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
				case "totalConfirmed14Day":
				case "totalFatalities":
				case "latestConfirmed":
				case "latestConfirmed14Day":
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
		isPerCapitaelected() {
			return (
				this.filter === "totalConfirmed14Day" ||
				this.filter === "latestConfirmed14Day"
			);
		},
		isFatalitiesSelected() {
			return (
				this.filter === "totalFatalities" ||
				this.filter === "latestFatalities"
			);
		},
	},
	watch: {
		scroll: {
			handler: function () {
				this.scrollIntoView();
			},
		},
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
						inline: "nearest",
					});
				}
			});
		},

		isCovidIncreasing(country) {
			return country.series.stats.slope > 0;
		},
	},
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
			i {
				margin: -4px 0 0 0;
				z-index: -1;
				color: #4caf50;
				transform: rotate(90deg);
				&.up {
					color: #f44336;
					transform: rotate(-90deg);
				}
				&.pad {
					margin: 12px 0 0 0;
				}
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
					width: 260px;
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
							color: var(--section-header-color);
						}
						span span {
							font-size: 9px;
							color: #e0e0e0;
						}
					}
				}
			}
		}
	}
}
</style>