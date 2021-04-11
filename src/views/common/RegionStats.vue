<template>
	<section class="covid-region">
		<ul
			class="covid-region--stats"
			:class="{ slim: isSlim }"
			v-resize="onResize"
		>
			<li v-if="region.numCountries !== undefined && showCountries">
				<label>Countries</label>
				<div>{{ numCountries | number(0) }}</div>
			</li>
			<li v-if="showPopulation">
				<label>Population</label>
				<div>{{ population | number(0) }}</div>
			</li>
			<li v-if="showPerCapita">
				<label>Confirmed Per Capita Per 100,000</label>
				<div>
					<nobr>
						<span class="label">Total</span>
						<span class="ml-1">{{ perCapita | number(0) }}</span>
						<span class="label ml-3">Last 14 Days</span>
						<span class="ml-1">{{
							perCapitaLatest | number(0)
						}}</span>
					</nobr>
				</div>
			</li>
			<li>
				<label>Total Confirmed</label>
				<div>
					<span>{{ confirmed | number(0) }}</span>
					<span class="small"
						>{{ confirmedPercent | number(2) }}%</span
					>
				</div>
			</li>
			<li>
				<label>Total Fatalities</label>
				<div>
					<span>{{ fatalities | number(0) }}</span>
					<span class="small"
						>{{ fatalitiesPercent | number(2) }}%</span
					>
				</div>
			</li>
			<li>
				<label>Total Vaccinations</label>
				<div>
					<span>{{ vaccinations | number(0) }}</span>
				</div>
			</li>
		</ul>
		<Progress v-if="hasProgress" :value="fullyVaccinated" title="Fully Vaccinated"/>
	</section>
</template>

<script>
import Progress from './Progress'
export default {
	props: {
		region: {
			type: Object,
			default: () => {},
		},
		isSlim: {
			type: Boolean,
			default: false,
		},
		hasProgress: {
			type: Boolean,
			default: false,
		}
	},
	data() {
		return {
			windowWidth: 0,
		};
	},
	mounted() {
		this.onResize();
	},
	components: {
		Progress
	},
	computed: {
		fullyVaccinated() {
			return (this.region.fullyVaccinated / this.region.population) * 100;
		},
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

			return stats.totalConfirmed14Day;
		},
		perCapitaLatest() {
			const stats = this.region.series
				? this.region.series.stats
				: this.region.stats;

			return stats.latestConfirmed14Day;
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
		vaccinations() {
			if (this.region.vaccinations?.total !== undefined) {
				return this.region.vaccinations.total;
			}
			return this.region.vaccinations || 0;
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
		},
		showPopulation() {
			return this.windowWidth > 920;
		},
		showPerCapita() {
			return this.windowWidth > 760;
		},
		showCountries() {
			return this.windowWidth > 610;
		},
	},
	methods: {
		onResize() {
			this.windowWidth = window.innerWidth;
		},
	},
};
</script>

<style lang="less" scoped>
.covid-region {
	display: flex;
	justify-content: space-between;
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
					font-size: 11px;
				}
				span.label {
					font-size: 10px;
					text-transform: uppercase;
					font-weight: 400;
					color: #e0e0e0;
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
}
@media screen and (max-width: 520px) {
	ul.covid-region--stats {
		display: none;
	}
}
</style>