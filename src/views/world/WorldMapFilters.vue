<template>
	<v-radio-group
		v-model="filter"
		active-class="covid-radio"
		dense
		hide-details
		@change="onFilterChange()"
	>
		<div class="covid-map-filters">
			<h1>Filter Map by</h1>
			<div>
				<div class="covid-map--filters__radio">
					<v-radio hide-details label="Popluation" value="population" color="linkColor"></v-radio>
					<span>{{coverage.population | number(0)}}</span>
				</div>
				<div class="covid-map--filters__radio">
					<v-radio hide-details label="Latest Confirmed" value="latestConfirmed" color="linkColor"></v-radio>
					<span>{{coverage.stats.latestConfirmed | number(0)}}</span>
				</div>
				<div class="covid-map--filters__radio">
					<v-radio hide-details label="Latest Recovered" value="latestRecovered" color="linkColor"></v-radio>
					<span>{{coverage.stats.latestRecovered | number(0)}}</span>
				</div>
				<div class="covid-map--filters__radio">
					<v-radio hide-details label="Latest Fatalities" value="latestDeaths" color="linkColor"></v-radio>
					<span>{{coverage.stats.latestDeaths | number(0)}}</span>
				</div>
				<div class="covid-map--filters__radio">
					<v-radio hide-details label="Total Confirmed" value="totalConfirmed" color="linkColor"></v-radio>
					<span>{{coverage.stats.totalConfirmed | number(0)}}</span>
				</div>
				<div class="covid-map--filters__radio">
					<v-radio hide-details label="Total Recovered" value="totalRecovered" color="linkColor"></v-radio>
					<span>{{coverage.stats.totalRecovered | number(0)}}</span>
				</div>
				<div class="covid-map--filters__radio">
					<v-radio hide-details label="Total Fatalities" value="totalDeaths" color="linkColor"></v-radio>
					<span>{{coverage.stats.totalDeaths | number(0)}}</span>
				</div>
			</div>
		</div>
	</v-radio-group>
</template>

<script>
export default {
	props: {
		coverage: {
			type: Object,
			default: () => ({
				stats: {}
			})
		}
	},
	data() {
		return {
			filter: "latestConfirmed"
		};
	},
	methods: {
		onFilterChange() {
			this.$emit("onFilterChange", this.filter);
		}
	}
};
</script>

<style lang="less" scoped>
.covid-map-filters {
	h1 {
		font-size: 16px;
		text-transform: uppercase;
		font-weight: 300;
		color: var(--section-header-color);
		margin: 0 0 8px 8px;
	}
	.covid-map--filters__radio {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 320px;
		width: 100%;
		padding: 4px 0px 0 8px;
		span {
			font-size: 16px;
			margin: 0 0 4px;
			color: var(--section-header-color);
			font-weight: 300;
		}
	}
}
</style>