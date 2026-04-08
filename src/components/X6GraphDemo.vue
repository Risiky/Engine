<script setup>
import { Graph, Shape, Snapline, Transform } from "@antv/x6";
import { Modal } from "ant-design-vue";
import { storeToRefs } from "pinia";
import {
	END_NODE_MIME_TYPE,
	END_NODE_TYPE,
	createEndNode,
	createEndPorts,
	getEndNodePayload,
	isEndNode,
} from "./End.vue";
import {
	CONDITION_NODE_MIME_TYPE,
	CONDITION_NODE_TYPE,
	createConditionNode,
	getConditionNodePayload,
	isConditionNode,
} from "./Condition.vue";
import {
	NODE_NODE_MIME_TYPE,
	NODE_NODE_TYPE,
	createNodeNode,
	getNodePayload,
	isNodeNode,
} from "./Node.vue";
import {
	START_NODE_MIME_TYPE,
	START_NODE_TYPE,
	createStartNode,
	createStartPorts,
	getStartNodePayload,
	isStartNode,
} from "./Start.vue";
import { ensureX6Styles } from "./x6/styles.js";
import {
	GRID_OPTIONS,
	EDGE_DASH_MAP,
	EDGE_HANDLE_COLOR,
	EDGE_STROKE_COLOR,
	createEdgeLabelConfig,
	edgeTools,
	buildGraphSnapshot as createGraphSnapshot,
	getEdgePayload,
	loadGraphFromSnapshot as restoreGraphFromSnapshot,
} from "./x6/graphShared.js";
import { INITIAL_GRAPH_DATA } from "./x6/initialGraphData.js";
import { useWorkflowStore } from "../stores/workflow.js";
import { isSameSelectedNodePayload } from "../utils/selectedNode.js";

const workflowStore = useWorkflowStore();
const { selectedNode, graphSnapshot } = storeToRefs(workflowStore);

const containerRef = ref(null);
const graphRef = shallowRef(null);
const activeEdgeRef = shallowRef(null);
const selectedNodeRef = shallowRef(null);
const selectedEdgeRef = shallowRef(null);
const isDropActive = ref(false);
const copyStatus = ref("idle");
const isSnapshotPanelOpen = ref(false);
const copiedNodeRef = shallowRef(null);

const formattedGraphSnapshot = computed(() =>
	isSnapshotPanelOpen.value ? JSON.stringify(graphSnapshot.value, null, 2) : "",
);

const snapshotButtonText = computed(() => {
	if (copyStatus.value === "copied") {
		return "已复制快照";
	}

	if (copyStatus.value === "failed") {
		return "复制失败";
	}

	return "复制结构快照";
});

const shortcutHints = [
	"Delete 删除选中",
	"Ctrl/Cmd + C 复制节点",
	"Ctrl/Cmd + V 粘贴节点",
	"Ctrl/Cmd + 方向键 微调节点",
];

const graphPredicates = {
	isStartNode,
	isEndNode,
	isConditionNode,
	isNodeNode,
};

let snapshotFrameId = 0;

const NODE_PASTE_OFFSET = 36;
const NODE_NUDGE_STEP = 2;

function getStartNode() {
	return graphRef.value?.getNodes().find((node) => isStartNode(node)) || null;
}

function getEndNode() {
	return graphRef.value?.getNodes().find((node) => isEndNode(node)) || null;
}

function getNodeById(id) {
	return id ? graphRef.value?.getCellById(id) : null;
}

function hasExistingEdgeBetweenNodes(graph, sourceCell, targetCell, currentEdge = null) {
	if (!graph || !sourceCell || !targetCell) {
		return false;
	}

	return graph.getEdges().some((existingEdge) => {
		if (currentEdge && existingEdge.id === currentEdge.id) {
			return false;
		}

		const existingSourceId = existingEdge.getSourceCellId?.();
		const existingTargetId = existingEdge.getTargetCellId?.();

		if (!existingSourceId || !existingTargetId) {
			return false;
		}

		return (
			(existingSourceId === sourceCell.id && existingTargetId === targetCell.id) ||
			(existingSourceId === targetCell.id && existingTargetId === sourceCell.id)
		);
	});
}

function hasConditionNodeTarget(graph, sourceCell, currentEdge = null) {
	if (!graph || !sourceCell || !isConditionNode(sourceCell)) {
		return false;
	}

	return graph.getEdges().some((existingEdge) => {
		if (currentEdge && existingEdge.id === currentEdge.id) {
			return false;
		}

		return existingEdge.getSourceCellId?.() === sourceCell.id;
	});
}

