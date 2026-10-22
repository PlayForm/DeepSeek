export declare const DEFAULT_POLICY: {
    coder: {
        provider: string;
        model: string;
        reasoningEffort: "high";
    };
    explorer: {
        provider: string;
        model: string;
        reasoningEffort: "low";
    };
    planner: {
        provider: string;
        model: string;
        reasoningEffort: "max";
    };
    allowedModels: string[];
    escalation: {
        enabled: true;
        max: number;
    };
};
