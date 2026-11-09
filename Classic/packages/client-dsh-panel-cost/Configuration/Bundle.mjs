// Configuration/Bundle.mjs - the package's own client-bundle step: the one
// call into the shared tooling with this package's entry. Everything it reads
// and writes is package-local, so a standalone install builds the same bundle
// the monorepo does.
import { Bundle } from "@playform/lib-dsh-bundle";

await Bundle(process.cwd(), "Source/Bundle.ts");
