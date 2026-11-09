import { join } from "node:path";

import Placement from "../Variable/Placement.js";

/**
 * @module User
 *
 * The USER layer's candidate paths for a slug: the documented `.yml`, then
 * `.yaml`, then `.json`.
 *
 * @remarks
 * The JSON form needs no YAML parser.
 */

export default (Slug: string, Home: string): string[] =>
	Placement.Extensions.map((Extension) =>
		join(Home, Placement.UserDirectory, `${Slug}${Extension}`),
	);
