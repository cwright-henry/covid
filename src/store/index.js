import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		isLoading: false,
		data: [],		/* Frozen - Need to copy it to alter it, even sorting! */
		coverage: {},	/* Frozen */
		geoJson: {},	/* Frozen */
		currentCountryCode: null,
		laodingStatus: {
			countries: false,
			cases: false,
			parsing: false,
		}
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
		setLoadingStatus(state, data) {
			state.laodingStatus[data] = true;
		},

		setData(state, data) {
			state.data = data;
		},

		setCoverage(state, coverage) {
			state.coverage = coverage;
		},

		setGeoJson(state, geoJson) {
			state.geoJson = geoJson;
		},

		isLoading(state, isLoading) {
			state.isLoading = isLoading
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
