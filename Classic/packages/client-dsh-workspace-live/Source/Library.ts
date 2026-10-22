// Library - the entry module of @playform/client-dsh-workspace-live (the
// workspace family's live client). Loader contract (cordis):
// `export const name` + `export const apply` + `export const Config` +
// `export const inject` + `export default { name, apply, Config, inject }`.
//
// Like the central panel package, the host half of the entry is EMPTY: the
// live view lives entirely in the browser (Source/Client.ts). The Loader row
// exists so the client module system serves the ./client half. The Config
// schema ships here because the loader validates it at load and the knobs
// (enabled, tabOrder, maxEvents, maxRepresentations) are the package's own
// tunables.
//
// THE ROLE (Documentation/Plans/Workspace-Family/LIVE.md): the presentation,
// stable-until-event. The live view presents the workspace's representations
// at the END of the invisible flow; it never re-renders continuously and
// never conflates a running OS process with a managed entity.
import Definition from "@Variable/Config.js";

export const name = "client-dsh-workspace-live";

export const Config = Definition;

export const inject: string[] = [];

/** The empty host half - the Loader row exists to serve the client half. */
export function apply(): void {}

export default { name, apply, Config, inject };
