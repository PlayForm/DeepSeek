const CENTRE = 50;

const number = (Value) => {
	const Rounded = Math.round(Value * 100) / 100;
	return Object.is(Rounded, -0) ? "0" : String(Rounded);
};

export const polar = (Angle, Radius) => {
	const Radians = (Angle * Math.PI) / 180;
	return {
		x: CENTRE + Radius * Math.cos(Radians),
		y: CENTRE + Radius * Math.sin(Radians),
	};
};

export const pointsToPath = (Points, Close = false) =>
	Points.map(
		(Point, Index) => `${Index === 0 ? "M" : "L"}${number(Point.x)},${number(Point.y)}`,
	).join(" ") + (Close ? " Z" : "");

const arc = (Radius, From, To) => {
	const Start = polar(From, Radius);
	const End = polar(To, Radius);
	const Sweep = To >= From ? 1 : 0;
	const Large = Math.abs(To - From) > 180 ? 1 : 0;
	return `M${number(Start.x)},${number(Start.y)} A${number(Radius)},${number(Radius)} 0 ${Large},${Sweep} ${number(End.x)},${number(End.y)}`;
};

export const dotPath = (X, Y, Radius) =>
	`M${number(X - Radius)},${number(Y)} a${number(Radius)},${number(Radius)} 0 1,0 ${number(Radius * 2)},0 a${number(Radius)},${number(Radius)} 0 1,0 ${number(-Radius * 2)},0`;

export const ring = ({ Radius, GapAngle = 0, GapWidth = 0 }) => {
	if (GapWidth <= 0) {
		return `${arc(Radius, -90, 90)} ${arc(Radius, 90, 270)}`;
	}
	const Start = GapAngle + GapWidth / 2;
	const End = GapAngle + 360 - GapWidth / 2;
	return arc(Radius, Start, End);
};

export const spike = ({ Angle, Outer, Inner, Waist, HalfWidth }) => {
	const Left = polar(Angle - HalfWidth, Inner);
	const ControlLeft = polar(Angle - HalfWidth * 0.55, Waist);
	const Tip = polar(Angle, Outer);
	const ControlRight = polar(Angle + HalfWidth * 0.55, Waist);
	const Right = polar(Angle + HalfWidth, Inner);
	return `M${number(Left.x)},${number(Left.y)} Q${number(ControlLeft.x)},${number(ControlLeft.y)} ${number(Tip.x)},${number(Tip.y)} Q${number(ControlRight.x)},${number(ControlRight.y)} ${number(Right.x)},${number(Right.y)}`;
};

export const petal = ({ Angle, Outer, Inner, Width }) => {
	const Left = polar(Angle - Width, Inner);
	const ControlLeft = polar(Angle - Width * 0.55, Outer * 0.62);
	const Tip = polar(Angle, Outer);
	const ControlRight = polar(Angle + Width * 0.55, Outer * 0.62);
	const Right = polar(Angle + Width, Inner);
	const Base = polar(Angle, Inner * 0.45);
	return `M${number(Left.x)},${number(Left.y)} Q${number(ControlLeft.x)},${number(ControlLeft.y)} ${number(Tip.x)},${number(Tip.y)} Q${number(ControlRight.x)},${number(ControlRight.y)} ${number(Right.x)},${number(Right.y)} Q${number(Base.x)},${number(Base.y)} ${number(Left.x)},${number(Left.y)} Z`;
};

export const teardrop = ({ Angle, Radius, Bulb, Neck }) => {
	const Tip = polar(Angle, Radius + Neck);
	const Left = polar(Angle - 22, Radius);
	const Right = polar(Angle + 22, Radius);
	const ControlLeft = polar(Angle - 30, Radius + Neck * 0.35);
	const ControlRight = polar(Angle + 30, Radius + Neck * 0.35);
	return `M${number(Tip.x)},${number(Tip.y)} Q${number(ControlLeft.x)},${number(ControlLeft.y)} ${number(Left.x)},${number(Left.y)} A${number(Bulb)},${number(Bulb)} 0 1,0 ${number(Right.x)},${number(Right.y)} Q${number(ControlRight.x)},${number(ControlRight.y)} ${number(Tip.x)},${number(Tip.y)} Z`;
};

export const scroll = ({ Angle, Radius, Curl, Direction = 1 }) => {
	const Start = polar(Angle, Radius * 0.4);
	const ControlA = polar(Angle + Direction * 26, Radius * 0.55);
	const ControlB = polar(Angle + Direction * 62, Radius * 0.82);
	const End = polar(Angle + Direction * 52, Radius);
	const CurlEnd = polar(Angle + Direction * 52 + Direction * 150, Radius * 0.86);
	const CurlControl = polar(Angle + Direction * 52 + Direction * 70, Radius * 1.02);
	return `M${number(Start.x)},${number(Start.y)} C${number(ControlA.x)},${number(ControlA.y)} ${number(ControlB.x)},${number(ControlB.y)} ${number(End.x)},${number(End.y)} Q${number(CurlControl.x)},${number(CurlControl.y)} ${number(CurlEnd.x)},${number(CurlEnd.y)}`;
};

