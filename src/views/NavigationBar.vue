<template>
	<v-navigation-drawer v-model="drawer" app clipped fixed width="320">
		<div class="covid-nav--top">
			<div class="covid-nav-world">
				<router-link to="/world" class="covid-link">
					<img src="../assets/earth.gif" width="28" class="mx-3" />
					<h1>World View</h1>
				</router-link>
				<v-spacer></v-spacer>
				<v-menu
					origin="top right"
					transition="scale-transition"
					:close-on-content-click="true"
					:nudge-width="0"
					offset-y
					left
				>
					<template v-slot:activator="{ on }">
						<v-btn dark icon v-on="on">
							<v-icon>mdi-dots-vertical</v-icon>
						</v-btn>
					</template>
					<div class="covid-nav-world--filters">
						<h1>Sort Countries</h1>
						<ul>
							<li
								v-for="filter of sortFilters"
								:key="filter.uuid"
								:class="{'active': currentFilter === filter.uuid}"
								@click="currentFilter = filter.uuid"
							>
								{{filter.text}}
								<v-icon v-if="currentFilter === filter.uuid" size="22" class="mr-1">mdi-check</v-icon>
							</li>
						</ul>
					</div>
				</v-menu>
			</div>
			<div class="covid-nav-search">
				<v-text-field
					v-model="search"
					dense
					color="#E0E0E0"
					prepend-inner-icon="mdi-magnify"
					placeholder="search"
					flat
					clearable
					outlined
					hide-details
					maxlength="128"
				></v-text-field>
			</div>
		</div>
		<div ref="regionList">
			<ul
				v-if="currentFilter === 'region' || currentFilter === 'subregion'"
				class="covid-nav--region-list"
			>
				<li v-for="(countries, region) in items" :key="region" class="covid-nav--region">
					<h1>{{region}}</h1>
					<NavigationCountry :countries="countries" />
				</li>
			</ul>
			<NavigationCountry v-else :countries="items" />
		</div>
	</v-navigation-drawer>
</template>

<script>
import { mapState } from "vuex";
import NavigationCountry from "./NavigationCountry";
import {
	getLastest,
	arrangeByRegion,
	arrangeByPopulation,
	arrangeByConfirmed,
	arrangeByRecovered,
	arrangeByFatalities
} from "@/utils";
import EventBus from "@/events";

export default {
	data() {
		return {
			search: null,
			drawer: !this.$vuetify.breakpoint.mdAndDown,
			currentFilter: "subregion",
			sortFilters: [
				{ text: "By Region", uuid: "region" },
				{ text: "By Sub Region", uuid: "subregion" },
				{ text: "By Population", uuid: "population" },
				{ text: "By Confirmed", uuid: "confirmed" },
				{ text: "By Recovered", uuid: "recovered" },
				{ text: "By Fatalities", uuid: "fatalities" }
			]
		};
	},
	components: {
		NavigationCountry
	},
	mounted() {
		EventBus.$on("toggleNavBar", () => {
			this.drawer = !this.drawer;
		});
	},
	watch: {
		currentFilter(filter) {
			console.log(filter);
			this.$nextTick(() => {
				const selector =
					filter === "region" || filter === "subregion"
						? "ul > li > ul > li"
						: "ul > li";
				this.search = null;
				this.$refs["regionList"]
					.querySelector(selector)
					.scrollIntoView({
						behavior: "auto",
						block: "center",
						inline: "nearest"
					});
			});
		}
	},
	computed: {
		...mapState(["data"]),

		items() {
			const searchTerm = this.search
				? this.search.trim().toLowerCase()
				: null;

			let data = this.data;
			if (searchTerm) {
				data = this.data.filter(item => {
					return item.filteredName.indexOf(searchTerm) !== -1;
				});
			}

			switch (this.currentFilter) {
				case "region":
					return arrangeByRegion(data);
				case "subregion":
					return arrangeByRegion(data, true);
				case "population":
					return arrangeByPopulation(data);
				case "confirmed":
					return arrangeByConfirmed(data);
				case "recovered":
					return arrangeByRecovered(data);
				case "fatalities":
					return arrangeByFatalities(data);
			}
			return [];
		}
	}
};
</script>

<style lang="less">
.covid-nav-world--filters {
	background-color: #212121;
	padding: 8px;
	h1 {
		font-size: 14px;
		text-transform: uppercase;
		font-weight: 400;
		padding: 0 4px;
		color: var(--app-header-color);
	}
	ul li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 4px 0 !important;
		padding: 4px 4px !important;
		width: 200px;
		border-radius: 4px;
		cursor: pointer;
		&:hover {
			background-color: #424242;
		}
		&.active {
			color: var(--link-color);
			i {
				color: var(--link-color);
			}
		}
	}
}
</style>

<style lang="less">
.router-link-active {
	color: var(--link-color) !important;
	h1 {
		color: var(--link-color) !important;
	}
}
</style>

<style lang="less" scoped>
.covid-nav--top {
	position: sticky;
	top: 0px;
	background-color: #363636;
	padding: 0 0 12px 0;
}
.covid-nav-world {
	padding: 12px 0 16px;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	color: #fff;
	h1 {
		text-transform: uppercase;
		font-size: 18px;
		font-weight: 400;
		letter-spacing: 0.01em;
		color: #fff;
	}
	.covid-nav-world--filters {
		background-color: #212121;
	}
}
.covid-nav-search {
	margin: 0 8px;
}
ul.covid-nav--region-list {
	li:first-child {
		h1 {
			margin: 12px 8px 8px 8px;
		}
	}
	li {
		h1 {
			margin: 36px 8px 8px 8px;
			border-radius: 4px;
			font-size: 16px;
			font-weight: 300;
			text-transform: uppercase;
			color: var(--nav-region-header-color);
		}
	}
}
</style>