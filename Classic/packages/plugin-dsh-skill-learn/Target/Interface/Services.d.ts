import type Agent from "./Agent.js";
import type Message from "./Message.js";
import type { LoadedSkill, SkillRow } from "./Skill.js";
/**
 * @module Services
 *
 * The STRUCTURAL context slices the service injects or probes.
 *
 * @remarks
 *
 * TAKEN FROM the harness declarations this package cannot import (the skill package is
 * not installed, and the fs/llm declarations are the only typed authority the design was
 * measured against):
 *
 * - fs - `dsh-fs/lib/types/index.d.ts:61-240` (fifteen methods, no delete and no move;
 *   `resolve` at `:94`, `stat` at `:138`, `readText` at `:162`, `writeText` at `:221`,
 *   `editText` at `:235`, `contains` at `:131`, `processPath` at `:106`)
 * - skills - `dsh-skill/lib/index.js:224` (list), `:250` (get), and `invalidateCache` at
 *   `:376-380`, which is the only way a write becomes visible to the catalog
 * - llm - `dsh-llm/lib/types/index.d.ts:433` (`stream`), request at
 *   `dsh-llm/lib/types/types.d.ts:506-547`, frames at `:434-464`
 * - workingDirectory - `dsh-working-directory/lib/types/index.d.ts:73`
 * - logger - `@deepseek-ai/cordis` `LoggerService`, `lib/types/logger.d.ts:77-85`
 *
 * TWO MEMBERS ARE REQUIRED AND THREE ARE PROBED, and the difference is the plugin's
 * failure vocabulary: `fs` and `skills` are injected (the loader resolves them, so their
 * absence is a load failure, not a review outcome), while `llm`, `workingDirectory` and
 * `logger` are optional because their absence is a REPORTED outcome (`no-llm`) or a
 * degraded but working run (a missing logger must never fail a review, and a missing
 * working directory falls back to the configured corpus root).
 *
 * THE WRITE METHODS ARE DECLARED HERE, AND THE WRITE LEAF RESTATES A NARROWER SUBSET OF
 * THEM. `Function/Write` declares `Seam`, the seven members the fence actually calls,
 * so a widened service cannot widen the fence by accident; this slice is a structural
 * SUPERSET of that seam (it carries `processPath`, the trailing signals, and the version
 * on a write outcome), which is what lets the service pass its `fs` slice to a leaf that
 * asked for a seam. The intent union is the fence itself - `createIfAbsent` refuses an
 * existing target and `replaceIfVersion` refuses an absent or moved one
 * (`dsh-fs/lib/types/types.d.ts:105-116`, codes at `:162`) - so omitting the intent is
 * never an option this type offers, because omitting it would mean an unconditional
 * overwrite.
 */
/**
 * An opaque resolved target; `targetKey` is identity and must never be parsed.
 */
export interface FsTarget {
    /**
     * The opaque identity token.
     */
    readonly targetKey: string;
    /**
     * The absolute spelling the caller asked for, for messages and the ledger.
     */
    readonly displayPath: string;
}
/**
 * Metadata only, never content; `version` is the token a guarded write needs.
 */
export interface FsInfo {
    /**
     * The opaque freshness token a guarded write carries.
     */
    readonly version: string;
    /**
     * The node kind the stat saw.
     */
    readonly type: "file" | "directory" | "other";
    /**
     * The file's size in bytes, when the provider reports one.
     */
    readonly size?: number;
}
/**
 * The fence: create refuses an existing target, replace refuses an absent or changed one.
 */
export type FsWriteIntent = 
/**
 * Refuse an existing target with FS_NOT_OBSERVED.
 */
{
    readonly kind: "createIfAbsent";
}
/**
 * Refuse an absent or moved target with FS_STALE_VERSION.
 */
 | {
    readonly kind: "replaceIfVersion";
    readonly version: string;
};
export interface FsWriteOutcome {
    /**
     * Whether the write created or updated the target.
     */
    readonly operation: "create" | "update";
    /**
     * The version after the write, which is what the next guard carries.
     */
    readonly version: string;
    /**
     * The prior text, or null on a create; the ledger's `before` blob comes from it.
     */
    readonly before: string | null;
    /**
     * The text as written; the ledger's `after` blob comes from it.
     */
    readonly after: string;
}
export interface FsEditRequest {
    /**
     * The anchor text the edit matches exactly once.
     */
    readonly oldString: string;
    /**
     * The replacement text.
     */
    readonly newString: string;
    /**
     * Always false for a skill patch: exactly one anchor is the rule the fence enforces.
     */
    readonly replaceAll: boolean;
}
export interface FsEditOutcome {
    /**
     * The version after the edit.
     */
    readonly version: string;
    /**
     * The text before the edit.
     */
    readonly before: string;
    /**
     * The text after the edit.
     */
    readonly after: string;
}
/**
 * One direct child of a listed directory: metadata and a resolved target, never content.
 */
