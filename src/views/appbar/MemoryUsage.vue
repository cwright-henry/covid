<template>
	<MemoryUsageChart :data="latestMemory" />
</template>

<script>
import MemoryUsageChart from "@/views/common/MemoryUsageChart";

const maxLen = 200;

export default {
	components: {
		MemoryUsageChart,
	},
	data() {
		return {
			latestMemory: [],
			fps: 0,
			lastLoop: new Date(),
		};
	},
	mounted() {
		if (window.performance && window.performance.memory) {
			this.startPolling();
		}
	},
	methods: {
		startPolling() {
			const date = +new Date();
			const memory = window.performance.memory;
			const usedHeap = memory.usedJSHeapSize / 1048576;
			const totalHeap = memory.totalJSHeapSize / 1048576;

			this.latestMemory = [date, usedHeap];
			setTimeout(() => {
				this.startPolling();
			}, 2000);
		},
	},
};
</script>