<template>
	<v-app-bar app fixed clipped-left prominent color="primary">
		<v-app-bar-nav-icon color="#fff" @click="toggleNavBar"></v-app-bar-nav-icon>
		<div class="covid-appbar--header ml-4">
			<h1>
				Covid 19
				<span>Last Updated: {{total.date | date-long}}</span>
			</h1>
			<ul>
				<li class="mr-8">
					<label>Countries</label>
					<div>{{data.length | number(0)}}</div>
				</li>
				<li class="mr-8">
					<label>Population</label>
					<div>{{coverage.population | number(0)}}</div>
				</li>
				<li class="mr-8">
					<label>Confirmed</label>
					<div>
						{{total.confirmed | number(0)}}
						<span>{{confirmedRate | number(2)}}%</span>
					</div>
				</li>
				<li class="mr-8">
					<label>Recovered</label>
					<div>
						{{total.recovered | number(0)}}
						<span>{{ this.recoveryRate | number(2)}}%</span>
					</div>
				</li>
				<li>
					<label>Fatalities</label>
					<div>
						{{total.deaths | number(0)}}
						<span>{{fatalityRate | number(2)}}%</span>
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
	data() {
		return {
			confirmedRate: 0,
			fatalityRate: 0,
			recoveryRate: 0
		};
	},
	computed: {
		...mapState(["coverage", "data"]),

		total() {
			if (this.coverage.data && this.coverage.data.length > 1) {
				const coverage = this.coverage.data[
					this.coverage.data.length - 1
				];

				this.confirmedRate =
					(coverage.confirmed / this.coverage.population) * 100;

				if (coverage.confirmed !== 0) {
					this.fatalityRate =
						(coverage.deaths / coverage.confirmed) * 100;
				}

				if (coverage.confirmed !== 0) {
					this.recoveryRate =
						(coverage.recovered / coverage.confirmed) * 100;
				}

				return coverage;
			}
			return {};
		}
	},
	methods: {
		toggleNavBar() {
			EventBus.$emit("toggleNavBar");
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