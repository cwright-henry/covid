<template>
	<v-app>
		<SplashScreen v-if="isLoading"></SplashScreen>
		<template v-else>
			<AppBar />
			<NavigationBar />
			<v-content>
				<v-container fluid>
					<div class="covid-perspective">
						<transition :name="transitionName">
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
	createGeoJson,
	parse,
	createSeriesCoverage,
	parseIreland
} from "@/utils";

const COUNTRY_API = "https://restcountries.eu/rest/v2/all";
const CASES_API = "https://api.covid19api.com/all";
const IRELAND_API =
	"https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/Covid19CountyStatisticsHPSCIrelandOpenData/FeatureServer/0/query?where=TimeStampDate%20%3E%3D%20TIMESTAMP%20%272020-03-12%2000%3A00%3A00%27%20&outFields=CountyName,PopulationCensus16,Lat,Long,ConfirmedCovidCases,TimeStampDate&outSR=4326&f=json";

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
			right: false,
			transitionName: null
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
		this.$router.beforeEach((to, from, next) => {
			if (from.name === "country" && to.name === "provinces") {
				this.transitionName = "slide-left";
			} else if (from.name === "provinces" && to.name === "country") {
				this.transitionName = "slide-right";
			} else {
				this.transitionName = "fade";
			}

			next();
		});

		try {
			this.$store.commit("isLoading", true);
			this.$store.commit("setLoadingStatus", "Country Data...");
			const countries = await load(COUNTRY_API);
			const irelandData = await load(IRELAND_API);
			this.$store.commit("setLoadingStatus", "Covid Data...");
			const cases = await load(CASES_API);
			this.parseAndStore(countries, cases, irelandData);
			this.$store.commit("setLoadingStatus", "Parsing...");
			setTimeout(() => {
				this.$store.commit("isLoading", false);
			}, 350);
		} catch (error) {
			console.log(error);
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
		parseAndStore(countryData, casesData, irelandData) {
			const countries = parse(countryData, casesData);
			const ireland = parseIreland(irelandData);
			const ieData = countries.find(item => item.countryCode === "IE");
			if (ieData) {
				ieData.geojson = ireland.geojson;
				ieData.population = ireland.population;
				ieData.series.provinces = ireland.provinces;
			}

			this.$store.commit("setData", Object.freeze(countries));
			this.$store.commit(
				"setCoverage",
				Object.freeze(createSeriesCoverage(countries))
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
	--link-color: #fff9c4;
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
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
	transition-duration: 0.475s;
	transition-property: all;
	transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
	overflow: hidden;
}

.slide-left-enter,
.slide-right-leave-active {
	opacity: 0;
	transform: translate(100%, 0) !important;
}

.slide-left-leave-active,
.slide-right-enter {
	opacity: 0;
	max-width: 1750px;
	transform: translate(-100%, 0) !important;
}
</style>
