<template>
	<section>
		<div class="covid-province-map--container">
			<div id="provinceMap" ref="map"></div>
		</div>
		<div class="covid-province-map--filters">
			<ProvinceMapFilters :country="coverage" @onFilterChange="onFilterChange" />
		</div>
	</section>
</template>

<script>
import mapboxgl from "mapbox-gl";
import ProvinceMapFilters from "./ProvinceMapFilters";

export default {
	props: {
		coverage: {
			type: Object,
			default: () => ({
				stats: {}
			})
		},
		local: {
			type: Object,
			default: () => {}
		}
	},
	components: {
		ProvinceMapFilters
	},
	data() {
		return {
			accessToken: `pk.eyJ1IjoiY3dyaWdodDEyMyIsImEiOiJjazh6cDU0Z2gxbGFnM2dva2FicTAwejQ3In0.d5_v9j64wbF6aUJYhQUvVQ`,
			mapStyle: "mapbox://styles/mapbox/dark-v10?optimize=true",
			viewState: {
				longitude: 50,
				latitude: 20,
				zoom: 3,
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
	methods: {
		setDataSource() {
			if (this.mapLoaded) {
				this.map.getSource("coverage").setData(this.coverage.geojson);
				this.map.flyTo({
					// These options control the ending camera position: centered at
					// the target, at zoom level 9, and north up.
					center: [this.coverage.lng, this.coverage.lat],
					zoom: this.local.zoom,
					pitch: this.local.pitch,

					// These options control the flight curve, making it move
					// slowly and zoom out almost completely before starting
					// to pan.
					speed: 1, // make the flying slow
					curve: 1, // change the speed at which it zooms out

					// This can be any easing function: it takes a number between
					// 0 and 1 and returns another number between 0 and 1.
					easing: function(t) {
						return t;
					},

					// this animation is considered essential with respect to prefers-reduced-motion
					essential: true
				});
			}
		},

		onFilterChange(filter) {
			this.filter = filter;
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
		}
	}
};
</script>

<style lang="less" scoped>
section {
	display: flex;
	flex-wrap: wrap;

	.covid-province-map--container {
		width: 70%;
		height: 500px;
		position: relative;
		overflow: hidden;
		#provinceMap {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}
	}
	.covid-province-map--filters {
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