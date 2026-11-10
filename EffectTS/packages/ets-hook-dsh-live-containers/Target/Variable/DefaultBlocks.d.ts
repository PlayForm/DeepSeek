/**
 * @module DefaultBlocks
 *
 * Declares the DEFAULT block table the schema default of config `blocks` ships.
 *
 * @remarks
 * A Variable: pure data, not code. The 14-entry catalog of Requirements/03 section 3,
 * shipped as the schema default of config `blocks` with the sensible enablements
 * (todo-list, command-runner and session-stats ON; the rest dormant) - and the PLUGIN
 * still disabled (the IDLE-forever posture, schema default of `enabled`).
 *
 * The catalog entries carry their wave-2 kind names (03 section 3); in phase 1 they
 * validate against the kind registry (Interface/Execution.ts KINDS) and render as skipped
 * blocks - reason "unknown kind" - until the wave-2 render engine lands. This keeps the
 * shipped config byte-stable across the phase boundary: wave 2 extends the render engine,
 * never the defaults (IMPLEMENTATION-DESIGN.md section 2.2).
 *
 * The catalog doubles as the suggester's input and the docs' block table in wave 2 (03
 * section 2: one source, three consumers) - Variable/Catalog.ts (the suggester-facing
 * projection) is the wave-2 file that reads these.
 *
 * Tokens the phase-1 engine does not resolve ({{set:NAME}} - the live_container_set
 * state) render LITERALLY (research section 3: unknown tokens are never a failure) and
 * log `render unknown <id> <token>` - the frames of the dormant entries are inert by
 * construction (enabled: false).
 */
import type { BlockSpecification } from "../Interface/Execution.js";
export declare const DEFAULT_BLOCKS: BlockSpecification[];
