import { inspect } from "node:util";
import { asMessageList, named, partName } from "./hub.js";
import { ASSERTION_NAME } from "./describe.js";

export * from "./describe.js";

export const CONTRACT_VIOLATED = Symbol("A contract was violated");
export const PASS = Symbol("Assertion passed");
export const FAIL = Symbol("Assertion failed");

const CONTRACT_DATA = Symbol("Contract assertion data");

const coalesceContractData = (messagePayload, data) => Object.assign(
    {}, 
    messagePayload[CONTRACT_DATA], 
    data
);

const withContractDataSafe = (messagePayload, data) => Object.assign(
    {}, 
    messagePayload, 
    { [CONTRACT_DATA]: coalesceContractData(messagePayload, data) }
);


export function withContractData(messagePayload, data) {
    return (messagePayload && (data !== undefined)) 
        ? withContractDataSafe(messagePayload, data) 
        : messagePayload;
}

export function contractData(messagePayload) {
    
    if(messagePayload) 
        return messagePayload[CONTRACT_DATA];

}

function createPassResponse() {
    return { result: PASS };
}

function createFailResponse(reason) {
    return { result: FAIL, reason: reason || "Assertion failed" };
}

function createResponse(value) {
    return !!value ? createPassResponse() : createFailResponse();
}

/*

    The assertion factories will return assertions based on the content of a message received

*/
export function Contract(ObjectFactory, assertionFactories) {

    return (...args) => {

        const o = ObjectFactory(...args);
        const oName = partName(o);
        return named(oName, async (...inputs) => {

            const result = asMessageList(await o(...inputs));
            const outcome = [];

            for (const assertionFactory of assertionFactories) {
                const assertions = assertionFactory(...inputs);
                if (!Array.isArray(assertions)) {
                    console.error("Assertion factory did not return an array:", assertions);
                    continue;
                }
                for (const assertion of assertions) {
                    let assertionOutcome = null;
                    
                    const pass = () => assertionOutcome = createPassResponse();
                    const fail = (failReason) => assertionOutcome = createFailResponse(failReason);
                    
                    const finalOutcome = assertion(result, pass, fail) ?? assertionOutcome;
                    const normalizedOutcome = finalOutcome?.result ? finalOutcome : createResponse(finalOutcome);

                    if (normalizedOutcome.result === FAIL) {
                        outcome.push([CONTRACT_VIOLATED, {
                            assertion: assertion[ASSERTION_NAME] || "Unknown assertion",
                            reason: normalizedOutcome.reason,
                            output: inspect(result, { depth: null, colors: true, compact: true })
                        }]);
                    }
                }
            }

            removeContractData(result);

            return [...result, ...outcome];
        });
    };
}

function removeContractData(result) {
    if (!result) return result;
    if (Array.isArray(result)) {
        result.forEach(removeContractData);
    } else if(typeof result === "object") {
        if(CONTRACT_DATA in result) delete result[CONTRACT_DATA];
        Object.values(result).forEach(removeContractData);
    }
}

function ContractConsoleWriter() {

    return named("Contract Console Writer", async (messageType, payload) => {
        if (messageType === CONTRACT_VIOLATED) {
            console.log([
                "--- CONTRACT VIOLATION ---",
                payload.assertion,
                payload.reason,
                payload.output
            ].join("\n"));
        }
    });

}

export { ContractConsoleWriter };