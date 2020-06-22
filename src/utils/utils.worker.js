import { getCoverage } from './coverage'

if (typeof window != "object")
    self.window = self;

export default class CoverageWorker {
    constructor() {
    }
    async getAll() {
        return getCoverage();
    }
}