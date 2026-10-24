// Location - the proposal's path (D4): `<home>/.dsh/playform/proposals/
// <slug>.yml`. NEVER the live pack's path (`<home>/.dsh/playform/workspaces/
// <slug>.yml`) and never the repo layer: the learner proposes, the user
// installs. The proposals directory is the learner's own; it is not one of
// the two pack layers (lib-dsh-pack's Placement), so no resolver reads it.
import { join } from "node:path";

export default (Home: string, Slug: string): string =>
	join(Home, ".dsh/playform/proposals", `${Slug}.yml`);
