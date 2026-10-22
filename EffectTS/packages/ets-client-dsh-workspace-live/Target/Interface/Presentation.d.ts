export type Representation = {
    id: string;
    kind: "file" | "symbol" | "block" | "test" | "doc";
    label: string;
    version: string;
    lastSequence: number;
};
export type LiveView = {
    sequence: number;
    representations: Representation[];
    events: {
        operationId: string;
        parentId: string;
        category: string;
        path?: string;
        sequence: number;
    }[];
};
