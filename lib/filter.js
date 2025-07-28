export function WhiteList(...args) {
    const filtered = args.pop();
    return (mt, message) => {
        if (!args.includes(mt)) return;
        return filtered(mt, message);
    };
}

export function BlackList(...args) {
    const filtered = args.pop();
    return (mt, message) => {
        if (args.includes(mt)) return;
        return filtered(mt, message);
    };
}

export function findMessage(messageType, messages) {
    if (!Array.isArray(messages)) return;
    return messages.find(([mt]) => mt === messageType);
}

export function findMessagePayload(messageType, messages) {
    return findMessage(messageType, messages)?.[1];
}