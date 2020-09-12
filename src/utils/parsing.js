import { uuid, cumulative_number_for_14_days_of_COVID_19_cases_per_100000 } from './utils'
import { createGeoJsonForCountry, createGeoJsonHistoryForCountries } from './geojson'
import { sortCountriesStats } from './sorting'
import { numberFormat } from './format'

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
	{ longName: "Korea (Republic of)", shortName: 'South Korea' },
	{ longName: "Tanzania, United Republic of", shortName: 'Tanzania' },
	{ longName: "Macedonia (the former Yugoslav Republic of)", shortName: 'Macedonia' },
	{ longName: "United Kingdom of Great Britain and Northern Ireland", shortName: 'United Kingdom' },
	{ longName: "United States of America", shortName: 'United States' },
	{ longName: "Venezuela (Bolivarian Republic of)", shortName: 'Venezuela' },
	{ longName: "Ireland", shortName: 'Republic of Ireland' }
];

const statsSorter = sortCountriesStats('latestConfirmed', 'asc');

const findReplacementName = name => {
	const replacement = replacements.find(item => item.longName === name);
	return replacement ? replacement.shortName : name;
}

export const parseWorld = (countries, cases, usStatePopulation) => {
	const data = [];
	for (const country of countries) {
		if (country.alpha2Code === 'MO') continue;
		const entries = cases.filter(
			item => country.alpha2Code === item.CountryCode
		);
		if (entries.length > 0) {
			const name = findReplacementName(country.name);
			const population = country.alpha2Code === 'IE' ? 4937786 : country.population
			const item = {
				uuid: uuid(),
				countryName: name,
				filteredName: name.toLowerCase(),
				countryCode: country.alpha2Code,
				countryCode3: country.alpha3Code,
				flag: country.flag,
				population,
				lat: country.latlng[0],
				lng: country.latlng[1],
				borders: country.borders,
				area: country.area /* Square kilometers */,
				regionName: country.region,
				subRegionName: country.subregion,
				regionCode: country.regionalBlocs[0]
					? country.regionalBlocs[0].acronym
					: "Other",
				series: createdSeriesForCountry(
					entries,
					country.alpha2Code,
					usStatePopulation,
					population
				)
			};
			if (item.series.provinces.length > 0) {
				item.geojson = createGeoJsonForCountry(item)
			}

			postMessage({
				type: 'parse-country',
				population
			})
			data.push(item);
		}
	}
	postMessage({
		type: 'parse-country-finished',
	})
	return data;
}

/**
 * Coverage/summary of all the countries
 * 
 * @param {*} countries List of supported countries
 */
export const createSeriesCoverage = countries => {
	const coverage = {
		numCountries: countries.length,
		lastestDate: null,
		population: 0,
		history: null,
		stats: {
			latestConfirmed: 0,
			latestRecovered: 0,
			latestDeaths: 0,
			totalConfirmed: 0,
			totalRecovered: 0,
			totalDeaths: 0
		},
		ts: {
			confirmedSeries: [],
			recoveredSeries: [],
			deathSeries: [],
			confirmedDailySeries: [],
			recoveredDailySeries: [],
			deathDailySeries: []
		}
	};

	const merge = (tsTo, tsFrom) => {
		for (let i = 0; i < tsFrom.length; i++) {
			const entry = tsFrom[i];
			const current = tsTo.find(item => item[0] === entry[0]);
			if (current) {
				current[1] += entry[1];
			} else {
				tsTo.push([entry[0], entry[1]]);
			}
		}
	};

	for (let i = 0; i < countries.length; i++) {
		const country = countries[i];

		// Merge pop
		coverage.population += country.population;

		// Merge stats
		coverage.stats.latestConfirmed += country.series.stats.latestConfirmed;
		coverage.stats.latestRecovered += country.series.stats.latestRecovered;
		coverage.stats.latestDeaths += country.series.stats.latestDeaths;
		coverage.stats.totalConfirmed += country.series.stats.totalConfirmed;
		coverage.stats.totalRecovered += country.series.stats.totalRecovered;
		coverage.stats.totalDeaths += country.series.stats.totalDeaths;

		// Merge ts
		merge(coverage.ts.confirmedSeries, country.series.ts.confirmedSeries);
		merge(coverage.ts.recoveredSeries, country.series.ts.recoveredSeries);
		merge(coverage.ts.deathSeries, country.series.ts.deathSeries);
		merge(coverage.ts.confirmedDailySeries, country.series.ts.confirmedDailySeries);
		merge(coverage.ts.recoveredDailySeries, country.series.ts.recoveredDailySeries);
		merge(coverage.ts.deathDailySeries, country.series.ts.deathDailySeries);

		// lastest Date
		coverage.lastestDate = ""
		if (country.series.ts.confirmedSeries.length > 0) {
			coverage.lastestDate = country.series.ts.confirmedSeries[country.series.ts.confirmedSeries.length - 1][0];
		}
	}

	coverage.ts.confirmed14DaySeries = create14DayPer100k(coverage.population, coverage.ts.confirmedDailySeries);
	coverage.stats.latestConfirmed14Day = getLatestFromSeries(coverage.ts.confirmed14DaySeries);
	coverage.stats.totalConfirmed14Day = (coverage.stats.totalConfirmed / coverage.population) * 100000;

	coverage.history = createGeoJsonHistoryForCountries(countries)
	return coverage;
}

