import { Stream } from "effect";
type BlockShape = {
    type: "text";
    text: string;
} | {
    type: "reasoning";
    text?: string | undefined;
} | {
    type: string;
};
type ChunkShape = {
    type: "text-delta";
    text: string;
} | {
    type: "reasoning-delta";
    text: string;
} | {
    type: "tool-call-delta";
    id?: string;
    name?: string;
    argumentsDelta: string;
} | {
    type: "block-end";
    block: BlockShape;
} | {
    type: string;
};
export default _default;
declare function _default<T extends ChunkShape, E, R>(Upstream: Stream.Stream<T, E, R>, Replace: (Text: string) => {
    text: string;
    count: number;
}, Reasoning: boolean, ToolArgs?: boolean, OnCount?: (Count: number) => void): Stream.Stream<T, E, R>;
