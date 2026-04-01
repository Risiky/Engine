<script>
import { computed, defineComponent } from "vue";

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
	description: "拖动到中间画布后创建 Ellipse 圆形结束节点",
	label: "结束",
	portPosition: "top",
	fontSize: 16,
	width: 108,
	height: 108,
	bodyFill: "#fef2f2",
	bodyStroke: "#ef4444",
	bodyStrokeWidth: 2,
	labelColor: "#7f1d1d",
	labelFontWeight: 700,
	portStroke: "#ef4444",
	portFill: "#ffffff",
	portStrokeWidth: 2,
	portRadius: 8,
};

const END_LABEL_WRAP = {
	width: "60%",
	height: "60%",
	ellipsis: true,
};

function toNumber(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

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

	return {
		groups: {
			in: {
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
				group: "in",
			},
		],
	};
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
	const data = cell.getData?.() || {};

	return {
		id: cell.id,
		nodeType: END_NODE_TYPE,
		label: cell.attr("label/text") ?? "",
		portPosition: data.portPosition || END_NODE_DEFAULTS.portPosition,
		portId: data.portId || "end-input",
		fontSize: Number(cell.attr("label/fontSize")) || END_NODE_DEFAULTS.fontSize,
		width: Math.round(cell.size().width),
		height: Math.round(cell.size().height),
		bodyFill: cell.attr("body/fill") || data.bodyFill || END_NODE_DEFAULTS.bodyFill,
		bodyStroke: cell.attr("body/stroke") || data.bodyStroke || END_NODE_DEFAULTS.bodyStroke,
		bodyStrokeWidth:
			Number(cell.attr("body/strokeWidth")) ||
			data.bodyStrokeWidth ||
			END_NODE_DEFAULTS.bodyStrokeWidth,
		labelColor: cell.attr("label/fill") || data.labelColor || END_NODE_DEFAULTS.labelColor,
		labelFontWeight:
			Number(cell.attr("label/fontWeight")) ||
			data.labelFontWeight ||
			END_NODE_DEFAULTS.labelFontWeight,
		portStroke: data.portStroke || END_NODE_DEFAULTS.portStroke,
		portFill: data.portFill || END_NODE_DEFAULTS.portFill,
		portStrokeWidth: data.portStrokeWidth || END_NODE_DEFAULTS.portStrokeWidth,
		portRadius: data.portRadius || END_NODE_DEFAULTS.portRadius,
	};
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
		description: {
			type: String,
			default: END_NODE_DEFAULTS.description,
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
