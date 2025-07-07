import { Describe, It } from "./describe.js";
import { BlackList, WhiteList } from "./filter.js";
import { Hub, named } from "./hub.js";
import { ConsoleInstrumentation, Instrument } from "./instrument.js";

const ADD_NUMBERS = Symbol("Add some numbers");
const ADD_NUMBERS_RESULT = Symbol("Add numbers result");

function Adder() {

    return named("Adder",
        WhiteList(ADD_NUMBERS, addNumbers)
    );


    function addNumbers(_messageType, payload) {
        if (!payload?.numbers) return;
        if (!payload.numbers.every(x => typeof x === "number")) return;
        return [ADD_NUMBERS_RESULT, {
            result: payload?.numbers.reduce((a, b) => a + b, 0)
        }];
    }
}

const InstrumentedAdder = Instrument(Adder, [

    Describe("When adding numbers", WhiteList(ADD_NUMBERS, (_, payload) => {

        if (Array.isArray(payload?.numbers) && payload.numbers.every(x => typeof x === "number")) {

            It("Produces an add numbers result", result => result?.[0]?.[0] === ADD_NUMBERS_RESULT);
            It("Adds up the numbers", result => result?.[0]?.[1]?.result === payload?.numbers?.reduce((a, b) => a + b, 0));

        } else {

            It("Ignores messages without an array of numbers", result => !result);

        }

    })),
    Describe("When not adding numbers", BlackList(ADD_NUMBERS, () => {

        It("Does not produce a result", result => !result);

    }))

]);

const adder = InstrumentedAdder();

const hub = Hub("main",
    adder,
    ConsoleInstrumentation(),
    WhiteList(ADD_NUMBERS_RESULT, console.log.bind(console))
);

await hub(ADD_NUMBERS, { numbers: [1, 2, 3] });
await hub(Symbol("Something else"));
await hub(ADD_NUMBERS, { numbers: ["asdf"] })