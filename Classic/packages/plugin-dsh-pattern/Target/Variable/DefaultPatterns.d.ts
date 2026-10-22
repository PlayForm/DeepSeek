declare const _default: ({
    id: string;
    intent: string;
    trigger: {
        keywords: string[];
        tool?: never;
    };
    targets: string[];
    transform: string[];
    arbiter: string;
    confidence: number;
    allowlist: true;
    updatedAt: number;
} | {
    id: string;
    intent: string;
    trigger: {
        tool: string;
        keywords: string[];
    };
    targets: string[];
    transform: string[];
    arbiter: string;
    confidence: number;
    allowlist: false;
    updatedAt: number;
} | {
    id: string;
    intent: string;
    trigger: {
        tool?: never;
        keywords: string[];
    };
    targets: string[];
    transform: string[];
    arbiter: string;
    confidence: number;
    allowlist: false;
    updatedAt: number;
})[];
export default _default;
