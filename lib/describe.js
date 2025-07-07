
let scenarioAssertions = null;
let assertionContext = "";

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


export function It(description, assertions) {

    return scenarioAssertions.push([`${assertionContext} > ${description}`, assertions]);

}