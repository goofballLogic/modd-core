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