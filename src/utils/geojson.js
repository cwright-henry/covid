import { sortGeoJson } from './sorting'

const numberFormat = new Intl.NumberFormat({ maximumFractionDigits: 0, minimumFractionDigits: 0 });
const totalConfirmedSorter = sortGeoJson("totalConfirmedRaw", "asc");
const totalRecoveredSorter = sortGeoJson("totalRecoveredRaw", "asc");
const totalFatalitiesSorter = sortGeoJson("totalFatalitiesRaw", "asc");
const lastConfirmedSorter = sortGeoJson("latestConfirmedRaw", "asc");
const latestRecoveredSorter = sortGeoJson("latestRecoveredRaw", "asc");
const latestFatalitiesSorter = sortGeoJson("latestFatalitiesdRaw", "asc");

const createFeatureCollection = () => {
    return {
        type: 'FeatureCollection',
        features: []
    }
}

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
            totalConfirmed: numberFormat.format(stats.totalConfirmed || 0),
            totalConfirmedRaw: stats.totalConfirmed || 0,
            totalRecovered: numberFormat.format(stats.totalRecovered || 0),
            totalRecoveredRaw: stats.totalRecovered || 0,
            totalFatalities: numberFormat.format(stats.totalFatalities || 0),
            totalFatalitiesRaw: stats.totalFatalities || 0,
            latestConfirmed: numberFormat.format(stats.latestConfirmed || 0),
            latestConfirmedRaw: stats.latestConfirmed || 0,
            latestRecovered: numberFormat.format(stats.latestRecovered || 0),
            latestRecoveredRaw: stats.latestRecovered || 0,
            latestFatalities: numberFormat.format(stats.latestFatalities || 0),
            latestFatalitiesRaw: stats.latestFatalities || 0
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
    const geoJson = createFeatureCollection()

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
 * 	Create history for all countries to be used for animation
 * 	Take any confirmed ts - first one and iterate over the dates
 * 	Remove 0 values and split series
 * 	Sort the final feature set
 * 
 *  @param {*} countries
 */
export const createGeoJsonHistoryForCountries = countries => {
    const history = [];
    const baseSeeries = countries[0].series.ts.confirmedSeries;
    for (let i = 1; i < baseSeeries.length; i++) {
        const totalConfirmed = createFeatureCollection();
        const totalRecovered = createFeatureCollection();
        const totalFatalities = createFeatureCollection();
        const latestConfirmed = createFeatureCollection();
        const latestRecovered = createFeatureCollection();
        const latestFatalities = createFeatureCollection();

        for (const country of countries) {
            if (country.series.ts.confirmedSeries[i][1] > 0) {
                totalConfirmed.features.push(createFeature(country, {
                    totalConfirmed: country.series.ts.confirmedSeries[i][1]
                }))
            }
            if (country.series.ts.recoveredSeries[i][1] > 0) {
                totalRecovered.features.push(createFeature(country, {
                    totalRecovered: country.series.ts.recoveredSeries[i][1]
                }))
            }
            if (country.series.ts.deathSeries[i][1] > 0) {
                totalFatalities.features.push(createFeature(country, {
                    totalFatalities: country.series.ts.deathSeries[i][1]
                }))
            }
            if (country.series.ts.confirmedDailySeries[i - 1][1] > 0) {
                latestConfirmed.features.push(createFeature(country, {
                    latestConfirmed: country.series.ts.confirmedDailySeries[i - 1][1]
                }))
            }
            if (country.series.ts.recoveredDailySeries[i - 1][1] > 0) {
                latestRecovered.features.push(createFeature(country, {
                    latestRecovered: country.series.ts.recoveredDailySeries[i - 1][1]
                }))
            }
            if (country.series.ts.deathDailySeries[i - 1][1] > 0) {
                latestFatalities.features.push(createFeature(country, {
                    latestFatalities: country.series.ts.deathDailySeries[i - 1][1]
                }))
            }
        }
        totalConfirmed.features.sort(totalConfirmedSorter)
        totalRecovered.features.sort(totalRecoveredSorter)
        totalFatalities.features.sort(totalFatalitiesSorter)
        latestConfirmed.features.sort(lastConfirmedSorter)
        latestRecovered.features.sort(latestRecoveredSorter)
        latestFatalities.features.sort(latestFatalitiesSorter)
        history.push({ date: baseSeeries[i][0], totalConfirmed, totalRecovered, totalFatalities, latestConfirmed, latestRecovered, latestFatalities })
    }

    return history;
}