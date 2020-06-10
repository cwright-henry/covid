import { load } from '@/services/Api';
import { parse, createSeriesCoverage } from './parsing'
import { parseIreland } from './parseIE'

class Coverage {
    static COUNTRY_URL = "https://restcountries.eu/rest/v2/all";
    static CASES_URL = "https://api.covid19api.com/all";
    static IRELAND_URL = "https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/Covid19CountyStatisticsHPSCIrelandOpenData/FeatureServer/0/query?where=TimeStampDate%20%3E%3D%20TIMESTAMP%20%272020-04-20%2000%3A00%3A00%27%20&outFields=CountyName,PopulationCensus16,Lat,Long,ConfirmedCovidCases,TimeStampDate&outSR=4326&f=json"

    static async getAll() {
        const [countryData, casesData, irelandData] = await Promise.all([
            load(Coverage.COUNTRY_URL),
            load(Coverage.CASES_URL),
            load(Coverage.IRELAND_URL)
        ]);

        const countries = parse(countryData, casesData);
        const ireland = parseIreland(irelandData);
        const ieData = countries.find(item => item.countryCode === "IE");
        if (ieData) {
            ieData.geojson = ireland.geojson;
            ieData.population = ireland.population;
            ieData.series.provinces = ireland.provinces;
        }

        const coverage = createSeriesCoverage(countries);
        return {
            countries, coverage
        }
    }
}

export const getCoverage = async () => {
    return await Coverage.getAll()
}

