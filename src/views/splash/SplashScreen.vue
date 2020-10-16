<template>
	<div class="covid-splashscreen">
		<div class="loading-wrapper">
			<h1>Covid 19 Watch</h1>
			<div class="animated-image">
				<img src="@/assets/covid.png" height="64" width="64" />
			</div>
			<ul>
				<li>
					<div class="covid-splashscreen--status">
						<v-icon
							size="18"
							color="#4CAF50"
							v-if="countryData.isFinished"
							>mdi-check</v-icon
						>
						<v-icon
							size="18"
							color="#F44336"
							v-else-if="countryData.isError"
							>mdi-alert-circle</v-icon
						>
						<v-icon
							size="18"
							color="#4CAF50"
							v-else-if="
								countryData.isLoading ||
								countryData.isConnecting
							"
							>mdi-arrow-right-bold</v-icon
						>
					</div>
					<label>{{ getStatus(countryData) }} Country List</label>
					<div
						class="covid-splashscreen--size"
						v-if="countryData.isConnecting"
					>
						connecting...
					</div>
					<div
						class="covid-splashscreen--size"
						v-else-if="
							countryData.isLoading || countryData.isFinished
						"
					>
						{{ countryData.comtentSize | number(0) }}
						<span class="ml-2">KB</span>
					</div>
					<div
						class="covid-splashscreen--size"
						v-else-if="countryData.isError"
					>
						No Connection
					</div>
				</li>
				<li>
					<div class="covid-splashscreen--status">
						<v-icon
							size="18"
							color="#4CAF50"
							v-if="usStatsData.isFinished"
							>mdi-check</v-icon
						>
						<v-icon
							size="18"
							color="#F44336"
							v-else-if="usStatsData.isError"
							>mdi-alert-circle</v-icon
						>
						<v-icon
							size="18"
							color="#4CAF50"
							v-else-if="
								usStatsData.isLoading ||
								usStatsData.isConnecting
							"
							>mdi-arrow-right-bold</v-icon
						>
					</div>
					<label>{{ getStatus(usStatsData) }} US Statistics</label>
					<div
						class="covid-splashscreen--size"
						v-if="usStatsData.isConnecting"
					>
						connecting...
					</div>
					<div
						class="covid-splashscreen--size"
						v-else-if="
							usStatsData.isLoading || usStatsData.isFinished
						"
					>
						{{ usStatsData.comtentSize | number(0) }}
						<span class="ml-2">KB</span>
					</div>
					<div
						class="covid-splashscreen--size"
						v-else-if="usStatsData.isError"
					>
						No Connection
					</div>
				</li>
				<li>
					<div class="covid-splashscreen--status">
						<v-icon
							size="18"
							color="#4CAF50"
							v-if="covidData.isFinished"
							>mdi-check</v-icon
						>
						<v-icon
							size="18"
							color="#F44336"
							v-else-if="covidData.isError"
							>mdi-alert-circle</v-icon
						>
						<v-icon
							size="18"
							color="#4CAF50"
							v-else-if="
								covidData.isLoading ||
								covidData.isConnecting ||
								covidData.isParsing
							"
							>mdi-arrow-right-bold</v-icon
						>
					</div>
					<label>{{ getStatus(covidData) }} Covid Data</label>
					<div
						class="covid-splashscreen--size"
						v-if="covidData.isConnecting"
					>
						connecting...
					</div>
					<div
						class="covid-splashscreen--size"
						v-else-if="
							covidData.isLoading ||
							covidData.isFinished ||
							covidData.isParsing
						"
					>
						{{ covidData.comtentSize | number(0) }}
						<span class="ml-2">KB</span>
					</div>
					<div
						class="covid-splashscreen--size"
						v-else-if="covidData.isError"
					>
						No Connection
					</div>
					<div
						class="covid-splashscreen--progress"
						v-if="covidData.isParsing"
					>
						<v-progress-linear
							color="#4CAF50"
							height="3"
							:value="covidData.percentParsed"
						>
						</v-progress-linear>
					</div>
				</li>
				<li>
					<div class="covid-splashscreen--status">
						<v-icon
							size="18"
							color="#4CAF50"
							v-if="processing.isFinished"
							>mdi-check</v-icon
						>
						<v-icon
							size="18"
							color="#4CAF50"
							v-else-if="processing.inProgress"
							>mdi-arrow-right-bold</v-icon
						>
					</div>
					<label>Population Analysed</label>
					<div class="covid-splashscreen--size">
						<span class="ml-2">{{
							processing.comtentSize | number(0)
						}}</span>
					</div>
				</li>
				<li
					:class="{ finished: processing.isFinished }"
					class="covid-splashscreen--rendering mt-6"
				>
					<div>Rendering Application</div>
					<v-progress-linear
						color="#FFEB3B"
						class="mt-4"
						buffer-value="0"
						stream
					></v-progress-linear>
				</li>
				<li
					:class="{ 'has-error': hasError }"
					class="covid-splashscreen--error mt-6"
					@click="reload"
				>
					<v-btn fab color="#F44336">
						<v-icon size="28" color="#FFF">mdi-refresh</v-icon>
					</v-btn>
					<label>Refresh</label>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
