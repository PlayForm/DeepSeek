import type { Eviction } from "./Store.js";
import type State from "../Interface/State.js";
import type { ContentBlock } from "@deepseek-ai/dsh-llm";
export type Verdict = {
    action: "pass";
} | {
    action: "store";
    type: string;
    size: number;
    hash: string;
    evicted: Eviction[];
} | {
    action: "replace";
    type: string;
    size: number;
    hash: string;
    preview: string;
    evicted: Eviction[];
};
export default _default;
declare function _default(State: State, Name: string, IsError: boolean, Content: ContentBlock[]): Verdict;
