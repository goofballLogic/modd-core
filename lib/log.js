let isComplete = false;

export function loggingComplete() {

    isComplete = true;

}

export function log(...args) {

    stack.push([console.log, new Date(), args]);

}

export function logError(...args) {
    
    stack.push([console.error, new Date(), args]);
    
}

const stack = [];
function processStack() {
    
    while(stack.length){
        
        const [method, when, args] = stack.shift();
        const timestamp = `[ ${when.toISOString().split("T")[1].substring(0,12)} ]`;
        method(timestamp, ...args);

    }
    if(!isComplete) setTimeout(processStack, 10);

}

processStack();