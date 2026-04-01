<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { Graph, Shape, Snapline, Transform } from "@antv/x6";
import { Modal } from "ant-design-vue";
import { content as x6Styles } from "@antv/x6/es/style/raw";
import { END_NODE_MIME_TYPE, END_NODE_TYPE, createEndNode, createEndPorts, getEndNodePayload, isEndNode } from "./End.vue";
import { CONDITION_NODE_MIME_TYPE, CONDITION_NODE_TYPE, createConditionNode, getConditionNodePayload, isConditionNode } from "./Condition.vue";
import { NODE_NODE_MIME_TYPE, NODE_NODE_TYPE, createNodeNode, getNodePayload, isNodeNode } from "./Node.vue";
import { START_NODE_MIME_TYPE, START_NODE_TYPE, createStartNode, createStartPorts, getStartNodePayload, isStartNode } from "./Start.vue";

const props = defineProps({
	selectedNode: {
		type: Object,
		default: null,
	},
});

const emit = defineEmits(["node-selection-change"]);

const containerRef = ref(null);
const graphRef = shallowRef(null);
const activeEdgeRef = shallowRef(null);
const selectedNodeRef = shallowRef(null);
const selectedEdgeRef = shallowRef(null);
const isDropActive = ref(false);
const graphSnapshot = ref({
	nodes: [],
	edges: [],
});
const copyStatus = ref("idle");

