/**
 * Provinces are called different things in different countries.
 * Additionally we set the default zoom and pitch level for map
 */

const provinces = {
	'AU': {
		zoom: 3,
		pitch: 45,
		provinceName: 'Territories'
	},
	'IE': {
		zoom: 5.5,
		pitch: 0,
		provinceName: 'Counties'
	},
	'US': {
		zoom: 3,
		pitch: 0,
		provinceName: 'States'
	},
	'CN': {
		zoom: 3,
		pitch: 45,
		provinceName: 'Provinces'
	},
	'DN': {
		zoom: 6,
		pitch: 45,
		provinceName: 'Regions'
	},
	'CA': {
		zoom: 2.2,
		pitch: 45,
		provinceName: 'Provinces'
	},
	'UK': {
		zoom: 2,
		pitch: 45,
		provinceName: 'Territories'
	},
	'DEFAULT': {
		zoom: 1,
		pitch: 0,
		provinceName: 'Provinces'
	}
}

export const getLocalProvince = countryCode => {
	return provinces[countryCode] ? provinces[countryCode] : provinces['DEFAULT']
}