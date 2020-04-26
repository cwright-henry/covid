<template>
	<div>
		<div class="covid-country--charts">
			<div class="covid-country--charts__chart">
				<h1>Cumulative Confirmed</h1>
				<BasicChart :ts="confirmedSeries" chartType="line" :name="`${country.countryName} Confirmed`" />
			</div>
			<div class="covid-country--charts__chart">
				<h1>
					Daily Confirmed
					<div>
						Latest
						<span>{{latestConfirmed | number(0)}}</span>
					</div>
				</h1>
				<BasicChart
					:ts="confirmedDailySeries"
					chartType="bar"
					:name="`${country.countryName} Confirmed Daily Change`"
				/>
			</div>
		</div>
		<div class="covid-country--charts">
			<div class="covid-country--charts__chart">
				<h1>Cumulative Recovered</h1>
				<BasicChart :ts="recoveredSeries" chartType="line" :name="`${country.countryName} Recovered`" />
			</div>
			<div class="covid-country--charts__chart">
				<h1>
					Daily Recovered
					<div>
						Latest
						<span>{{latestRecovered | number(0)}}</span>
					</div>
				</h1>
				<BasicChart
					:ts="recoveredDailySeries"
					chartType="bar"
					:name="`${country.countryName} Recovered Daily Changge`"
				/>
			</div>
		</div>
		<div class="covid-country--charts">
			<div class="covid-country--charts__chart">
				<h1>Cumulative Fatalities</h1>
				<BasicChart :ts="deathSeries" chartType="line" :name="`${country.countryName} Deaths`" />
			</div>
			<div class="covid-country--charts__chart">
				<h1>
					Daily Fatalities
					<div>
						Latest
						<span>{{latestDeaths | number(0)}}</span>
					</div>
				</h1>
				<BasicChart
					:ts="deathDailySeries"
					chartType="bar"
					:name="`${country.countryName} Deaths Daily Changge`"
				/>
			</div>
		</div>
		<div class="covid-country--charts__provinces" v-if="country.series.provinces.length > 0">
			<h1>Confirmed Cases By Province</h1>
			<ul class="covid-country--charts__provinces">
				<li v-for="(province, index) of country.series.provinces" :key="province.uuid">
					<h1>{{province.name}}</h1>
					<BasicChart
						:ts="getConfirmedSeries(province.data)"
						chartType="bar"
						height="200"
						:color="findAColor(index)"
						:name="`${province.name} Deaths Daily Changge`"
					/>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
import BasicChart from "./BasicChart";
import { findColor } from "@/utils";

export default {
	props: {
		country: {
			type: Object,
			default: () => {
				series: {
					data: [];
					provinces: [];
				}
			}
		}
	},
	data() {
		return {
			confirmedSeries: [],
			confirmedDailySeries: [],
			recoveredSeries: [],
			recoveredDailySeries: [],
			deathSeries: [],
			deathDailySeries: [],
			latestConfirmed: 0,
			latestRecovered: 0,
			latestDeaths: 0
		};
	},
	components: {
		BasicChart
	},
	watch: {
		country() {
			this.loadData();
		}
	},
	mounted() {
		this.loadData();
	},
	methods: {
		findAColor(index) {
			return findColor(index);
		},

		getConfirmedSeries(series) {
			const confirmedSeries = [];
			for (let i = 1; i < series.length; i++) {
				const date = series[i].date;
				const diff = series[i].confirmed - series[i - 1].confirmed;
				confirmedSeries.push([date, diff]);
			}
			return confirmedSeries;
		},

		loadData() {
			if (this.country.series) {
				const series = this.country.series.data;

				this.confirmedSeries = [];
				this.recoveredSeries = [];
				this.deathSeries = [];
				this.confirmedDailySeries = [];
				this.recoveredDailySeries = [];
				this.deathDailySeries = [];
				for (const { confirmed, recovered, deaths, date } of series) {
					this.confirmedSeries.push([date, confirmed]);
					this.recoveredSeries.push([date, recovered]);
					this.deathSeries.push([date, deaths]);
				}

				for (let i = 1; i < this.confirmedSeries.length; i++) {
					const date = this.confirmedSeries[i][0];
					const diff =
						this.confirmedSeries[i][1] -
						this.confirmedSeries[i - 1][1];
					this.confirmedDailySeries.push([date, diff]);
				}
				if (this.confirmedDailySeries.length > 0) {
					this.latestConfirmed = this.confirmedDailySeries[
						this.confirmedDailySeries.length - 1
					][1];
				}

				for (let i = 1; i < this.recoveredSeries.length; i++) {
					const date = this.recoveredSeries[i][0];
					const diff =
						this.recoveredSeries[i][1] -
						this.recoveredSeries[i - 1][1];
					this.recoveredDailySeries.push([date, diff]);
				}
				if (this.recoveredDailySeries.length > 0) {
					this.latestRecovered = this.recoveredDailySeries[
						this.recoveredDailySeries.length - 1
					][1];
				}

				for (let i = 1; i < this.deathSeries.length; i++) {
					const date = this.deathSeries[i][0];
					const diff =
						this.deathSeries[i][1] - this.deathSeries[i - 1][1];
					this.deathDailySeries.push([date, diff]);
				}
				if (this.deathDailySeries.length > 0) {
					this.latestDeaths = this.deathDailySeries[
						this.deathDailySeries.length - 1
					][1];
				}
			}
		}
	}
};
</script>

<style lang="less" scoped>
.covid-country--charts {
	display: flex;
	margin: 0 0 24px;
	.covid-country--charts__chart {
		width: 50%;
		display: flex;
		flex-direction: column;
		h1 {
			font-size: 16px;
			text-transform: uppercase;
			font-weight: 300;
			color: var(--section-header-color);
			margin: 0 0 4px 12px;
			display: flex;
			justify-content: space-between;
			align-items: baseline;
			div {
				margin: 0 16px 0 0;
				font-size: 12px;
				color: #e0e0e0;
				span {
					margin: 0 0 0 2px;
					font-size: 16px;
					color: var(--section-header-color);
				}
			}
		}
	}
}
.covid-country--charts__provinces {
	h1 {
		font-size: 16px;
		text-transform: uppercase;
		font-weight: 300;
		color: var(--section-header-color);
		margin: 0 0 12px 12px;
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		li {
			width: 25%;
			h1 {
				font-size: 13px;
				text-transform: uppercase;
				font-weight: 300;
				color: #fff;
				margin: 0 0 4px 12px;
			}
		}
	}
}
</style>