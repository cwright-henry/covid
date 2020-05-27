<template>
	<v-navigation-drawer v-model="drawer" app clipped fixed width="320">
		<div class="covid-nav--top">
			<div class="covid-nav-world">
				<router-link to="/world" class="covid-link">
					<img src="../assets/earth.gif" width="28" height="28" class="mx-3" />
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
						<h1>Sort Countries By</h1>
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
					<NavigationCountry
						:countries="countries"
						:scroll="scroll"
						:filter="currentFilter"
						:search="search"
					/>
				</li>
			</ul>
			<NavigationCountry v-else :countries="items" :filter="currentFilter" :search="search" />
		</div>
	</v-navigation-drawer>
</template>

<script>
import { mapState } from "vuex";
import NavigationCountry from "./NavigationCountry";
import {
	arrangeByRegion,
	arrangeByPopulation,
	arrangeByTotalConfirmed,
	arrangeByTotalRecovered,
	arrangeByTotalFatalities,
	arrangeByLatestConfirmed,
	arrangeByLatestRecovered,
	arrangeByLatestFatalities
} from "@/utils";
import EventBus from "@/events";

export default {
	data() {
		return {
			search: null,
			drawer: !this.$vuetify.breakpoint.mdAndDown,
			currentFilter: "lastestconfirmed",
			sortFilters: [
				{ text: "Region", uuid: "region" },
				{ text: "Sub Region", uuid: "subregion" },
				{ text: "Total Population", uuid: "population" },
				{ text: "Latest Confirmed", uuid: "lastestconfirmed" },
				{ text: "Latest Recovered", uuid: "lastestrecovered" },
				{ text: "Latest Fatalities", uuid: "lastestfatalities" },
				{ text: "Total Confirmed", uuid: "confirmed" },
				{ text: "Total Recovered", uuid: "recovered" },
				{ text: "Total Fatalities", uuid: "fatalities" }
			],
			scroll: false
		};
	},
	components: {
		NavigationCountry
	},
	mounted() {
		EventBus.$on("toggleNavBar", () => {
			this.drawer = !this.drawer;
		});
		this.scroll = true;
	},
	watch: {
		currentFilter(filter) {
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
				this.$root.gaInteraction("Filter Change", filter);
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
					return arrangeByTotalConfirmed(data);
				case "recovered":
					return arrangeByTotalRecovered(data);
				case "fatalities":
					return arrangeByTotalFatalities(data);
				case "lastestconfirmed":
					return arrangeByLatestConfirmed(data);
				case "lastestrecovered":
					return arrangeByLatestRecovered(data);
				case "lastestfatalities":
					return arrangeByLatestFatalities(data);
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
		padding: 6px 4px !important;
		width: 200px;
		border-radius: 4px;
		cursor: pointer;
		border-bottom: 1px solid #424242;
		&:hover {
			background-color: #424242;
		}
		&.active {
			color: var(--link-color);
			i {
				color: var(--link-color);
			}
		}
		&:last-child {
			padding-bottom: 0 !important;
			border-bottom: none;
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