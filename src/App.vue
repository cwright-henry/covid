<template>
	<v-app>
		<SplashScreen
			v-if="isLoading"
			:isLoading="isLoading"
			:isRendering="isRendering"
			:isLoadError="isLoadError"
		></SplashScreen>
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
import { getCoverage } from "@/utils";
import CoverageWorker from "@/utils/utils.worker";

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
			transitionName: null,
			isLoadError: false,
			isRendering: false,
			isLoading: true
		};
	},

	components: {
		AppBar,
		NavigationBar,
		SplashScreen
	},
	async created() {
		const worker = await new CoverageWorker();
		try {
			this.isLoading = true;
			const { countries, coverage, regions } = await worker.getAll();
			this.isRendering = true;
			// Allow time for the splash screen to update
			// Why does not nexttick work???
			setTimeout(() => {
				this.$store.commit("setData", Object.freeze(countries));
				this.$store.commit("setCoverage", Object.freeze(coverage));
				this.$store.commit("setRegions", Object.freeze(regions));
				this.isLoading = false;
			}, 1000);
		} catch (error) {
			this.$root.gaExperience("error", error);
			this.isLoadError = true;
		}

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
[v-cloak] {
	display: none;
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
