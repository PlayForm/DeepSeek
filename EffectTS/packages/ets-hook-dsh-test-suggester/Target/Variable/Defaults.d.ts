declare const _default: {
    pack: string;
    version: number;
    intents: {
        id: string;
        priority: number;
        threshold: number;
        signals: {
            rule: string;
            pattern: string;
            weight: number;
        }[];
        targets: {
            path: string;
            reason: string;
            prior: number;
        }[];
        note: string;
    }[];
};
export default _default;