import Worker from "@/utils/utils.worker";
import EventBus from "@/events";

export default {
	data() {
		return {
			countryData: {
				isError: false,
				isConnecting: false,
				isLoading: false,
				isFinished: false,
				comtentSize: 0,
			},
			usStatsData: {
				isError: false,
				isConnecting: false,
				isLoading: false,
				isFinished: false,
				comtentSize: 0,
			},
			covidData: {
				isError: false,
				isConnecting: false,
				isLoading: false,
				isParsing: false,
				isFinished: false,
				comtentSize: 0,
				percentParsed: 0,
			},
			processing: {
				inProgress: false,
				isFinished: false,
				comtentSize: 0,
			},
		};
	},
	computed: {
		hasError() {
			return (
				this.countryData.isError ||
				this.usStatsData.isError ||
				this.covidData.isError
			);
		},
	},
	mounted() {
		const worker = new Worker();
		worker.postMessage({ msg: "getCoverage" });

		worker.onmessage = (event) => {
			switch (event.data.type) {
				case "complete":
					const { countries, coverage, regions } = event.data.results;
					this.$store.commit("setData", Object.freeze(countries));
					this.$store.commit("setCoverage", Object.freeze(coverage));
					this.$store.commit("setRegions", Object.freeze(regions));
					worker.terminate();
					this.$store.commit("isLoaded", true);
					break;
				case "url-download-started":
					if (event.data.contentId === "COUNTRY_LIST") {
						this.countryData.isConnecting = true;
					}
					if (event.data.contentId === "US_POPULATION") {
						this.usStatsData.isConnecting = true;
					}
					if (event.data.contentId === "COVID_DATA") {
						this.covidData.isConnecting = true;
					}
					break;
				case "url-download-in-progress":
					if (event.data.contentId === "COUNTRY_LIST") {
						this.countryData.isConnecting = false;
						this.countryData.isLoading = true;
						this.countryData.comtentSize =
							event.data.receivedLength / 1024;
					}
					if (event.data.contentId === "US_POPULATION") {
						this.usStatsData.isConnecting = false;
						this.usStatsData.isLoading = true;
						this.usStatsData.comtentSize =
							event.data.receivedLength / 1024;
					}
					if (event.data.contentId === "COVID_DATA") {
						this.covidData.isConnecting = false;
						this.covidData.isLoading = true;
						this.covidData.comtentSize =
							event.data.receivedLength / 1024;
					}
					break;
				case "url-download-parsing-progress":
					if (event.data.contentId === "COVID_DATA") {
						this.covidData.isLoading = false;
						this.covidData.isParsing = true;
					}
					break;
				case "url-download-unzip-progress":
					if (event.data.contentId === "COVID_DATA") {
						this.covidData.percentParsed = event.data.percent;
					}
					break;
				case "url-download-finished":
					if (event.data.contentId === "COUNTRY_LIST") {
						this.countryData.isFinished = true;
						this.countryData.isLoading = false;
					}
					if (event.data.contentId === "US_POPULATION") {
						this.usStatsData.isFinished = true;
						this.usStatsData.isLoading = false;
					}
					if (event.data.contentId === "COVID_DATA") {
						this.covidData.isFinished = true;
						this.covidData.isLoading = false;
						this.covidData.isParsing = false;
					}
					break;
				case "url-download-error":
					if (event.data.contentId === "COUNTRY_LIST") {
						this.countryData.isConnecting = false;
						this.countryData.isLoading = false;
						this.countryData.isError = true;
					}
					if (event.data.contentId === "US_POPULATION") {
						this.usStatsData.isConnecting = false;
						this.usStatsData.isLoading = false;
						this.usStatsData.isError = true;
					}
					if (event.data.contentId === "COVID_DATA") {
						this.covidData.isConnecting = false;
						this.covidData.isLoading = false;
						this.covidData.isError = true;
					}
					EventBus.$emit("onError", event.data.error);
					break;
				case "processing-data":
					this.processing.inProgress = true;
					break;
				case "parse-country":
					this.processing.comtentSize += event.data.population;
					break;
				case "parse-country-finished":
					this.processing.inProgress = false;
					this.processing.isFinished = true;
					break;
			}
		};

		worker.onerror = (event) => {
			this.$root.gaError("error", event.data);
			this.loadStatus.status = "error";
		};
	},

	methods: {
		reload() {
			window.location.reload(false);
		},

		getStatus(source) {
			if (source.isFinished) {
				return "Loaded";
			} else if (source.isError) {
				return "Failed";
			} else if (source.isParsing) {
				return "Parsing";
			}
			return "Loading";
		},
	},
};
</script>


