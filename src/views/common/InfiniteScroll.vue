<template>
	<aside v-show="hasNext">
		<div class="dc-infinite-scroll">
			<v-progress-circular :size="30" :width="2" indeterminate color="#FFEB3B"></v-progress-circular>
		</div>
	</aside>
</template>

<script>
export default {
	props: {
		hasNext: {
			type: Boolean,
			default: false
		},
		options: {
			type: Object,
			default: () => {
				return {
					root: null,
					threshold: 0.25
				};
			}
		}
	},
	data() {
		return {
			observer: null
		};
	},
	mounted() {
		this.observer = new IntersectionObserver(([entry]) => {
			if (entry && entry.isIntersecting) {
				this.loadMore();
			}
		}, this.options);

		this.observer.observe(this.$el);
	},
	methods: {
		loadMore() {
			this.$emit("loadmore");
		}
	},
	destroyed() {
		this.observer.disconnect();
	}
};
</script>

<style lang="less">
aside {
	.dc-infinite-scroll {
		margin: 0 auto;
		width: 200px;
		height: 48px;
		padding: 8px 0;
	}
}
</style>