export const HUB_ADD_RECEIVER = Symbol("Hub: Add receiver");
export const HUB_REMOVE_RECEIVER = Symbol("Hub: Remove receiver");

export type Receiver = (messageType: symbol, message: object) => Promise<Message[] | Message | void>;
export type Message = [messageType: symbol, message: object];

let senderSeed = 1;

export function Hub(name: string, ...members: Receiver[]) : Receiver {

    const stack : [Message, any][] = [];
    let isProcessing = false;

    async function receive(messages : Message[] | Message, from: any | null = null) {
        
        const messageList : Message[] = (typeof messages?.[0] === "symbol")
            ? [messages as Message] 
            : messages as Message[];

        console.log(new Date(), name, "<==", partName(from), ...messageList.map(x => x[0]));
        
        const mapped : [Message, any][] = messageList.map((m) => [m, from]);
        stack.push(...mapped);
        kick();

    };

    function addReceiver(receiver: Receiver) {

        console.log(new Date(), name, "+++", partName(receiver));
        members.push(receiver);

    }

    function removeReceiver(receiver: Receiver) {

        const foundIndex = members.indexOf(receiver);
        if(foundIndex < 0)
            console.warn("Receiver to remove not found");
        else {

            console.log(new Date(), name, "---", partName(receiver));
            members.splice(foundIndex, 1);

        }

    }

    return async function(messageType: symbol, message? : any) {

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

            console.error(err);

        }

    }

    async function send([[messageType, message], from]: [Message, any]) {

        console.log(new Date(), name, "--{", messageType, "from", partName(from));
        let receivers = members.filter(m => m !== from);
        while (receivers.length) {

            const receiver = receivers.shift();
            const outputs = await receiver(messageType, message);
            if(outputs)
                receive(outputs, receiver);

        }
        
    }

}

function partName(from: any) {

    if (!from) return;
    if (from["@name"]) return from["@name"];
    if (from.name) return from.name;
    from["@name"] = "Unnamed sender " + senderSeed++;
    return from["@name"];
    
}