export const band = ({ From, To, Inner, Outer, BreakAt = 0 }) => {
	if (BreakAt <= 0) {
		const Corners = [
			polar(From, Inner),
			polar(To, Inner),
			polar(To, Outer),
			polar(From, Outer),
		];
		return pointsToPath(Corners, true);
	}
	const Middle = (From + To) / 2;
	const First = [
		polar(From, Inner),
		polar(Middle - BreakAt / 2, Inner),
		polar(Middle - BreakAt / 2, Outer),
		polar(From, Outer),
	];
	const Second = [
		polar(Middle + BreakAt / 2, Inner),
		polar(To, Inner),
		polar(To, Outer),
		polar(Middle + BreakAt / 2, Outer),
	];
	return `${pointsToPath(First, true)} ${pointsToPath(Second, true)}`;
};

export const interlace = ({ Count, Radius, Width, Phase = 0 }) => {
	const Inner = Radius - Width;
	const Outer = Radius + Width;
	const Parts = [ring({ Radius: Inner }), ring({ Radius: Outer })];
	for (let Index = 0; Index < Count; Index += 1) {
		const Angle = Phase + (Index * 360) / Count;
		const Over = Index % 2 === 0;
		Parts.push(band({ From: Angle, To: Angle + 0.6, Inner, Outer, BreakAt: Over ? 0 : 5 }));
	}
	return Parts.join(" ");
};

export const quadrant = ({ Angle, Inner, Outer, Inset }) => {
	const Corners = [
		polar(Angle - 45, Inner),
		polar(Angle - 45, Outer),
		polar(Angle + 45, Outer),
		polar(Angle + 45, Inner),
	];
	const InsetCorners = [
		polar(Angle - 45 + Inset, Inner + Inset),
		polar(Angle - 45 + Inset, Outer - Inset),
		polar(Angle + 45 - Inset, Outer - Inset),
		polar(Angle + 45 - Inset, Inner + Inset),
	];
	return `${pointsToPath(Corners, true)} ${pointsToPath(InsetCorners, true)}`;
};

export const web = ({ Spokes, Radii, Inner = 10 }) => {
	const Parts = [];
	for (let Index = 0; Index < Spokes; Index += 1) {
		const Angle = (Index * 360) / Spokes;
		const Start = polar(Angle, Inner);
		const End = polar(Angle, Radii[Radii.length - 1]);
		Parts.push(`M${number(Start.x)},${number(Start.y)} L${number(End.x)},${number(End.y)}`);
	}
	for (const Radius of Radii) {
		const Step = 360 / Spokes;
		for (let Index = 0; Index < Spokes; Index += 1) {
			const From = Index * Step + 4;
			const To = (Index + 1) * Step - 4;
			Parts.push(arc(Radius, From, To));
		}
	}
	return Parts.join(" ");
};

export const orbit = ({ Radius, Count, Glyph, OffsetAngle = 0, Size }) => {
	const Parts = [];
	for (let Index = 0; Index < Count; Index += 1) {
		const Angle = OffsetAngle + (Index * 360) / Count;
		const Point = polar(Angle, Radius);
		switch (Glyph) {
			case "teardrop":
				Parts.push(
					teardrop({
						Angle,
						Radius: Radius - Size * 0.4,
						Bulb: Size * 0.55,
						Neck: Size * 0.8,
					}),
				);
				break;
			case "crescent":
				Parts.push(
					`M${number(polar(Angle - 26, Radius - Size).x)},${number(polar(Angle - 26, Radius - Size).y)} A${number(Size)},${number(Size)} 0 1,1 ${number(polar(Angle + 26, Radius - Size).x)},${number(polar(Angle + 26, Radius - Size).y)} A${number(Size * 0.7)},${number(Size * 0.7)} 0 1,0 ${number(polar(Angle - 26, Radius - Size).x)},${number(polar(Angle - 26, Radius - Size).y)} Z`,
				);
				break;
			case "tick": {
				const Inner = polar(Angle, Radius - Size);
				const Outer = polar(Angle, Radius + Size);
				Parts.push(
					`M${number(Inner.x)},${number(Inner.y)} L${number(Outer.x)},${number(Outer.y)}`,
				);
				break;
			}
			case "spark": {
				const Outer = polar(Angle, Radius + Size);
				const Inner = polar(Angle, Radius - Size);
				const SideA = polar(Angle + 90, Radius);
				const SideB = polar(Angle - 90, Radius);
				Parts.push(
					`M${number(Inner.x)},${number(Inner.y)} L${number(Outer.x)},${number(Outer.y)} M${number(SideA.x)},${number(SideA.y)} L${number(SideB.x)},${number(SideB.y)}`,
				);
				break;
			}
			default:
				Parts.push(dotPath(Point.x, Point.y, Size * 0.5));
		}
	}
	return Parts.join(" ");
};

