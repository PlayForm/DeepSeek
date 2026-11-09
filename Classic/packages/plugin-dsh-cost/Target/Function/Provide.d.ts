import { DatabaseSync } from "node:sqlite";
import type { Context } from "@deepseek-ai/cordis";
import type Config from "../Interface/Config.js";
export default function Provide(Context: Context, Config: Config, Database?: DatabaseSync): () => void;