/**
 * Can only tell increasing or decreasing slope
 * 
 * @param {*} data 
 */
const getSlope = data => {
	let sum = [0, 0, 0, 0, 0], n = 0;
	if (data.length > 2) {
		for (; n < data.length; n++) {
			if (data[n][1]) {
				sum[0] += data[n][0];
				sum[1] += data[n][1];
				sum[2] += data[n][0] * data[n][0];
				sum[3] += data[n][0] * data[n][1];
				sum[4] += data[n][1] * data[n][1];
			}
		}
		return (n * sum[3] - sum[0] * sum[1]) / (n * sum[2] - sum[0] * sum[0]);
	}
	return 0;
}

/**
 * Create daily series from cumalitive series
 */
const createDailySeries = series => {
	const dailySeries = [];
	for (let i = 1; i < series.length; i++) {
		const date = series[i][0];
		const diff = series[i][1] - series[i - 1][1];
		dailySeries.push([date, diff > 0 ? diff : 0]);
	}
	return dailySeries;
}

/**
 * Covid-19 confirmed, recovered, fatalities per 100,000 people over the past 14 days.
 */
const create14DayPer100k = (population, series) => {
	const incidences = []
	if (series.length > 14) {
		for (let i = 0; i < 14; i++) {
			incidences.push([1, 0.1]);
		}
		for (let i = 0; i < series.length - 14; i++) {
			const subset = series.slice(i, 14 + i); // End not included
			const average = (subset.reduce((a, b) => a + b[1], 0) / population) * 100000;
			incidences.push([series[14 - 1 + i][0], average])
		}
	}
	return incidences;
}

/**
 * Retrieve latest from series
 */
const getLatestFromSeries = series => {
	if (series.length > 0) {
		return series[series.length - 1][1];
	}
	return 0;
}

/**
 * Taking the forward and backward 3 seems to be the way to
 * Taking the previous 7 presents a lag
 */
const SMA_AVG = data => {
	const moveMean = [];

	for (var i = 3; i < data.length - 3; i++) {
		var mean =
			(data[i][1] +
				data[i - 1][1] +
				data[i - 2][1] +
				data[i - 3][1] +
				data[i + 1][1] +
				data[i + 2][1] +
				data[i + 3][1]) /
			7.0;
		moveMean.push([data[i][0], mean]);
	}

	return moveMean;
};

/**
 * Creates timeseries, latest and totals for confirmed, recovered and fatalities.
 * Assumes that dates are ordered - is this correct?
 * 
 * @param {*} series Either a country or province
 */
