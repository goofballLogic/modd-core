import { Hub, named } from "./hub.js";
import { Outbound } from "./outbound.js";
import { WhiteList } from "./filter.js";

const TICK = Symbol("TOCK");

function Ticker(send) {

    let ticks = 0;
    function tick() {

        send(TICK, { ticks: ++ticks });
        setTimeout(tick, 1000);

    }
    tick();

    return async () => {};

}

Hub(
    "Example",

    WhiteList(TICK, (_, mp) => console.log("Ticker says:", mp?.ticks)),
    
    named("Ticker", Outbound(Ticker))

);