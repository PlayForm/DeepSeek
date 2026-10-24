/** One advertised model (the id is the only field the ladder reads). */
export interface ModelInfo {
    id: string;
}
/** The structural shape the plugin probes for (the `ctx.llm` service). */
export default interface CatalogService {
    listModels: (Provider: string) => Promise<ModelInfo[]>;
}