export interface FsDirEntry {
    /**
     * The child's name as the listing reported it.
     */
    readonly name: string;
    /**
     * The node kind.
     */
    readonly type: "file" | "directory" | "other";
    /**
     * The resolved target for the child.
     */
    readonly target: FsTarget;
    /**
     * The child's version, when the provider reports one.
     */
    readonly version?: string;
    /**
     * The child's size in bytes, when the provider reports one.
     */
    readonly size?: number;
}
export interface FsSlice {
    /**
     * Resolve one path spelling into an opaque target identity.
     */
    resolve(path: string, options?: {
        readonly cwd?: string;
        readonly signal?: AbortSignal;
    }): Promise<FsTarget>;
    /**
     * One target's metadata, or `undefined` when it is absent.
     */
    stat(target: FsTarget, signal?: AbortSignal): Promise<FsInfo | undefined>;
    /**
     * One target's full text; the read the digest and the fence compare.
     */
    readText(target: FsTarget, signal?: AbortSignal): Promise<string>;
    /**
     * The direct children of a directory; the archive copy walks a skill package with it.
     */
    listDir(target: FsTarget, signal?: AbortSignal): Promise<readonly FsDirEntry[]>;
    /**
     * Write a whole file behind the guarded write intent.
     */
    writeText(target: FsTarget, content: string, intent?: FsWriteIntent, signal?: AbortSignal): Promise<FsWriteOutcome>;
    /**
     * Edit one file behind a literal anchor and an expected version.
     */
    editText(target: FsTarget, edit: FsEditRequest, expected?: {
        readonly version: string;
    }, signal?: AbortSignal): Promise<FsEditOutcome>;
    /**
     * Canonical containment: the root fence and the archive refusal both use it.
     */
    contains(parent: FsTarget, child: FsTarget): boolean;
    /**
     * The host path of a resolved target, for the configured-root comparisons.
     */
    processPath(target: FsTarget): string;
}
export interface SkillsSlice {
    /**
     * One row per discovered skill; the model-invocability filter runs over these.
     */
    list(options?: {
        readonly cwd?: string;
        readonly scope?: string;
        readonly signal?: AbortSignal;
    }): Promise<readonly SkillRow[]>;
    /**
     * The parsed skill, or `undefined` when the catalog does not resolve the name.
     */
    get(name: string, options?: {
        readonly cwd?: string;
        readonly signal?: AbortSignal;
    }): Promise<LoadedSkill | undefined>;
    /**
     * Drop the collection cache and announce the change
     * (`dsh-skill/lib/index.js:376-380`). Called after every mutation, because
     * the provider's watcher is best-effort and a direct `ctx.fs` write never
     * takes the `fs/observed` fast path (`Temporary/Research/DSH-Write-Path.md:604-617`).
     */
    invalidateCache(): void;
}
/**
 * The runtime's own request, structurally (`dsh-llm/lib/types/types.d.ts:506-547`):
 * the three fields every call sets and the three a hand-built one-shot may set.
 * `system`, `maxTokens` and `signal` are OPTIONAL here because the loop's own
 * requests leave them unset, while a review call always sets all three.
 *
 * `messages` IS OPAQUE ON PURPOSE. The harness's array carries its own `Message`
 * union, whose block list is wider than the two blocks this plugin reads
 * (`Interface/Message.ts:9-20`), so the slice ACCEPTS the runtime's array rather
 * than narrowing it. That is what makes the real `ctx.llm` service assignable
 * here without a cast: the runtime is the fact, and this file is the contract
 * written to fit it. `StreamRequest` below is the narrower view the plugin
 * itself sends, so nothing in this package ever builds an opaque array.
 */
export interface LLMRequest {
    readonly provider: string;
    readonly model: string;
    readonly system?: string;
    readonly messages: readonly unknown[];
    readonly maxTokens?: number;
    readonly signal?: AbortSignal;
}
/**
 * One review request: the runtime's own shape narrowed to the six fields a
 * hand-built review call sets, with the message array typed as the plugin's own
 * `Message` so `Function/Plan` and `Function/Confirm` are checked against the
 * blocks they actually build.
 */
export interface StreamRequest extends LLMRequest {
    /**
     * The one-shot system prompt; the loop's own requests leave it unset.
     */
    readonly system: string;
    readonly messages: readonly Message[];
    readonly maxTokens: number;
    readonly signal: AbortSignal;
}
/**
 * One stream frame, projected onto the only arm this plugin reads. The harness's
 * union has seven arms (`dsh-llm/lib/types/types.d.ts:434-464`); a reply is read
 * from `text-delta` alone (`:439-442`), so every other frame is typed as
 * "some frame with some type" rather than declared and then ignored.
 */
export interface StreamFrame {
    readonly type: string;
    readonly text?: string;
}
export interface LLMSlice {
    /**
     * The one-shot streaming call (`dsh-llm/lib/types/index.d.ts:433`). The
     * parameter is the runtime's OWN request rather than the review's narrower
     * one, because a slice the real service cannot satisfy is a contract written
     * against a shape nobody offers; a review passes a `StreamRequest`, which is
     * that same shape with the six fields it sets.
     */
    stream(request: LLMRequest): AsyncIterable<StreamFrame>;
}
export interface WorkingDirectorySlice {
    /**
     * The agent's working directory, created on demand
     * (`dsh-working-directory/lib/types/index.d.ts:73`).
     */
    ensure(agent: Agent, signal?: AbortSignal): Promise<string>;
}
/**
 * The logger cordis injects; every level is a one-way line.
 */
export interface LoggerSlice {
    /**
     * One informational line.
     */
    info(format: unknown, ...parameter: unknown[]): void;
    /**
     * One warning line.
     */
    warn(format: unknown, ...parameter: unknown[]): void;
    /**
     * One error line.
     */
    error(format: unknown, ...parameter: unknown[]): void;
    /**
     * One debug line.
     */
    debug(format: unknown, ...parameter: unknown[]): void;
}
export default interface Services {
    /**
     * Injected: the only seam that may touch a file.
     */
    readonly fs: FsSlice;
    /**
     * Injected: the catalog the review reads and the cache a write invalidates.
     */
    readonly skills: SkillsSlice;
    /**
     * Probed: absent is the `no-llm` outcome, never a throw.
     */
    readonly llm?: LLMSlice;
    /**
     * Probed: absent falls back to the configured corpus root.
     */
    readonly workingDirectory?: WorkingDirectorySlice;
    /**
     * Probed: absent means no ledger line, never a failed run.
     */
    readonly logger?: LoggerSlice;
}
