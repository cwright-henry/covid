import { load } from '@/services/Api';
import { parseUK } from './parseUK'

class Coverage {
    static LOCATION_URL = "https://api.covid19uk.live/locations";
    static HISTORY_URL = "http://api.covid19uk.live/history";

    static async getAll() {
        const locationData = await load(Coverage.LOCATION_URL);
        const historyData = await load(Coverage.HISTORY_URL);

        return parseUK(locationData, historyData);
    }
}

export const getCoverageUK = async () => {
    return await Coverage.getAll()
}

