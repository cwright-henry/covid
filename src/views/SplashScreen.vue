<template>
	<div class="covid-splashscreen">
		<div class="loading-wrapper" v-if="!isLoadError">
			<h1>Covid 19 Watch</h1>
			<div class="animated-image">
				<img src="@/assets/covid.png" height="64" width="64" />
			</div>
			<span>{{msg}}</span>
			<v-progress-linear rounded color="linkColor" height="6" :value="value"></v-progress-linear>
		</div>
		<div v-else>
			<v-alert icon="mdi-refresh-circle" prominent text color="warning" type="info">
				Oops, there was a problem loading data sources -
				<strong>try refreshing the page</strong>
			</v-alert>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		isLoadError: {
			type: Boolean,
			default: false
		},
		isLoading: {
			type: Boolean,
			default: false
		},
		isRendering: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			value: 0,
			interval: null,
			msg: "Loading Data Sources..."
		};
	},
	watch: {
		isLoadError() {
			clearInterval(this.interval);
		},
		isRendering: {
			handler(value) {
				if (value) {
					this.msg = "Rendering Application...";
					this.value = 100;
				}
			},
			immediate: true
		},
		isLoading(val) {
			if (!val) {
				clearInterval(this.interval);
			}
		}
	},
	mounted() {
		// Whoops main thred is blocked
		this.interval = setInterval(() => {
			this.value += 100 / 330;
			if (this.value >= 100) {
				clearInterval(this.interval);
			}
		}, 100);
	}
};
</script>


<style lang="less">
.covid-splashscreen {
	display: flex;
	height: 100vh;
	align-items: center;
	justify-content: center;

	.loading-wrapper {
		max-width: 320px;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;

		h1 {
			color: #fff;
			font-weight: 400;
			font-size: 32px;
			margin: 0 0 16px;
		}

		.animated-image {
			height: 64px;
			width: 64px;
			position: relative;
			img {
				position: absolute;
				right: 0;
				top: 0;
				animation: spin 24s linear infinite;
			}
		}

		span {
			margin: 32px 0 8px 0;
			font-size: 11px;
			color: #b0bec5;
		}
	}

	@keyframes spin {
		100% {
			transform: rotate(360deg);
		}
	}
}
</style>