const asyncMode = process.env.LOG_ASYNC && !["false", "0"].includes(process.env.LOG_ASYNC.toLowerCase());

let isComplete = false;

export function loggingComplete() {

    isComplete = true;

}

export function log(...args) {

    if(asyncMode)
        stack.push([console.log, new Date(), args]);
    else
        enlog(new Date(), console.log, args);


}

export function logError(...args) {
    
    if(asyncMode)
        stack.push([console.error, new Date(), args]);
    else
        enlog(new Date(), console.error, args);
    
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
