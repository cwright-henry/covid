<template>
	<v-app-bar app fixed clipped-left :prominent="isProminent" color="primary" v-resize="onResize">
		<v-app-bar-nav-icon color="#fff" @click="toggleNavBar"></v-app-bar-nav-icon>
		<div class="covid-appbar--header ml-4">
			<h1>
				Covid 19 Watch
				<span>Last Update: {{coverage.lastestDate | date-long}}</span>
				<img src="@/assets/covid.png" height="24" width="24" />
			</h1>
			<div class="covid-appbar--info">
				<RegionStats :region="coverage" isSlim />
				<Performance v-if="supportsMemory" class="mr-2 mt-2" />
			</div>
		</div>
	</v-app-bar>
</template>

<script>
import { mapState } from "vuex";
import EventBus from "@/events";
import RegionStats from "@/views/common/RegionStats";
import Performance from "./Performance";

export default {
	data() {
		return {
			windowWidth: 0,
		};
	},
	components: {
		RegionStats,
		Performance,
	},
	computed: {
		...mapState(["coverage"]),
		isProminent() {
			return this.windowWidth > 520;
		},
		supportsMemory() {
			return window.performance && window.performance.memory;
		},
	},
	mounted() {
		this.onResize();
	},
	methods: {
		toggleNavBar() {
			EventBus.$emit("onToggleNavBar");
		},
		onResize() {
			this.windowWidth = window.innerWidth;
		},
	},
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
			margin: 0 0 0 8px;
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
.covid-appbar--info {
	width: 100%;
	display: flex;
	justify-content: space-between;
}

@media screen and (max-width: 1000px) {
	.covid-appbar--header {
		h1 {
			img {
				display: none;
			}
		}
	}
}
@media screen and (max-width: 520px) {
	.covid-appbar--header {
		h1 {
			span {
				display: none;
			}
		}
	}
}
</style>