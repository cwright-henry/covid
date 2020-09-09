<template>
	<div class="covid-map-slider">
		<h1>Play History</h1>

		<div>
			<v-slider
				v-model="current"
				thumb-label="always"
				ticks
				color="linkColor"
				track-color="grey"
				hide-details
				class="mt-12 px-2"
				min="0"
				:max="max"
				@end="onEndSlide"
				:disabled="isDisabled"
			>
				<template v-slot:thumb-label="{ }">
					<span class="covid-map-slider--thumb">{{currentDate | date-day}}</span>
				</template>
				<template v-slot:prepend>
					<v-icon color="linkColor" @click="decrement">mdi-minus</v-icon>
				</template>

				<template v-slot:append>
					<v-icon color="linkColor" @click="increment">mdi-plus</v-icon>
				</template>
			</v-slider>
			<div class="covid-map-slider--play">
				<v-btn color="linkColor" small depressed outlined fab @click="toggle" :disabled="isDisabled">
					<v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
				</v-btn>
				<div class="covid-map-slider--play__date">{{currentDate | date-short}}</div>
			</div>
		</div>
	</div>
</template>


<script>
export default {
	props: {
		coverage: {
			type: Object,
			default: () => ({
				history: [],
			}),
		},
		currentFilter: {
			type: String,
			default: "",
		},
	},
	data: () => ({
		current: 0,
		isPlaying: false,
		timer: null,
		isDisabled: false,
	}),

	computed: {
		max() {
			return this.coverage.history.length - 1;
		},
		currentDate() {
			if (this.coverage.history[this.current])
				return this.coverage.history[this.current].date;
			return "";
		},
	},
	watch: {
		coverage: {
			handler: function () {
				this.current = this.coverage.history.length - 1;
			},
			immediate: true,
		},
		currentFilter() {
			this.reset();
		},
	},
	methods: {
		toggle() {
			this.isPlaying = !this.isPlaying;
			if (this.isPlaying) {
				this.play();
			} else {
				clearTimeout(this.timer);
			}
		},

		play() {
			if (this.current === this.max) {
				this.current = 0;
			}
			this.$emit("coverageChange", this.current);
			this.timer = setTimeout(() => {
				this.play();
				this.current++;
			}, 1000);
		},

		onEndSlide() {
			this.$emit("coverageChange", this.current);
		},

		decrement() {
			if (this.current === 0) {
				this.current = this.max;
			} else {
				this.current--;
			}
			this.$emit("coverageChange", this.current);
		},

		increment() {
			if (this.current === this.max) {
				this.current = 0;
			} else {
				this.current++;
			}
			this.$emit("coverageChange", this.current);
		},

		reset() {
			this.isPlaying = false;
			clearTimeout(this.timer);
			this.current = this.max;
			this.isDisabled = this.currentFilter === "population";
		},
	},
};
</script>


<style lang="less">
.covid-map-slider {
	width: 100%;
	h1 {
		font-size: 16px;
		text-transform: uppercase;
		font-weight: 300;
		color: var(--section-header-color);
		margin: 0 0 8px 8px;
	}
	.covid-map-slider--thumb {
		color: #212121;
	}
	.covid-map-slider--play {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		position: relative;
		.covid-map-slider--play__date {
			position: absolute;
			right: 12px;
		}
	}
}
</style>