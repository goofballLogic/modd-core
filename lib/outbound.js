import { OUTSIDE } from "./hub.js";

export function Outbound(factory) {

    let outside;
    const outbox = [];
    const inside = factory(send);

    return (messageType, ...rest) => {

        if (messageType === OUTSIDE) {
            outside = rest[0];
            processMessages();
        }
        else
            return inside(messageType, ...rest);

    }

    function send(...args) {

        outbox.push(args);
        processMessages();

    }

    function processMessages() {

        if (!outside) return;
        while(outbox.length) {

            const next = outbox.shift()
            outside(...next);

        }

    }

}