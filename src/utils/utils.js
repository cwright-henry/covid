const colors = [
    "#2196F3",
    "#78909C",
    "#3949AB",
    "#E64A19",
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
    "#FFF59D",
    "#FFFFFF",
    "#ff0000",
    "#ffc107",
];

const continentColor = [
    "#37474F",
    "#1976D2",
    "#BBDEFB",
    "#673AB7",
    "#FFEB3B",
];

/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
 * 
 * @param {*} object 
 */
export const deepFreeze = (object) => {

    // Retrieve the property names defined on object
    var propNames = Object.getOwnPropertyNames(object);

    // Freeze properties before freezing self

    for (let name of propNames) {
        let value = object[name];

        if (value && typeof value === "object") {
            deepFreeze(value);
        }
    }

    return Object.freeze(object);
}

export const findColor = index => {
    return colors[index % colors.length];
};

export const findContinentColor = index => {
    return continentColor[index % continentColor.length];
};

/**
 * Unique ID from element
 */
export const uuid = () => {
    return parseInt(Math.random().toString().slice(2, 11))
}

/**
 * https://css-tricks.com/snippets/javascript/lighten-darken-color/
 * 
 * Note: not very effecctive!!
 * 
 * @param {*} col 
 * @param {*} amt 
 */
export const lightenDarkenColor = (col, amt) => {

    var usePound = false;

    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col, 16);

    var r = (num >> 16) + amt;

    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    var g = (num & 0x0000FF) + amt;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);

}

/**
 * Create a per capita timeseries
 *
 * @param {*} arr
 * @param {*} population
 */
export const createPerCapita = (arr, population) => {
    if (population) {
        return arr.map(item => {
            return [item[0], (item[1] / population) * 100000];
        });
    }
    return arr;
};

/**
 * 14 Day average of cumulative confirmed cases
 * 
 * @param {*} arr 
 * @param {*} population 
 */
export const cumulative_number_for_14_days_of_COVID_19_cases_per_100000 = (arr, population) => {
    const cumulative = [];
    for (let i = 13; i < arr.length; i++) {
        const count = arr[i][1] + arr[i - 1][1] + arr[i - 2][1] + arr[i - 3][1] + arr[i - 4][1] + arr[i - 5][1] + arr[i - 6][1] + arr[i - 7][1]
            + arr[i - 8][1] + arr[i - 9][1] + arr[i - 10][1] + arr[i - 11][1] + arr[i - 12][1] + arr[i - 13][1];
        cumulative.push([arr[i][0], (count / population) * 100000]);
    }

    return cumulative;
}

/**
 * Can only tell increasing or decreasing slope
 * 
 * @param {*} data 
 */
export const getSlope = data => {
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
 * Taking the forward and backward 3 seems to be the way to
 * Taking the previous 7 presents a lag
 */
export const SMA_AVG = data => {
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
 * Covid-19 confirmed, recovered, fatalities per 100,000 people over the past 14 days.
 */
export const create14DayPer100k = (population, series) => {
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
export const getLatestFromSeries = series => {
    if (series.length > 0) {
        return series[series.length - 1][1];
    }
    return 0;
}

