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
		a.lineStyle === b.lineStyle &&
		a.portPosition === b.portPosition &&
		Number(a.fontSize) === Number(b.fontSize) &&
		Number(a.width) === Number(b.width) &&
		Number(a.height) === Number(b.height)
	);
}
