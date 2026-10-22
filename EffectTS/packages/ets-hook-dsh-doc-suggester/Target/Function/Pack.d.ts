declare const _default: {
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
        kind: string;
        prior: number;
        reason: string;
    }[];
}[];
export default _default;
