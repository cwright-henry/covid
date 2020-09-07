import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		isLoaded: false,			/* Status of loading resources */
		data: [],					/* Frozen - Need to copy it to alter it, even sorting! */
		coverage: {},				/* Frozen */
		regions: [],				/* Frozen */
		currentCountryCode: null, 	/* Used between Navigator and Country */
	},
	getters: {
		findCountry: state => countryCode => {
			return state.data.find(item => item.countryCode === countryCode);
		},

		findCountry3: state => countryCode3 => {
			return state.data.find(item => item.countryCode3 === countryCode3);
		},

		findRegion: state => regionCode => {
			let subregion = null;
			for (const region of state.regions) {
				subregion = region.subRegions.find(item => item.subRegion === regionCode);
				if (subregion) {
					break;
				}
			}
			return subregion;
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
		},

		isLoaded(state, isLoaded) {
			state.isLoaded = isLoaded;
		}
	},
	actions: {
	},
	modules: {
	}
})
