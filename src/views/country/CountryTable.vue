<template>
	<v-data-table
		:headers="headers"
		sort-by="latestConfirmed"
		sort-desc
		hide-default-footer
		:items="countryList"
		:items-per-page="30"
		class="covid-compare-table"
	>
		<template v-slot:header>
			<tr class="covid-compare-table--header">
				<td>
					<div>
						<img :src="country.flag" width="28" height="14" class="mr-2" />
						<span>{{country.countryName}}</span>
					</div>
				</td>
				<td>{{country.population | number(0)}}</td>
				<td>{{country.series.stats.totalConfirmed| number(0)}}</td>
				<td>
					<div class="covid-compare-table--spark">
						<Sparkline :ts="countryPerCapitaConfirmed.ts" />
						<label>{{countryPerCapitaConfirmed.value | number(0)}}</label>
					</div>
				</td>
				<td>
					<div class="covid-compare-table--spark">
						<Sparkline :ts="countryPerCapitaFatalities.ts" />
						<label>{{countryPerCapitaFatalities.value | number(0)}}</label>
					</div>
				</td>
				<td>
					<div class="covid-compare-table--spark">
						<Sparkline :ts="country.series.ts.confirmedDailySeries" />
						<label>{{country.series.stats.latestConfirmed | number(0)}}</label>
					</div>
				</td>
			</tr>
		</template>
		<template v-slot:item.country="{ item }">
			<router-link :to="`/country/${item.country.code}`" class="covid-compare-table--link covid-link">
				<img :src="item.country.flag" width="28" height="14" class="mr-2" />
				<span>
					<nobr>{{item.country.name}}</nobr>
				</span>
			</router-link>
		</template>
		<template v-slot:item.population="{ item }">{{item.population | number(0)}}</template>
		<template v-slot:item.totalConfirmed="{ item }">{{item.totalConfirmed | number(0)}}</template>
		<template v-slot:item.perCapitaConfirmed="{ item }">
			<div class="covid-compare-table--spark">
				<Sparkline :ts="item.perCapitaConfirmed.ts" />
				<label>{{item.perCapitaConfirmed.value | number(0)}}</label>
			</div>
		</template>
		<template v-slot:item.perCapitaFatalities="{ item }">
			<div class="covid-compare-table--spark">
				<Sparkline :ts="item.perCapitaFatalities.ts" />
				<label>{{item.perCapitaFatalities.value | number(0)}}</label>
			</div>
		</template>
		<template v-slot:item.latestConfirmed="{ item }">
			<div class="covid-compare-table--spark">
				<Sparkline :ts="item.latestConfirmed.ts" />
				<label>{{item.latestConfirmed.value | number(0)}}</label>
			</div>
		</template>
		<template v-slot:no-data>No Bordered Countries</template>
	</v-data-table>
</template>

<script>
import { createPerCapita, objectSorter } from "@/utils";
import Sparkline from "@/views/common/SparklineChart";

export default {
	props: {
		country: {
			series: {
				ts: {},
				stats: {}
			}
		},
		borderedCountries: {
			type: Array,
			default: () => []
		}
	},
	components: {
		Sparkline
	},
	data() {
		return {
			headers: [
				{
					text: "Country Name",
					align: "start",
					sortable: true,
					value: "country",
					sort: objectSorter("name"),
					width: "20%"
				},
				{
					text: "Population",
					align: "end",
					sortable: true,
					value: "population"
				},
				{
					text: "Total Confirmed",
					align: "end",
					sortable: true,
					value: "totalConfirmed"
				},
				{
					text: "Per 100,000 Confirmed",
					align: "start",
					sortable: true,
					value: "perCapitaConfirmed",
					sort: objectSorter("value")
				},
				{
					text: "Per 100,000 Fatalities",
					align: "start",
					sortable: true,
					value: "perCapitaFatalities",
					sort: objectSorter("value")
				},
				{
					text: "Latest Confirmed",
					align: "start",
					sortable: true,
					value: "latestConfirmed",
					sort: objectSorter("value")
				}
			]
		};
	},
	computed: {
		countryList() {
			return this.borderedCountries.map(item => {
				const perCapitaConfirmed = createPerCapita(
					item.series.ts.confirmedSeries,
					item.population
				);
				const perCapitaFatalities = createPerCapita(
					item.series.ts.deathSeries,
					item.population
				);
				return {
					country: {
						name: item.countryName,
						flag: item.flag,
						code: item.countryCode
					},
					population: item.population,
					totalConfirmed: item.series.stats.totalConfirmed,
					perCapitaConfirmed: {
						ts: perCapitaConfirmed,
						value:
							perCapitaConfirmed[perCapitaConfirmed.length - 1][1]
					},
					perCapitaFatalities: {
						ts: perCapitaFatalities,
						value:
							perCapitaFatalities[
								perCapitaFatalities.length - 1
							][1]
					},
					latestConfirmed: {
						ts: item.series.ts.confirmedDailySeries,
						value: item.series.stats.latestConfirmed
					}
				};
			});
		},
		countryPerCapitaConfirmed() {
			if (this.country.series.ts.confirmedSeries) {
				const perCapitaConfirmed = createPerCapita(
					this.country.series.ts.confirmedSeries,
					this.country.population
				);
				return {
					ts: perCapitaConfirmed,
					value: perCapitaConfirmed[perCapitaConfirmed.length - 1][1]
				};
			}
			return {
				ts: [],
				value: 0
			};
		},
		countryPerCapitaFatalities() {
			if (this.country.series.ts.deathSeries) {
				const perCapitaFatalities = createPerCapita(
					this.country.series.ts.deathSeries,
					this.country.population
				);
				return {
					ts: perCapitaFatalities,
					value:
						perCapitaFatalities[perCapitaFatalities.length - 1][1]
				};
			}
			return {
				ts: [],
				value: 0
			};
		}
	}
};
</script>

<style lang="less">
@highlight-color: rgba(67, 160, 71, 0.5);

.covid-compare-table {
	background-color: #212121 !important;
	.covid-compare-table--link {
		color: #fff;
		display: flex;
		align-items: center;
		span {
			color: var(--link-color);
		}
	}
	.covid-compare-table--spark {
		display: flex;
		align-items: flex-start;
		label {
			margin: 8px 0 0 12px;
			background-color: @highlight-color;
			height: max-content;
			padding: 4px 8px;
			border-radius: 0 4px 4px 0;
			line-height: 1.1;
			font-size: 11px;
			position: relative;
			color: #fff;
			&::after {
				position: absolute;
				top: 0;
				content: "";
				left: -10px;
				width: 0;
				height: 0;
				border-right: 10px solid @highlight-color;
				border-top: 10px solid transparent;
				border-bottom: 10px solid transparent;
			}
		}
	}
	.covid-compare-table--header {
		td {
			padding: 24px 16px;
			background-color: #303030;
			border-bottom: 3px solid @highlight-color;
			font-size: 14px;
			&:nth-child(2),
			&:nth-child(3) {
				text-align: right;
			}
		}
	}
	tr:hover {
		background: none !important;
	}
}
</style>