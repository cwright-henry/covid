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
const confirmedSorter = objectSorter('latestConfirmed', 'asc')
export const arrangeByConfirmed = countries => {
	const copy = [];
	countries.forEach(item => copy.push(item));
	return copy.sort(confirmedSorter);
};

/**
 * Sort by Recovered cases
 */
const recoveredSorter = objectSorter('latestRecovered', 'asc')
export const arrangeByRecovered = countries => {
	const copy = [];
	countries.forEach(item => copy.push(item));
	return copy.sort(recoveredSorter);
};

/**
 * Sort by Fatality cases
 */
const fatalitySorter = objectSorter('latestFatalities', 'asc')
export const arrangeByFatalities = countries => {
	const copy = [];
	countries.forEach(item => copy.push(item));
	return copy.sort(fatalitySorter);
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