import { uuid, cumulative_number_for_14_days_of_COVID_19_cases_per_100000 } from './utils'
import { createGeoJsonForCountry, createGeoJsonHistoryForCountries } from './geojson'
import { sortCountriesStats } from './sorting'

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
		const entries = cases.filter(
			item => country.alpha2Code === item.CountryCode
		);
		if (entries.length > 0) {
			const name = findReplacementName(country.name);
			const item = {
				uuid: uuid(),
				countryName: name,
				filteredName: name.toLowerCase(),
				countryCode: country.alpha2Code,
				countryCode3: country.alpha3Code,
				flag: country.flag,
				population: country.population,
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
					usStatePopulation
				)
			};
			if (item.series.provinces.length > 0) {
				item.geojson = createGeoJsonForCountry(item)
			}
			data.push(item);
		}
	}
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
		coverage.lastestDate = country.series.ts.confirmedSeries[country.series.ts.confirmedSeries.length - 1][0];
	}

	coverage.history = createGeoJsonHistoryForCountries(countries)
	return coverage;
};

/**
 * Creates timeseries, latest and totals for confirmed, recovered and fatalities.
 * Assumes that dates are ordered - is this correct?
 * 
 * @param {*} series Either a country. province or city
 */
const createSeriesData = (series) => {
	// Timeseries
	const confirmedSeries = [];
	const recoveredSeries = [];
	const deathSeries = [];
	const confirmedDailySeries = [];
	const recoveredDailySeries = [];
	const deathDailySeries = [];

	// Latest Figures
	let latestConfirmed = 0;
	let latestRecovered = 0;
	let latestDeaths = 0;

	// Total Figures
	let totalConfirmed = 0;
	let totalRecovered = 0;
	let totalDeaths = 0;

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

	// Create totals
	if (confirmedSeries.length > 0) {
		totalConfirmed = confirmedSeries[confirmedSeries.length - 1][1];
	}
	if (recoveredSeries.length > 0) {
		totalRecovered = recoveredSeries[recoveredSeries.length - 1][1];
	}
	if (deathSeries.length > 0) {
		totalDeaths = deathSeries[deathSeries.length - 1][1];
	}

	// Create daily time series and latest figures
	for (let i = 1; i < confirmedSeries.length; i++) {
		const date = confirmedSeries[i][0];
		const diff =
			confirmedSeries[i][1] -
			confirmedSeries[i - 1][1];
		confirmedDailySeries.push([date, diff > 0 ? diff : 0]);
	}
	if (confirmedDailySeries.length > 0) {
		latestConfirmed = confirmedDailySeries[
			confirmedDailySeries.length - 1
		][1];
	}

	for (let i = 1; i < recoveredSeries.length; i++) {
		const date = recoveredSeries[i][0];
		const diff =
			recoveredSeries[i][1] -
			recoveredSeries[i - 1][1];
		recoveredDailySeries.push([date, diff]);
	}
	if (recoveredDailySeries.length > 0) {
		latestRecovered = recoveredDailySeries[
			recoveredDailySeries.length - 1
		][1];
	}

	for (let i = 1; i < deathSeries.length; i++) {
		const date = deathSeries[i][0];
		const diff =
			deathSeries[i][1] - deathSeries[i - 1][1];
		deathDailySeries.push([date, diff]);
	}
	if (deathDailySeries.length > 0) {
		latestDeaths = deathDailySeries[
			deathDailySeries.length - 1
		][1];
	}

	return {
		ts: {
			confirmedSeries,
			recoveredSeries,
			deathSeries,
			confirmedDailySeries,
			recoveredDailySeries,
			deathDailySeries,
		},
		stats: {
			latestConfirmed,
			latestRecovered,
			latestDeaths,
			totalConfirmed,
			totalRecovered,
			totalDeaths,
		}
	}
}

/**
 * Ignore cities - US only
 * 
 * @param {*} entries 
 * @param {*} countryCode 
 */
const createdSeriesForCountry = (entries, countryCode, usStatePopulation) => {
	const series = {
		data: [],		/* Get Garbage collected at the end of day */
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
		for (let province of series.provinces) {
			const state = usStatePopulation.data.find(item => item.State == province.name)
			if (state) {
				province.population = state.Population;
			}
		}
	}

	Object.assign(series, createSeriesData(series.data))
	delete series.data;
	for (let province of series.provinces) {
		Object.assign(province, createSeriesData(province.data))
		delete province.data;
		for (let city of province.cities) {
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
