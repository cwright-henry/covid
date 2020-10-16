import { load } from '@/services/Api';
import { parseWorld, createSeriesCoverage, createSeriesRegion } from './parsing'

class Coverage {
    static COUNTRY_URL = "https://restcountries.eu/rest/v2/all";
    static CASES_URL = "/covid/api/covid-data";
    static IRELAND_URL = "https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/Covid19CountyStatisticsHPSCIrelandOpenData/FeatureServer/0/query?where=TimeStampDate%20%3E%3D%20TIMESTAMP%20%272020-05-20%2000%3A00%3A00%27%20&outFields=CountyName,PopulationCensus16,Lat,Long,ConfirmedCovidCases,TimeStampDate&outSR=4326&f=json"
    static US_POPULATION = "https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest";

    static async parse(countryData, casesData, usStatePopulation) {
        return new Promise(resolve => {
            const countries = parseWorld(countryData, casesData, usStatePopulation);

            const coverage = createSeriesCoverage(countries);
            const regions = createSeriesRegion(countries);
            resolve({ countries, coverage, regions })
        })
    }

    static async getAll() {
        const [countryData, casesData, usStatePopulation] = await Promise.all([
            load(Coverage.COUNTRY_URL, "COUNTRY_LIST"),
            load(Coverage.CASES_URL, "COVID_DATA", true),
            load(Coverage.US_POPULATION, "US_POPULATION")
        ]);
        postMessage({
            type: 'processing-data',
        })

        return await this.parse(countryData, casesData, usStatePopulation)
    }
}

export const getCoverage = async () => {
    return await Coverage.getAll()
}

