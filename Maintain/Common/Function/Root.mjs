// The monorepo root, resolved from this file's own location.
//
// Every maintainer command runs from the repository root in CI and from
// whatever directory the maintainer happens to be in locally; resolving the
// root from the module's own path (Maintain/Common/Function/Root.mjs -> three
// levels up) makes both cases work with no git dependency and no cwd trust.
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export default resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
