const numberFormat = new Intl.NumberFormat(navigator.language, { maximumFractionDigits: 0, minimumFractionDigits: 0 })

/**
 * Replace long names with shorter - this helps the map
 */
const replacements = [
	{ longName: "Bolivia (Plurinational State of)", shortName: 'Bolivia' },
	{ longName: "Congo (Democratic Republic of the)", shortName: 'Congo (Democratic Republic)' },
	{ longName: "Iran (Islamic Republic of)", shortName: 'Iran' },
	{ longName: "Lao People's Democratic Republic", shortName: 'Lao' },
	{ longName: "Moldova (Republic of)", shortName: 'Moldova' },
	{ longName: "Palestine, State of", shortName: 'Palestine' },
	{ longName: "Korea (Republic of)", shortName: 'Korea' },
	{ longName: "Tanzania, United Republic of", shortName: 'Tanzania' },
	{ longName: "Macedonia (the former Yugoslav Republic of)", shortName: 'Macedonia' },
	{ longName: "United Kingdom of Great Britain and Northern Ireland", shortName: 'United Kingdom' },
	{ longName: "United States of America", shortName: 'United States' },
	{ longName: "Venezuela (Bolivarian Republic of)", shortName: 'Venezuela' }
];

const findReplacementName = name => {
	const replacement = replacements.find(item => item.longName === name);
	return replacement ? replacement.shortName : name;
}

const colors = [
	"#2196F3",
	"#FFF59D",
	"#3f51b5",
	"#E64A19",
	"#ffc107",
	"#009688",
	"#8bc34a",
	"#cddc39",
	"#4caf50",
	"#00bcd4",
	"#2196f3",
	"#673ab7",
	"#e91e63",
	"#ffeb3b",
	"#ff5722",
	"#607d8b",
	"#000000",
	"#ff0000"
];

const findColor = index => {
	return colors[index % colors.length];
};

/**
 * Unique ID from element
 */
const uuid = () => {
	return parseInt(Math.random().toString().slice(2, 11))
}

/**
 * Sort array of object by properties
 * 
 * @param {*} property 
 * @param {*} sort 
 */
const objectSorter = (property, sort) => {
	return function (a, b) {
		if ((a[property] != undefined) && (b[property] !== undefined)) {
			const left = typeof a[property] === 'string' ? a[property].toUpperCase() : a[property];
			const right = typeof b[property] === 'string' ? b[property].toUpperCase() : b[property];

			if (left < right) {
				return sort ? (sort === "desc" ? -1 : 1) : -1;
			}
			if (left > right) {
				return sort ? (sort === "desc" ? 1 : -1) : 1;
			}
		}
		return 0;
	};
};

/**
 * Merge 2 timeseries based on date
 * 
 * @param {*} data 
 * @param {*} newData 
 */
const merge = (data, newData) => {
	const dataItem = data.find(item => item.date === newData.date);
	if (dataItem) {
		dataItem.confirmed += newData.confirmed;
		dataItem.deaths += newData.deaths;
		dataItem.recovered += newData.recovered;
	} else {
		data.push(newData);
	}
};

const createSeriesCoverage = countries => {
	const coverage = {
		population: 0,
		data: []
	};

	for (let i = 0; i < countries.length; i++) {
		const country = JSON.parse(JSON.stringify(countries[i])); // Weird bug here, as first entry gets accumalated with rest of them
		coverage.population += country.population;
		for (let j = 0; j < country.series.data.length; j++) {
			merge(coverage.data, country.series.data[j]);
		}
	}

	return coverage;
};

const createdSeriesForCountry = (entries, countryCode) => {
	const series = {
		data: [],
		provinces: []
	};

	const stats = (entries, i) => {
		return {
			confirmed: entries[i].Confirmed,
			deaths: entries[i].Deaths,
			recovered: entries[i].Recovered,
			date: new Date(entries[i].Date).getTime()
		};
	};

	for (let i = 0; i < entries.length; i++) {
		if (entries[i].Province === "") {
			series.data.push(stats(entries, i));
		} else {
			let province = series.provinces.find(
				item => item.name === entries[i].Province
			);
			if (!province) {
				province = {
					uuid: uuid(),
					name: entries[i].Province,
					lat: entries[i].Lat,
					lng: entries[i].Lon,
					data: [],
					cities: []
				};
				series.provinces.push(province);
			}
			if (entries[i].City !== "") {
				let city = province.cities.find(
					item => item.name === entries[i].City
				);
				if (!city) {
					city = {
						uuid: uuid(),
						name: entries[i].City,
						lat: entries[i].Lat,
						lng: entries[i].Lon,
						data: []
					};
					province.cities.push(city);
				}
				city.data.push(stats(entries, i));
			} else {
				province.data.push(stats(entries, i));
			}
		}
	}

	// Ensure that all cities add to province as this missed in previous step
	let hasCities = false;
	if (series.provinces.length > 0) {
		for (let j = 0; j < series.provinces.length; j++) {
			if (series.provinces[j].cities.length > 0) {
				hasCities = true;
				series.provinces[j].data = [];
				for (
					let z = 0;
					z < series.provinces[j].cities.length;
					z++
				) {
					for (
						let x = 0;
						x < series.provinces[j].cities[z].data.length;
						x++
					) {
						merge(
							series.provinces[j].data,
							series.provinces[j].cities[z].data[x]
						);
					}
				}
			}
		}
	}

	if (
		hasCities ||
		countryCode === "AU" ||
		countryCode === "CA" ||
		countryCode === "CN"
	) {
		series.data = [];
		for (let j = 0; j < series.provinces.length; j++) {
			for (let x = 0; x < series.provinces[j].data.length; x++) {
				merge(series.data, series.provinces[j].data[x]);
			}
		}
	}

	return series;
}

