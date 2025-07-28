import { log, logError } from "./log.js";

export const HUB_ADD_RECEIVER = Symbol("Hub: Add receiver");
export const HUB_REMOVE_RECEIVER = Symbol("Hub: Remove receiver");
export const NAME = Symbol("Name of part");
export const REENTRANT = Symbol("Reentrant message");
export const OUTSIDE = Symbol("OUTSIDE");

let senderSeed = 1;

export function Hub(name, ...members) {

    const stack = [];
    let isProcessing = false;

    async function receive(messages, from) {
        
        const messageList = asMessageList(messages);
        if (!messageList?.length) return;

        log(partName(from), ...messageList.map(x => x[0]), "((", name, "))");        
        const mapped = messageList.map((m) => [m, from]);
        stack.push(...mapped);
        kick();

    }

    function registerOutside(member) {

        member(OUTSIDE, (...args) => receive(args, member));

    }

    for(const member of members)
        registerOutside(member);

    function addReceiver(receiver) {

        log(name, "[]+++", partName(receiver));
        members.push(receiver);
        registerOutside(receiver);        

    }

    function removeReceiver(receiver) {

        const foundIndex = members.indexOf(receiver);
        if(foundIndex < 0)
            console.warn("Receiver to remove not found");
        else {

            log(name, "[]---", partName(receiver));
            members.splice(foundIndex, 1);

        }

    }

    return async function(messageType, message) {

        if(messageType === HUB_ADD_RECEIVER)
            addReceiver(message);
        else if(messageType === HUB_REMOVE_RECEIVER)
            removeReceiver(message);
        else if (typeof messageType === "symbol")
            receive([[messageType, message]], { name: "Outside" });

    }
        
    async function kick() {

        if (isProcessing) return;
        isProcessing = true;
        try {

            await kickLoop();

        } finally {

            isProcessing = false;

        }

    }

    async function kickLoop() {

        let safety = 10000;
        while (stack.length && safety-- > 0) {

            await kickLoopSend();

        }

    }

    async function kickLoopSend() {
        
        const next = stack.shift();
        try {

            await send(next);

        } catch (err) {

            logError(err);

        }

    }

    async function send([[messageType, message], from]) {

        log("((", name, "))", messageType, "for", partName(from));
        let receivers = message?.[REENTRANT] ? [...members] : members.filter(m => m !== from);
        while (receivers.length) {

            const receiver = receivers.shift();
            const outputs = await receiver(messageType, message);
            if(outputs)
                receive(outputs, receiver);

        }
        
    }

}

export function asMessageList(messages) {
    return (typeof messages?.[0] === "symbol") ? [messages] : messages || [];
}

export function partName(from) {

    if (!from) return;
    if (from["@name"]) return from["@name"];
    if (from[NAME]) return from[NAME];
    if (from.name) return from.name;

    from["@name"] = "Unnamed sender " + senderSeed++;
    return from["@name"];
    
}

export function named(name, part) {
    part[NAME] = name;
    return part;
}