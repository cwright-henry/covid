<template>
	<section>
		<div class="covid-map--container">
			<div id="worldMap" ref="map"></div>
		</div>
		<div class="covid-map--filters">
			<WorldMapFilters :coverage="coverage" @onFilterChange="onFilterChange" />
			<WorldMapSlider
				class="mt-6"
				:currentFilter="filter"
				:coverage="coverage"
				@coverageChange="coverageChange"
			/>
		</div>
	</section>
</template>

<script>
import mapboxgl from "mapbox-gl";
import WorldMapFilters from "./WorldMapFilters";
import WorldMapSlider from "./WorldMapSlider";

export default {
	props: {
		coverage: {
			type: Object,
			default: () => ({
				stats: {},
				history: []
			})
		}
	},
	components: {
		WorldMapFilters,
		WorldMapSlider
	},
	data() {
		return {
			accessToken: `pk.eyJ1IjoiY3dyaWdodDEyMyIsImEiOiJjazh6cDU0Z2gxbGFnM2dva2FicTAwejQ3In0.d5_v9j64wbF6aUJYhQUvVQ`,
			mapStyle: "mapbox://styles/mapbox/dark-v10?optimize=true",
			viewState: {
				longitude: 50,
				latitude: 20,
				zoom: 1,
				bearing: 0,
				pitch: 0,
				antialias: true
			},
			mapLoaded: false,
			filter: "latestConfirmed",
			counter: 0
		};
	},
	created() {
		// creating a non reactive map object
		this.map = null;
	},
	mounted() {
		this.map = new mapboxgl.Map({
			accessToken: this.accessToken,
			container: this.$refs.map,
			style: this.mapStyle,
			center: [this.viewState.longitude, this.viewState.latitude],
			zoom: this.viewState.zoom,
			pitch: this.viewState.pitch,
			bearing: this.viewState.bearing,
			antialias: this.viewState.antialias
		});

		this.map.on("load", () => {
			this.loadLayer();
			this.mapLoaded = true;
		});
	},
	watch: {
		coverage() {
			this.setDataSource();
		},

		mapLoaded() {
			this.setDataSource();
		}
	},
	computed: {
		lastDate() {
			return this.coverage.history.length - 1;
		}
	},
	methods: {
		coverageChange(current) {
			this.map
				.getSource("coverage")
				.setData(this.coverage.history[current][this.filter]);
		},

		setDataSource() {
			if (this.mapLoaded) {
				this.map
					.getSource("coverage")
					.setData(this.coverage.history[this.lastDate][this.filter]);
			}
		},

		onFilterChange(filter) {
			this.filter = filter;
			if (this.filter !== "population") {
				this.map
					.getSource("coverage")
					.setData(this.coverage.history[this.lastDate][this.filter]);
			}
			this.map.setLayoutProperty("coverage-labels", "text-field", [
				"concat",
				["to-string", ["get", "name"]],
				"\n",
				["to-string", ["get", this.filter]]
			]);

			switch (this.filter) {
				case "population":
					this.map.setPaintProperty(
						"coverage-labels",
						"text-color",
						"#A5D6A7"
					);
					break;
				case "latestConfirmed":
					this.map.setPaintProperty("coverage-labels", "text-color", [
						"interpolate",
						["cubic-bezier", 0, 0.5, 1, 0.5],
						["get", "latestConfirmedRaw"],
						500,
						"#FFF176",
						1000,
						"#F44336"
					]);
					break;
				case "latestRecovered":
					this.map.setPaintProperty("coverage-labels", "text-color", [
						"interpolate",
						["cubic-bezier", 0, 0.5, 1, 0.5],
						["get", "latestRecoveredRaw"],
						100,
						"#C8E6C9",
						2000,
						"#4CAF50"
					]);
					break;
				case "latestDeaths":
					this.map.setPaintProperty("coverage-labels", "text-color", [
						"interpolate",
						["cubic-bezier", 0, 0.5, 1, 0.5],
						["get", "latestDeathsRaw"],
						0,
						"#FFF176",
						10,
						"#F44336"
					]);
					break;
				case "totalConfirmed":
					this.map.setPaintProperty("coverage-labels", "text-color", [
						"interpolate",
						["cubic-bezier", 0, 0.5, 1, 0.5],
						["get", "totalConfirmedRaw"],
						1000,
						"#FFF176",
						50000,
						"#F44336"
					]);
					break;
				case "totalRecovered":
					this.map.setPaintProperty("coverage-labels", "text-color", [
						"interpolate",
						["cubic-bezier", 0, 0.5, 1, 0.5],
						["get", "totalRecoveredRaw"],
						100,
						"#C8E6C9",
						2000,
						"#4CAF50"
					]);
					break;
				case "totalDeaths":
					this.map.setPaintProperty("coverage-labels", "text-color", [
						"interpolate",
						["cubic-bezier", 0, 0.5, 1, 0.5],
						["get", "totalDeathsRaw"],
						10,
						"#FFF176",
						1000,
						"#F44336"
					]);
					break;
			}
		},

		loadLayer() {
			this.map.addSource("coverage", {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: []
				}
			});

			this.map.addLayer({
				id: "coverage-circles",
				type: "circle",
				source: "coverage",
				paint: {
					"circle-radius": 3,
					"circle-opacity": 0.75,
					"circle-color": "#B3E5FC"
				}
			});

			this.map.addLayer({
				id: "coverage-labels",
				type: "symbol",
				source: "coverage",
				layout: {
					"text-field": [
						"concat",
						["to-string", ["get", "name"]],
						"\n",
						["to-string", ["get", "latestConfirmed"]]
					],
					"text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
					"text-size": 11
				},
				paint: {
					"text-color": [
						"interpolate",
						["cubic-bezier", 0, 0.5, 1, 0.5],
						["get", "latestConfirmedRaw"],
						500,
						"#FFF176",
						1000,
						"#F44336"
					]
				}
			});

			this.map.on("click", "coverage-labels", e => {
				this.$router.push({
					path: `/country/${e.features[0].properties.countryCode}`
				});
			});

			this.map.on("mouseenter", "coverage-labels", () => {
				this.map.getCanvas().style.cursor = "pointer";
			});

			this.map.on("mouseleave", "coverage-labels", () => {
				this.map.getCanvas().style.cursor = "";
			});
		}
	}
};
</script>

<style lang="less" scoped>
section {
	display: flex;
	flex-wrap: wrap;

	.covid-map--container {
		width: 75%;
		height: 500px;
		position: relative;
		overflow: hidden;
		#worldMap {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}
	}
	.covid-map--filters {
		flex: 1;
		margin: 0 0 0 12px;
		h1 {
			font-size: 16px;
			text-transform: uppercase;
			font-weight: 300;
			color: var(--section-header-color);
			margin: 0 0 4px 8px;
		}
	}
	.v-input--selection-controls {
		margin: 0;
	}
}
</style>