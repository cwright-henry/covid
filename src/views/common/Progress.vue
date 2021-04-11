<template>
	<div class="covid-progress">
		<v-progress-circular
			:rotate="-90"
			:size="size"
			:width="width"
			:value="value"
			color="#4CAF50"
		>
			{{ value | number(0) }}%
		</v-progress-circular>
		<label>Fully Vaccinated</label>
	</div>
</template>

<script>
export default {
	props: {
		value: {
			type: Number,
			default: 0,
		},
		title: {
			type: String,
			default: "Title",
		},
		small: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		size() {
			return this.small ? 56 : 72
		},
		width() {
			return this.small ? 6 : 10
		}
	}
};
</script>

<style lang="less" scoped>
.covid-progress {
	display: flex;
	flex-direction: column;
	align-items: center;
	font-size: 16px;
	label {
		font-size: 13px;
		margin: 2px 0 0 0;
		font-weight: 300;
	}
}
</style>
