export const CIRCLE_PORT_MARKUP = [
	{
		tagName: "circle",
		selector: "circle",
	},
];

export function toNumber(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

export function createCirclePortAttrs(resolved) {
	return {
		circle: {
			r: resolved.portRadius,
			magnet: true,
			stroke: resolved.portStroke,
			strokeWidth: resolved.portStrokeWidth,
			fill: resolved.portFill,
		},
	};
}

export function createSinglePortConfig(group, position, portId, resolved) {
	return {
		groups: {
			[group]: {
				position: {
					name: position,
				},
				attrs: createCirclePortAttrs(resolved),
				markup: CIRCLE_PORT_MARKUP,
			},
		},
		items: [
			{
				id: portId,
				group,
			},
		],
	};
}

export function createFourWayPortConfig(portIds, resolved) {
	const attrs = createCirclePortAttrs(resolved);

	return {
		groups: {
			ioTop: {
				position: { name: "top" },
				attrs,
				markup: CIRCLE_PORT_MARKUP,
			},
			ioBottom: {
				position: { name: "bottom" },
				attrs,
				markup: CIRCLE_PORT_MARKUP,
			},
			ioLeft: {
				position: { name: "left" },
				attrs,
				markup: CIRCLE_PORT_MARKUP,
			},
			ioRight: {
				position: { name: "right" },
				attrs,
				markup: CIRCLE_PORT_MARKUP,
			},
		},
		items: [
			{ id: portIds.top, group: "ioTop" },
			{ id: portIds.bottom, group: "ioBottom" },
			{ id: portIds.left, group: "ioLeft" },
			{ id: portIds.right, group: "ioRight" },
		],
	};
}

export function getSharedNodePayload(cell, defaults, nodeType, options = {}) {
	const data = cell.getData?.() || {};
	const payload = {
		id: cell.id,
		nodeType,
		label: cell.attr("label/text") ?? "",
		fontSize: Number(cell.attr("label/fontSize")) || defaults.fontSize,
		width: Math.round(cell.size().width),
		height: Math.round(cell.size().height),
		bodyFill: cell.attr("body/fill") || data.bodyFill || defaults.bodyFill,
		bodyStroke: cell.attr("body/stroke") || data.bodyStroke || defaults.bodyStroke,
		bodyStrokeWidth:
			Number(cell.attr("body/strokeWidth")) ||
			data.bodyStrokeWidth ||
			defaults.bodyStrokeWidth,
		labelColor: cell.attr("label/fill") || data.labelColor || defaults.labelColor,
		labelFontWeight:
			Number(cell.attr("label/fontWeight")) ||
			data.labelFontWeight ||
			defaults.labelFontWeight,
		portStroke: data.portStroke || defaults.portStroke,
		portFill: data.portFill || defaults.portFill,
		portStrokeWidth: data.portStrokeWidth || defaults.portStrokeWidth,
		portRadius: data.portRadius || defaults.portRadius,
	};

	if (options.includePortPosition) {
		payload.portPosition = data.portPosition || defaults.portPosition;
	}

	if (options.portIdFallback) {
		payload.portId = data.portId || options.portIdFallback;
	}

	return payload;
}
