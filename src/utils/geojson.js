import { arrangeByConfirmed } from './sorting'

const numberFormat = new Intl.NumberFormat(navigator.language, { maximumFractionDigits: 0, minimumFractionDigits: 0 })

/**
 * Create a Feature entry, the formatted value is used for display
 * and the raw value used for the color gradient.
 * 
 * @param {*} region
 */
const createFeature = (region, stats) => {
	return {
		type: 'Feature',
		properties: {
			name: region.countryName || region.name,
			population: numberFormat.format(region.population || 0),
			countryCode: region.countryCode || '',
			totalConfirmed: numberFormat.format(stats.totalConfirmed),
			totalConfirmedRaw: stats.totalConfirmed,
			totalRecovered: numberFormat.format(stats.totalRecovered),
			totalRecoveredRaw: stats.totalRecovered,
			totalDeaths: numberFormat.format(stats.totalDeaths),
			totalDeathsRaw: stats.totalDeaths,
			latestConfirmed: numberFormat.format(stats.latestConfirmed),
			latestConfirmedRaw: stats.latestConfirmed,
			latestRecovered: numberFormat.format(stats.latestRecovered),
			latestRecoveredRaw: stats.latestRecovered,
			latestDeaths: numberFormat.format(stats.latestDeaths),
			latestDeathsRaw: stats.latestDeaths
		},
		geometry: {
			type: 'Point',
			coordinates: [region.lng, region.lat]
		}
	}
}

/**
 * Each country get a GeoJson object
 * 
 * @param {*} country 
 */
export const createGeoJsonForCountry = country => {
	const geoJson = {
		type: 'FeatureCollection',
		features: []
	}

	if (country.series.provinces.length > 0) {
		for (const province of country.series.provinces) {
			geoJson.features.push(createFeature(province, province.stats));
		}
	}
	else {
		geoJson.features.push(createFeature(country, country.series.stats));
	}

	return geoJson;
}

/**
 * One geoJson for all countries
 * 
 * @param {*} countries
 */
export const createGeoJsonForCountries = countries => {
	const geoJson = {
		type: 'FeatureCollection',
		features: []
	}

	arrangeByConfirmed(countries)

	for (const country of countries) {
		geoJson.features.push(createFeature(country, country.series.stats));
	}

	return geoJson;
}