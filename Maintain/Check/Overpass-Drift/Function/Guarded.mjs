import FileFlavor from "../Variable/FileFlavor.mjs";
import Flavors from "../Variable/Flavors.mjs";

// The guarded flavors per cluster: Command stays the six stream flavors,
// StepBatch/Overpass add the file flavor.
export default (Cluster) => (Cluster === "Command" ? Flavors : [...Flavors, FileFlavor]);
