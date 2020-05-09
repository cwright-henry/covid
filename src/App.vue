<template>
	<v-app>
		<SplashScreen v-if="isLoading"></SplashScreen>
		<template v-else>
			<AppBar />
			<NavigationBar />
			<v-content>
				<v-container fluid>
					<div class="covid-perspective">
						<transition name="fade" mode="out-in">
							<keep-alive>
								<router-view></router-view>
							</keep-alive>
						</transition>
					</div>
				</v-container>
			</v-content>
			<v-snackbar
				v-model="msg"
				:top="top"
				:bottom="bottom"
				:left="left"
				:right="right"
				:timeout="timeout"
				:color="color"
			>
				{{ text }}
				<v-btn text @click="msg = false">Close</v-btn>
			</v-snackbar>
		</template>
	</v-app>
</template>

<script>
import { mapState } from "vuex";

import AppBar from "@/views/AppBar";
import NavigationBar from "@/views/NavigationBar";
import SplashScreen from "@/views/SplashScreen";
import EventBus from "@/events";

import { load } from "@/services/Api";
import {
	uuid,
	createGeoJson,
	getLatest,
	createSeriesCoverage,
	createdSeriesForCountry,
	findReplacementName
} from "@/utils";

export default {
	name: "App",

	data() {
		return {
			msg: false,
			timeout: 8000, // Allow 10 seconds to read error message
			text: "",
			color: "#53a318",
			top: true,
			bottom: false,
			left: false,
			right: false
		};
	},

	components: {
		AppBar,
		NavigationBar,
		SplashScreen
	},

	computed: {
		...mapState(["isLoading"])
	},

	async created() {
		try {
			this.$store.commit("isLoading", true);
			this.$store.commit("setLoadingStatus", "Country Data...");
			const countries = await load(
				"https://restcountries.eu/rest/v2/all"
			);
			this.$store.commit("setLoadingStatus", "Covid Data...");
			const cases = await load("https://api.covid19api.com/all");
			this.parseAndStore(countries, cases);
			this.$store.commit("setLoadingStatus", "Parsing...");
			setTimeout(() => {
				this.$store.commit("isLoading", false);
			}, 350);
		} catch (error) {
			EventBus.$emit("error", "Error connecting to services");
		}
	},

	mounted() {
		EventBus.$on("error", reason => {
			this.msg = true;
			this.text = reason;
			this.color = "#F44336";
		});
	},

	methods: {
		parseAndStore(countries, cases) {
			const data = [];
			for (const country of countries) {
				const entries = cases.filter(
					item => country.alpha2Code === item.CountryCode
				);
				if (entries.length > 0) {
					const name = findReplacementName(country.name);
					const item = {
						uuid: uuid(),
						countryName: name,
						filteredName: name.toLowerCase(),
						countryCode: country.alpha2Code,
						countryCode3: country.alpha3Code,
						flag: country.flag,
						population: country.population,
						lat: country.latlng[0],
						lng: country.latlng[1],
						borders: country.borders,
						area: country.area /* Square kilometers */,
						regionName: country.region,
						subRegionName: country.subregion,
						regionCode: country.regionalBlocs[0]
							? country.regionalBlocs[0].acronym
							: "Other",
						series: createdSeriesForCountry(
							entries,
							country.alpha2Code
						)
					};
					data.push({ ...item, ...getLatest(item) });
				}
			}
			this.$store.commit(
				"setGeoJson",
				Object.freeze(createGeoJson(data))
			);
			this.$store.commit("setData", Object.freeze(data));
			this.$store.commit(
				"setCoverage",
				Object.freeze(createSeriesCoverage(data))
			);
		}
	}
};
</script>

<style lang="less">
html,
body {
	min-height: 100%;
	scroll-behavior: smooth;
	background-color: #121212;
}
ul {
	padding: 0 !important;
	margin: 0;
	list-style: none;
}
:root {
	--app-header-color: #b3e5fc;
	--nav-region-header-color: #e1f5fe;
	--section-header-color: #b3e5fc;
	--link-color: #64b5f6;
}
.covid-link {
	text-decoration: none;
	padding: 2px 0;
	display: flex;
}
.covid-perspective {
	position: relative;
	max-width: 1750px;
	width: 100%;
	margin: 0 auto;
	perspective: 1200px;
	height: 100%;
	.covid-page {
		width: 100%;
		display: block;
		position: absolute;
		top: 0;
		left: 0;
		padding-bottom: 48px;
		backface-visibility: hidden;
		transform: translate3d(0, 0, 0);
		transform-style: preserve-3d;
		.covid-sheet {
			width: 100%;
			background-color: #212121;
			border: 1px solid #424242;
			border-radius: 4px;
			padding: 8px;
			overflow: hidden;
		}
	}
}
.fade-enter-active,
.fade-leave-active {
	transition-duration: 0.175s;
	transition-property: opacity;
	transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
	opacity: 0;
}
</style>
