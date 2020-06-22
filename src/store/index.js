import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		data: [],		/* Frozen - Need to copy it to alter it, even sorting! */
		coverage: {},	/* Frozen */
		regions: [],	/* Frozen */
		currentCountryCode: null,
	},
	getters: {
		findCountry: state => countryCode => {
			return state.data.find(item => item.countryCode === countryCode);
		},

		findCountryList: state => {
			return state.data.map(country => {
				return {
					text: country.countryName,
					value: country.countryCode,
					code3: country.countryCode3,
					flag: country.flag
				}
			})
		}
	},
	mutations: {
		setData(state, data) {
			state.data = data;
		},

		setCoverage(state, coverage) {
			state.coverage = coverage;
		},

		setRegions(state, regions) {
			state.regions = regions;
		},

		setCurrentCountryCode(state, currentCountryCode) {
			state.currentCountryCode = currentCountryCode;
		}
	},
	actions: {
	},
	modules: {
	}
})
