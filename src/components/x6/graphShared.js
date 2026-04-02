export const edgeTools = [
	{
		name: "segments",
		args: {
			attrs: {
				fill: "#2563eb",
				stroke: "#ffffff",
				"stroke-width": 2,
			},
		},
	},
];

export const EDGE_DASH_MAP = {
	solid: null,
	dashed: "8 6",
	dotted: "2 6",
};

export const EDGE_LABEL_STYLE = {
	fill: "#0f172a",
	fontSize: 12,
	textAnchor: "middle",
	textVerticalAnchor: "middle",
	lineHeight: "1.35em",
	textWrap: {
		width: 140,
		height: 72,
		ellipsis: true,
	},
};

export const GRID_OPTIONS = {
	visible: false,
	size: 24,
};

const PORT_GROUP_LABELS = {
	out: "下",
	in: "上",
	ioTop: "上",
	ioBottom: "下",
	ioLeft: "左",
	ioRight: "右",
};

const PORT_POSITION_LABELS = {
	top: "上",
	bottom: "下",
	left: "左",
	right: "右",
};

const PORT_LABEL_POSITIONS = {
	上: "top",
	下: "bottom",
	左: "left",
	右: "right",
};

function normalizeToValue(targetIds) {
	if (!targetIds.length) return null;
	return targetIds.length === 1 ? targetIds[0] : targetIds;
}

export function createEdgeLabelConfig(label) {
	return {
		position: 0.5,
		attrs: {
			body: {
				fill: "#ffffff",
				fillOpacity: 0.94,
				stroke: "#dbe2f0",
				strokeWidth: 1,
				rx: 6,
				ry: 6,
			},
			label: {
				text: label,
				...EDGE_LABEL_STYLE,
			},
		},
	};
}

export function mapPortGroupToLabel(group) {
	return PORT_GROUP_LABELS[group] || group;
}

export function mapPositionToPortLabel(position) {
	return PORT_POSITION_LABELS[position] || position;
}

export function mapPortLabelToPosition(label) {
	return PORT_LABEL_POSITIONS[label] || "right";
}

export function mapNodeType(node, predicates) {
	const { isStartNode, isEndNode, isConditionNode, isNodeNode } = predicates;

	if (isStartNode(node)) return "start";
	if (isEndNode(node)) return "end";
	if (isConditionNode(node)) return "condition";
	if (isNodeNode(node)) return "node";
	return "unknown";
}

export function getNodePortLabels(node, predicates) {
	const data = node.getData?.() || {};

	if (predicates.isStartNode(node) || predicates.isEndNode(node)) {
		return [mapPositionToPortLabel(data.portPosition)];
	}

	return node.getPorts().map((port) => mapPortGroupToLabel(port.group));
}

export function getEdgeLineStyle(edge) {
	const dash = edge.attr("line/strokeDasharray");
	if (!dash) {
		return "solid";
	}

	if (String(dash) === EDGE_DASH_MAP.dashed) {
		return "dashed";
	}

	if (String(dash) === EDGE_DASH_MAP.dotted) {
		return "dotted";
	}

	return "solid";
}

export function getEdgePayload(edge) {
	const labels = edge.getLabels();
	const firstLabel = labels[0];
	const labelText =
		firstLabel?.attrs?.label?.text ??
		firstLabel?.attrs?.label?.text?.text ??
		firstLabel?.attrs?.text?.text ??
		firstLabel?.attrs?.text?.text?.text ??
		(firstLabel?.position ? "" : "");

	return {
		id: edge.id,
		nodeType: "edge",
		label: labelText,
		lineStyle: getEdgeLineStyle(edge),
	};
}

