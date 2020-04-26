<template>
	<div class="covid-country--select">
		<label class="mr-2">
			<nobr>Compare To</nobr>
		</label>
		<v-autocomplete
			v-model="countries"
			:items="countryList"
			background-color="#424242"
			attach
			chips
			label
			hide-details
			outlined
			dense
			multiple
		>
			<template v-slot:item="data">
				<template v-if="data.item.header">
					<v-list-item-content v-text="data.item"></v-list-item-content>
				</template>
				<template v-else-if="data.item.divider">
					<v-divider></v-divider>
				</template>
				<div v-else class="covid-country--select__item">
					<img :src="data.item.flag" width="28" class="mx-2" />
					<span>{{data.item.text}}</span>
				</div>
			</template>
			<template v-slot:selection="data">
				<v-chip
					color="#212121"
					small
					text-color="white"
					:input-value="data.selected"
					close
					@click="data.select"
					@click:close="remove(data.item)"
				>
					<v-avatar left>
						<img :src="data.item.flag" width="28" />
					</v-avatar>
					<span class="covid-country--select__text">{{ data.item.text }}</span>
				</v-chip>
			</template>
			<template v-slot:no-data>
				<v-list-item-content>
					<v-list-item-title class="pl-6">No Country Found</v-list-item-title>
				</v-list-item-content>
			</template>
		</v-autocomplete>
	</div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
	props: {
		country: {
			type: Object,
			default: () => {}
		}
	},
	data() {
		return {
			countries: [],
			countryList: []
		};
	},
	computed: {
		...mapGetters(["findCountryList"])
	},
	watch: {
		country() {
			this.countries = [];
			this.countryList = [];
			if (this.country.borders.length > 0) {
				this.countryList.push({ header: "Bordered Countries" });

				for (let countryCode of this.country.borders) {
					const country = this.findCountryList.find(
						item => item.code3 === countryCode
					);
					if (country) {
						this.countryList.push(country);
					}
				}
				this.countryList.push({ divider: true });
				this.countryList.push({ header: "All Other Countries" });
				for (const country of this.findCountryList) {
					if (!this.country.borders.includes(country.code3)) {
						this.countryList.push(country);
					}
				}
			} else {
				this.countryList = this.findCountryList;
			}
		},

		countries() {
			this.$emit("compareChange", this.countries);
		}
	},
	methods: {
		remove(item) {
			const index = this.countries.indexOf(item.value);
			if (index !== -1) {
				this.countries.splice(index, 1);
			}
		}
	}
};
</script>

<style lang="less">
.covid-country--select {
	width: 500px;
	max-width: 100%;
	label {
		font-weight: 300;
		font-size: 14px;
		margin: 0 0 4px 2px;
		display: inline-block;
	}
	.covid-country--select__item {
		display: flex;
		align-items: center;
		color: #fff;
		span {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			width: 220px;
		}
	}
	.covid-country--select__text {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100px;
	}
}
</style>