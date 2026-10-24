// Slug - the repo slug: the repo root's basename, lowercased (D2). A pack
// may override it with `slug:`; the override is read from the repo layer
// before the user layer is located.
import { basename } from "node:path";

export default (Root: string): string => basename(Root).toLowerCase();
