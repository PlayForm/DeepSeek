/** The text substitutions: the ETS dependency names, the ETS ledger paths and
 *  the ETS sibling paths. THREE SURFACES, THREE RULES, and the module identity
 *  is deliberately OUTSIDE all three:
 *  1. the quoted package names (`"@playform/hook-dsh-x"`) and the bare
 *     dependency tokens (`lib-dsh-core`, `plugin-dsh-factory`, the two new
 *     libraries) - the npm identity;
 *  2. the ledger path at the `.dsh/playform/` boundary - the twin's OWN ledger
 *     file (`~/.dsh/playform/ets-<package>.log`), never the Classic one;
 *  3. the RELATIVE sibling import (`../../../plugin-dsh-workspace-graph/
 *     Target/Library.js`) - the wave-5 defect the per-token list missed. The
 *     rule matches a run of `../` immediately followed by the family token, so
 *     a repo-root fixture path (`Classic/packages/hook-dsh-x/...`) is never
 *     touched.
 *  NOT substituted, on purpose: the `export const name` value, the loader
 *  `id:` in cordis.patch.yml, and every log-line prefix. They are the CLASSIC
 *  module identity (the ledger strings stay byte-identical); only the npm
 *  package identity and the ledger FILE name belong to the twin.
 *  THE ORDER IS LOAD-BEARING: `lib-dsh-core` renames to `ets-base-dsh`, so the
 *  bare token rules run before the relative-path rule could see them. */
export default (Text) =>
	Text.replaceAll("lib-dsh-core", "ets-base-dsh")
		.replaceAll("plugin-dsh-factory", "ets-plugin-dsh-factory")
		.replaceAll("lib-dsh-trace", "ets-lib-dsh-trace")
		.replaceAll("lib-dsh-pack", "ets-lib-dsh-pack")
		.replaceAll(".dsh/playform/hook-dsh-", ".dsh/playform/ets-hook-dsh-")
		.replaceAll(".dsh/playform/plugin-dsh-", ".dsh/playform/ets-plugin-dsh-")
		.replaceAll(".dsh/playform/client-dsh-", ".dsh/playform/ets-client-dsh-")
		.replaceAll(".dsh/playform/lib-dsh-", ".dsh/playform/ets-lib-dsh-")
		.replaceAll('"@playform/plugin-dsh-', '"@playform/ets-plugin-dsh-')
		.replaceAll('"@playform/hook-dsh-', '"@playform/ets-hook-dsh-')
		.replaceAll('"@playform/client-dsh-', '"@playform/ets-client-dsh-')
		.replaceAll('"@playform/lib-dsh-', '"@playform/ets-lib-dsh-')
		.replaceAll(/((?:\.\.\/)+)(hook|plugin|client|lib)-dsh-/g, "$1ets-$2-dsh-");
