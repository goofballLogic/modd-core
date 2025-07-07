import { asMessageList, NAME, named, partName } from "./hub.js";

export const INSTRUMENT_CHECK_FAILED = Symbol("Instrument check failed");

/*

    The instrumentations are a set of assertion factories that will return assertions based on the content of a message received

*/
export function Instrument(ObjectFactory, instrumentations) {

    return (...args) => {

        const o = ObjectFactory(...args);
        const oName = partName(o);
        return named(oName, async (...inputs) => {

            const result = asMessageList(await o(...inputs));
            const instrumentedResults = [];
            for (const instrumentation of instrumentations) {

                const checks = instrumentation(...inputs);
                for (const [name, assertionCheck] of checks) {
                    
                    if (assertionCheck && !assertionCheck(result)) {

                        instrumentedResults.push([
                            INSTRUMENT_CHECK_FAILED, { part: oName, name, inputs, result }]);

                    }
                }

            }
            if (result)
                instrumentedResults.push(...result);
            return instrumentedResults;


        });

    };

}

export function ConsoleInstrumentation() {

    return (mt, payload) => {
        if (mt !== INSTRUMENT_CHECK_FAILED) return;
        console.warn("Check failed (", payload.part, "):", payload.name || "Unknown instrument", "\n - Inputs:", payload.inputs, "\n - Result:", payload.result);
    }

}