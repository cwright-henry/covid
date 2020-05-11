<template>
	<article class="covid-page">
		<div class="covid-world covid-sheet">
			<div class="covid-world--map">
				<div class="covid-world--map__container">
					<div id="map" ref="map"></div>
				</div>
				<div class="covid-world--map__filters">
					<v-radio-group
						v-model="filter"
						active-class="covid-radio"
						dense
						hide-details
						@change="onFilterChange()"
					>
						<div class="pl-8">
							<h2>Filter Map By</h2>
							<div class="my-1">
								<v-radio hide-details label="Population" value="population" color="linkColor"></v-radio>
							</div>
							<div class="my-1">
								<v-radio hide-details label="Confirmed" value="confirmed" color="linkColor"></v-radio>
							</div>
							<div class="my-1">
								<v-radio hide-details label="Recovered" value="recovered" color="linkColor"></v-radio>
							</div>
							<div class="my-1">
								<v-radio hide-details label="Fatalities" value="deaths" color="linkColor"></v-radio>
							</div>
							<div class="my-1">
								<v-radio hide-details label="Fatality Rate" value="deathRate" color="linkColor"></v-radio>
							</div>
						</div>
					</v-radio-group>
				</div>
			</div>
			<div class="covid-world--charts">
				<div class="covid-world--charts__chart">
					<h1>Confirmed</h1>
					<BasicChart :ts="coverage.ts.confirmedSeries" chartType="line" name="World Confirmed" />
				</div>
				<div class="covid-world--charts__chart">
					<h1>
						Daily Confirmed
						<div>
							Latest
							<span>{{coverage.ts.latestConfirmed | number(0)}}</span>
						</div>
					</h1>
					<BasicChart :ts="coverage.ts.confirmedDailySeries" chartType="bar" name="World Daily Change" />
				</div>
			</div>
			<div class="covid-world--charts">
				<div class="covid-world--charts__chart">
					<h1>Recovered</h1>
					<BasicChart :ts="coverage.ts.recoveredSeries" chartType="line" name="World Recovered" />
				</div>
				<div class="covid-world--charts__chart">
					<h1>
						Daily Recovered
						<div>
							Latest
							<span>{{coverage.ts.latestRecovered | number(0)}}</span>
						</div>
					</h1>
					<BasicChart :ts="coverage.ts.recoveredDailySeries" chartType="bar" name="World Daily Change" />
				</div>
			</div>
			<div class="covid-world--charts">
				<div class="covid-world--charts__chart">
					<h1>Fatalities</h1>
					<BasicChart :ts="coverage.ts.deathSeries" chartType="line" name="World Recovered" />
				</div>
				<div class="covid-world--charts__chart">
					<h1>
						Daily Fatalities
						<div>
							Latest
							<span>{{coverage.ts.latestDeaths | number(0)}}</span>
						</div>
					</h1>
					<BasicChart :ts="coverage.ts.deathDailySeries" chartType="bar" name="`World Daily Change" />
				</div>
			</div>
		</div>
	</article>
</template>

<script>
import { mapState } from "vuex";
import mapboxgl from "mapbox-gl";
import BasicChart from "./BasicChart";

export default {
	data() {
		return {
			accessToken: `pk.eyJ1IjoiY3dyaWdodDEyMyIsImEiOiJjazh6cDU0Z2gxbGFnM2dva2FicTAwejQ3In0.d5_v9j64wbF6aUJYhQUvVQ`,
			mapStyle: "mapbox://styles/mapbox/dark-v10?optimize=true",
			viewState: {
				longitude: -22,
				latitude: 32,
				zoom: 1.15,
				bearing: 0,
				pitch: 0,
				antialias: true
			},
			filter: "confirmed",
			streams: []
		};
	},
	components: {
		BasicChart
	},
	computed: {
		...mapState(["geoJson", "coverage", "data"])
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
		});
	},
	methods: {
		onFilterChange() {
			this.map.setLayoutProperty("coverage-labels", "text-field", [
				"concat",
				["to-string", ["get", "name"]],
				"\n",
				["to-string", ["get", this.filter]]
			]);

			if (this.filter === "recovered") {
				this.map.setPaintProperty("coverage-labels", "text-color", [
					"interpolate",
					["cubic-bezier", 0, 0.5, 1, 0.5],
					["get", "recoveredRaw"],
					100,
					"#C8E6C9",
					20000,
					"#4CAF50"
				]);
			} else if (this.filter === "population") {
				this.map.setPaintProperty(
					"coverage-labels",
					"text-color",
					"#FFF176"
				);
			} else if (this.filter === "deathRate") {
				this.map.setPaintProperty("coverage-labels", "text-color", [
					"interpolate",
					["cubic-bezier", 0, 0.5, 1, 0.5],
					["get", "deathRateRaw"],
					0,
					"#FFF176",
					10,
					"#F44336"
				]);
			} else {
				this.map.setPaintProperty("coverage-labels", "text-color", [
					"interpolate",
					["cubic-bezier", 0, 0.5, 1, 0.5],
					["get", "confirmedRaw"],
					2000,
					"#FFF176",
					20000,
					"#F44336"
				]);
			}
		},

		loadLayer() {
			this.map.addSource("coverage", {
				type: "geojson",
				data: this.geoJson
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
						["to-string", ["get", "confirmed"]]
					],
					"text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
					"text-size": 11
				},
				paint: {
					"text-color": [
						"interpolate",
						["cubic-bezier", 0, 0.5, 1, 0.5],
						["get", "confirmedRaw"],
						2000,
						"#FFF176",
						20000,
						"#F44336"
					]
				}
			});

			this.map.on("click", "coverage-labels", e => {
				this.map.flyTo({
					center: [e.lngLat.lng, e.lngLat.lat],
					essential: true
				});
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

<style lang="less">
.covid-radio {
	color: red !important;
}
.covid-world {
	display: flex;
	flex-direction: column;
	.covid-world--map {
		display: flex;
		margin: 0 0 32px;
		.covid-world--map__container {
			width: 80%;
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
		.covid-world--map__filters {
			flex: 1;
			h2 {
				font-size: 16px;
				text-transform: uppercase;
				font-weight: 300;
				color: var(--section-header-color);
				margin: 0 0 8px 2px;
			}
		}
	}
	.covid-world--charts {
		display: flex;
		flex-direction: row;
		margin: 16px 0;
		h1 {
			font-size: 16px;
			text-transform: uppercase;
			font-weight: 300;
			color: var(--section-header-color);
			margin: 0 0 4px 12px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			div {
				margin: 0 16px 0 0;
				font-size: 12px;
				color: #e0e0e0;
				span {
					margin: 0 0 0 2px;
					font-size: 16px;
					color: var(--section-header-color);
				}
			}
		}
		.covid-world--charts__chart {
			width: 50%;
		}
	}
}
</style>