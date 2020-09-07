import { getCoverage } from './coverage'
if (typeof window != "object")
    self.window = self;

/**
 * See https://github.com/webpack-contrib/worker-loader#config
 */
onmessage = async (event) => {
    try {
        const results = await getCoverage();
        postMessage({
            type: 'complete',
            results
        });
    }
    catch (error) {
        postMessage({
            type: 'error',
            error
        });
    }
};