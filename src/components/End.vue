<script>
import { createSinglePortConfig, getSharedNodePayload, toNumber } from "./nodeShared.js";

export const END_NODE_MIME_TYPE = "application/x-engine-node";
export const END_NODE_TYPE = "end-node";

export const END_PORT_POSITION_OPTIONS = [
	{ label: "上", value: "top" },
	{ label: "下", value: "bottom" },
	{ label: "左", value: "left" },
	{ label: "右", value: "right" },
];

export const END_FONT_SIZE_OPTIONS = [12, 14, 16];

export const END_NODE_DEFAULTS = {
	title: "结束节点",
	label: "结束",
	portPosition: "top",
	fontSize: 16,
	width: 108,
	height: 108,
	bodyFill: "#fff0e8",
	bodyStroke: "#ff8b67",
	bodyStrokeWidth: 2,
	labelColor: "#7d2814",
	labelFontWeight: 700,
	portStroke: "#ff8b67",
	portFill: "#ffffff",
	portStrokeWidth: 2,
	portRadius: 8,
};

const END_LABEL_WRAP = {
	width: "60%",
	height: "60%",
	ellipsis: true,
};

export function normalizeEndNodeConfig(config = {}) {
	return {
		...END_NODE_DEFAULTS,
		...config,
		fontSize: toNumber(config.fontSize, END_NODE_DEFAULTS.fontSize),
		width: toNumber(config.width, END_NODE_DEFAULTS.width),
		height: toNumber(config.height, END_NODE_DEFAULTS.height),
		bodyStrokeWidth: toNumber(config.bodyStrokeWidth, END_NODE_DEFAULTS.bodyStrokeWidth),
		labelFontWeight: toNumber(config.labelFontWeight, END_NODE_DEFAULTS.labelFontWeight),
		portStrokeWidth: toNumber(config.portStrokeWidth, END_NODE_DEFAULTS.portStrokeWidth),
		portRadius: toNumber(config.portRadius, END_NODE_DEFAULTS.portRadius),
	};
}

export function createEndPorts(position, config = {}) {
	const resolved = normalizeEndNodeConfig(config);
	const portPosition = position || resolved.portPosition;
	const portId = config.portId || "end-input";

	return createSinglePortConfig("in", portPosition, portId, resolved);
}

export function createEndNode(config = {}) {
	const resolved = normalizeEndNodeConfig(config);
	const centerX = toNumber(config.x, 0);
	const centerY = toNumber(config.y, 0);

	return {
		id: config.id || `end-node-${Date.now()}`,
		shape: "ellipse",
		x: centerX - resolved.width / 2,
		y: centerY - resolved.height / 2,
		width: resolved.width,
		height: resolved.height,
		data: {
			nodeType: END_NODE_TYPE,
			portPosition: resolved.portPosition,
			portId: config.portId || "end-input",
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
			},
			label: {
				text: resolved.label,
				fill: resolved.labelColor,
				fontSize: resolved.fontSize,
				fontWeight: resolved.labelFontWeight,
				textAnchor: "middle",
				textVerticalAnchor: "middle",
				lineHeight: "1.35em",
				textWrap: END_LABEL_WRAP,
			},
		},
		ports: createEndPorts(resolved.portPosition, {
			...resolved,
			portId: config.portId || "end-input",
		}),
	};
}

export function isEndNode(cell) {
	return cell?.isNode?.() && cell.getData?.()?.nodeType === END_NODE_TYPE;
}

export function getEndNodePayload(cell) {
	return getSharedNodePayload(cell, END_NODE_DEFAULTS, END_NODE_TYPE, {
		includePortPosition: true,
		portIdFallback: "end-input",
	});
}

export default defineComponent({
	name: "End",
	props: {
		draggable: {
			type: Boolean,
			default: false,
		},
		title: {
			type: String,
			default: END_NODE_DEFAULTS.title,
		},
		label: {
			type: String,
			default: END_NODE_DEFAULTS.label,
		},
		portPosition: {
			type: String,
			default: END_NODE_DEFAULTS.portPosition,
		},
		fontSize: {
			type: [Number, String],
			default: END_NODE_DEFAULTS.fontSize,
		},
		width: {
			type: [Number, String],
			default: END_NODE_DEFAULTS.width,
		},
		height: {
			type: [Number, String],
			default: END_NODE_DEFAULTS.height,
		},
		bodyFill: {
			type: String,
			default: END_NODE_DEFAULTS.bodyFill,
		},
		bodyStroke: {
			type: String,
			default: END_NODE_DEFAULTS.bodyStroke,
		},
		bodyStrokeWidth: {
			type: [Number, String],
			default: END_NODE_DEFAULTS.bodyStrokeWidth,
		},
		labelColor: {
			type: String,
			default: END_NODE_DEFAULTS.labelColor,
		},
		labelFontWeight: {
			type: [Number, String],
			default: END_NODE_DEFAULTS.labelFontWeight,
		},
		portStroke: {
			type: String,
			default: END_NODE_DEFAULTS.portStroke,
		},
		portFill: {
			type: String,
			default: END_NODE_DEFAULTS.portFill,
		},
		portStrokeWidth: {
			type: [Number, String],
			default: END_NODE_DEFAULTS.portStrokeWidth,
		},
		portRadius: {
			type: [Number, String],
			default: END_NODE_DEFAULTS.portRadius,
		},
	},
	emits: ["dragstart"],
	setup(props, { emit }) {
		const resolved = computed(() => normalizeEndNodeConfig(props));

		const previewStyle = computed(() => ({
			borderColor: resolved.value.bodyStroke,
			borderWidth: `${resolved.value.bodyStrokeWidth}px`,
			background: `radial-gradient(circle at 35% 35%, ${resolved.value.bodyFill} 0%, ${resolved.value.portStroke} 100%)`,
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
	border-color: rgba(255, 143, 104, 0.34);
	box-shadow: 0 18px 40px rgba(0, 0, 0, 0.2);
}

.tool-node:active {
	cursor: grabbing;
}

.tool-node-preview {
	width: 52px;
	height: 52px;
	border-style: solid;
	border-radius: 999px;
	box-shadow:
		inset 0 0 0 2px rgba(255, 255, 255, 0.76),
		0 10px 24px rgba(255, 143, 104, 0.24);
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
