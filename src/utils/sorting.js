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
			a["series"] && b["series"] &&
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