import { join } from "node:path";

import Placement from "../Variable/Placement.js";

/**
 * @module Repository
 *
 * The REPO layer's candidate paths: `<root>/.dsh/pack.yml`, then `.yaml`, then
 * `.json`.
 *
 * @remarks
 * The repo layer overrides the user layer.
 */

export default (Root: string): string[] =>
	Placement.Extensions.map((Extension) =>
		join(Root, Placement.RepoDirectory, `${Placement.RepoFile}${Extension}`),
	);