/**
 * Retrieve the latest data for a country - some countries
 * dont report recovery's or fatalities per day so iterate back to retrieve latest figures.
 * 
 * @param {*} country 
 */
const getLatest = country => {
	const data = {
		latestConfirmed: 0,
		latestRecovered: 0,
		latestFatalities: 0,
		latestConfirmedRate: 0,
		latestRecoveryRate: 0,
		latestFatalityRate: 0
	}

	if (country.series.data.length > 0) {
		for (let i = country.series.data.length - 1; i >= 0; i--) {
			const item = country.series.data[i];
			if (!data.latestConfirmed) {
				data.latestConfirmed = item.confirmed;
			}
			if (!data.latestRecovered) {
				data.latestRecovered = item.recovered;
			}
			if (!data.latestFatalities) {
				data.latestFatalities = item.deaths;
			}
			if (data.latestConfirmed && data.latestRecovered && data.latestFatalities) {
				break;
			}
		}
		data.latestConfirmedRate = (data.latestConfirmed / country.population) * 100;
		if (data.latestConfirmed) {
			data.latestRecoveryRate = (data.latestRecovered / data.latestConfirmed) * 100;
			data.latestFatalityRate = (data.latestFatalities / data.latestConfirmed) * 100;
		}
	}

	return data;
}

/**
 * Create a GeoJson using the following example
 * 
 * { type: 'Feature', properties: { Name: 'VA Medical Center -- Leestown Division', Address: '2250 Leestown Rd' }, geometry: { type: 'Point', coordinates: [-84.539487, 38.072916] } },
 * 
 * @param {*} data List of countries
 */
const createGeoJson = countries => {
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

/**
 * Group counties by region or subregion
 * 
 * @param {*} countries 
 * @param {*} subRegion 
 */
const arrangeByRegion = (countries, subRegion) => {
	const regions = {};
	const copy = [];
	countries.forEach(item => copy.push(item));

	for (const country of copy) {
		const regionName = subRegion
			? country.subRegionName
			: country.regionName;
		if (!regions[regionName]) {
			regions[regionName] = new Array();
		}
		regions[regionName].push(country);
	}

	const ordered = {};
	Object.keys(regions)
		.sort()
		.forEach(function (key) {
			ordered[key] = regions[key];
		});

	return ordered;
};

/**
 * Sort By population
 */
const populationSorter = objectSorter('population', 'asc')
const arrangeByPopulation = countries => {
	const copy = [];
	countries.forEach(item => copy.push(item));
	return copy.sort(populationSorter);
};

/**
 * Sort by Confirmed cases
 */
const confirmedSorter = objectSorter('latestConfirmed', 'asc')
const arrangeByConfirmed = countries => {
	const copy = [];
	countries.forEach(item => copy.push(item));
	return copy.sort(confirmedSorter);
};

/**
 * Sort by Recovered cases
 */
const recoveredSorter = objectSorter('latestRecovered', 'asc')
const arrangeByRecovered = countries => {
	const copy = [];
	countries.forEach(item => copy.push(item));
	return copy.sort(recoveredSorter);
};

/**
 * Sort by Fatality cases
 */
const fatalitySorter = objectSorter('latestFatalities', 'asc')
const arrangeByFatalities = countries => {
	const copy = [];
	countries.forEach(item => copy.push(item));
	return copy.sort(fatalitySorter);
};

export {
	objectSorter,
	uuid,
	createGeoJson,
	getLatest,
	arrangeByRegion,
	arrangeByPopulation,
	arrangeByConfirmed,
	arrangeByRecovered,
	arrangeByFatalities,
	createSeriesCoverage,
	createdSeriesForCountry,
	findReplacementName,
	findColor
}