<template>
	<v-app-bar app fixed clipped-left prominent color="primary">
		<v-app-bar-nav-icon color="#fff" @click="toggleNavBar"></v-app-bar-nav-icon>
		<div class="covid-appbar--header ml-4">
			<h1>
				Covid 19 Watch
				<span>Last Updated: {{coverage.lastestDate | date-long}}</span>
				<img src="@/assets/covid.png" height="36" width="36" />
			</h1>
			<RegionStats :region="coverage" isSlim />
		</div>
	</v-app-bar>
</template>

<script>
import { mapState } from "vuex";
import EventBus from "@/events";
import RegionStats from "@/views/common/RegionStats";

export default {
	components: {
		RegionStats
	},
	computed: {
		...mapState(["coverage"])
	},
	methods: {
		toggleNavBar() {
			EventBus.$emit("onToggleNavBar");
		}
	}
};
</script>

<style lang="less">
.covid-appbar--header {
	display: flex;
	align-items: flex-start;
	flex-direction: column;
	justify-content: center;
	width: 100%;
	h1 {
		font-size: 28px;
		font-weight: 400;
		margin: 4px 0;
		position: relative;
		width: 100%;
		span {
			font-size: 13px;
		}
		img {
			position: absolute;
			right: 4px;
			top: 12px;
			animation: spin 24s linear infinite;
		}
	}

	@keyframes spin {
		100% {
			transform: rotate(360deg);
		}
	}
}
</style>