function commitGraphSnapshot() {
	workflowStore.setGraphSnapshot(createGraphSnapshot(graphRef.value, graphPredicates));
}

function scheduleGraphSnapshot() {
	if (snapshotFrameId) {
		return;
	}

	snapshotFrameId = window.requestAnimationFrame(() => {
		snapshotFrameId = 0;
		commitGraphSnapshot();
	});
}

function cancelGraphSnapshotSchedule() {
	if (!snapshotFrameId) {
		return;
	}

	window.cancelAnimationFrame(snapshotFrameId);
	snapshotFrameId = 0;
}

function getSelectedNodePayload(node) {
	if (isStartNode(node)) return getStartNodePayload(node);
	if (isEndNode(node)) return getEndNodePayload(node);
	if (isNodeNode(node)) return getNodePayload(node);
	if (isConditionNode(node)) return getConditionNodePayload(node);
	return null;
}

function buildCopiedNodePayload(node) {
	if (!node?.isNode?.()) {
		return null;
	}

	const payload = getSelectedNodePayload(node);
	if (!payload) {
		return null;
	}

	const position = node.getPosition();
	const size = node.getSize();

	return {
		...payload,
		x: Math.round(position.x + size.width / 2),
		y: Math.round(position.y + size.height / 2),
		width: Math.round(size.width),
		height: Math.round(size.height),
	};
}

function emitSelection(cell = null) {
	if (!cell || !cell.isNode?.()) {
		if (cell?.isEdge?.()) {
			selectedNodeRef.value = null;
			selectedEdgeRef.value = cell;
			const payload = getEdgePayload(cell);
			if (!isSameSelectedNodePayload(selectedNode.value, payload)) {
				workflowStore.setSelectedNode(payload);
			}
			return;
		}

		selectedNodeRef.value = null;
		if (selectedNode.value !== null) {
			workflowStore.clearSelectedNode();
		}
		return;
	}

	selectedNodeRef.value = cell;
	const payload = getSelectedNodePayload(cell);
	if (!isSameSelectedNodePayload(selectedNode.value, payload)) {
		workflowStore.setSelectedNode(payload);
	}
}

function updateNodeLabel(node, label) {
	if (!node) return;
	if ((node.attr("label/text") ?? "") === (label ?? "")) return;
	node.attr("label/text", label ?? "");
	emitSelection(node);
	scheduleGraphSnapshot();
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
		scheduleGraphSnapshot();
		return;
	}

	edge.setLabels([createEdgeLabelConfig(label, currentPayload.labelPosition)]);
	selectedEdgeRef.value = edge;
	emitSelection(edge);
	scheduleGraphSnapshot();
}

function updateEdgeStyle(edge, lineStyle) {
	if (!edge || !lineStyle) {
		return;
	}

	if (getEdgePayload(edge).lineStyle === lineStyle) {
		return;
	}

	edge.attr("line/strokeDasharray", EDGE_DASH_MAP[lineStyle] || null);
	selectedEdgeRef.value = edge;
	emitSelection(edge);
	scheduleGraphSnapshot();
}

function updateNodeFontSize(node, fontSize) {
	const parsedFontSize = Number(fontSize);
	if (!node || !Number.isFinite(parsedFontSize) || parsedFontSize <= 0) return;
	if (Number(node.attr("label/fontSize")) === parsedFontSize) return;
	node.attr("label/fontSize", parsedFontSize);
	emitSelection(node);
	scheduleGraphSnapshot();
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
	scheduleGraphSnapshot();
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
	scheduleGraphSnapshot();
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
	return Boolean(
		eventTarget.closest(
			"input, textarea, select, [contenteditable='true'], .ant-select",
		),
	);
}

function copySelectedNode() {
	const graph = graphRef.value;
	const selectedNode = selectedNodeRef.value;
	if (!graph || !selectedNode || !graph.getCellById(selectedNode.id)) {
		return false;
	}

	copiedNodeRef.value = buildCopiedNodePayload(selectedNode);
	return Boolean(copiedNodeRef.value);
}

