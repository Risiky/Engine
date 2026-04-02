<script setup>
import { Graph, Shape, Snapline, Transform } from "@antv/x6";
import { Modal } from "ant-design-vue";
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
	createEdgeLabelConfig,
	edgeTools,
	buildGraphSnapshot as createGraphSnapshot,
	getEdgePayload,
	loadGraphFromSnapshot as restoreGraphFromSnapshot,
} from "./x6/graphShared.js";
import { INITIAL_GRAPH_DATA } from "./x6/initialGraphData.js";
import { isSameSelectedNodePayload } from "../utils/selectedNode.js";

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
const isSnapshotPanelOpen = ref(false);
const formattedGraphSnapshot = computed(() =>
	isSnapshotPanelOpen.value ? JSON.stringify(graphSnapshot.value, null, 2) : "",
);

const graphPredicates = {
	isStartNode,
	isEndNode,
	isConditionNode,
	isNodeNode,
};

let snapshotFrameId = 0;

function getStartNode() {
	return graphRef.value?.getNodes().find((node) => isStartNode(node)) || null;
}

function getEndNode() {
	return graphRef.value?.getNodes().find((node) => isEndNode(node)) || null;
}

function getNodeById(id) {
	return id ? graphRef.value?.getCellById(id) : null;
}

function commitGraphSnapshot() {
	graphSnapshot.value = createGraphSnapshot(graphRef.value, graphPredicates);
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

function emitSelection(cell = null) {
	if (!cell || !cell.isNode?.()) {
		if (cell?.isEdge?.()) {
			selectedNodeRef.value = null;
			selectedEdgeRef.value = cell;
			const payload = getEdgePayload(cell);
			if (!isSameSelectedNodePayload(props.selectedNode, payload)) {
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
	if (!isSameSelectedNodePayload(props.selectedNode, payload)) {
		emit("node-selection-change", payload);
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

	edge.setLabels([createEdgeLabelConfig(label)]);
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

function removeSelectedNode() {
	const graph = graphRef.value;
	const selectedNode = selectedNodeRef.value;
	if (!graph || !selectedNode || !graph.getCellById(selectedNode.id)) return;

	graph.removeNode(selectedNode);
	selectedNodeRef.value = null;
	clearEdgeTools();
	selectedEdgeRef.value = null;
	emit("node-selection-change", null);
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
	graphSnapshot.value = { nodes: [], edges: [] };
	emit("node-selection-change", null);
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
					props.selectedNode?.nodeType === START_NODE_TYPE
						? props.selectedNode.label
						: "开始",
				portPosition:
					props.selectedNode?.nodeType === START_NODE_TYPE
						? props.selectedNode.portPosition
						: "bottom",
				fontSize:
					props.selectedNode?.nodeType === START_NODE_TYPE
						? props.selectedNode.fontSize
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

watch(() => props.selectedNode, (selectedNode) => {
	if (!selectedNode?.id) return;

	const graphCell = getNodeById(selectedNode.id);
	if (!graphCell) return;

	if (graphCell.isEdge?.()) {
		const currentPayload = getEdgePayload(graphCell);
		if (isSameSelectedNodePayload(currentPayload, selectedNode)) {
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
	if (isSameSelectedNodePayload(currentPayload, selectedNode)) return;

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
});

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
			validateConnection({ sourceCell, targetCell, sourceMagnet, targetMagnet }) {
				if (!sourceCell || !targetCell || !sourceMagnet || !targetMagnet) {
					return false;
				}

				if (sourceCell.id === targetCell.id || isStartNode(targetCell)) {
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
		emit("node-selection-change", null);
	});

	window.addEventListener("keydown", handleDeleteKey);
	loadGraphFromSnapshot(INITIAL_GRAPH_DATA);
});

onBeforeUnmount(() => {
	cancelGraphSnapshotSchedule();
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
				<div class="header-json-actions">
					<AButton size="small" @click="isSnapshotPanelOpen = !isSnapshotPanelOpen">
						{{ isSnapshotPanelOpen ? "收起结构数据" : "查看结构数据" }}
					</AButton>
					<AButton size="small" @click="copySnapshot">
						{{ copyStatus === "copied" ? "已复制" : copyStatus === "failed" ? "复制失败" : "复制结构数据" }}
					</AButton>
				</div>
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

.header-json-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	justify-content: flex-end;
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
