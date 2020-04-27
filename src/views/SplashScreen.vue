<template>
	<div id="loading-wrapper">
		<div id="loading-text">
			LOADING
			<span>Step {{progress}} of 3</span>
		</div>
		<div id="loading-content"></div>
	</div>
</template>

<script>
import { mapState } from "vuex";
export default {
	data() {
		return {
			progress: 0
		};
	},
	computed: {
		...mapState(["laodingStatus"])
	},
	watch: {
		laodingStatus: {
			handler: function() {
				this.progress += 1;
			},
			immediate: true,
			deep: true
		}
	}
};
</script>

<style lang="less">
#loading-wrapper {
	position: fixed;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
}

#loading-text {
	display: block;
	position: absolute;
	top: 50%;
	left: 50%;
	color: #fff176;
	width: 100px;
	height: 30px;
	margin: -24px 0 0 -45px;
	text-align: center;
	font-family: "PT Sans Narrow", sans-serif;
	font-size: 20px;
	span {
		font-size: 16px;
		display: block;
	}
}

#loading-content {
	display: block;
	position: relative;
	left: 50%;
	top: 50%;
	width: 170px;
	height: 170px;
	margin: -85px 0 0 -85px;
	border: 3px solid #f00;
}

#loading-content {
	border: 3px solid transparent;
	border-top-color: #2196f3;
	border-bottom-color: #2196f3;
	border-radius: 50%;
	-webkit-animation: loader 2s linear infinite;
	-moz-animation: loader 2s linear infinite;
	-o-animation: loader 2s linear infinite;
	animation: loader 2s linear infinite;
}

@keyframes loader {
	0% {
		-webkit-transform: rotate(0deg);
		-ms-transform: rotate(0deg);
		transform: rotate(0deg);
	}

	100% {
		-webkit-transform: rotate(360deg);
		-ms-transform: rotate(360deg);
		transform: rotate(360deg);
	}
}
</style>