function createNodeFromCopiedPayload(payload) {
	if (!payload) {
		return null;
	}

	const { id: _copiedNodeId, ...copiedNodeConfig } = payload;
	const pastedConfig = {
		...copiedNodeConfig,
		x: payload.x + NODE_PASTE_OFFSET,
		y: payload.y + NODE_PASTE_OFFSET,
	};

	if (payload.nodeType === START_NODE_TYPE) {
		if (getStartNode()) {
			return null;
		}

		return createStartNode(pastedConfig);
	}

	if (payload.nodeType === END_NODE_TYPE) {
		if (getEndNode()) {
			return null;
		}

		return createEndNode(pastedConfig);
	}

	if (payload.nodeType === NODE_NODE_TYPE) {
		return createNodeNode(pastedConfig);
	}

	if (payload.nodeType === CONDITION_NODE_TYPE) {
		return createConditionNode(pastedConfig);
	}

	return null;
}

function pasteCopiedNode() {
	const graph = graphRef.value;
	const copiedNode = copiedNodeRef.value;
	if (!graph || !copiedNode) {
		return false;
	}

	const nodeConfig = createNodeFromCopiedPayload(copiedNode);
	if (!nodeConfig) {
		return false;
	}

	const pastedNode = graph.addNode(nodeConfig);
	clearEdgeTools();
	selectedEdgeRef.value = null;
	emitSelection(pastedNode);
	scheduleGraphSnapshot();
	copiedNodeRef.value = buildCopiedNodePayload(pastedNode);
	return true;
}

function nudgeSelectedNode(dx, dy) {
	const graph = graphRef.value;
	const selectedNode = selectedNodeRef.value;
	if (!graph || !selectedNode || !graph.getCellById(selectedNode.id)) {
		return false;
	}

	const position = selectedNode.getPosition();
	selectedNode.position(position.x + dx, position.y + dy);
	emitSelection(selectedNode);
	scheduleGraphSnapshot();
	return true;
}

function removeSelectedNode() {
	const graph = graphRef.value;
	const selectedNode = selectedNodeRef.value;
	if (!graph || !selectedNode || !graph.getCellById(selectedNode.id)) return;

	graph.removeNode(selectedNode);
	selectedNodeRef.value = null;
	clearEdgeTools();
	selectedEdgeRef.value = null;
	workflowStore.clearSelectedNode();
	scheduleGraphSnapshot();
}

function removeSelectedEdge() {
	const graph = graphRef.value;
	const selectedEdge = selectedEdgeRef.value;
	if (!graph || !selectedEdge || !graph.getCellById(selectedEdge.id)) return;

	selectedEdge.remove();
	selectedEdgeRef.value = null;
	clearEdgeTools();
	scheduleGraphSnapshot();
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
			title: "确认删除连线",
			content: "当前选中的连线将从画布中移除，是否继续？",
			okText: "删除连线",
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
		content: "该节点与其他路径存在连接，删除后会一并移除关联连线。",
		okText: "删除节点",
		cancelText: "取消",
		onOk: () => removeSelectedNode(),
	});
}

function handleNodeClipboardKey(event) {
	if (shouldIgnoreDelete(event.target)) {
		return;
	}

	const key = event.key.toLowerCase();
	const hasCommandModifier = event.ctrlKey || event.metaKey;
	if (!hasCommandModifier || event.altKey) {
		return;
	}

	if (key === "c") {
		if (!copySelectedNode()) {
			return;
		}

		event.preventDefault();
		return;
	}

	if (key === "v") {
		if (!pasteCopiedNode()) {
			return;
		}

		event.preventDefault();
	}
}

function handleNodeNudgeKey(event) {
	if (shouldIgnoreDelete(event.target)) {
		return;
	}

	const hasCommandModifier = event.ctrlKey || event.metaKey;
	if (!hasCommandModifier || event.altKey || event.shiftKey) {
		return;
	}

	if (event.key === "ArrowUp") {
		if (!nudgeSelectedNode(0, -NODE_NUDGE_STEP)) {
			return;
		}

		event.preventDefault();
		return;
	}

	if (event.key === "ArrowDown") {
		if (!nudgeSelectedNode(0, NODE_NUDGE_STEP)) {
			return;
		}

		event.preventDefault();
		return;
	}

	if (event.key === "ArrowLeft") {
		if (!nudgeSelectedNode(-NODE_NUDGE_STEP, 0)) {
			return;
		}

		event.preventDefault();
		return;
	}

	if (event.key === "ArrowRight") {
		if (!nudgeSelectedNode(NODE_NUDGE_STEP, 0)) {
			return;
		}

		event.preventDefault();
	}
}

