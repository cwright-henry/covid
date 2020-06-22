<template>
	<ul class="covid-region--stats" :class="{slim: isSlim}">
		<li v-if="region.numCountries !== undefined">
			<label>Countries</label>
			<div>{{numCountries | number(0)}}</div>
		</li>
		<li>
			<label>Population</label>
			<div>{{population | number(0)}}</div>
		</li>
		<li>
			<label>Per Capita</label>
			<div>
				<span>{{perCapita | number(0)}}</span>
				<span class="small">per 100,000</span>
			</div>
		</li>
		<li>
			<label>Confirmed</label>
			<div>
				<span>{{confirmed | number(0)}}</span>
				<span class="small">{{confirmedPercent | number(2)}}%</span>
			</div>
		</li>
		<li>
			<label>Recovered</label>
			<div>
				<span>{{recovered | number(0)}}</span>
				<span class="small">{{recoveredPercent | number(2)}}%</span>
			</div>
		</li>
		<li>
			<label>Fatalities</label>
			<div>
				<span>{{fatalities | number(0)}}</span>
				<span class="small">{{fatalitiesPercent | number(2)}}%</span>
			</div>
		</li>
	</ul>
</template>

<script>
export default {
	props: {
		region: {
			type: Object,
			default: () => {}
		},
		isSlim: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		numCountries() {
			return this.region.numCountries;
		},
		population() {
			return this.region.population;
		},
		perCapita() {
			const stats = this.region.series
				? this.region.series.stats
				: this.region.stats;

			return (stats.totalConfirmed / this.region.population) * 100000;
		},
		confirmed() {
			const stats = this.region.series
				? this.region.series.stats
				: this.region.stats;
			return stats.totalConfirmed;
		},
		confirmedPercent() {
			const stats = this.region.series
				? this.region.series.stats
				: this.region.stats;
			return (stats.totalConfirmed / this.region.population) * 100;
		},
		recovered() {
			const stats = this.region.series
				? this.region.series.stats
				: this.region.stats;
			return stats.totalRecovered;
		},
		recoveredPercent() {
			const stats = this.region.series
				? this.region.series.stats
				: this.region.stats;
			return (stats.totalRecovered / stats.totalConfirmed) * 100;
		},
		fatalities() {
			const stats = this.region.series
				? this.region.series.stats
				: this.region.stats;
			return stats.totalDeaths;
		},
		fatalitiesPercent() {
			const stats = this.region.series
				? this.region.series.stats
				: this.region.stats;
			return (stats.totalDeaths / stats.totalConfirmed) * 100;
		}
	}
};
</script>

<style lang="less" scoped>
ul.covid-region--stats {
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
		margin: 0 16px 0 0;
		label {
			font-size: 14px;
			color: var(--app-header-color);
		}
		div {
			font-size: 18px;
			span.small {
				margin: 0 0 0 4px;
				font-size: 12px;
			}
		}
	}

	&.slim {
		li {
			background-color: transparent;
			border: none;
			border-right: 1px solid #757575;
			border-radius: 0px;
			padding: 4px 24px 8px 24px;
			margin: 0 0 0 0;
			min-width: auto;
			&:first-child {
				padding: 4px 16px 8px 0;
			}
			&:last-child {
				border-right: none;
			}
		}
	}
}
</style>