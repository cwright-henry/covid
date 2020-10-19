<template>
	<article class="covid-page covid-provinces">
		<router-link :to="`/country/${countryCode}`" class="covid-link">
			<v-icon class="mb-2">mdi-arrow-left</v-icon>
		</router-link>
		<div class="covid-sheet">
			<header>
				<div class="covid-provinces--title">
					<img :src="country.flag" width="36" class="mr-3" />
					<h1>
						{{ country.countryName }}
						<span>Last Update: {{ lastUpdate | dateLong }}</span>
					</h1>
				</div>
			</header>
			<RegionStats :region="country" />
			<ProvinceMapView :country="country" :local="local" class="mb-8" />
			<ProvinceListView :country="country" :local="local" />
		</div>
	</article>
</template>

<script>
import { mapGetters } from "vuex";
import ProvinceMapView from "./ProvinceMapView";
import { getLocalProvince } from "@/utils";
import ProvinceListView from "./ProvinceListView";
import RegionStats from "@/views/common/RegionStats";

export default {
	props: {
		countryCode: {
			type: String,
			default: "",
		},
	},
	data() {
		return {
			country: {
				series: {
					data: [],
					provinces: [],
					ts: {},
					stats: {},
					geojson: {},
				},
			},
		};
	},
	components: {
		ProvinceMapView,
		ProvinceListView,
		RegionStats,
	},
	computed: {
		...mapGetters(["findCountry"]),

		local() {
			return getLocalProvince(this.countryCode);
		},

		lastUpdate() {
			if (
				this.country.series.ts.confirmedSeries &&
				this.country.series.ts.confirmedSeries.length > 0
			) {
				return this.country.series.ts.confirmedSeries[
					this.country.series.ts.confirmedSeries.length - 1
				][0];
			}
			return "";
		},
	},
	watch: {
		countryCode() {
			this.loadData();
		},
	},
	mounted() {
		this.loadData();
	},
	methods: {
		loadData() {
			this.country = Object.freeze(this.findCountry(this.countryCode));
		},
	},
};
</script>

<style lang="less">
.covid-provinces {
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0 0 12px 0;
		.covid-provinces--title {
			display: flex;
			align-items: center;
			h1 {
				font-size: 24px;
				font-weight: 400;
				span {
					margin: 0 0 0 8px;
					font-size: 11px;
					font-weight: 400;
				}
			}
		}
	}
	ul.covid-provinces--info {
		display: flex;
		margin: 0 0 24px 0;
		li {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			border-radius: 4px;
			background-color: #424242;
			padding: 8px 16px;
			min-width: 170px;
			border: 1px solid #616161;
			label {
				font-size: 14px;
				color: var(--app-header-color);
			}
			div {
				font-size: 18px;
				span {
					margin: 0 0 0 4px;
					font-size: 13px;
				}
			}
		}
	}
}
</style>