export function buildGraphSnapshot(graph, predicates) {
	if (!graph) {
		return { nodes: [], edges: [] };
	}

	const edges = graph.getEdges().map((edge) => {
		const payload = getEdgePayload(edge);

		return {
			id: edge.id,
			source: edge.getSourceCellId?.() || null,
			target: edge.getTargetCellId?.() || null,
			sourcePort: edge.getSource()?.port || null,
			targetPort: edge.getTarget()?.port || null,
			attrs: {
				label: payload.label ?? "",
				lineStyle: payload.lineStyle ?? "solid",
			},
			vertices: edge.getVertices().map((point) => ({
				x: Math.round(point.x),
				y: Math.round(point.y),
			})),
		};
	});

	const nodes = graph.getNodes().map((node) => {
		const position = node.getPosition();
		const size = node.getSize();
		const outgoingEdges = graph.getOutgoingEdges(node) || [];
		const targetIds = outgoingEdges.map((edge) => edge.getTargetCellId?.()).filter(Boolean);

		return {
			id: node.id,
			type: mapNodeType(node, predicates),
			to: normalizeToValue(targetIds),
			attrs: {
				label: node.attr("label/text") ?? "",
				size: Number(node.attr("label/fontSize")) || 0,
			},
			ports: getNodePortLabels(node, predicates),
			position: {
				x: Math.round(position.x),
				y: Math.round(position.y),
			},
			dimensions: {
				width: Math.round(size.width),
				height: Math.round(size.height),
			},
		};
	});

	return {
		nodes,
		edges,
	};
}

export function loadGraphFromSnapshot(config) {
	const {
		graph,
		snapshot,
		clearGraph,
		createStartNode,
		createEndNode,
		createNodeNode,
		createConditionNode,
	} = config;

	if (!graph) {
		return;
	}

	clearGraph();

	snapshot.nodes.forEach((node) => {
		const centerX = node.position.x + node.dimensions.width / 2;
		const centerY = node.position.y + node.dimensions.height / 2;
		const commonConfig = {
			id: node.id,
			x: centerX,
			y: centerY,
			label: node.attrs.label,
			fontSize: node.attrs.size,
			width: node.dimensions.width,
			height: node.dimensions.height,
		};

		if (node.type === "start") {
			graph.addNode(
				createStartNode({
					...commonConfig,
					portPosition: mapPortLabelToPosition(node.ports[0]),
					portId: "start-output",
				}),
			);
			return;
		}

		if (node.type === "end") {
			graph.addNode(
				createEndNode({
					...commonConfig,
					portPosition: mapPortLabelToPosition(node.ports[0]),
					portId: "end-input",
				}),
			);
			return;
		}

		if (node.type === "node") {
			graph.addNode(
				createNodeNode({
					...commonConfig,
					portIds: {
						top: `node-top-${node.id}`,
						bottom: `node-bottom-${node.id}`,
						left: `node-left-${node.id}`,
						right: `node-right-${node.id}`,
					},
				}),
			);
			return;
		}

		if (node.type === "condition") {
			graph.addNode(
				createConditionNode({
					...commonConfig,
					portIds: {
						top: `condition-top-${node.id}`,
						bottom: `condition-bottom-${node.id}`,
						left: `condition-left-${node.id}`,
						right: `condition-right-${node.id}`,
					},
				}),
			);
		}
	});

	snapshot.edges.forEach((edge) => {
		const edgeConfig = {
			id: edge.id,
			source: {
				cell: edge.source,
				port: edge.sourcePort,
			},
			target: {
				cell: edge.target,
				port: edge.targetPort,
			},
			vertices: edge.vertices || [],
			router: {
				name: "orth",
				args: {
					padding: 24,
				},
			},
			connector: {
				name: "rounded",
				args: {
					radius: 18,
				},
			},
			attrs: {
				line: {
					stroke: "#2563eb",
					strokeWidth: 3,
					strokeDasharray: EDGE_DASH_MAP[edge.attrs?.lineStyle] || null,
					targetMarker: {
						name: "classic",
						width: 10,
						height: 12,
					},
				},
			},
			zIndex: 1,
		};

		if (edge.attrs?.label) {
			edgeConfig.labels = [createEdgeLabelConfig(edge.attrs.label)];
		}

		graph.addEdge({
			...edgeConfig,
		});
	});
}
