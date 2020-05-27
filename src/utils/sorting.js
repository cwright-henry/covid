/**
 * Sort the properties of geoJson file
 * 
 * @param {*} property 
 * @param {*} sort 
 */
export const sortGeoJson = (property, sort) => {
	return function (a, b) {
		if (
			a["properties"][property] != undefined &&
			b["properties"][property] !== undefined
		) {
			const left =
				typeof a["properties"][property] === "string"
					? a["properties"][property].toUpperCase()
					: a["properties"][property];
			const right =
				typeof b["properties"][property] === "string"
					? b["properties"][property].toUpperCase()
					: b["properties"][property];

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
 * Sort the properties of countries.series.stats
 * 
 * @param {*} property 
 * @param {*} sort 
 */
export const sortCountries = (property, sort) => {
	return function (a, b) {
		if (
			a["series"]['stats'][property] != undefined &&
			b["series"]['stats'][property] !== undefined
		) {
			const left =
				typeof a["series"]['stats'][property] === "string"
					? a["series"]['stats'][property].toUpperCase()
					: a["series"]['stats'][property];
			const right =
				typeof b["series"]['stats'][property] === "string"
					? b["series"]['stats'][property].toUpperCase()
					: b["series"]['stats'][property];

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
 * Sort timeseries
 * 
 * @param {*} property 
 * @param {*} sort 
 */
export const timeseriesSorter = (sort) => {
	return function (a, b) {
		if ((a[0] != undefined) && (b[0] !== undefined)) {
			const left = a[0];
			const right = b[0];

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
 * Generic Sort array of object by properties
 * 
 * @param {*} property 
 * @param {*} sort 
 */
export const objectSorter = (property, sort) => {
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
 * Sort By population
 */
const populationSorter = objectSorter('population', 'asc')
export const arrangeByPopulation = countries => {
	const copy = [];
	countries.forEach(item => copy.push(item));
	return copy.sort(populationSorter);
};

/**
 * Sort by Confirmed cases
 */
const totalConfirmedSorter = sortCountries('totalConfirmed', 'asc')
export const arrangeByTotalConfirmed = countries => {
	const copy = [];
	countries.forEach(item => copy.push(item));
	return copy.sort(totalConfirmedSorter);
};

/**
 * Sort by Latest Confirmed cases
 */
const latestConfirmedSorter = sortCountries('latestConfirmed', 'asc')
export const arrangeByLatestConfirmed = countries => {
	const copy = [];
	countries.forEach(item => copy.push(item));
	return copy.sort(latestConfirmedSorter);
};

/**
 * Sort by Total Recovered cases
 */
const totalRecoveredSorter = sortCountries('totalRecovered', 'asc')
export const arrangeByTotalRecovered = countries => {
	const copy = [];
	countries.forEach(item => copy.push(item));
	return copy.sort(totalRecoveredSorter);
};

/**
 * Sort by Latest Recovered cases
 */
const latestRecoveredSorter = sortCountries('latestRecovered', 'asc')
export const arrangeByLatestRecovered = countries => {
	const copy = [];
	countries.forEach(item => copy.push(item));
	return copy.sort(latestRecoveredSorter);
};

/**
 * Sort by Total Fatality cases
 */
const totalDeathsSorter = sortCountries('totalDeaths', 'asc')
export const arrangeByTotalFatalities = countries => {
	const copy = [];
	countries.forEach(item => copy.push(item));
	return copy.sort(totalDeathsSorter);
};

/**
 * Sort by Latest Fatality cases
 */
const latestDeathsSorter = sortCountries('latestDeaths', 'asc')
export const arrangeByLatestFatalities = countries => {
	const copy = [];
	countries.forEach(item => copy.push(item));
	return copy.sort(latestDeathsSorter);
};


/**
 * Group counties by region or subregion
 * 
 * @param {*} countries 
 * @param {*} subRegion 
 */
export const arrangeByRegion = (countries, subRegion) => {
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