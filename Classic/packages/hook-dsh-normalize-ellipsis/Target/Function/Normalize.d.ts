import type { StreamChunk } from "@deepseek-ai/dsh-llm";
import type State from "../Interface/State.js";
export default function (Upstream: AsyncIterable<StreamChunk>, State: State): AsyncGenerator<StreamChunk, void, void>;
