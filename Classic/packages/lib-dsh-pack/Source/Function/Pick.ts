import { existsSync } from "node:fs";

/**
 * @module Pick
 *
 * The first existing path of a candidate list, or `undefined`.
 *
 * @remarks
 * The layer probes share it so the extension order lives in one Variable.
 */

export default (Paths: string[]): string | undefined => Paths.find((Path) => existsSync(Path));