async function copySnapshot() {
	commitGraphSnapshot();

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
	workflowStore.clearGraphSnapshot();
	workflowStore.clearSelectedNode();
}

function loadGraphFromSnapshot(snapshot) {
	restoreGraphFromSnapshot({
		graph: graphRef.value,
		snapshot,
		clearGraph,
		createStartNode,
		createEndNode,
		createNodeNode,
		createConditionNode,
	});
	commitGraphSnapshot();
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
				label:
					selectedNode.value?.nodeType === START_NODE_TYPE
						? selectedNode.value.label
						: "开始",
				portPosition:
					selectedNode.value?.nodeType === START_NODE_TYPE
						? selectedNode.value.portPosition
						: "bottom",
				fontSize:
					selectedNode.value?.nodeType === START_NODE_TYPE
						? selectedNode.value.fontSize
						: 14,
			}),
		);
		emitSelection(startNode);
		scheduleGraphSnapshot();
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
		scheduleGraphSnapshot();
	}

	if (payload === NODE_NODE_TYPE) {
		const node = graph.addNode(
			createNodeNode({
				x: position.x,
				y: position.y,
			}),
		);
		emitSelection(node);
		scheduleGraphSnapshot();
	}

	if (payload === CONDITION_NODE_TYPE) {
		const node = graph.addNode(
			createConditionNode({
				x: position.x,
				y: position.y,
			}),
		);
		emitSelection(node);
		scheduleGraphSnapshot();
	}

	isDropActive.value = false;
}

watch(
	selectedNode,
	(selectionPayload) => {
		if (!selectionPayload?.id) return;

		const graphCell = getNodeById(selectionPayload.id);
		if (!graphCell) return;

		if (graphCell.isEdge?.()) {
			const currentPayload = getEdgePayload(graphCell);
			if (isSameSelectedNodePayload(currentPayload, selectionPayload)) {
				return;
			}

			if (selectionPayload.label !== undefined) {
				updateEdgeLabel(graphCell, selectionPayload.label);
			}

			if (selectionPayload.lineStyle != null) {
				updateEdgeStyle(graphCell, selectionPayload.lineStyle);
			}
			return;
		}

		if (!graphCell.isNode?.()) return;

		const currentPayload = getSelectedNodePayload(graphCell);
		if (isSameSelectedNodePayload(currentPayload, selectionPayload)) return;

		if (selectionPayload.label !== undefined) {
			updateNodeLabel(graphCell, selectionPayload.label);
		}

		if (selectionPayload.fontSize != null && selectionPayload.fontSize !== "") {
			updateNodeFontSize(graphCell, selectionPayload.fontSize);
		}

		if (selectionPayload.portPosition != null) {
			updateStartNodePortPosition(graphCell, selectionPayload.portPosition);
			updateEndNodePortPosition(graphCell, selectionPayload.portPosition);
		}
	},
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
			edgeLabelMovable: true,
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
						stroke: EDGE_HANDLE_COLOR,
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
							stroke: EDGE_STROKE_COLOR,
							strokeWidth: 3,
							strokeDasharray: EDGE_DASH_MAP.solid,
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
			validateConnection({ edge, sourceCell, targetCell, sourceMagnet, targetMagnet }) {
				if (!sourceCell || !targetCell || !sourceMagnet || !targetMagnet) {
					return false;
				}

				if (sourceCell.id === targetCell.id || isStartNode(targetCell)) {
					return false;
				}

				if (isConditionNode(sourceCell) && isConditionNode(targetCell)) {
					return false;
				}

				if (hasConditionNodeTarget(this, sourceCell, edge)) {
					return false;
				}

				if (hasExistingEdgeBetweenNodes(this, sourceCell, targetCell, edge)) {
					return false;
				}

				return (
					["out", "ioTop", "ioBottom", "ioLeft", "ioRight"].includes(
						sourceMagnet.getAttribute("port-group"),
					) &&
					["in", "ioTop", "ioBottom", "ioLeft", "ioRight"].includes(
						targetMagnet.getAttribute("port-group"),
					)
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
					return (
						isStartNode(node) ||
						isEndNode(node) ||
						isNodeNode(node) ||
						isConditionNode(node)
					);
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
		scheduleGraphSnapshot();
	});

	graph.on("edge:change:labels", ({ edge }) => {
		selectedEdgeRef.value = edge;
		if (selectedNode.value?.id === edge.id) {
			emitSelection(edge);
		}
		scheduleGraphSnapshot();
	});

	graph.on("node:click", ({ node }) => {
		clearEdgeTools();
		selectedEdgeRef.value = null;
		emitSelection(node);
	});

	graph.on("node:resized", ({ node }) => {
		if (isStartNode(node) || isEndNode(node) || isNodeNode(node) || isConditionNode(node)) {
			emitSelection(node);
			scheduleGraphSnapshot();
		}
	});

	graph.on("node:change:position", () => {
		scheduleGraphSnapshot();
	});

	graph.on("edge:change:vertices", () => {
		scheduleGraphSnapshot();
	});

	graph.on("blank:click", () => {
		clearEdgeTools();
		selectedEdgeRef.value = null;
		selectedNodeRef.value = null;
		workflowStore.clearSelectedNode();
	});

	window.addEventListener("keydown", handleDeleteKey);
	window.addEventListener("keydown", handleNodeClipboardKey);
	window.addEventListener("keydown", handleNodeNudgeKey);
	loadGraphFromSnapshot(INITIAL_GRAPH_DATA);
});