const createSeriesData = (series, population) => {
	// Total Timeseries
	const confirmedSeries = [];
	const recoveredSeries = [];
	const deathSeries = [];

	// Create cummalative timeseries -
	// If there is a missing data item in the series it can really screw things
	// up
	let prevConfirmed = 0;
	let prevRecovered = 0;
	let prevDeaths = 0;
	for (let i = 0; i < series.length; i++) {
		const entry = series[i];
		const currentConfirmed = prevConfirmed > entry.confirmed ? prevConfirmed : entry.confirmed;
		const currentRecovered = prevRecovered > entry.recovered ? prevRecovered : entry.recovered;
		const currentDeaths = prevDeaths > entry.deaths ? prevDeaths : entry.deaths
		confirmedSeries.push([entry.date, currentConfirmed]);
		recoveredSeries.push([entry.date, currentRecovered]);
		deathSeries.push([entry.date, currentDeaths]);
		prevConfirmed = currentConfirmed;
		prevRecovered = currentRecovered;
		prevDeaths = currentDeaths;
	}

	const totalConfirmed = getLatestFromSeries(confirmedSeries);
	const totalRecovered = getLatestFromSeries(recoveredSeries);
	const totalDeaths = getLatestFromSeries(deathSeries);

	const confirmedDailySeries = createDailySeries(confirmedSeries);
	const recoveredDailySeries = createDailySeries(recoveredSeries);
	const deathDailySeries = createDailySeries(deathSeries);

	const latestConfirmed = getLatestFromSeries(confirmedDailySeries);
	const latestDeaths = getLatestFromSeries(deathDailySeries);
	const latestRecovered = getLatestFromSeries(recoveredDailySeries);

	const confirmed14DaySeries = create14DayPer100k(population, confirmedDailySeries);
	const latestConfirmed14Day = getLatestFromSeries(confirmed14DaySeries);

	const sma = SMA_AVG(confirmedDailySeries)

	const len = sma.length;
	const slope = getSlope(sma.slice(len - 14, len));

	const totalConfirmed14Day = (totalConfirmed / population) * 100000;

	return {
		ts: {
			confirmedSeries,
			recoveredSeries,
			deathSeries,
			confirmedDailySeries,
			recoveredDailySeries,
			deathDailySeries,
			confirmed14DaySeries
		},
		stats: {
			latestConfirmed,
			latestRecovered,
			latestDeaths,
			totalConfirmed,
			totalRecovered,
			totalDeaths,
			latestConfirmed14Day,
			totalConfirmed14Day,
			slope
		}
	}
}

/**
 * Ignore cities - US only
 * 
 * @param {*} entries 
 * @param {*} countryCode 
 */
