<template>
	<v-radio-group v-model="filter" active-class="covid-radio" dense hide-details>
		<div class="covid-map-filters">
			<h1>Filter Map by</h1>
			<div>
				<div class="covid-map--filters__radio">
					<v-radio hide-details label="Popluation" value="population" color="linkColor"></v-radio>
					<span>{{coverage.population | number(0)}}</span>
				</div>
				<label>Confirmed</label>
				<div class="covid-map--filters__radio">
					<v-radio hide-details label="Latest" value="latestConfirmed" color="linkColor"></v-radio>
					<span>{{coverage.stats.latestConfirmed | number(0)}}</span>
				</div>
				<div class="covid-map--filters__radio">
					<v-radio hide-details label="Total" value="totalConfirmed" color="linkColor"></v-radio>
					<span>{{coverage.stats.totalConfirmed | number(0)}}</span>
				</div>
				<label>Fatalities</label>
				<div class="covid-map--filters__radio">
					<v-radio hide-details label="Latest" value="latestFatalities" color="linkColor"></v-radio>
					<span>{{coverage.stats.latestDeaths | number(0)}}</span>
				</div>
				<div class="covid-map--filters__radio">
					<v-radio hide-details label="Total" value="totalFatalities" color="linkColor"></v-radio>
					<span>{{coverage.stats.totalDeaths | number(0)}}</span>
				</div>
				<label>Per Capita Confirmed</label>
				<div class="covid-map--filters__radio">
					<v-radio hide-details label="Latest" value="latestConfirmed14Day" color="linkColor"></v-radio>
					<span>
						{{coverage.stats.latestConfirmed14Day | number(0)}}
						<span>per 100,000</span>
					</span>
				</div>
				<div class="covid-map--filters__radio">
					<v-radio hide-details label="Total" value="totalConfirmed14Day" color="linkColor"></v-radio>
					<span>
						{{coverage.stats.totalConfirmed14Day | number(0)}}
						<span>per 100,000</span>
					</span>
				</div>
			</div>
		</div>
	</v-radio-group>
</template>

<script>
import EventBus from "@/events";
export default {
	props: {
		coverage: {
			type: Object,
			default: () => ({
				stats: {},
			}),
		},
	},
	mounted() {
		EventBus.$on("onNavFilterChange", (filter) => {
			this.filter = filter;
		});
	},
	data() {
		return {
			filter: "latestConfirmed",
		};
	},
	watch: {
		filter() {
			this.$emit("onFilterChange", this.filter);
			EventBus.$emit("onWorldMapFilterChange", this.filter);
		},
	},
};
</script>

<style lang="less" scoped>
.covid-map-filters {
	h1,
	label {
		font-size: 16px;
		text-transform: uppercase;
		font-weight: 300;
		color: var(--section-header-color);
		margin: 0 0 8px 8px;
	}
	label {
		font-size: 15px;
		text-transform: none;
	}
	.covid-map--filters__radio {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 320px;
		width: 100%;
		padding: 0px 8px 0 12px;
		span {
			font-size: 16px;
			margin: 0 0 4px;
			color: var(--section-header-color);
			font-weight: 300;
			color: #fff;
			span {
				margin: 0 0 0 4px;
				font-size: 11px;
			}
		}
	}
}
</style>