onBeforeUnmount(() => {
	cancelGraphSnapshotSchedule();
	clearEdgeTools();
	window.removeEventListener("keydown", handleDeleteKey);
	window.removeEventListener("keydown", handleNodeClipboardKey);
	window.removeEventListener("keydown", handleNodeNudgeKey);
	selectedNodeRef.value = null;
	selectedEdgeRef.value = null;
	copiedNodeRef.value = null;
	workflowStore.clearSelectedNode();
	workflowStore.clearGraphSnapshot();
	graphRef.value?.dispose();
	graphRef.value = null;
});
</script>

<template>
	<section class="workspace-center">
		<header class="workspace-header">
			<p class="header-kicker">Canvas / Live Graph</p>

			<div class="header-actions">
				<AButton size="small" @click="isSnapshotPanelOpen = !isSnapshotPanelOpen">
					{{ isSnapshotPanelOpen ? "收起结构快照" : "查看结构快照" }}
				</AButton>
				<AButton type="primary" size="small" @click="copySnapshot">
					{{ snapshotButtonText }}
				</AButton>
			</div>

			<pre v-if="isSnapshotPanelOpen" class="header-json">{{ formattedGraphSnapshot }}</pre>
		</header>

		<section
			class="canvas-shell"
			:class="{ 'canvas-shell-active': isDropActive }"
			@dragover="onCanvasDragOver"
			@dragleave="onCanvasDragLeave"
			@drop="onCanvasDrop"
		>
			<div class="canvas-overlay canvas-overlay-top">
				<span>支持复制、删除、缩放与像素级微调</span>
			</div>

			<div ref="containerRef" class="graph-canvas"></div>

			<div class="canvas-overlay canvas-overlay-bottom">
				<span v-for="hint in shortcutHints" :key="hint" class="shortcut-pill">
					{{ hint }}
				</span>
			</div>

			<div v-if="isDropActive" class="canvas-drop-indicator">
				<p>释放以放置节点</p>
				<span>系统会自动定位到当前指针位置</span>
			</div>
		</section>
	</section>
</template>

<style scoped>
.workspace-center {
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	min-width: 0;
	height: 100%;
	min-height: 0;
	gap: 12px;
	padding: 16px;
	border: 1px solid var(--border-strong);
	border-radius: 28px;
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 248, 240, 0.84)),
		var(--panel);
	box-shadow: var(--shadow);
	backdrop-filter: blur(20px);
	overflow: hidden;
}

.workspace-header,
.canvas-shell {
	position: relative;
	border-radius: 24px;
	border: 1px solid var(--line-mid);
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.86), rgba(251, 244, 233, 0.8)),
		rgba(255, 255, 255, 0.58);
}

.workspace-header {
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	gap: 14px;
	padding: 16px;
	overflow: hidden;
	align-items: center;
}

.header-kicker,
.canvas-overlay p {
	margin: 0;
	font-family: "IBM Plex Mono", monospace;
	font-size: 0.74rem;
	font-weight: 500;
	letter-spacing: 0.14em;
	text-transform: uppercase;
	color: var(--accent-cool);
}

