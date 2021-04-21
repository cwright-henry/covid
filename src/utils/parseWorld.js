import { uuid, getSlope, SMA_AVG, create14DayPer100k, getLatestFromSeries } from './utils'
import { createGeoJsonForCountry, createGeoJsonHistoryForCountries } from './geojson'
import { sortCountriesStats, timeseriesSorter } from './sorting'

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

const mergeVaccines = (to, from) => {
	if (to === '') {
		return from;
	}
	const toSet = new Set(to.split(','))
	const fromSet = new Set(from.split(','))
	fromSet.forEach(toSet.add, toSet)
	return Array.from(toSet).join(',')
}

/**
 * Replace long names with shorter - this helps the map
 */
const shortNames = [
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

/**
 * Map the case name to the meta data
 */
const caseNameMapping = [
	{ caseName: "US", actualName: 'United States of America' },
	{ caseName: "United Kingdom", actualName: 'United Kingdom of Great Britain and Northern Ireland' },
	{ caseName: "Vietnam", actualName: 'Viet Nam' },
	{ caseName: "Venezuela", actualName: 'Venezuela (Bolivarian Republic of)' },
	{ caseName: "Tanzania", actualName: 'Tanzania, United Republic of' },
	{ caseName: "Taiwan*", actualName: 'Taiwan' },
	{ caseName: "Syria", actualName: 'Syrian Arab Republic' },
	{ caseName: `\"Korea, South\"`, actualName: 'Korea (Republic of)' },
	{ caseName: "Russia", actualName: 'Russian Federation' },
	{ caseName: "Moldova", actualName: 'Moldova (Republic of)' },
	{ caseName: "Micronesia", actualName: 'Micronesia (Federated States of)' },
	{ caseName: "Laos", actualName: `Lao People's Democratic Republic` },
	{ caseName: "Iran", actualName: 'Iran (Islamic Republic of)' },
	{ caseName: "Bolivia", actualName: 'Bolivia (Plurinational State of)' },
	{ caseName: "Congo (Kinshasa)", actualName: 'Congo (Democratic Republic of the)' },
	{ caseName: "Congo (Brazzaville)", actualName: 'Congo' },
	{ caseName: "Czechia", actualName: 'Czech Republic' },
	{ caseName: "Kosovo", actualName: 'Republic of Kosovo' },
	{ caseName: "North Macedonia", actualName: 'Macedonia (the former Yugoslav Republic of)' },
	{ caseName: "British Virgin Islands", actualName: 'Virgin Islands (British)' },
	{ caseName: `Côte d'Ivoire`, actualName: `Cote d'Ivoire` },
	{ caseName: `\"Bonaire, Sint Eustatius and Saba\"`, actualName: `Bonaire, Sint Eustatius and Saba` },
	{ caseName: "Brunei", actualName: "Brunei Darussalam" },
	{ caseName: "Curacao", actualName: "Curaçao" },
	{ caseName: "Reunion", actualName: "Réunion" },
	{ caseName: "Saint Barthelemy", actualName: "Saint Barthélemy" },
	{ caseName: "St Martin", actualName: "Saint Martin (French part)" },
	{ caseName: "Sint Maarten", actualName: "Sint Maarten (Dutch part)" },
	{ caseName: "Burma", actualName: "Myanmar" },
];

const statsSorter = sortCountriesStats('latestConfirmed', 'asc');

const findCaseName = name => {
	const replacement = caseNameMapping.find(item => item.caseName === name);
	return replacement ? replacement.actualName : name;
}

const findShorttName = name => {
	const shortName = shortNames.find(item => item.longName === name);
	return shortName ? shortName.shortName : name;
}

const processEntries = (countryCode, data, population) => {
	if (countryCode === 'US') {
		const provinces = [];
		const totalConfirmed = []
		const totalDeaths = []

		// Role up cities to provinces and provinces to the country level
		// Note there is no recovered for US
		for (const entry of data) {
			let province = provinces.find(item => item.name === entry.province);
			if (province) {
				merge(province.confirmed, entry.confirmed)
				merge(province.deaths, entry.deaths)
				province.population += entry.population;
			}
			else {
				const confirmed = [];
				const deaths = [];
				merge(confirmed, entry.confirmed);
				merge(deaths, entry.deaths);
				province = {
					uuid: uuid(),
					name: entry.province,
					lat: entry.lat,
					lng: entry.lng,
					confirmed,
					deaths,
					population: entry.population
				}
				provinces.push(province)
			}
			merge(totalConfirmed, entry.confirmed)
			merge(totalDeaths, entry.deaths)
		}

		for (const province of provinces) {
			Object.assign(province, createSeriesData({
				confirmedSeries: province.confirmed,
				deathSeries: province.deaths,
				recoveredSeries: []
			}, province.population));
			delete province.confirmed;
			delete province.deaths;
		}

		return Object.assign({}, { provinces: provinces }, createSeriesData({ confirmedSeries: totalConfirmed, deathSeries: totalDeaths, recoveredSeries: [] }, population))
	}
	else if (countryCode === 'AU' || countryCode === 'CA' || countryCode === 'CN') {
		const provinces = []
		const totalConfirmed = []
		const totalDeaths = []
		const totalRecovered = []

		for (const entry of data) {
			merge(totalConfirmed, entry.confirmed)
			merge(totalDeaths, entry.deaths)
			merge(totalRecovered, entry.recovered || [])
			const province = {
				uuid: uuid(),
				name: entry.province,
				lat: entry.lat,
				lng: entry.lng,
				confirmed: entry.confirmed,
				deaths: entry.deaths,
				recovered: entry.recovered || []
			}
			provinces.push(province)
		}
		for (const province of provinces) {
			Object.assign(province, createSeriesData({
				confirmedSeries: province.confirmed,
				deathSeries: province.deaths,
				recoveredSeries: province.recovered
			}, province.population));
			delete province.confirmed;
			delete province.deaths;
			delete province.recovered;
		}

		return Object.assign({}, { provinces: provinces }, createSeriesData({ confirmedSeries: totalConfirmed, deathSeries: totalDeaths, recoveredSeries: totalRecovered }, population))
	}
	else {
		return Object.assign({}, { provinces: [] }, createSeriesData({ confirmedSeries: data[0].confirmed, deathSeries: data[0].deaths, recoveredSeries: data[0].recovered || [] }, population))
	}
}

export const parseWorld = (countries, cases, vaccinations, vaccinationsLocations) => {
	const data = [];
	for (const country of countries) {
		let entries = cases.filter(
			item => country.name === findCaseName(item.country) || country.name === findCaseName(item.province)
		);

		if (entries.length > 1) {
			const country = entries.find(item => item.province === '')
			if (country) {
				entries = [country]
			}
		}

		if (entries.length > 0) {
			const name = findShorttName(country.name);
			const population = country.alpha2Code === 'IE' ? 4937786 : country.population;
			const vaccineData = vaccinations.find(item => item.iso === country.alpha3Code);
			const vaccineLocationData = vaccinationsLocations.find(item => item.iso === country.alpha3Code)
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
				vaccinations: vaccineData || { total: 0, percent: 0, data: [] },
				vaccinationsLatest: vaccineData?.data ? getLatestFromSeries(vaccineData.data) : 0,
				vaccines: vaccineLocationData?.vaccines || '',
				regionCode: country.regionalBlocs[0]
					? country.regionalBlocs[0].acronym
					: "Other",
				series: processEntries(country.alpha2Code, entries, population)
			}

			item.fullyVaccinated = (item.vaccinations.percent / 100) * item.population;

			if (item.series.provinces?.length > 0) {
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
 * Coverage/summary of all the countries
 * 
 * @param {*} countries List of supported countries
 */
export const createSeriesCoverage = countries => {
	const coverage = {
		numCountries: countries.length,
		lastestDate: null,
		population: 0,
		vaccinations: 0,
		fullyVaccinated: 0,
		history: null,
		daysSoFar: 0,
		stats: {
			latestConfirmed: 0,
			latestDeaths: 0,
			latestVaccinations: 0,
			totalConfirmed: 0,
			totalDeaths: 0
		},
		ts: {
			confirmedSeries: [],
			deathSeries: [],
			confirmedDailySeries: [],
			deathDailySeries: [],
			dailyVaccinations: []
		}
	};

	let minDate = Number.MAX_VALUE;
	let maxDate = 0;

	for (let i = 0; i < countries.length; i++) {
		const country = countries[i];

		// Merge pop
		coverage.population += country.population;

		// Merge vaccinations
		coverage.vaccinations += country.vaccinations.total;
		coverage.fullyVaccinated += country.fullyVaccinated;

		// Merge stats
		coverage.stats.latestConfirmed += country.series.stats.latestConfirmed;
		coverage.stats.latestDeaths += country.series.stats.latestDeaths;
		coverage.stats.totalConfirmed += country.series.stats.totalConfirmed;
		coverage.stats.totalDeaths += country.series.stats.totalDeaths;

		// Merge ts
		merge(coverage.ts.confirmedSeries, country.series.ts.confirmedSeries);
		merge(coverage.ts.deathSeries, country.series.ts.deathSeries);
		merge(coverage.ts.confirmedDailySeries, country.series.ts.confirmedDailySeries);
		merge(coverage.ts.deathDailySeries, country.series.ts.deathDailySeries);
		merge(coverage.ts.dailyVaccinations, country.vaccinations.data);

		// lastest Date
		coverage.lastestDate = ""
		if (country.series.ts.confirmedSeries.length > 0) {
			coverage.lastestDate = country.series.ts.confirmedSeries[country.series.ts.confirmedSeries.length - 1][0];
		}

		// Calculate date range for daysSoFar
		const min = coverage.ts.confirmedSeries[0][0]
		const max = coverage.ts.confirmedSeries[coverage.ts.confirmedSeries.length - 1][0];
		if (min < minDate) {
			minDate = min;
		}
		if (max > maxDate) {
			maxDate = max;
		}
	}

	coverage.daysSoFar = (maxDate - minDate) / (1000 * 60 * 60 * 24);

	coverage.ts.dailyVaccinations.sort(timeseriesSorter('desc'))

	coverage.ts.confirmedSMASeries = SMA_AVG(coverage.ts.confirmedDailySeries)
	coverage.ts.deathSMASeries = SMA_AVG(coverage.ts.deathDailySeries)
	coverage.ts.vaccinationsSMASeries = SMA_AVG(coverage.ts.dailyVaccinations)

	coverage.ts.confirmed14DaySeries = create14DayPer100k(coverage.population, coverage.ts.confirmedDailySeries);
	coverage.stats.latestConfirmed14Day = getLatestFromSeries(coverage.ts.confirmed14DaySeries);
	coverage.stats.totalConfirmed14Day = (coverage.stats.totalConfirmed / coverage.population) * 100000;
	coverage.stats.latestVaccinations = getLatestFromSeries(coverage.ts.dailyVaccinations);

	coverage.history = createGeoJsonHistoryForCountries(countries)
	return coverage;
}

/**
 * Creates timeseries, latest and totals for confirmed, recovered and fatalities.
 * Assumes that dates are ordered - is this correct?
 * 
 * @param {*} series Either a country or province
 */
const createSeriesData = ({ confirmedSeries, deathSeries, recoveredSeries }, population) => {

	const totalConfirmed = getLatestFromSeries(confirmedSeries);
	const totalRecovered = getLatestFromSeries(recoveredSeries);
	const totalDeaths = getLatestFromSeries(deathSeries);

	const confirmedDailySeries = createDailySeries(confirmedSeries);
	const recoveredDailySeries = createDailySeries(recoveredSeries);
	const deathDailySeries = createDailySeries(deathSeries);

	const latestConfirmed = getLatestFromSeries(confirmedDailySeries);
	const latestDeaths = getLatestFromSeries(deathDailySeries);
	const latestRecovered = getLatestFromSeries(recoveredDailySeries);

	const confirmedSMASeries = SMA_AVG(confirmedDailySeries)
	const recoveredSMASeries = SMA_AVG(recoveredDailySeries)
	const deathSMASeries = SMA_AVG(deathDailySeries)

	const len = confirmedSMASeries.length;
	const slope = getSlope(confirmedSMASeries.slice(len - 14, len));

	// Some sub-series do not have a defined population
	let confirmed14DaySeries = []
	let latestConfirmed14Day = 0;
	let totalConfirmed14Day = 0;
	if (population) {
		confirmed14DaySeries = create14DayPer100k(population, confirmedDailySeries);
		latestConfirmed14Day = getLatestFromSeries(confirmed14DaySeries);
		totalConfirmed14Day = (totalConfirmed / population) * 100000;
	}

	return {
		ts: {
			confirmedSeries,
			recoveredSeries,
			deathSeries,
			confirmedDailySeries,
			recoveredDailySeries,
			deathDailySeries,
			confirmed14DaySeries,
			confirmedSMASeries,
			recoveredSMASeries,
			deathSMASeries
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
 * Bases on subRegionName create a series
 */
export const createSeriesRegion = (countries) => {
	const regions = []
	const subRegions = [];

	for (const country of countries) {
		let region = subRegions.find(item => item.subRegion === country.subRegionName);
		if (!region) {
			region = {
				uuid: uuid(),
				population: 0,
				vaccinations: 0,
				fullyVaccinated: 0,
				region: country.regionName,
				subRegion: country.subRegionName,
				countries: [],
				vaccines: null,
				stats: {
					latestConfirmed: 0,
					latestDeaths: 0,
					totalConfirmed: 0,
					totalDeaths: 0
				},
				ts: {
					vaccinationsSeries: [],
					confirmedSeries: [],
					deathSeries: [],
					confirmedDailySeries: [],
					deathDailySeries: [],
					confirmedSMASeries: [],
					deathSMASeries: []
				}
			}
			subRegions.push(region)
		}
		region.population += country.population;
		region.vaccinations += country.vaccinations.total;
		region.fullyVaccinated += country.fullyVaccinated;
		region.countries.push(country)
	}

	// Now merge country series into region series
	for (const region of subRegions) {
		const vaccinesSet = new Set();
		for (const country of region.countries) {
			// Merge stats
			region.stats.latestConfirmed += country.series.stats.latestConfirmed;
			region.stats.latestDeaths += country.series.stats.latestDeaths;
			region.stats.totalConfirmed += country.series.stats.totalConfirmed;
			region.stats.totalDeaths += country.series.stats.totalDeaths;

			// Merge ts
			merge(region.ts.confirmedSeries, country.series.ts.confirmedSeries);
			merge(region.ts.deathSeries, country.series.ts.deathSeries);
			merge(region.ts.confirmedDailySeries, country.series.ts.confirmedDailySeries);
			merge(region.ts.deathDailySeries, country.series.ts.deathDailySeries);
			merge(region.ts.vaccinationsSeries, country.vaccinations.data);

			// Merge Vaccines
			const vaccines = country.vaccines.split(',');
			for (const vaccineUsed of vaccines) {
				if (vaccineUsed) {
					vaccinesSet.add(vaccineUsed.trim());
				}
			}

		}
		region.ts.vaccinationsSeries.sort(timeseriesSorter('desc'));
		region.vaccines = Array.from(vaccinesSet).join(', ')
		region.ts.confirmedSMASeries = SMA_AVG(region.ts.confirmedDailySeries)
		region.ts.deathSMASeries = SMA_AVG(region.ts.deathDailySeries)
		region.ts.confirmed14DaySeries = create14DayPer100k(region.population, region.ts.confirmedDailySeries);
		region.stats.latestConfirmed14Day = getLatestFromSeries(region.ts.confirmed14DaySeries);
		region.stats.totalConfirmed14Day = (region.stats.totalConfirmed / region.population) * 100000;
	}

	for (const region of subRegions) {
		let aregion = regions.find(item => item.name === region.region);
		if (!aregion) {
			aregion = {
				uuid: uuid(),
				population: 0,
				vaccinations: 0,
				fullyVaccinated: 0,
				name: region.region,
				subRegions: [],
				stats: {
					latestConfirmed: 0,
					latestDeaths: 0,
					totalConfirmed: 0,
					totalDeaths: 0
				},
				ts: {
					vaccinationsSeries: [],
					confirmedSeries: [],
					deathSeries: [],
					confirmedDailySeries: [],
					deathDailySeries: [],
					confirmedSMASeries: [],
					deathSMASeries: []
				}
			}
			regions.push(aregion)
		}
		aregion.subRegions.push(region);
		aregion.population += region.population;
		aregion.vaccinations += region.vaccinations;
		aregion.fullyVaccinated += region.fullyVaccinated;

		// Merge stats
		aregion.stats.latestConfirmed += region.stats.latestConfirmed;
		aregion.stats.latestDeaths += region.stats.latestDeaths;
		aregion.stats.totalConfirmed += region.stats.totalConfirmed;
		aregion.stats.totalDeaths += region.stats.totalDeaths;

		// Merge ts
		merge(aregion.ts.vaccinationsSeries, region.ts.vaccinationsSeries);
		merge(aregion.ts.confirmedSeries, region.ts.confirmedSeries);
		merge(aregion.ts.deathSeries, region.ts.deathSeries);
		merge(aregion.ts.confirmedDailySeries, region.ts.confirmedDailySeries);
		merge(aregion.ts.deathDailySeries, region.ts.deathDailySeries);
		merge(aregion.ts.confirmedSMASeries, region.ts.confirmedSMASeries);
		merge(aregion.ts.deathSMASeries, region.ts.deathSMASeries);
		aregion.ts.vaccinationsSeries.sort(timeseriesSorter('desc'))

		aregion.ts.confirmed14DaySeries = create14DayPer100k(aregion.population, aregion.ts.confirmedDailySeries);
		aregion.stats.latestConfirmed14Day = getLatestFromSeries(aregion.ts.confirmed14DaySeries);
		aregion.stats.totalConfirmed14Day = (aregion.stats.totalConfirmed / aregion.population) * 100000;
	}

	regions.sort(statsSorter);
	for (const region of regions) {
		region.subRegions.sort(statsSorter)
	}

	return regions;
}
