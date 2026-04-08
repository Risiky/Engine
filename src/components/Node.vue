<script>
import { createFourWayPortConfig, getSharedNodePayload, toNumber } from "./nodeShared.js";

export const NODE_NODE_MIME_TYPE = "application/x-engine-node";
export const NODE_NODE_TYPE = "rect-node";

export const NODE_PORT_POSITION_OPTIONS = [
	{ label: "上", value: "top" },
	{ label: "下", value: "bottom" },
	{ label: "左", value: "left" },
	{ label: "右", value: "right" },
];

export const NODE_FONT_SIZE_OPTIONS = [12, 14, 16];

export const NODE_DEFAULTS = {
	title: "通用节点",
	label: "节点",
	fontSize: 16,
	width: 176,
	height: 96,
	bodyFill: "#f7efe1",
	bodyStroke: "#f0b75a",
	bodyStrokeWidth: 2,
	labelColor: "#17181b",
	labelFontWeight: 700,
	portStroke: "#f0b75a",
	portFill: "#ffffff",
	portStrokeWidth: 2,
	portRadius: 7,
};

export const NODE_LABEL_WRAP = {
	width: "82%",
	height: "72%",
	ellipsis: true,
};

export function normalizeNodeConfig(config = {}) {
	return {
		...NODE_DEFAULTS,
		...config,
		fontSize: toNumber(config.fontSize, NODE_DEFAULTS.fontSize),
		width: toNumber(config.width, NODE_DEFAULTS.width),
		height: toNumber(config.height, NODE_DEFAULTS.height),
		bodyStrokeWidth: toNumber(config.bodyStrokeWidth, NODE_DEFAULTS.bodyStrokeWidth),
		labelFontWeight: toNumber(config.labelFontWeight, NODE_DEFAULTS.labelFontWeight),
		portStrokeWidth: toNumber(config.portStrokeWidth, NODE_DEFAULTS.portStrokeWidth),
		portRadius: toNumber(config.portRadius, NODE_DEFAULTS.portRadius),
	};
}

export function createNodePorts(config = {}) {
	const resolved = normalizeNodeConfig(config);
	const nodeId = config.id || "node";
	const portIds = config.portIds || {
		top: `node-top-${nodeId}`,
		bottom: `node-bottom-${nodeId}`,
		left: `node-left-${nodeId}`,
		right: `node-right-${nodeId}`,
	};

	return createFourWayPortConfig(portIds, resolved);
}

export function createNodeNode(config = {}) {
	const resolved = normalizeNodeConfig(config);
	const centerX = toNumber(config.x, 0);
	const centerY = toNumber(config.y, 0);
	const nodeId = config.id || `rect-node-${Date.now()}`;

	return {
		id: nodeId,
		shape: "rect",
		x: centerX - resolved.width / 2,
		y: centerY - resolved.height / 2,
		width: resolved.width,
		height: resolved.height,
		data: {
			nodeType: NODE_NODE_TYPE,
			bodyFill: resolved.bodyFill,
			bodyStroke: resolved.bodyStroke,
			bodyStrokeWidth: resolved.bodyStrokeWidth,
			labelColor: resolved.labelColor,
			labelFontWeight: resolved.labelFontWeight,
			portStroke: resolved.portStroke,
			portFill: resolved.portFill,
			portStrokeWidth: resolved.portStrokeWidth,
			portRadius: resolved.portRadius,
		},
		attrs: {
			body: {
				fill: resolved.bodyFill,
				stroke: resolved.bodyStroke,
				strokeWidth: resolved.bodyStrokeWidth,
				rx: 18,
				ry: 18,
			},
			label: {
				text: resolved.label,
				fill: resolved.labelColor,
				fontSize: resolved.fontSize,
				fontWeight: resolved.labelFontWeight,
				textAnchor: "middle",
				textVerticalAnchor: "middle",
				lineHeight: "1.35em",
				textWrap: NODE_LABEL_WRAP,
			},
		},
		ports: createNodePorts({
			...resolved,
			id: nodeId,
			portIds: config.portIds,
		}),
	};
}

