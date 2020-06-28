import { uuid } from './utils'
import { timeseriesSorter } from './sorting'

const tsSorter = timeseriesSorter('desc')
const numberFormat = new Intl.NumberFormat(navigator.language, { maximumFractionDigits: 0, minimumFractionDigits: 0 });

const createFeatureCollection = () => {
    return {
        type: 'FeatureCollection',
        features: []
    }
}

const createFeature = (county, stats) => {
    return {
        type: 'Feature',
        properties: {
            name: county.name,
            population: numberFormat.format(county.population || 0),
            totalConfirmed: numberFormat.format(stats.totalConfirmed || 0),
            totalConfirmedRaw: stats.totalConfirmed || 0,
            latestConfirmed: numberFormat.format(stats.latestConfirmed || 0),
            latestConfirmedRaw: stats.latestConfirmed || 0
        },
        geometry: {
            type: 'Point',
            coordinates: [county.lng, county.lat]
        }
    }
}

const getLocations = (locationData) => {
    return locationData.data.filter(item => {
        return !item.name.startsWith(' ')
    })
        .map(item => {
            return {
                uuid: uuid(),
                name: item.name,
                lat: item.la,
                lng: item.lo,
                ts: {
                    confirmedSeries: [],
                    confirmedDailySeries: []
                },
                stats: {
                    totalConfirmed: 0,
                    latestConfirmed: 0
                }
            }
        });
}
const regex = /\\\"/gi;
const replacement = "\"";

export const parseUK = (locationData, countyData) => {
    const geojson = createFeatureCollection();
    const locations = getLocations(locationData);
    for (const entry of countyData.data) {
        const area = JSON.parse(entry.area.replace(regex, replacement))
        const date = entry.date;
        for (const town of area) {
            const location = locations.find(item => item.name === town.location)
            if (location) {
                location.ts.confirmedSeries.push([date, town.number || 0])
            }
        }
    }

    let t = 0;

    for (const entry of locations) {
        entry.ts.confirmedSeries.sort(tsSorter)
        for (let i = 1; i < entry.ts.confirmedSeries.length; i++) {
            const current = entry.ts.confirmedSeries[i];
            const previous = entry.ts.confirmedSeries[i - 1];
            entry.ts.confirmedDailySeries.push([current[0], current[1] - previous[1]])

            if (i === entry.ts.confirmedSeries.length - 1) {
                entry.stats.totalConfirmed = entry.ts.confirmedSeries[i][1];
                entry.stats.latestConfirmed = current[1] - previous[1];
                t += parseInt(entry.stats.latestConfirmed)
                geojson.features.push(createFeature(entry, {
                    totalConfirmed: entry.stats.totalConfirmed,
                    latestConfirmed: entry.stats.latestConfirmed
                }))
            }
        }
    }
    return { provinces: locations, geojson };
}