const INITIAL_GRAPH_DATA = {
	nodes: [
		{
			id: "start-node-1774946269438",
			type: "start",
			to: "rect-node-1774948010316",
			attrs: {
				label: "开始",
				size: 14,
			},
			ports: ["下"],
			position: {
				x: 416,
				y: -16,
			},
			dimensions: {
				width: 80,
				height: 80,
			},
		},
		{
			id: "end-node-1774947341676",
			type: "end",
			to: null,
			attrs: {
				label: "结束",
				size: 16,
			},
			ports: ["上"],
			position: {
				x: 416,
				y: 816,
			},
			dimensions: {
				width: 80,
				height: 80,
			},
		},
		{
			id: "rect-node-1774948010316",
			type: "node",
			to: ["condition-node-1774948029525", "condition-node-1774948025388", "condition-node-1774948034220"],
			attrs: {
				label: "节点",
				size: 16,
			},
			ports: ["上", "下", "左", "右"],
			position: {
				x: 384,
				y: 128,
			},
			dimensions: {
				width: 144,
				height: 80,
			},
		},
		{
			id: "condition-node-1774948025388",
			type: "condition",
			to: "rect-node-1774948051883",
			attrs: {
				label: "条件1",
				size: 16,
			},
			ports: ["上", "下", "左", "右"],
			position: {
				x: 256,
				y: 288,
			},
			dimensions: {
				width: 80,
				height: 80,
			},
		},
		{
			id: "condition-node-1774948029525",
			type: "condition",
			to: "rect-node-1774948056771",
			attrs: {
				label: "条件2",
				size: 16,
			},
			ports: ["上", "下", "左", "右"],
			position: {
				x: 416,
				y: 288,
			},
			dimensions: {
				width: 80,
				height: 80,
			},
		},
		{
			id: "condition-node-1774948034220",
			type: "condition",
			to: "rect-node-1774948062914",
			attrs: {
				label: "条件3",
				size: 16,
			},
			ports: ["上", "下", "左", "右"],
			position: {
				x: 576,
				y: 288,
			},
			dimensions: {
				width: 80,
				height: 80,
			},
		},
		{
			id: "rect-node-1774948051883",
			type: "node",
			to: "rect-node-1774948070748",
			attrs: {
				label: "节点",
				size: 16,
			},
			ports: ["上", "下", "左", "右"],
			position: {
				x: 256,
				y: 464,
			},
			dimensions: {
				width: 80,
				height: 80,
			},
		},
		{
			id: "rect-node-1774948056771",
			type: "node",
			to: "rect-node-1774948070748",
			attrs: {
				label: "节点",
				size: 16,
			},
			ports: ["上", "下", "左", "右"],
			position: {
				x: 416,
				y: 464,
			},
			dimensions: {
				width: 80,
				height: 80,
			},
		},
		{
			id: "rect-node-1774948062914",
			type: "node",
			to: "rect-node-1774948070748",
			attrs: {
				label: "节点",
				size: 16,
			},
			ports: ["上", "下", "左", "右"],
			position: {
				x: 576,
				y: 464,
			},
			dimensions: {
				width: 80,
				height: 80,
			},
		},
		{
			id: "rect-node-1774948070748",
			type: "node",
			to: "end-node-1774947341676",
			attrs: {
				label: "节点",
				size: 16,
			},
			ports: ["上", "下", "左", "右"],
			position: {
				x: 344,
				y: 656,
			},
			dimensions: {
				width: 224,
				height: 80,
			},
		},
	],
	edges: [
		{
			id: "e7542fb2-357d-43c5-9c46-9feb9842c5a9",
			source: "start-node-1774946269438",
			target: "rect-node-1774948010316",
			sourcePort: "start-output",
			targetPort: "node-top-rect-node-1774948010316",
			attrs: {
				label: "",
				lineStyle: "solid",
			},
			vertices: [],
		},
		{
			id: "503b59ed-0b09-4925-b7dd-401095471798",
			source: "rect-node-1774948010316",
			target: "condition-node-1774948029525",
			sourcePort: "node-bottom-rect-node-1774948010316",
			targetPort: "condition-top-condition-node-1774948029525",
			attrs: {
				label: "",
				lineStyle: "solid",
			},
			vertices: [],
		},
		{
			id: "b49165e1-dae7-44fc-aaa8-9beb840e7ae1",
			source: "rect-node-1774948010316",
			target: "condition-node-1774948025388",
			sourcePort: "node-left-rect-node-1774948010316",
			targetPort: "condition-top-condition-node-1774948025388",
			attrs: {
				label: "",
				lineStyle: "solid",
			},
			vertices: [],
		},
		{
			id: "e4a286d8-941f-4ae2-adb9-4e956a02e0e9",
			source: "rect-node-1774948010316",
			target: "condition-node-1774948034220",
			sourcePort: "node-right-rect-node-1774948010316",
			targetPort: "condition-top-condition-node-1774948034220",
			attrs: {
				label: "测试连接线文本",
				lineStyle: "dashed",
			},
			vertices: [],
		},
		{
			id: "f2533939-f288-4ddb-b51e-95a9067fc8cf",
			source: "condition-node-1774948025388",
			target: "rect-node-1774948051883",
			sourcePort: "condition-bottom-condition-node-1774948025388",
			targetPort: "node-top-rect-node-1774948051883",
			attrs: {
				label: "",
				lineStyle: "solid",
			},
			vertices: [],
		},
		{
			id: "e1c941fc-8068-48c4-9a1f-e6fd553ac7bb",
			source: "condition-node-1774948029525",
			target: "rect-node-1774948056771",
			sourcePort: "condition-bottom-condition-node-1774948029525",
			targetPort: "node-top-rect-node-1774948056771",
			attrs: {
				label: "",
				lineStyle: "solid",
			},
			vertices: [],
		},
		{
			id: "db8b41e7-f1a7-4d86-adc6-5f5d17e907ff",
			source: "condition-node-1774948034220",
			target: "rect-node-1774948062914",
			sourcePort: "condition-bottom-condition-node-1774948034220",
			targetPort: "node-top-rect-node-1774948062914",
			attrs: {
				label: "",
				lineStyle: "solid",
			},
			vertices: [],
		},
		{
			id: "961637e5-b995-4243-8a10-e3a7417c1a7e",
			source: "rect-node-1774948051883",
			target: "rect-node-1774948070748",
			sourcePort: "node-bottom-rect-node-1774948051883",
			targetPort: "node-top-rect-node-1774948070748",
			attrs: {
				label: "",
				lineStyle: "solid",
			},
			vertices: [
				{
					x: 296,
					y: 608,
				},
				{
					x: 448,
					y: 608,
				},
			],
		},
		{
			id: "bc6c823a-adc7-4ef7-b25d-9cb0814a658a",
			source: "rect-node-1774948056771",
			target: "rect-node-1774948070748",
			sourcePort: "node-bottom-rect-node-1774948056771",
			targetPort: "node-top-rect-node-1774948070748",
			attrs: {
				label: "",
				lineStyle: "solid",
			},
			vertices: [],
		},
		{
			id: "023a3d7e-1b80-4b18-acca-0a0f94d2a3a6",
			source: "rect-node-1774948062914",
			target: "rect-node-1774948070748",
			sourcePort: "node-bottom-rect-node-1774948062914",
			targetPort: "node-top-rect-node-1774948070748",
			attrs: {
				label: "",
				lineStyle: "solid",
			},
			vertices: [
				{
					x: 616,
					y: 608,
				},
				{
					x: 464,
					y: 608,
				},
			],
		},
		{
			id: "85064782-fece-40b9-8047-c5c2a6164b47",
			source: "rect-node-1774948070748",
			target: "end-node-1774947341676",
			sourcePort: "node-bottom-rect-node-1774948070748",
			targetPort: "end-input",
			attrs: {
				label: "",
				lineStyle: "solid",
			},
			vertices: [],
		},
	],
};

