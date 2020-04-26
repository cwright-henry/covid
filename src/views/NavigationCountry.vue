<template>
	<ul class="covid-nav-countries">
		<li v-for="country of countries" :key="country.uuid" :ref="country.countryCode">
			<router-link
				:to="`/country/${country.countryCode}`"
				class="covid-link covid-nav-countries--country"
			>
				<img :src="country.flag" width="28" class="mx-2" />
				<div class="covid-nav-countries--country__info">
					<h2>{{country.countryName}}</h2>
					<ul>
						<li class="mr-3">
							<label>Population</label>
							<span>{{country.population | number(0)}}</span>
						</li>
						<li class="mr-3">
							<label>Confirmed</label>
							<span>{{country.latestConfirmed | number(0)}}</span>
						</li>
						<li class="mr-3">
							<label>Recovered</label>
							<span>{{country.latestRecovered | number(0)}}</span>
						</li>
						<li>
							<label>Fatalities</label>
							<span>{{country.latestFatalities | number(0)}}</span>
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
		}
	},
	computed: {
		...mapState(["currentCountryCode"])
	},
	watch: {
		currentCountryCode() {
			this.scrollIntoView();
		}
	},
	methods: {
		scrollIntoView() {
			const current = this.$refs[this.currentCountryCode];
			if (current && current[0]) {
				current[0].scrollIntoView({
					behavior: "smooth",
					block: "center",
					inline: "nearest"
				});
			}
		}
	}
};
</script>

<style lang="less" scoped>
ul.covid-nav-countries {
	li {
		margin: 8px 0;
		.covid-nav-countries--country {
			display: flex;
			align-items: center;
			color: #fff;
			.covid-nav-countries--country__info {
				h2 {
					font-size: 18px;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					width: 220px;
					margin: 0 0 2px 0;
				}
				ul {
					display: flex;
					font-size: 11px;
					li {
						display: flex;
						flex-direction: column;
						align-items: flex-start;
						margin: 0;
					}
				}
			}
		}
	}
}
</style>