export function isNodeNode(cell) {
	return cell?.isNode?.() && cell.getData?.()?.nodeType === NODE_NODE_TYPE;
}

export function getNodePayload(cell) {
	return getSharedNodePayload(cell, NODE_DEFAULTS, NODE_NODE_TYPE);
}

export default defineComponent({
	name: "Node",
	props: {
		draggable: {
			type: Boolean,
			default: false,
		},
		title: {
			type: String,
			default: NODE_DEFAULTS.title,
		},
		label: {
			type: String,
			default: NODE_DEFAULTS.label,
		},
		fontSize: {
			type: [Number, String],
			default: NODE_DEFAULTS.fontSize,
		},
		width: {
			type: [Number, String],
			default: NODE_DEFAULTS.width,
		},
		height: {
			type: [Number, String],
			default: NODE_DEFAULTS.height,
		},
		bodyFill: {
			type: String,
			default: NODE_DEFAULTS.bodyFill,
		},
		bodyStroke: {
			type: String,
			default: NODE_DEFAULTS.bodyStroke,
		},
		bodyStrokeWidth: {
			type: [Number, String],
			default: NODE_DEFAULTS.bodyStrokeWidth,
		},
		labelColor: {
			type: String,
			default: NODE_DEFAULTS.labelColor,
		},
		labelFontWeight: {
			type: [Number, String],
			default: NODE_DEFAULTS.labelFontWeight,
		},
		portStroke: {
			type: String,
			default: NODE_DEFAULTS.portStroke,
		},
		portFill: {
			type: String,
			default: NODE_DEFAULTS.portFill,
		},
		portStrokeWidth: {
			type: [Number, String],
			default: NODE_DEFAULTS.portStrokeWidth,
		},
		portRadius: {
			type: [Number, String],
			default: NODE_DEFAULTS.portRadius,
		},
	},
	emits: ["dragstart"],
	setup(props, { emit }) {
		const resolved = computed(() => normalizeNodeConfig(props));

		const previewStyle = computed(() => ({
			borderColor: resolved.value.bodyStroke,
			borderWidth: `${resolved.value.bodyStrokeWidth}px`,
			background: `linear-gradient(180deg, ${resolved.value.bodyFill} 0%, rgba(255,255,255,0.95) 100%)`,
		}));

		function onDragstart(event) {
			emit("dragstart", event);
		}

		return {
			previewStyle,
			onDragstart,
		};
	},
});
</script>

<template>
	<div class="tool-node" :draggable="draggable" @dragstart="onDragstart">
		<div class="tool-node-preview" :style="previewStyle"></div>
		<div class="tool-node-copy">
			<strong>{{ title }}</strong>
		</div>
	</div>
</template>

<style scoped>
.tool-node {
	position: relative;
	display: grid;
	grid-template-columns: 52px minmax(0, 1fr);
	gap: 14px;
	align-items: center;
	padding: 14px;
	border: 1px solid rgba(244, 185, 92, 0.16);
	border-radius: 22px;
	background:
		linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 55%),
		rgba(255, 255, 255, 0.03);
	cursor: grab;
	user-select: none;
	transition:
		transform 0.18s ease,
		border-color 0.18s ease,
		box-shadow 0.18s ease;
}

.tool-node:hover {
	transform: translateY(-2px);
	border-color: rgba(244, 185, 92, 0.34);
	box-shadow: 0 18px 40px rgba(0, 0, 0, 0.2);
}

.tool-node:active {
	cursor: grabbing;
}

.tool-node-preview {
	width: 52px;
	height: 52px;
	border-style: solid;
	border-radius: 14px;
	box-shadow:
		inset 0 0 0 2px rgba(255, 255, 255, 0.76),
		0 10px 24px rgba(240, 183, 90, 0.22);
	flex: 0 0 auto;
}

.tool-node-copy {
	display: grid;
	min-width: 0;
}

.tool-node-copy strong {
	font-size: 0.98rem;
	color: var(--text-1);
}
</style>
