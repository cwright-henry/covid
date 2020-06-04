<template>
	<v-app-bar app fixed clipped-left prominent color="primary">
		<v-app-bar-nav-icon color="#fff" @click="toggleNavBar"></v-app-bar-nav-icon>
		<div class="covid-appbar--header ml-4">
			<h1>
				Covid 19 Watch
				<span>Last Updated: {{coverage.lastestDate | date-long}}</span>
			</h1>
			<ul>
				<li class="mr-8">
					<label>Countries</label>
					<div>{{coverage.numCountries | number(0)}}</div>
				</li>
				<li class="mr-8">
					<label>Population</label>
					<div>{{coverage.population | number(0)}}</div>
				</li>
				<li class="mr-8">
					<label>Confirmed</label>
					<div>
						{{coverage.stats.totalConfirmed | number(0)}}
						<span>{{(coverage.stats.totalConfirmed / coverage.population) * 100 | number(2)}}%</span>
					</div>
				</li>
				<li class="mr-8">
					<label>Recovered</label>
					<div>
						{{coverage.stats.totalRecovered | number(0)}}
						<span>{{(coverage.stats.totalRecovered / coverage.stats.totalConfirmed) * 100 | number(2)}}%</span>
					</div>
				</li>
				<li>
					<label>Fatalities</label>
					<div>
						{{coverage.stats.totalDeaths | number(0)}}
						<span>{{(coverage.stats.totalDeaths / coverage.stats.totalConfirmed) * 100 | number(2)}}%</span>
					</div>
				</li>
			</ul>
		</div>
		<v-spacer></v-spacer>
	</v-app-bar>
</template>

<script>
import { mapState } from "vuex";
import EventBus from "@/events";

export default {
	computed: {
		...mapState(["coverage"])
	},
	methods: {
		toggleNavBar() {
			EventBus.$emit("onToggleNavBar");
		}
	}
};
</script>

<style lang="less">
.covid-appbar--header {
	display: flex;
	align-items: flex-start;
	flex-direction: column;
	justify-content: center;
	h1 {
		font-size: 28px;
		font-weight: 400;
		margin: 4px 0;
		span {
			font-size: 13px;
		}
	}
	ul {
		display: flex;
		margin: 8px 0 0 0;
		li {
			display: flex;
			flex-direction: column;
			border-right: 1px solid #757575;
			padding: 0 24px 0 0;
			label {
				font-size: 13px;
				color: var(--app-header-color);
			}
			div {
				font-size: 18px;
				span {
					margin: 0 0 0 4px;
					font-size: 13px;
				}
			}

			&:last-child {
				border-right: none;
				padding: 0 0 0 0;
			}
		}
	}
}
</style>