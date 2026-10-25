import { sceneOf } from "../../../Icon/Transliterate.mjs";

const AreaOf = (Points) => {
	let Sum = 0;
	for (let Index = 0; Index < Points.length; Index += 1) {
		const Next = Points[(Index + 1) % Points.length];
		Sum += Points[Index].x * Next.y - Next.x * Points[Index].y;
	}
	return Math.abs(Sum) / 2;
};

const LengthOf = (Points) => {
	let Sum = 0;
	for (let Index = 1; Index < Points.length; Index += 1) {
		Sum += Math.hypot(
			Points[Index].x - Points[Index - 1].x,
			Points[Index].y - Points[Index - 1].y,
		);
	}
	return Sum;
};

export default (Genome) => {
	const Components = sceneOf(Genome, Genome.plan).components;
	const Solids = Components.filter(
		(Component) =>
			Component.render !== "ribbon" &&
			Component.geometry.topology === "closed" &&
			Component.material.tone !== "tint",
	);
	const Area = Solids.reduce((Sum, Component) => Sum + AreaOf(Component.centerline), 0);
	const Ink = Components.reduce((Sum, Component) => Sum + LengthOf(Component.centerline), 0);
	const Mass = Components.reduce((Sum, Component) => Sum + AreaOf(Component.centerline), 0);
	const Centroid = Components.reduce(
		(Sum, Component) => {
			const Part = AreaOf(Component.centerline);
			const X =
				Component.centerline.reduce((Total, Point) => Total + Point.x, 0) /
				Component.centerline.length;
			const Y =
				Component.centerline.reduce((Total, Point) => Total + Point.y, 0) /
				Component.centerline.length;
			return { x: Sum.x + X * Part, y: Sum.y + Y * Part };
		},
		{ x: 0, y: 0 },
	);
	const Centre = Mass === 0 ? { x: 50, y: 50 } : { x: Centroid.x / Mass, y: Centroid.y / Mass };
	const Balance = Math.hypot(Centre.x - 50, Centre.y - 50);
	const Widths = Components.map((Component) => Component.stroke.width);
	const Contrast = Math.max(...Widths) / Math.min(...Widths);
	const Tones = new Set(Components.map((Component) => Component.material.tone)).size;
	const Profile = Genome.profile ?? {};
	return {
		dir: Genome.dir,
		role: Profile.role,
		feature: Profile.feature,
		sides: 3 + Math.max(0, Math.min(4, Number(Profile.branching) || 0)),
		rounds: 2 + Math.max(0, Math.min(4, Number(Profile.weight) || 0)),
		symmetry: Genome.plan.order,
		components: Components.length,
		area: Math.round(Area),
		ink: Math.round(Ink),
		balance: Math.round(Balance * 10) / 10,
		contrast: Math.round(Contrast * 10) / 10,
		tones: Tones,
	};
};
