/**
 * @module Catalog
 *
 * GENERATED FILE - DO NOT EDIT BY HAND.
 *
 * The static tool-catalog fallback: every tool the harness ships, projected from
 * the harness's own generated `docs/tool-catalog.md`. The harness derives that
 * file by booting each tool plugin on a real context and reading
 * `ctx.tools.schemas()`, and its CI re-derives it and fails when it is stale,
 * so a pinned submodule commit is a trustworthy snapshot of the tool contract.
 *
 * Regenerate: `pnpm run catalog` - verify: `pnpm run catalog:check`.
 * Source: Module/deepseek-harness/docs/tool-catalog.md
 *
 * The runtime owns every formatting decision: Function/Fetch applies the
 * first-sentence cap, derives the primary parameter from the schema's own
 * `required` list, and extracts each parameter's default from its description
 * ("Defaults to X.") or its `default` annotation. This file therefore stays a
 * dumb, honest projection - it decides nothing.
 */
export interface CatalogParameter {
    readonly description?: string;
    readonly default?: string;
}
export interface CatalogTool {
    readonly description: string;
    readonly parameters: {
        readonly type: "object";
        readonly properties: Readonly<Record<string, CatalogParameter>>;
        readonly required?: readonly string[];
    };
}
export declare const CATALOG: Readonly<Record<string, CatalogTool>>;
