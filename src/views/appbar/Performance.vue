<template>
	<div class="covid-performance">
		<PerformanceChart
			:data="latestMemory"
			title="Memory"
			units="MB"
			:precision="1"
			setExtremes
			v-if="supportsMemory"
		/>
		<PerformanceChart class="ml-4" :data="framesPerSecond" title="FPS" />
	</div>
</template>

<script>
import PerformanceChart from "@/views/common/PerformanceChart";

const maxLen = 200;

export default {
	components: {
		PerformanceChart,
	},
	data() {
		return {
			latestMemory: [],
			framesPerSecond: [],
			supportsMemory: false,
		};
	},
	mounted() {
		if (window.performance && window.performance.memory) {
			this.supportsMemory = true;
			this.startMemoryPolling();
		}
		this.startFPSPolling();
	},
	methods: {
		startMemoryPolling() {
			const date = Date.now();
			const memory = window.performance.memory;
			const usedHeap = memory.usedJSHeapSize / 1048576;
			const totalHeap = memory.totalJSHeapSize / 1048576;

			this.latestMemory = [date, usedHeap];
			setTimeout(() => {
				this.startMemoryPolling();
			}, 1000);
		},

		/**
		 * https://gist.github.com/capfsb/3fd1b700b4732debb29aefd576cf54ef
		 */
		startFPSPolling() {
			const fpsMeter = () => {
				let prevTime = Date.now(),
					frames = 0;
				const loop = () => {
					const time = Date.now();
					frames++;
					if (time > prevTime + 1000) {
						let fps = Math.round(
							(frames * 1000) / (time - prevTime)
						);
						prevTime = time;
						frames = 0;
						this.framesPerSecond = [time, fps];
					}
					requestAnimationFrame(loop);
				};

				requestAnimationFrame(loop);
			};

			fpsMeter();
		},
	},
};
</script>

<style lang="less" scoped>
.covid-performance {
	display: flex;
}
</style>