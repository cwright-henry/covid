import { load } from '@/services/Api';
import { parseWorld, createSeriesCoverage, createSeriesRegion } from './parsing2'
import { parseIreland } from './parseIE'

/**
 * Examples:
 * https://covid19ireland-geohive.hub.arcgis.com/pages/detailed-county-statistics
 */

class Coverage {
    static COUNTRY_URL = "https://restcountries.eu/rest/v2/all";
    static GLOBAL_CONFIRMED_URL = "/covid/api/covid-data-confirmed-global";
    static US_CONFIRMED_URL = "/covid/api/covid-data-confirmed-us";
    static GLOBAL_DEATHS_URL = "/covid/api/covid-data-deaths-global";
    static US_DEATHS_URL = "/covid/api/covid-data-deaths-us";
    static GLOBAL_RECOVERED_URL = "/covid/api/covid-data-recovered-global";
    static IRELAND_URL = "/covid/api/covid-ireland-data";
    static US_POPULATION = "https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest";

    static async mergeCases(globalConfirmed, usConfirmed, globalDeaths, usDeaths, globalRecovered) {
        return new Promise(resolve => {
            globalConfirmed = globalConfirmed.filter(item => item.country !== "US")
            for (const globalEntry of globalConfirmed) {
                const deathsEntry = globalDeaths.find(item => item.country === globalEntry.country && item.province === globalEntry.province)
                if (deathsEntry) {
                    globalEntry.deaths = deathsEntry.deaths;
                }
                const recoveredEntry = globalRecovered.find(item => item.country === globalEntry.country && item.province === globalEntry.province)
                if (recoveredEntry) {
                    globalEntry.recovered = recoveredEntry.recovered;
                }
            }

            usConfirmed = usConfirmed.filter(item => item.province !== "US")

            for (const usEntry of usConfirmed) {
                const deathsEntry = usDeaths.find(item => item.city === usEntry.city)
                if (deathsEntry) {
                    usEntry.deaths = deathsEntry.deaths;
                    usEntry.population = deathsEntry.population;
                }
            }

            resolve([...globalConfirmed, ...usConfirmed]);
        })
    }

    static async parse(countryData, cases, irelandData, usStatePopulation) {
        return new Promise(resolve => {
            const countries = parseWorld(countryData, cases, usStatePopulation);

            const ireland = parseIreland(irelandData);
            const ieData = countries.find(item => item.countryCode === "IE");
            if (ieData) {
                ieData.geojson = ireland.geojson;
                ieData.population = ireland.population;
                ieData.series.provinces = ireland.provinces;
            }

            const coverage = createSeriesCoverage(countries);
            const regions = createSeriesRegion(countries);
            resolve({ countries, coverage, regions })
        })
    }

    /**
     * Carefull here cause if it throws you wont know about it
     */
    static async getAll() {
        try {
            const [irelandData, countryData, globalConfirmed, usConfirmed, globalDeaths, usDeaths, globalRecovered, usStatePopulation] = await Promise.all([
                load(Coverage.IRELAND_URL, "IRELAND_DATA"),
                load(Coverage.COUNTRY_URL, "COUNTRY_LIST"),
                load(Coverage.GLOBAL_CONFIRMED_URL, "COVID_DATA"),
                load(Coverage.US_CONFIRMED_URL, "COVID_DATA"),
                load(Coverage.GLOBAL_DEATHS_URL, "COVID_DATA"),
                load(Coverage.US_DEATHS_URL, "COVID_DATA"),
                load(Coverage.GLOBAL_RECOVERED_URL, "COVID_DATA"),
                load(Coverage.US_POPULATION, "US_POPULATION")
            ]);
            postMessage({
                type: 'processing-data',
            });

            const cases = await this.mergeCases(globalConfirmed, usConfirmed, globalDeaths, usDeaths, globalRecovered);

            return await this.parse(countryData, cases, irelandData, usStatePopulation)
        }
        catch (e) {
            console.log(e)
        }
    }
}

export const getCoverage = async () => {
    return await Coverage.getAll()
}

