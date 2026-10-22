declare const _default: {
    id: string;
    priority: number;
    threshold: number;
    signals: {
        rule: string;
        pattern: string;
        weight: number;
    }[];
    targets: ({
        path: string;
        kind: string;
        prior: number;
        digest: string;
        reason: string;
    } | {
        digest?: never;
        path: string;
        kind: string;
        prior: number;
        reason: string;
    })[];
    familyGlobs: string[];
}[];
export default _default;
