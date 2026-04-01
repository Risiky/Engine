<script>
import { computed, defineComponent } from "vue";

export const START_NODE_MIME_TYPE = "application/x-engine-node";
export const START_NODE_TYPE = "start-node";

export const START_PORT_POSITION_OPTIONS = [
	{ label: "上", value: "top" },
	{ label: "下", value: "bottom" },
	{ label: "左", value: "left" },
	{ label: "右", value: "right" },
];

export const START_FONT_SIZE_OPTIONS = [12, 14, 16];

export const START_NODE_DEFAULTS = {
	title: "开始节点",
	description: "拖动到中间画布后创建 Ellipse 圆形节点",
	label: "开始",
	portPosition: "bottom",
	fontSize: 14,
	width: 108,
	height: 108,
	bodyFill: "#dcfce7",
	bodyStroke: "#10b981",
	bodyStrokeWidth: 2,
	labelColor: "#065f46",
	labelFontWeight: 700,
	portStroke: "#10b981",
	portFill: "#ffffff",
	portStrokeWidth: 2,
	portRadius: 8,
};

const START_LABEL_WRAP = {
	width: "60%",
	height: "60%",
	ellipsis: true,
};

function toNumber(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeStartNodeConfig(config = {}) {
	return {
		...START_NODE_DEFAULTS,
		...config,
		fontSize: toNumber(config.fontSize, START_NODE_DEFAULTS.fontSize),
		width: toNumber(config.width, START_NODE_DEFAULTS.width),
		height: toNumber(config.height, START_NODE_DEFAULTS.height),
		bodyStrokeWidth: toNumber(
			config.bodyStrokeWidth,
			START_NODE_DEFAULTS.bodyStrokeWidth,
		),
		labelFontWeight: toNumber(
			config.labelFontWeight,
			START_NODE_DEFAULTS.labelFontWeight,
		),
		portStrokeWidth: toNumber(
			config.portStrokeWidth,
			START_NODE_DEFAULTS.portStrokeWidth,
		),
		portRadius: toNumber(config.portRadius, START_NODE_DEFAULTS.portRadius),
	};
}

export function createStartPorts(position, config = {}) {
	const resolved = normalizeStartNodeConfig(config);
	const portPosition = position || resolved.portPosition;
	const portId = config.portId || "start-output";

	return {
		groups: {
			out: {
				position: {
					name: portPosition,
				},
				attrs: {
					circle: {
						r: resolved.portRadius,
						magnet: true,
						stroke: resolved.portStroke,
						strokeWidth: resolved.portStrokeWidth,
						fill: resolved.portFill,
					},
				},
				markup: [
					{
						tagName: "circle",
						selector: "circle",
					},
				],
			},
		},
		items: [
			{
				id: portId,
				group: "out",
			},
		],
	};
}

export function createStartNode(config = {}) {
	const resolved = normalizeStartNodeConfig(config);
	const centerX = toNumber(config.x, 0);
	const centerY = toNumber(config.y, 0);

	return {
		id: config.id || `start-node-${Date.now()}`,
		shape: "ellipse",
		x: centerX - resolved.width / 2,
		y: centerY - resolved.height / 2,
		width: resolved.width,
		height: resolved.height,
		data: {
			nodeType: START_NODE_TYPE,
			portPosition: resolved.portPosition,
			portId: config.portId || "start-output",
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
				textWrap: START_LABEL_WRAP,
			},
		},
		ports: createStartPorts(resolved.portPosition, {
			...resolved,
			portId: config.portId || "start-output",
		}),
	};
}

export function isStartNode(cell) {
	return cell?.isNode?.() && cell.getData?.()?.nodeType === START_NODE_TYPE;
}

export function getStartNodePayload(cell) {
	const data = cell.getData?.() || {};

	return {
		id: cell.id,
		nodeType: START_NODE_TYPE,
		label: cell.attr("label/text") ?? "",
		portPosition: data.portPosition || START_NODE_DEFAULTS.portPosition,
		portId: data.portId || "start-output",
		fontSize: Number(cell.attr("label/fontSize")) || START_NODE_DEFAULTS.fontSize,
		width: Math.round(cell.size().width),
		height: Math.round(cell.size().height),
		bodyFill: cell.attr("body/fill") || data.bodyFill || START_NODE_DEFAULTS.bodyFill,
		bodyStroke:
			cell.attr("body/stroke") || data.bodyStroke || START_NODE_DEFAULTS.bodyStroke,
		bodyStrokeWidth:
			Number(cell.attr("body/strokeWidth")) ||
			data.bodyStrokeWidth ||
			START_NODE_DEFAULTS.bodyStrokeWidth,
		labelColor:
			cell.attr("label/fill") || data.labelColor || START_NODE_DEFAULTS.labelColor,
		labelFontWeight:
			Number(cell.attr("label/fontWeight")) ||
			data.labelFontWeight ||
			START_NODE_DEFAULTS.labelFontWeight,
		portStroke: data.portStroke || START_NODE_DEFAULTS.portStroke,
		portFill: data.portFill || START_NODE_DEFAULTS.portFill,
		portStrokeWidth: data.portStrokeWidth || START_NODE_DEFAULTS.portStrokeWidth,
		portRadius: data.portRadius || START_NODE_DEFAULTS.portRadius,
	};
}

export default defineComponent({
	name: "Start",
	props: {
		draggable: {
			type: Boolean,
			default: false,
		},
		title: {
			type: String,
			default: START_NODE_DEFAULTS.title,
		},
		description: {
			type: String,
			default: START_NODE_DEFAULTS.description,
		},
		label: {
			type: String,
			default: START_NODE_DEFAULTS.label,
		},
		portPosition: {
			type: String,
			default: START_NODE_DEFAULTS.portPosition,
		},
		fontSize: {
			type: [Number, String],
			default: START_NODE_DEFAULTS.fontSize,
		},
		width: {
			type: [Number, String],
			default: START_NODE_DEFAULTS.width,
		},
		height: {
			type: [Number, String],
			default: START_NODE_DEFAULTS.height,
		},
		bodyFill: {
			type: String,
			default: START_NODE_DEFAULTS.bodyFill,
		},
		bodyStroke: {
			type: String,
			default: START_NODE_DEFAULTS.bodyStroke,
		},
		bodyStrokeWidth: {
			type: [Number, String],
			default: START_NODE_DEFAULTS.bodyStrokeWidth,
		},
		labelColor: {
			type: String,
			default: START_NODE_DEFAULTS.labelColor,
		},
		labelFontWeight: {
			type: [Number, String],
			default: START_NODE_DEFAULTS.labelFontWeight,
		},
		portStroke: {
			type: String,
			default: START_NODE_DEFAULTS.portStroke,
		},
		portFill: {
			type: String,
			default: START_NODE_DEFAULTS.portFill,
		},
		portStrokeWidth: {
			type: [Number, String],
			default: START_NODE_DEFAULTS.portStrokeWidth,
		},
		portRadius: {
			type: [Number, String],
			default: START_NODE_DEFAULTS.portRadius,
		},
	},
	emits: ["dragstart"],
	setup(props, { emit }) {
		const resolved = computed(() => normalizeStartNodeConfig(props));

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
	border-radius: 999px;
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