<style lang="less">
.covid-splashscreen {
	display: flex;
	height: 100vh;
	align-items: center;
	justify-content: center;
	background: center/cover url("~@/assets/background.jpg") no-repeat;
	position: relative;

	.loading-wrapper {
		max-width: 520px;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		margin: -32px 0 0 0;

		h1 {
			color: #fff;
			font-weight: 300;
			font-size: 42px;
			margin: 0 0 16px;
			background-color: rgba(0, 0, 0, 0.1);
			font-family: "Merriweather", serif;
		}

		.animated-image {
			position: absolute;
			right: 20px;
			top: 20px;
			img {
				height: 48px;
				width: 48px;
				animation: spin 24s linear infinite;
			}
		}
		ul {
			margin: 24px 0 0 0;
			font-weight: 300;
			font-size: 18px;
			li {
				position: relative;
				display: flex;
				align-items: center;
				margin: 8px 0;
				border: 1px solid #424242;
				background-color: rgba(0, 0, 0, 0.85);
				border-radius: 4px;
				padding: 8px;
				label {
					width: 200px;
				}
				.covid-splashscreen--status {
					width: 48px;
					text-align: center;
				}
				.covid-splashscreen--size {
					width: 130px;
					text-align: right;
					word-break: keep-all;
					margin: 0 8px 0 0;
				}
				&.covid-splashscreen--rendering {
					justify-content: center;
					border: none;
					background-color: transparent;
					flex-direction: column;
					visibility: hidden;
					font-size: 20px;
					opacity: 0;
					transition: opacity 0.375s ease;
					&.finished {
						visibility: visible;
						opacity: 1;
					}
				}
				&.covid-splashscreen--error {
					justify-content: center;
					flex-direction: column;
					align-items: center;
					background-color: transparent;
					margin: -56px 0 0 0 !important;
					border: none;
					visibility: hidden;
					opacity: 0;
					transition: opacity 0.375s ease;
					label {
						width: auto;
						font-size: 14px;
						margin: 2px 0 0 0;
					}
					&.has-error {
						visibility: visible;
						opacity: 1;
					}
				}
				.covid-splashscreen--progress {
					position: absolute;
					left: 0;
					right: 0;
					bottom: 0px;
				}
			}
		}
	}

	@keyframes spin {
		100% {
			transform: rotate(360deg);
		}
	}
}
</style>