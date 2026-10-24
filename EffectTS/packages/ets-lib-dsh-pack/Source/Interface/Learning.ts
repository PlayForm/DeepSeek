// Learning - the pack's learning section (D4): the opt-in bootstrap that
// proposes a pack from the repo's index, and the continuous refinement from
// the observed edits. The proposal engine is a later lane; the pack carries
// the settings so one file describes one repo.
export default interface Learning {
	/** Whether the bootstrap may propose a pack (never writes silently). */
	propose?: boolean;
	/** Whether accepted suggestions refine the pack. */
	refine?: boolean;
	/** The observation window, in judged calls. */
	window?: number;
}