const createdSeriesForCountry = (entries, countryCode, usStatePopulation, population) => {
	const series = {
		data: [],		/* Garbage collected at the end of day */
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

	const merge = (data, newData) => {
		const current = data.find(item => item.date === newData.date);
		if (current) {
			current.confirmed += newData.confirmed;
			current.deaths += newData.deaths;
			current.recovered += newData.recovered;
		} else {
			data.push({ ...newData });
		}
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
			}
			else {
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

	if (countryCode === 'US') {
		for (const province of series.provinces) {
			const state = usStatePopulation.data.find(item => item.State == province.name)
			if (state) {
				province.population = state.Population;
			}
		}
	}

	Object.assign(series, createSeriesData(series.data, population))
	delete series.data;
	for (const province of series.provinces) {
		Object.assign(province, createSeriesData(province.data, province.population))
		delete province.data;
		for (const city of province.cities) {
			delete city.data;
		}
	}

	return series;
}

/**
 * Bases on subRegionName create a series
 */
export const createSeriesRegion = (countries) => {
	const regions = []
	const subRegions = [];

	const merge = (tsTo, tsFrom) => {
		for (let i = 0; i < tsFrom.length; i++) {
			const entry = tsFrom[i];
			const current = tsTo.find(item => item[0] === entry[0]);
			if (current) {
				current[1] += entry[1];
			} else {
				tsTo.push([entry[0], entry[1]]);
			}
		}
	};

	for (const country of countries) {
		let region = subRegions.find(item => item.subRegion === country.subRegionName);
		if (!region) {
			region = {
				uuid: uuid(),
				population: 0,
				region: country.regionName,
				subRegion: country.subRegionName,
				countries: [],
				stats: {
					latestConfirmed: 0,
					latestRecovered: 0,
					latestDeaths: 0,
					totalConfirmed: 0,
					totalRecovered: 0,
					totalDeaths: 0
				},
				ts: {
					confirmedSeries: [],
					recoveredSeries: [],
					deathSeries: [],
					confirmedDailySeries: [],
					recoveredDailySeries: [],
					deathDailySeries: []
				}
			}
			subRegions.push(region)
		}
		region.population += country.population;
		region.countries.push(country)
	}

	// Now merge country series into region series
	for (const region of subRegions) {
		for (const country of region.countries) {
			// Merge stats
			region.stats.latestConfirmed += country.series.stats.latestConfirmed;
			region.stats.latestRecovered += country.series.stats.latestRecovered;
			region.stats.latestDeaths += country.series.stats.latestDeaths;
			region.stats.totalConfirmed += country.series.stats.totalConfirmed;
			region.stats.totalRecovered += country.series.stats.totalRecovered;
			region.stats.totalDeaths += country.series.stats.totalDeaths;

			// Merge ts
			merge(region.ts.confirmedSeries, country.series.ts.confirmedSeries);
			merge(region.ts.recoveredSeries, country.series.ts.recoveredSeries);
			merge(region.ts.deathSeries, country.series.ts.deathSeries);
			merge(region.ts.confirmedDailySeries, country.series.ts.confirmedDailySeries);
			merge(region.ts.recoveredDailySeries, country.series.ts.recoveredDailySeries);
			merge(region.ts.deathDailySeries, country.series.ts.deathDailySeries);
		}
	}

	for (const region of subRegions) {
		let aregion = regions.find(item => item.name === region.region);
		if (!aregion) {
			aregion = {
				uuid: uuid(),
				population: 0,
				name: region.region,
				subRegions: [],
				stats: {
					latestConfirmed: 0,
					latestRecovered: 0,
					latestDeaths: 0,
					totalConfirmed: 0,
					totalRecovered: 0,
					totalDeaths: 0
				},
				ts: {
					confirmedSeries: [],
					recoveredSeries: [],
					deathSeries: [],
					confirmedDailySeries: [],
					recoveredDailySeries: [],
					deathDailySeries: []
				}
			}
			regions.push(aregion)
		}
		aregion.subRegions.push(region);
		aregion.population += region.population;

		// Merge stats
		aregion.stats.latestConfirmed += region.stats.latestConfirmed;
		aregion.stats.latestRecovered += region.stats.latestRecovered;
		aregion.stats.latestDeaths += region.stats.latestDeaths;
		aregion.stats.totalConfirmed += region.stats.totalConfirmed;
		aregion.stats.totalRecovered += region.stats.totalRecovered;
		aregion.stats.totalDeaths += region.stats.totalDeaths;

		// Merge ts
		merge(aregion.ts.confirmedSeries, region.ts.confirmedSeries);
		merge(aregion.ts.recoveredSeries, region.ts.recoveredSeries);
		merge(aregion.ts.deathSeries, region.ts.deathSeries);
		merge(aregion.ts.confirmedDailySeries, region.ts.confirmedDailySeries);
		merge(aregion.ts.recoveredDailySeries, region.ts.recoveredDailySeries);
		merge(aregion.ts.deathDailySeries, region.ts.deathDailySeries);

	}

	regions.sort(statsSorter);
	for (const region of regions) {
		region.subRegions.sort(statsSorter)
	}

	return regions;
}

export const create14DayCumulativeForCountries = (countries) => {
	for (const country of countries) {
		const country14Day = cumulative_number_for_14_days_of_COVID_19_cases_per_100000(country.series.ts.confirmedDailySeries, country.population);
		country.series.ts.confirmed14Day = country14Day;
		country.series.stats.latestConfirmed14Day = country14Day[country14Day.length - 1][1];
		for (const province of country.series.provinces) {
			const province14Day = cumulative_number_for_14_days_of_COVID_19_cases_per_100000(province.ts.confirmedDailySeries, province.population);
			province.ts.confirmed14Day = province14Day;
			province.stats.latestConfirmed14Day = province14Day[province14Day.length - 1][1];
		}
	}
}

export const create14DayCumulativeForRegions = (regions) => {
	for (const region of regions) {
		const region14Day = cumulative_number_for_14_days_of_COVID_19_cases_per_100000(region.ts.confirmedDailySeries, region.population);
		region.ts.confirmed14Day = region14Day;
		region.stats.latestConfirmed14Day = region14Day[region14Day.length - 1][1];
		for (const subRegion of region.subRegions) {
			const subRegion14Day = cumulative_number_for_14_days_of_COVID_19_cases_per_100000(subRegion.ts.confirmedDailySeries, subRegion.population);
			subRegion.ts.confirmed14Day = subRegion14Day;
			subRegion.stats.latestConfirmed14Day = subRegion14Day[subRegion14Day.length - 1][1];
		}
	}
}