export const core = ({ Glyph, Radius }) => {
	const Corners = (Count, Phase = -90) => {
		const Points = [];
		for (let Index = 0; Index < Count; Index += 1) {
			Points.push(polar(Phase + (Index * 360) / Count, Radius));
		}
		return Points;
	};
	switch (Glyph) {
		case "ring":
			return ring({ Radius: Radius * 0.8 });
		case "cross":
			return `M${number(CENTRE - Radius)},${number(CENTRE)} L${number(CENTRE + Radius)},${number(CENTRE)} M${number(CENTRE)},${number(CENTRE - Radius)} L${number(CENTRE)},${number(CENTRE + Radius)}`;
		case "diamond":
			return pointsToPath(Corners(4), true);
		case "square":
			return pointsToPath(Corners(4, -135), true);
		case "star":
			return pointsToPath(Corners(8, -90), true);
		case "hexagon":
			return pointsToPath(Corners(6), true);
		case "pinwheel": {
			const Parts = [];
			for (let Index = 0; Index < 4; Index += 1) {
				const Angle = Index * 90;
				const Start = polar(Angle, Radius * 0.2);
				const Control = polar(Angle + 40, Radius * 0.75);
				const End = polar(Angle + 85, Radius);
				Parts.push(
					`M${number(Start.x)},${number(Start.y)} Q${number(Control.x)},${number(Control.y)} ${number(End.x)},${number(End.y)}`,
				);
			}
			return Parts.join(" ");
		}
		case "barDiamond":
			return `${pointsToPath(Corners(4), true)} M${number(CENTRE - Radius * 0.6)},${number(CENTRE)} L${number(CENTRE + Radius * 0.6)},${number(CENTRE)}`;
		case "pin":
			return `${pointsToPath([polar(-90, Radius), polar(210, Radius), polar(330, Radius)], true)} M${number(CENTRE)},${number(CENTRE + Radius * 0.4)} L${number(CENTRE)},${number(CENTRE + Radius)}`;
		case "grid":
			return `${pointsToPath(
				[
					{ x: CENTRE - Radius, y: CENTRE - Radius },
					{ x: CENTRE, y: CENTRE - Radius },
					{ x: CENTRE, y: CENTRE },
					{ x: CENTRE - Radius, y: CENTRE },
				],
				true,
			)} ${pointsToPath(
				[
					{ x: CENTRE, y: CENTRE },
					{ x: CENTRE + Radius, y: CENTRE },
					{ x: CENTRE + Radius, y: CENTRE + Radius },
					{ x: CENTRE, y: CENTRE + Radius },
				],
				true,
			)}`;
		case "spiral":
			return `M${number(CENTRE)},${number(CENTRE)} m${number(Radius * 0.2)},0 a${number(Radius * 0.2)},${number(Radius * 0.2)} 0 1,1 ${number(-Radius * 0.4)},0 a${number(Radius * 0.45)},${number(Radius * 0.45)} 0 1,1 ${number(Radius * 0.9)},0`;
		case "dot":
		default:
			return dotPath(CENTRE, CENTRE, Radius * 0.55);
	}
};

export const squareFrame = ({ Half, Double = false }) => {
	const Square = (Size) =>
		pointsToPath(
			[
				{ x: CENTRE - Size, y: CENTRE - Size },
				{ x: CENTRE + Size, y: CENTRE - Size },
				{ x: CENTRE + Size, y: CENTRE + Size },
				{ x: CENTRE - Size, y: CENTRE + Size },
			],
			true,
		);
	return Double ? `${Square(Half)} ${Square(Half - 4)}` : Square(Half);
};

export const diamondFrame = ({ Half }) =>
	pointsToPath([polar(-90, Half), polar(0, Half), polar(90, Half), polar(180, Half)], true);

export const scallopFrame = ({ Radius, Lobes }) => {
	const Parts = [];
	const Step = 360 / Lobes;
	for (let Index = 0; Index < Lobes; Index += 1) {
		Parts.push(arc(Radius, Index * Step + 6, (Index + 1) * Step - 6));
	}
	return Parts.join(" ");
};

export const wovenFrame = ({ Radius, Count }) => {
	const Parts = [ring({ Radius }), ring({ Radius: Radius - 4 })];
	for (let Index = 0; Index < Count; Index += 1) {
		const Angle = (Index * 360) / Count;
		Parts.push(
			band({
				From: Angle - 3,
				To: Angle + 3,
				Inner: Radius - 4,
				Outer: Radius,
				BreakAt: Index % 2 === 0 ? 0 : 3,
			}),
		);
	}
	return Parts.join(" ");
};
