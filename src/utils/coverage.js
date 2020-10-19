import { load } from '@/services/Api';
import { parseWorld, createSeriesCoverage, createSeriesRegion } from './parsing'
import { parseIreland } from './parseIE'

class Coverage {
    static COUNTRY_URL = "https://restcountries.eu/rest/v2/all";
    static CASES_URL = "/covid/api/covid-data";
    static IRELAND_URL = "https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/Covid19CountyStatisticsHPSCIreland/FeatureServer/0/query?f=json&cacheHint=true&resultOffset=0&resultRecordCount=32000&where=(TimeStamp%20BETWEEN%20CURRENT_TIMESTAMP%20-%20120%20AND%20CURRENT_TIMESTAMP)&orderByFields=TimeStamp%20ASC&outFields=ConfirmedCovidCases%2CPopulationCensus16%2CTimeStamp%2CCountyName%2CLat%2CLong&resultType=standard&returnGeometry=false&spatialRel=esriSpatialRelIntersects"
    static US_POPULATION = "https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest";

    static async parse(countryData, casesData, irelandData, usStatePopulation) {
        return new Promise(resolve => {
            const countries = parseWorld(countryData, casesData, usStatePopulation);

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

    static async getAll() {
        const [irelandData, countryData, casesData, usStatePopulation] = await Promise.all([
            load(Coverage.IRELAND_URL, "IRELAND_DATA"),
            load(Coverage.COUNTRY_URL, "COUNTRY_LIST"),
            load(Coverage.CASES_URL, "COVID_DATA", true),
            load(Coverage.US_POPULATION, "US_POPULATION")
        ]);
        postMessage({
            type: 'processing-data',
        })

        return await this.parse(countryData, casesData, irelandData, usStatePopulation)
    }
}

export const getCoverage = async () => {
    return await Coverage.getAll()
}

