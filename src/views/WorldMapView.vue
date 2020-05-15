<template>
	<section>
		<div class="covid-map--container">
			<div id="map" ref="map"></div>
		</div>
		<div class="covid-map--filters">
			<v-radio-group
				v-model="filter"
				active-class="covid-radio"
				dense
				hide-details
				@change="onFilterChange()"
			>
				<div class="pl-4">
					<h1>Filter Map By</h1>
					<div class="covid-map--filters__radio">
						<v-radio hide-details label="Popluation" value="population" color="linkColor"></v-radio>
						<span>{{coverage.population | number(0)}}</span>
					</div>
					<div class="covid-map--filters__radio">
						<v-radio hide-details label="Latest Confirmed" value="latestConfirmed" color="linkColor"></v-radio>
						<span>{{coverage.stats.latestConfirmed | number(0)}}</span>
					</div>
					<div class="covid-map--filters__radio">
						<v-radio hide-details label="Latest Recovered" value="latestRecovered" color="linkColor"></v-radio>
						<span>{{coverage.stats.latestRecovered | number(0)}}</span>
					</div>
					<div class="covid-map--filters__radio">
						<v-radio hide-details label="Latest Fatalities" value="latestDeaths" color="linkColor"></v-radio>
						<span>{{coverage.stats.latestDeaths | number(0)}}</span>
					</div>
					<div class="covid-map--filters__radio">
						<v-radio hide-details label="Total Confirmed" value="totalConfirmed" color="linkColor"></v-radio>
						<span>{{coverage.stats.totalConfirmed | number(0)}}</span>
					</div>
					<div class="covid-map--filters__radio">
						<v-radio hide-details label="Total Recovered" value="totalRecovered" color="linkColor"></v-radio>
						<span>{{coverage.stats.totalRecovered | number(0)}}</span>
					</div>
					<div class="covid-map--filters__radio">
						<v-radio hide-details label="Total Fatalities" value="totalDeaths" color="linkColor"></v-radio>
						<span>{{coverage.stats.totalDeaths | number(0)}}</span>
					</div>
				</div>
			</v-radio-group>
		</div>
	</section>
</template>

<script>
import mapboxgl from "mapbox-gl";

const sortGeoJson = (property, sort) => {
	return function(a, b) {
		if (
			a["properties"][property] != undefined &&
			b["properties"][property] !== undefined
		) {
			const left =
				typeof a["properties"][property] === "string"
					? a["properties"][property].toUpperCase()
					: a["properties"][property];
			const right =
				typeof b["properties"][property] === "string"
					? b["properties"][property].toUpperCase()
					: b["properties"][property];

			if (left < right) {
				return sort ? (sort === "desc" ? -1 : 1) : -1;
			}
			if (left > right) {
				return sort ? (sort === "desc" ? 1 : -1) : 1;
			}
		}
		return 0;
	};
};

const lastConfirmedSorter = sortGeoJson("latestConfirmedRaw", "asc");

export default {
	props: {
		coverage: {
			type: Object,
			default: () => ({
				stats: {}
			})
		}
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
			filter: "latestConfirmed"
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
				this.coverage.geoJson.features.sort(lastConfirmedSorter);
				this.map.getSource("coverage").setData(this.coverage.geoJson);
			}
		},

		onFilterChange() {
			this.map.setLayoutProperty("coverage-labels", "text-field", [
				"concat",
				["to-string", ["get", "name"]],
				"\n",
				["to-string", ["get", this.filter]]
			]);

			console.log(this.filter);

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

	.covid-map--container {
		width: 75%;
		height: 500px;
		position: relative;
		overflow: hidden;
		#map {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}
	}
	.covid-map--filters {
		flex: 1;
		h1 {
			font-size: 16px;
			text-transform: uppercase;
			font-weight: 300;
			color: var(--section-header-color);
			margin: 0 0 6px 8px;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		.covid-map--filters__radio {
			display: flex;
			justify-content: space-between;
			align-items: center;
			max-width: 320px;
			width: 100%;
			padding: 6px 12px 0 8px;
			border-radius: 4px;
			span {
				font-size: 16px;
				margin: 0 0 4px;
				color: var(--section-header-color);
				font-weight: 300;
			}
		}
	}
	.v-input--selection-controls {
		margin: 0;
	}
}
</style>