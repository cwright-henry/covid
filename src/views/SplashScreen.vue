<template>
	<div class="covid-splashscreen">
		<div id="loading-wrapper" v-if="!isLoadError">
			<div id="loading-text">
				<span>Covid 19 Watch</span>
				<span>Loading...</span>
			</div>
			<div id="loading-content"></div>
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
		}
	}
};
</script>


<style lang="less">
.covid-splashscreen {
	display: flex;
	height: 100vh;
	align-items: center;
	justify-content: center;

	#loading-text {
		color: #fff176;
		width: 100px;
		height: 30px;
		text-align: center;
		font-family: "PT Sans Narrow", sans-serif;
		font-size: 20px;
		span:nth-child(1) {
			font-size: 18px;
			display: block;
		}
		span:nth-child(2) {
			font-size: 13px;
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
}
</style>