const edgeTools = [
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

const EDGE_LABEL_STYLE = {
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

const GRID_OPTIONS = {
	visible: false,
	size: 24,
};

function createEdgeLabelConfig(label) {
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

function ensureX6Styles() {
	if (document.getElementById("x6-base-styles")) {
		return;
	}

	const style = document.createElement("style");
	style.id = "x6-base-styles";
	style.textContent = x6Styles;
	document.head.append(style);
}

function getStartNode() {
	return graphRef.value?.getNodes().find((node) => isStartNode(node)) || null;
}

function getEndNode() {
	return graphRef.value?.getNodes().find((node) => isEndNode(node)) || null;
}

function getNodeById(id) {
	return id ? graphRef.value?.getCellById(id) : null;
}

function mapNodeType(node) {
	if (isStartNode(node)) return "start";
	if (isEndNode(node)) return "end";
	if (isConditionNode(node)) return "condition";
	if (isNodeNode(node)) return "node";
	return "unknown";
}

function mapPortGroupToLabel(group) {
	const mapping = {
		out: "下",
		in: "上",
		ioTop: "上",
		ioBottom: "下",
		ioLeft: "左",
		ioRight: "右",
	};

	return mapping[group] || group;
}

function mapPositionToPortLabel(position) {
	const mapping = {
		top: "上",
		bottom: "下",
		left: "左",
		right: "右",
	};

	return mapping[position] || position;
}

function mapPortLabelToPosition(label) {
	const mapping = {
		上: "top",
		下: "bottom",
		左: "left",
		右: "right",
	};

	return mapping[label] || "right";
}

function getNodePortLabels(node) {
	const data = node.getData?.() || {};

	if (isStartNode(node) || isEndNode(node)) {
		return [mapPositionToPortLabel(data.portPosition)];
	}

	return node.getPorts().map((port) => mapPortGroupToLabel(port.group));
}

function normalizeToValue(targetIds) {
	if (!targetIds.length) return null;
	return targetIds.length === 1 ? targetIds[0] : targetIds;
}

function buildGraphSnapshot() {
	const graph = graphRef.value;
	if (!graph) {
		graphSnapshot.value = { nodes: [], edges: [] };
		return;
	}

	const edges = graph.getEdges().map((edge) => ({
		id: edge.id,
		source: edge.getSourceCellId?.() || null,
		target: edge.getTargetCellId?.() || null,
		sourcePort: edge.getSource()?.port || null,
		targetPort: edge.getTarget()?.port || null,
		attrs: {
			label: getEdgePayload(edge).label ?? "",
			lineStyle: getEdgePayload(edge).lineStyle ?? "solid",
		},
		vertices: edge.getVertices().map((point) => ({
			x: Math.round(point.x),
			y: Math.round(point.y),
		})),
	}));

	const nodes = graph.getNodes().map((node) => {
		const position = node.getPosition();
		const size = node.getSize();
		const outgoingEdges = graph.getOutgoingEdges(node) || [];
		const targetIds = outgoingEdges.map((edge) => edge.getTargetCellId?.()).filter(Boolean);

		return {
			id: node.id,
			type: mapNodeType(node),
			to: normalizeToValue(targetIds),
			attrs: {
				label: node.attr("label/text") ?? "",
				size: Number(node.attr("label/fontSize")) || 0,
			},
			ports: getNodePortLabels(node),
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

	graphSnapshot.value = {
		nodes,
		edges,
	};
}

function getSelectedNodePayload(node) {
	if (isStartNode(node)) return getStartNodePayload(node);
	if (isEndNode(node)) return getEndNodePayload(node);
	if (isNodeNode(node)) return getNodePayload(node);
	if (isConditionNode(node)) return getConditionNodePayload(node);
	return null;
}

function getEdgeLineStyle(edge) {
	const dash = edge.attr("line/strokeDasharray");
	if (!dash) {
		return "solid";
	}

	if (String(dash) === "8 6") {
		return "dashed";
	}

	if (String(dash) === "2 6") {
		return "dotted";
	}

	return "solid";
}

function getEdgePayload(edge) {
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

function isSameNodePayload(a, b) {
	if (a === b) return true;
	if (!a || !b) return a === b;

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

function emitSelection(cell = null) {
	if (!cell || !cell.isNode?.()) {
		if (cell?.isEdge?.()) {
			selectedNodeRef.value = null;
			selectedEdgeRef.value = cell;
			const payload = getEdgePayload(cell);
			if (!isSameNodePayload(props.selectedNode, payload)) {
				emit("node-selection-change", payload);
			}
			return;
		}

		selectedNodeRef.value = null;
		if (props.selectedNode !== null) {
			emit("node-selection-change", null);
		}
		return;
	}

	selectedNodeRef.value = cell;
	const payload = getSelectedNodePayload(cell);
	if (!isSameNodePayload(props.selectedNode, payload)) {
		emit("node-selection-change", payload);
	}
}

function updateNodeLabel(node, label) {
	if (!node) return;
	if ((node.attr("label/text") ?? "") === (label ?? "")) return;
	node.attr("label/text", label ?? "");
	emitSelection(node);
	buildGraphSnapshot();
}

function updateEdgeLabel(edge, label) {
	if (!edge) {
		return;
	}

	const currentPayload = getEdgePayload(edge);
	if ((currentPayload.label ?? "") === (label ?? "")) {
		return;
	}

	if (!label) {
		edge.setLabels([]);
		selectedEdgeRef.value = edge;
		emitSelection(edge);
		buildGraphSnapshot();
		return;
	}

	edge.setLabels([
		createEdgeLabelConfig(label),
	]);
	selectedEdgeRef.value = edge;
	emitSelection(edge);
	buildGraphSnapshot();
}

function updateEdgeStyle(edge, lineStyle) {
	if (!edge || !lineStyle) {
		return;
	}

	if (getEdgeLineStyle(edge) === lineStyle) {
		return;
	}

	const dashMap = {
		solid: null,
		dashed: "8 6",
		dotted: "2 6",
	};

	edge.attr("line/strokeDasharray", dashMap[lineStyle] || null);
	selectedEdgeRef.value = edge;
	emitSelection(edge);
	buildGraphSnapshot();
}

function updateNodeFontSize(node, fontSize) {
	const parsedFontSize = Number(fontSize);
	if (!node || !Number.isFinite(parsedFontSize) || parsedFontSize <= 0) return;
	if (Number(node.attr("label/fontSize")) === parsedFontSize) return;
	node.attr("label/fontSize", parsedFontSize);
	emitSelection(node);
	buildGraphSnapshot();
}

function updateStartNodePortPosition(node, position) {
	if (!node || !position || !isStartNode(node)) return;
	const currentData = node.getData() || {};
	if (currentData.portPosition === position) return;

	node.setData({ ...currentData, portPosition: position }, { overwrite: true });
	node.prop(
		"ports",
		createStartPorts(position, {
			...node.getData(),
			portId: currentData.portId || "start-output",
		}),
	);
	emitSelection(node);
	buildGraphSnapshot();
}

function updateEndNodePortPosition(node, position) {
	if (!node || !position || !isEndNode(node)) return;
	const currentData = node.getData() || {};
	if (currentData.portPosition === position) return;

	node.setData({ ...currentData, portPosition: position }, { overwrite: true });
	node.prop(
		"ports",
		createEndPorts(position, {
			...node.getData(),
			portId: currentData.portId || "end-input",
		}),
	);
	emitSelection(node);
	buildGraphSnapshot();
}

function showEdgeTools(edge) {
	if (activeEdgeRef.value && activeEdgeRef.value.id !== edge.id) {
		activeEdgeRef.value.removeTools();
	}

	edge.removeTools();
	edge.addTools(edgeTools);
	activeEdgeRef.value = edge;
}

function clearEdgeTools() {
	if (activeEdgeRef.value) {
		activeEdgeRef.value.removeTools();
		activeEdgeRef.value = null;
	}
}

function shouldIgnoreDelete(eventTarget) {
	if (!(eventTarget instanceof HTMLElement)) return false;
	return Boolean(eventTarget.closest("input, textarea, select, [contenteditable='true'], .ant-select"));
}

function removeSelectedNode() {
	const graph = graphRef.value;
	const selectedNode = selectedNodeRef.value;
	if (!graph || !selectedNode || !graph.getCellById(selectedNode.id)) return;

	graph.removeNode(selectedNode);
	selectedNodeRef.value = null;
	clearEdgeTools();
	selectedEdgeRef.value = null;
	emit("node-selection-change", null);
	buildGraphSnapshot();
}

function removeSelectedEdge() {
	const graph = graphRef.value;
	const selectedEdge = selectedEdgeRef.value;
	if (!graph || !selectedEdge || !graph.getCellById(selectedEdge.id)) return;

	selectedEdge.remove();
	selectedEdgeRef.value = null;
	clearEdgeTools();
	buildGraphSnapshot();
}

function handleDeleteKey(event) {
	if (event.key !== "Delete" || shouldIgnoreDelete(event.target)) return;

	const graph = graphRef.value;
	const selectedEdge = selectedEdgeRef.value;
	const selectedNode = selectedNodeRef.value;
	if (!graph) return;

	event.preventDefault();

	if (selectedEdge && graph.getCellById(selectedEdge.id)) {
		Modal.confirm({
			title: "确认删除连接线",
			content: "确认移除当前选中的连接线吗？",
			okText: "确认删除",
			cancelText: "取消",
			onOk: () => removeSelectedEdge(),
		});
		return;
	}

	if (!selectedNode || !graph.getCellById(selectedNode.id)) return;

	const relatedEdges = graph.getConnectedEdges(selectedNode);
	if (!relatedEdges.length) {
		removeSelectedNode();
		return;
	}

	Modal.confirm({
		title: "确认删除节点",
		content: "该节点存在关联连线，删除后会一并移除相关内容。确认继续吗？",
		okText: "确认删除",
		cancelText: "取消",
		onOk: () => removeSelectedNode(),
	});
}

function zoomToContent() {
	const graph = graphRef.value;
	if (!graph) {
		return;
	}

	requestAnimationFrame(() => {
		graph.zoomToFit({
			padding: 36,
			maxScale: 1,
		});
		graph.centerContent();
	});
}

async function copySnapshot() {
	try {
		await navigator.clipboard.writeText(JSON.stringify(graphSnapshot.value, null, 2));
		copyStatus.value = "copied";
		window.setTimeout(() => {
			copyStatus.value = "idle";
		}, 1500);
	} catch {
		copyStatus.value = "failed";
		window.setTimeout(() => {
			copyStatus.value = "idle";
		}, 1500);
	}
}

function clearGraph() {
	const graph = graphRef.value;
	if (!graph) return;
	clearEdgeTools();
	graph.clearCells();
	selectedNodeRef.value = null;
	selectedEdgeRef.value = null;
	emit("node-selection-change", null);
}

function loadGraphFromSnapshot(snapshot) {
	const graph = graphRef.value;
	if (!graph) return;

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
		const dashMap = {
			solid: null,
			dashed: "8 6",
			dotted: "2 6",
		};

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
					strokeDasharray: dashMap[edge.attrs?.lineStyle] || null,
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

	buildGraphSnapshot();
}

function clearEdges() {
	const graph = graphRef.value;
	if (!graph) return;
	clearEdgeTools();
	graph.removeCells(graph.getEdges());
	buildGraphSnapshot();
}

function onCanvasDragOver(event) {
	if (
		!event.dataTransfer?.types.includes(START_NODE_MIME_TYPE) &&
		!event.dataTransfer?.types.includes(END_NODE_MIME_TYPE) &&
		!event.dataTransfer?.types.includes(NODE_NODE_MIME_TYPE) &&
		!event.dataTransfer?.types.includes(CONDITION_NODE_MIME_TYPE)
	) {
		return;
	}

	event.preventDefault();
	event.dataTransfer.dropEffect = "copy";
	isDropActive.value = true;
}

function onCanvasDragLeave(event) {
	if (!event.currentTarget.contains(event.relatedTarget)) {
		isDropActive.value = false;
	}
}

function onCanvasDrop(event) {
	const graph = graphRef.value;
	const payload =
		event.dataTransfer?.getData(START_NODE_MIME_TYPE) ||
		event.dataTransfer?.getData(END_NODE_MIME_TYPE) ||
		event.dataTransfer?.getData(NODE_NODE_MIME_TYPE) ||
		event.dataTransfer?.getData(CONDITION_NODE_MIME_TYPE);

	if (!graph || !payload) {
		isDropActive.value = false;
		return;
	}

	event.preventDefault();
	const position = graph.clientToLocal(event.clientX, event.clientY);

	if (payload === START_NODE_TYPE) {
		const existingStartNode = getStartNode();
		if (existingStartNode) {
			emitSelection(existingStartNode);
			isDropActive.value = false;
			return;
		}

		const startNode = graph.addNode(
			createStartNode({
				x: position.x,
				y: position.y,
				label: props.selectedNode?.nodeType === START_NODE_TYPE ? props.selectedNode.label : "开始",
				portPosition: props.selectedNode?.nodeType === START_NODE_TYPE ? props.selectedNode.portPosition : "bottom",
				fontSize: props.selectedNode?.nodeType === START_NODE_TYPE ? props.selectedNode.fontSize : 14,
			}),
		);
		emitSelection(startNode);
		buildGraphSnapshot();
	}

	if (payload === END_NODE_TYPE) {
		const existingEndNode = getEndNode();
		if (existingEndNode) {
			emitSelection(existingEndNode);
			isDropActive.value = false;
			return;
		}

		const endNode = graph.addNode(
			createEndNode({
				x: position.x,
				y: position.y,
				label: "结束",
				portPosition: "top",
			}),
		);
		emitSelection(endNode);
		buildGraphSnapshot();
	}

	if (payload === NODE_NODE_TYPE) {
		const node = graph.addNode(
			createNodeNode({
				x: position.x,
				y: position.y,
			}),
		);
		emitSelection(node);
		buildGraphSnapshot();
	}

	if (payload === CONDITION_NODE_TYPE) {
		const node = graph.addNode(
			createConditionNode({
				x: position.x,
				y: position.y,
			}),
		);
		emitSelection(node);
		buildGraphSnapshot();
	}

	isDropActive.value = false;
}

watch(
	() => props.selectedNode,
	(selectedNode) => {
		if (!selectedNode?.id) return;

		const graphNode = getNodeById(selectedNode.id);
		const graphCell = getNodeById(selectedNode.id);
		if (!graphCell) return;

		if (graphCell.isEdge?.()) {
			const currentPayload = getEdgePayload(graphCell);
			if (isSameNodePayload(currentPayload, selectedNode)) {
				return;
			}

			if (selectedNode.label !== undefined) {
				updateEdgeLabel(graphCell, selectedNode.label);
			}

			if (selectedNode.lineStyle != null) {
				updateEdgeStyle(graphCell, selectedNode.lineStyle);
			}
			return;
		}

		if (!graphCell.isNode?.()) return;

		const currentPayload = getSelectedNodePayload(graphCell);
		if (isSameNodePayload(currentPayload, selectedNode)) return;

		if (selectedNode.label !== undefined) {
			updateNodeLabel(graphCell, selectedNode.label);
		}

		if (selectedNode.fontSize != null && selectedNode.fontSize !== "") {
			updateNodeFontSize(graphCell, selectedNode.fontSize);
		}

		if (selectedNode.portPosition != null) {
			updateStartNodePortPosition(graphCell, selectedNode.portPosition);
			updateEndNodePortPosition(graphCell, selectedNode.portPosition);
		}
	},
	{ deep: true },
);

onMounted(() => {
	if (!containerRef.value) return;

	ensureX6Styles();

	const graph = new Graph({
		container: containerRef.value,
		autoResize: true,
		background: false,
		grid: GRID_OPTIONS,
		panning: {
			enabled: true,
		},
		mousewheel: {
			enabled: true,
			modifiers: ["ctrl", "meta"],
			minScale: 0.6,
			maxScale: 1.6,
			zoomAtMousePosition: true,
		},
		interacting: {
			edgeMovable: false,
			arrowheadMovable: false,
			vertexAddable: false,
			vertexDeletable: false,
			useEdgeTools: true,
		},
		highlighting: {
			magnetAvailable: {
				name: "stroke",
				args: {
					padding: 4,
					attrs: {
						stroke: "#2563eb",
						"stroke-width": 4,
					},
				},
			},
		},
		connecting: {
			snap: {
				radius: 28,
			},
			allowBlank: false,
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
			createEdge() {
				return new Shape.Edge({
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
							targetMarker: {
								name: "classic",
								width: 10,
								height: 12,
							},
						},
					},
					zIndex: 1,
				});
			},
			validateMagnet({ magnet }) {
				const portGroup = magnet.getAttribute("port-group");
				return portGroup === "out" || portGroup?.startsWith("io");
			},
			validateEdge({ edge }) {
				const target = edge.getTargetCell();
				return target != null && !isStartNode(target);
			},
			validateConnection({ sourceCell, targetCell, sourceMagnet, targetMagnet }) {
				if (!sourceCell || !targetCell || !sourceMagnet || !targetMagnet) {
					return false;
				}

				if (sourceCell.id === targetCell.id || isStartNode(targetCell)) {
					return false;
				}

				return (
					["out", "ioTop", "ioBottom", "ioLeft", "ioRight"].includes(sourceMagnet.getAttribute("port-group")) &&
					["in", "ioTop", "ioBottom", "ioLeft", "ioRight"].includes(targetMagnet.getAttribute("port-group"))
				);
			},
		},
	});

	graph.use(
		new Snapline({
			enabled: true,
			clean: 1200,
		}),
	);

	graph.use(
		new Transform({
			resizing: {
				enabled(node) {
					return isStartNode(node) || isEndNode(node) || isNodeNode(node) || isConditionNode(node);
				},
				minWidth: 80,
				minHeight: 80,
				maxWidth: 240,
				maxHeight: 240,
				preserveAspectRatio: false,
				orthogonal: false,
			},
			rotating: false,
		}),
	);

	graphRef.value = graph;

	graph.on("edge:click", ({ edge }) => {
		showEdgeTools(edge);
		selectedEdgeRef.value = edge;
		selectedNodeRef.value = null;
		emitSelection(edge);
	});

	graph.on("edge:connected", ({ edge }) => {
		showEdgeTools(edge);
		selectedEdgeRef.value = edge;
		buildGraphSnapshot();
	});

	graph.on("node:click", ({ node }) => {
		clearEdgeTools();
		selectedEdgeRef.value = null;
		emitSelection(node);
	});

	graph.on("node:resized", ({ node }) => {
		if (isStartNode(node) || isEndNode(node) || isNodeNode(node) || isConditionNode(node)) {
			emitSelection(node);
			buildGraphSnapshot();
		}
	});

	graph.on("node:change:position", () => {
		buildGraphSnapshot();
	});

	graph.on("edge:change:vertices", () => {
		buildGraphSnapshot();
	});

	graph.on("blank:click", () => {
		clearEdgeTools();
		selectedEdgeRef.value = null;
		selectedNodeRef.value = null;
		emit("node-selection-change", null);
	});

	window.addEventListener("keydown", handleDeleteKey);
	loadGraphFromSnapshot(INITIAL_GRAPH_DATA);
});

onBeforeUnmount(() => {
	clearEdgeTools();
	window.removeEventListener("keydown", handleDeleteKey);
	selectedNodeRef.value = null;
	selectedEdgeRef.value = null;
	graphRef.value?.dispose();
	graphRef.value = null;
});
</script>

<template>
	<section class="workspace-center">
		<header class="workspace-header">
			<div class="header-json-toolbar">
				<span class="header-json-title">结构数据</span>
				<AButton size="small" @click="copySnapshot">
					{{ copyStatus === "copied" ? "已复制" : copyStatus === "failed" ? "复制失败" : "复制结构数据" }}
				</AButton>
			</div>
			<pre class="header-json">{{ JSON.stringify(graphSnapshot, null, 2) }}</pre>
		</header>

		<section class="canvas-shell" :class="{ 'canvas-shell-active': isDropActive }" @dragover="onCanvasDragOver" @dragleave="onCanvasDragLeave" @drop="onCanvasDrop">
			<div ref="containerRef" class="graph-canvas"></div>
		</section>
	</section>
</template>

<style scoped>
.workspace-center,
.workspace-header,
.canvas-shell {
	border: 1px solid rgba(15, 23, 42, 0.08);
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.86);
	box-shadow: 0 30px 80px rgba(15, 23, 42, 0.08);
	backdrop-filter: blur(12px);
}

.workspace-center {
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	min-width: 0;
	height: 100%;
	min-height: 0;
	gap: 6px;
	overflow: hidden;
}

.workspace-header {
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	gap: 6px;
	padding: 6px;
	overflow: hidden;
	align-items: start;
}

.header-copy {
	min-width: 0;
}

.eyebrow {
	margin: 0 0 12px;
	font-size: 0.78rem;
	font-weight: 700;
	letter-spacing: 0.2em;
	text-transform: uppercase;
	color: #2563eb;
}

.header-copy h1 {
	margin: 0;
	font-size: clamp(2rem, 3vw, 3.4rem);
	line-height: 0.98;
	letter-spacing: -0.05em;
	color: #0f172a;
}

.summary {
	margin: 18px 0 0;
	color: rgba(15, 23, 42, 0.72);
	font-size: 1rem;
}

.panel-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	align-content: flex-start;
	justify-content: flex-end;
}

.header-json {
	grid-column: 1 / -1;
	margin: 0;
	padding: 8px;
	max-height: 220px;
	overflow: auto;
	border-radius: 8px;
	background: #0f172a;
	color: #dbeafe;
	font-size: 12px;
	line-height: 1.45;
	white-space: pre-wrap;
	word-break: break-word;
}

.header-json-toolbar {
	grid-column: 1 / -1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
}

.header-json-title {
	font-size: 0.86rem;
	font-weight: 700;
	color: #0f172a;
}

.canvas-shell {
	position: relative;
	flex: 1 1 auto;
	min-height: 0;
	padding: 6px;
	overflow: hidden;
	background: #ffffff;
	transition:
		border-color 0.18s ease,
		box-shadow 0.18s ease,
		background-color 0.18s ease;
}

.canvas-shell-active {
	border-color: rgba(16, 185, 129, 0.42);
	box-shadow:
		0 24px 60px rgba(15, 23, 42, 0.08),
		0 0 0 2px rgba(16, 185, 129, 0.18);
	background: rgba(236, 253, 245, 0.9);
}

.graph-canvas {
	position: relative;
	width: 100%;
	height: 100%;
	flex: 1 1 auto;
	min-height: 0;
	border-radius: 8px;
	overflow: hidden;
	background: #ffffff;
	background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M23.5 0.5H0.5V23.5' stroke='%23d1d5db' stroke-width='1' stroke-dasharray='2 6' stroke-linecap='round'/%3E%3C/svg%3E");
	background-size: 24px 24px;
	background-repeat: repeat;
	background-position: 0 0;
	box-shadow: inset 0 0 0 1px rgba(203, 213, 225, 0.7);
}

:deep(.x6-graph-grid) {
	opacity: 1;
	background-image: none !important;
}

:deep(.x6-graph-background) {
	background-color: transparent !important;
}

:deep(.x6-port-body) {
	transition:
		fill 0.18s ease,
		stroke 0.18s ease,
		filter 0.18s ease;
}

:deep(.x6-node:hover .x6-port-body) {
	fill: #dbeafe;
	stroke: #1d4ed8;
	filter: drop-shadow(0 0 6px rgba(37, 99, 235, 0.28));
}

@media (max-width: 1080px) {
	.workspace-header {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 640px) {
	.workspace-header,
	.canvas-shell {
		border-radius: 8px;
	}

	.canvas-shell {
		padding: 6px;
	}
}
</style>