.header-actions {
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-end;
	gap: 8px;
}

.header-json {
	grid-column: 1 / -1;
	margin: 0;
	padding: 14px;
	max-height: 260px;
	overflow: auto;
	border-radius: 18px;
	background: #fff9f0;
	border: 1px solid var(--line-mid);
	color: #4d3820;
	font-family: "IBM Plex Mono", monospace;
	font-size: 12px;
	line-height: 1.55;
	white-space: pre-wrap;
	word-break: break-word;
}

.canvas-shell {
	position: relative;
	flex: 1 1 auto;
	min-height: 0;
	padding: 14px;
	overflow: hidden;
	background:
		radial-gradient(circle at top, rgba(35, 121, 109, 0.08), transparent 30%),
		radial-gradient(circle at bottom right, rgba(185, 125, 44, 0.1), transparent 24%),
		#f3e8d7;
	transition:
		border-color 0.18s ease,
		box-shadow 0.18s ease,
		background-color 0.18s ease;
}

.canvas-shell-active {
	border-color: rgba(35, 121, 109, 0.38);
	box-shadow:
		var(--shadow-soft),
		0 0 0 2px rgba(35, 121, 109, 0.14);
}

.graph-canvas {
	position: relative;
	width: 100%;
	height: 100%;
	flex: 1 1 auto;
	min-height: 0;
	border-radius: 20px;
	overflow: hidden;
	background:
		linear-gradient(rgba(111, 80, 38, 0.12) 1px, transparent 1px),
		linear-gradient(90deg, rgba(111, 80, 38, 0.12) 1px, transparent 1px),
		linear-gradient(180deg, rgba(255, 251, 244, 0.99), rgba(244, 233, 216, 0.99));
	background-size: 28px 28px, 28px 28px, auto;
	box-shadow:
		inset 0 0 0 1px rgba(111, 80, 38, 0.18),
		inset 0 -50px 90px rgba(197, 167, 118, 0.24);
}

.canvas-overlay {
	position: absolute;
	left: 24px;
	right: 24px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
	pointer-events: none;
	z-index: 2;
}

.canvas-overlay-top {
	top: 18px;
}

.canvas-overlay-bottom {
	bottom: 18px;
	flex-wrap: wrap;
	justify-content: flex-start;
}

.canvas-overlay span {
	color: var(--text-2);
	font-size: 0.8rem;
}

.shortcut-pill {
	padding: 0.48rem 0.72rem;
	border-radius: 999px;
	background: rgba(255, 251, 245, 0.92);
	border: 1px solid var(--line-mid);
	font-family: "IBM Plex Mono", monospace;
	box-shadow: 0 8px 20px rgba(83, 58, 25, 0.06);
}

.canvas-drop-indicator {
	position: absolute;
	inset: 50% auto auto 50%;
	display: grid;
	gap: 8px;
	min-width: 260px;
	padding: 16px 18px;
	transform: translate(-50%, -50%);
	border-radius: 22px;
	border: 1px solid rgba(35, 121, 109, 0.34);
	background: rgba(255, 252, 246, 0.97);
	box-shadow: var(--shadow);
	text-align: center;
	z-index: 3;
}

.canvas-drop-indicator p,
.canvas-drop-indicator span {
	margin: 0;
}

.canvas-drop-indicator p {
	color: var(--text-1);
	font-weight: 700;
}

.canvas-drop-indicator span {
	color: var(--text-2);
	font-size: 0.84rem;
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
	fill: #fff5e6;
	stroke: #23796d;
	filter: drop-shadow(0 0 6px rgba(35, 121, 109, 0.22));
}

:deep(.x6-edge path) {
	stroke-linecap: round;
	stroke-linejoin: round;
}

:deep(.x6-edge:hover path),
:deep(.x6-edge-selected path) {
	filter: drop-shadow(0 0 4px rgba(159, 99, 33, 0.18));
}

@media (max-width: 1080px) {
	.workspace-center {
		height: auto;
	}

	.workspace-header {
		grid-template-columns: 1fr;
	}

	.header-actions {
		justify-content: flex-start;
	}
}

@media (max-width: 720px) {
	.workspace-center {
		padding: 14px;
		border-radius: 22px;
	}

	.workspace-header,
	.canvas-shell,
	.graph-canvas {
		border-radius: 20px;
	}

	.canvas-overlay {
		left: 16px;
		right: 16px;
	}
}
</style>
