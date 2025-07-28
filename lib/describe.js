
let scenarioAssertions = null;
let assertionContext = "";

export const ASSERTION_NAME = Symbol("Assertion name");

export function Describe(scenario, defineScenario) {

    return (messageType, messagePayload) => {

        const bookmarkedScenarioAssertions = scenarioAssertions;
        try {

            assertionContext = scenario;
            scenarioAssertions = [];
            defineScenario(messageType, messagePayload);
            return scenarioAssertions;

        } finally {

            scenarioAssertions = bookmarkedScenarioAssertions;
            assertionContext = "";

        }

    };

}

export function It(description, assertion) {

    assertion[ASSERTION_NAME] = `${assertionContext} > ${description}`;
    scenarioAssertions.push(assertion);
    return assertion;
}