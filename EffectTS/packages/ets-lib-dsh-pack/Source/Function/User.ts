/**
 * @module User
 *
 * Lists the USER layer's candidate paths for a slug.
 *
 * @remarks
 * The order is the documented `.yml`, then `.yaml`, then `.json` (the JSON
 * form needs no YAML parser).
 */
import { join } from "node:path";

import Placement from "../Variable/Placement.js";

export default (Slug: string, Home: string): string[] =>
	Placement.Extensions.map((Extension) =>
		join(Home, Placement.UserDirectory, `${Slug}${Extension}`),
	);
