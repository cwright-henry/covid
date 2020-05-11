import { arrangeByConfirmed } from './sorting'

const numberFormat = new Intl.NumberFormat(navigator.language, { maximumFractionDigits: 0, minimumFractionDigits: 0 })


/**
 * Create a GeoJson using the following example
 * 
 * { type: 'Feature', properties: { Name: 'VA Medical Center -- Leestown Division', Address: '2250 Leestown Rd' }, geometry: { type: 'Point', coordinates: [-84.539487, 38.072916] } },
 * 
 * @param {*} data List of countries
 */
export const createGeoJson = countries => {
	const geoJson = {
		type: 'FeatureCollection',
		features: []
	}

	countries = arrangeByConfirmed(countries)

	for (const country of countries) {
		const series = country.series.data;
		let confirmed = 0;
		let recovered = 0;
		let deaths = 0;
		let deathRate = 0;
		let confirmedRaw = 0;
		let recoveredRaw = 0;
		let deathsRaw = 0;
		let deathRateRaw = 0;
		if (series.length > 1) {
			const lastest = series[series.length - 1];
			confirmed = numberFormat.format(lastest.confirmed);
			recovered = numberFormat.format(lastest.recovered);
			deaths = numberFormat.format(lastest.deaths);
			confirmedRaw = lastest.confirmed
			recoveredRaw = lastest.recovered
			deathsRaw = lastest.deaths


			if (lastest.confirmed) {
				deathRate = `${numberFormat.format(lastest.deaths / lastest.confirmed * 100)} % `;
				deathRateRaw = lastest.deaths / lastest.confirmed * 100;
			}
		}

		const properties = {
			name: country.countryName,
			countryCode: country.countryCode,
			population: numberFormat.format(country.population),
			confirmed,
			recovered,
			deaths,
			deathRate,
			confirmedRaw,
			recoveredRaw,
			deathsRaw,
			deathRateRaw
		};

		const geometry = {
			type: 'Point',
			coordinates: [country.lng, country.lat]
		}


		geoJson.features.push({ type: 'Feature', properties, geometry })
	}

	return geoJson;
}