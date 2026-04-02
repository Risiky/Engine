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
	description: "拖动到中间画布后创建带四向端口的 Rect 节点",
	label: "节点",
	fontSize: 16,
	width: 176,
	height: 96,
	bodyFill: "#eff6ff",
	bodyStroke: "#2563eb",
	bodyStrokeWidth: 2,
	labelColor: "#0f172a",
	labelFontWeight: 700,
	portStroke: "#2563eb",
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
		description: {
			type: String,
			default: NODE_DEFAULTS.description,
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
			<span>{{ description }}</span>
		</div>
	</div>
</template>

<style scoped>
.tool-node {
	display: flex;
	gap: 10px;
	align-items: center;
	padding: 8px;
	border: 1px dashed rgba(37, 99, 235, 0.28);
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.9);
	cursor: grab;
	user-select: none;
}

.tool-node:active {
	cursor: grabbing;
}

.tool-node-preview {
	width: 42px;
	height: 42px;
	border-style: solid;
	border-radius: 12px;
	box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.7);
	flex: 0 0 auto;
}

.tool-node-copy {
	display: grid;
	gap: 2px;
}

.tool-node-copy strong {
	font-size: 0.96rem;
	color: #0f172a;
}

.tool-node-copy span {
	font-size: 0.82rem;
	color: rgba(15, 23, 42, 0.62);
}
</style>
