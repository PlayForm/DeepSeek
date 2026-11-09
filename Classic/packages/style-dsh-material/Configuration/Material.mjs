// Configuration/Material.mjs - the package's own build: publish the three
// partials to Target/Stylesheet and compile the base CSS there. Everything it
// reads and writes is package-local, so a standalone install builds the same
// surface the monorepo does.
import { Publish } from "@playform/lib-dsh-bundle";

Publish(process.cwd());
