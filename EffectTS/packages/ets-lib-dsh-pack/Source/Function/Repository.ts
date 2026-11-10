/**
 * @module Repository
 *
 * Lists the REPO layer's candidate paths.
 *
 * @remarks
 * The order is `<root>/.dsh/pack.yml`, then `.yaml`, then `.json`. The repo
 * layer overrides the user layer.
 */
import { join } from "node:path";

import Placement from "../Variable/Placement.js";

export default (Root: string): string[] =>
	Placement.Extensions.map((Extension) =>
		join(Root, Placement.RepoDirectory, `${Placement.RepoFile}${Extension}`),
	);
