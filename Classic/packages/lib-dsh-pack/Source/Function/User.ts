// User - the USER layer's candidate paths for a slug: the documented
// `.yml`, then `.yaml`, then `.json` (the JSON form needs no YAML parser).
import { join } from "node:path";

import Placement from "../Variable/Placement.js";

export default (Slug: string, Home: string): string[] =>
	Placement.Extensions.map((Extension) =>
		join(Home, Placement.UserDirectory, `${Slug}${Extension}`),
	);
