function normalizeLabelPosition(position) {
	if (typeof position === "number" && Number.isFinite(position)) {
		return {
			distance: position,
			angle: null,
			offset: null,
			options: null,
		};
	}

	if (!position || typeof position !== "object") {
		return {
			distance: 0.5,
			angle: null,
			offset: null,
			options: null,
		};
	}

	let offset = null;
	if (typeof position.offset === "number" && Number.isFinite(position.offset)) {
		offset = position.offset;
	} else if (position.offset && typeof position.offset === "object") {
		offset = {
			x: Number.isFinite(position.offset.x) ? position.offset.x : null,
			y: Number.isFinite(position.offset.y) ? position.offset.y : null,
		};
	}

	return {
		distance: Number.isFinite(position.distance) ? position.distance : 0.5,
		angle: Number.isFinite(position.angle) ? position.angle : null,
		offset,
		options:
			position.options && typeof position.options === "object"
				? Object.keys(position.options)
						.sort()
						.reduce((result, key) => {
							result[key] = position.options[key];
							return result;
						}, {})
				: null,
	};
}

export function isSameSelectedNodePayload(a, b) {
	if (a === b) {
		return true;
	}

	if (!a || !b) {
		return a === b;
	}

	return (
		a.id === b.id &&
		a.nodeType === b.nodeType &&
		a.label === b.label &&
		JSON.stringify(normalizeLabelPosition(a.labelPosition)) ===
			JSON.stringify(normalizeLabelPosition(b.labelPosition)) &&
		a.lineStyle === b.lineStyle &&
		a.portPosition === b.portPosition &&
		Number(a.fontSize) === Number(b.fontSize) &&
		Number(a.width) === Number(b.width) &&
		Number(a.height) === Number(b.height)
	);
}
