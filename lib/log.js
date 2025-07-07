import { createWriteStream } from "node:fs";

const asyncMode = process.env.LOG_ASYNC && !["false", "0"].includes(process.env.LOG_ASYNC.toLowerCase());
const fileDest = process.env.LOG_DEST

let isComplete = false;
const logReceiver = fileDest ? fileLogReceiver(fileDest) : console;

function fileLogReceiver(filename) {

    const stream = createWriteStream(filename, { encoding: "utf8"});
    process.on("beforeExit", () => {
        
        stream.write("---\n\n");
        stream.close()
    
    });

    return {
        log(...args) {
            stream.write("LOG: " + args.map(x => typeof x === "symbol" ? x.description : x.toString()).join(" ") + "\n");
        },
        error(...args) {
            stream.write("ERROR: " + args.map(x => typeof x === "symbol" ? x.description : x.toString()).join(" ") + "\n");
        }
    };

}

export function loggingComplete() {

    isComplete = true;
    
}

export function log(...args) {

    if(asyncMode)
        stack.push([logReceiver.log, new Date(), args]);
    else
        enlog(new Date(), logReceiver.log, args);


}

export function logError(...args) {
    
    if(asyncMode)
        stack.push([logReceiver.error, new Date(), args]);
    else
        enlog(new Date(), logReceiver.error, args);
    
}

const stack = [];
function processStack() {
    
    while(stack.length){
        
        const [method, when, args] = stack.shift();
        enlog(when, method, args);

    }
    if(!isComplete) setTimeout(processStack, 10);

}

if (process.env.LOG_ASYNC)
    processStack();

function enlog(when, method, args) {

    const timestamp = `[ ${when.toISOString().split("T")[1].substring(0, 12)} ]`;
    method(timestamp, ...args);

}
