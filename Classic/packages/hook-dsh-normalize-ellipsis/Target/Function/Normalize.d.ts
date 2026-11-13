import type { StreamChunk } from "@deepseek-ai/dsh-llm";
import type State from "../Interface/State.js";
/**
 * @module Normalize
 *
 * The stream wrapper: the thin delegate over the core's llm-stream arm factory
 * (`@playform/lib-dsh-core`, the `Stream` export).
 *
 * @remarks
 *
 * The machinery lives in the core: the per-call id and raw-marker tracking, the
 * count, the one-in-one-out loop, and the settle line plus journal record. This
 * file supplies only what makes it THE NORMALIZE-ELLIPSIS:
 *
 * - the ellipsis transform - the core's `Chunk` dispatch pinned to the
 *   configured replacement and the effective scopes, read per call from the
 *   volatile State;
 * - the ellipsis ledger line - the module's own string, byte-identical with the
 *   pre-delegate arm: `normalized N ellipsis char(s) in one stream`;
 * - the ellipsis ledger sink - `State.Factory.Append` / `State.Factory.Journal`.
 *
 * Invariants: `next()` is always called by the listener before this generator
 * runs, the chunk order is preserved, the stream is never buffered, and an
 * upstream throw propagates untouched (the core owns all four).
 */
declare const _default: (Upstream: AsyncIterable<StreamChunk>, State: State) => AsyncGenerator<StreamChunk, void, void>;
export default _default;
