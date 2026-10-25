import type State from "@Interface/State.js";
export default _default;
declare function _default(State: State): {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            spec: {
                type: string;
                description: string;
            };
            role: {
                type: string;
                enum: string[];
                description: string;
            };
            priority: {
                type: string;
                description: string;
            };
            dependsOn: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
        };
        required: string[];
    };
    exec({ spec, role, priority, dependsOn, }: {
        spec: string;
        role?: "explorer" | "coder" | "planner";
        priority?: number;
        dependsOn?: string[];
    }): {
        ok: boolean;
        error: string;
        id?: never;
        state?: never;
    } | {
        error?: never;
        ok: boolean;
        id: string;
        state: import("../Interface/Task").TaskState;
    };
};
