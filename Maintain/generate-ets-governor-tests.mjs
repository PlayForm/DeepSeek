// One-shot generator: the ETS test tree from the Classic test tree under the
// tree-identity substitutions ONLY (the L2 precedent). Identity ledger strings
// are protected - the ETS packages keep the Classic module identities by
// contract (the ETS source suites assert the same strings byte-identically).
// Run once from the monorepo root; the output is diff-verified afterwards.
import * as FS from "node:fs";
import * as Path from "node:path";

const From = "Classic/packages/hook-dsh-package-governor/Source/Test";
const To = "EffectTS/packages/ets-hook-dsh-package-governor/Source/Test";

const Substitute = (text) =>
	text
		// Comment package mentions: @playform/hook-dsh-* -> @playform/ets-hook-dsh-*
		// (never matches a ledger string - those have no @playform/ prefix).
		.replaceAll("@playform/hook-dsh-", "@playform/ets-hook-dsh-")
		// Cross-bundle import paths and comment mentions of the factory package.
		.replaceAll("plugin-dsh-factory", "ets-plugin-dsh-factory");

const Walk = (dir, base) => {
	for (const entry of FS.readdirSync(dir, { withFileTypes: true })) {
		const source = Path.join(dir, entry.name);
		const target = Path.join(To, Path.relative(base, source));
		if (entry.isDirectory()) {
			FS.mkdirSync(target, { recursive: true });
			Walk(source, base);
		} else {
			const text = FS.readFileSync(source, "utf8");
			FS.mkdirSync(Path.dirname(target), { recursive: true });
			FS.writeFileSync(target, Substitute(text));
		}
	}
};

FS.rmSync(To, { recursive: true, force: true });
Walk(From, From);
console.log("generated", To);
