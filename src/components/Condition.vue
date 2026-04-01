<script>
import { computed, defineComponent } from "vue";

export const CONDITION_NODE_MIME_TYPE = "application/x-engine-node";
export const CONDITION_NODE_TYPE = "condition-node";

export const CONDITION_FONT_SIZE_OPTIONS = [12, 14, 16];

export const CONDITION_DEFAULTS = {
	title: "条件节点",
	description: "拖动到中间画布后创建带四向端口的菱形节点",
	label: "条件",
	fontSize: 16,
	width: 168,
	height: 112,
	bodyFill: "#fff7ed",
	bodyStroke: "#f97316",
	bodyStrokeWidth: 2,
	labelColor: "#7c2d12",
	labelFontWeight: 700,
	portStroke: "#f97316",
	portFill: "#ffffff",
	portStrokeWidth: 2,
	portRadius: 7,
};

const CONDITION_LABEL_WRAP = {
	width: "60%",
	height: "60%",
	ellipsis: true,
};

function toNumber(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeConditionConfig(config = {}) {
	return {
		...CONDITION_DEFAULTS,
		...config,
		fontSize: toNumber(config.fontSize, CONDITION_DEFAULTS.fontSize),
		width: toNumber(config.width, CONDITION_DEFAULTS.width),
		height: toNumber(config.height, CONDITION_DEFAULTS.height),
		bodyStrokeWidth: toNumber(
			config.bodyStrokeWidth,
			CONDITION_DEFAULTS.bodyStrokeWidth,
		),
		labelFontWeight: toNumber(
			config.labelFontWeight,
			CONDITION_DEFAULTS.labelFontWeight,
		),
		portStrokeWidth: toNumber(
			config.portStrokeWidth,
			CONDITION_DEFAULTS.portStrokeWidth,
		),
		portRadius: toNumber(config.portRadius, CONDITION_DEFAULTS.portRadius),
	};
}

export function createConditionPorts(config = {}) {
	const resolved = normalizeConditionConfig(config);
	const nodeId = config.id || "condition";
	const portIds = config.portIds || {
		top: `condition-top-${nodeId}`,
		bottom: `condition-bottom-${nodeId}`,
		left: `condition-left-${nodeId}`,
		right: `condition-right-${nodeId}`,
	};

	return {
		groups: {
			ioTop: {
				position: { name: "top" },
				attrs: {
					circle: {
						r: resolved.portRadius,
						magnet: true,
						stroke: resolved.portStroke,
						strokeWidth: resolved.portStrokeWidth,
						fill: resolved.portFill,
					},
				},
				markup: [{ tagName: "circle", selector: "circle" }],
			},
			ioBottom: {
				position: { name: "bottom" },
				attrs: {
					circle: {
						r: resolved.portRadius,
						magnet: true,
						stroke: resolved.portStroke,
						strokeWidth: resolved.portStrokeWidth,
						fill: resolved.portFill,
					},
				},
				markup: [{ tagName: "circle", selector: "circle" }],
			},
			ioLeft: {
				position: { name: "left" },
				attrs: {
					circle: {
						r: resolved.portRadius,
						magnet: true,
						stroke: resolved.portStroke,
						strokeWidth: resolved.portStrokeWidth,
						fill: resolved.portFill,
					},
				},
				markup: [{ tagName: "circle", selector: "circle" }],
			},
			ioRight: {
				position: { name: "right" },
				attrs: {
					circle: {
						r: resolved.portRadius,
						magnet: true,
						stroke: resolved.portStroke,
						strokeWidth: resolved.portStrokeWidth,
						fill: resolved.portFill,
					},
				},
				markup: [{ tagName: "circle", selector: "circle" }],
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

export function createConditionNode(config = {}) {
	const resolved = normalizeConditionConfig(config);
	const centerX = toNumber(config.x, 0);
	const centerY = toNumber(config.y, 0);
	const nodeId = config.id || `condition-node-${Date.now()}`;

	return {
		id: nodeId,
		shape: "polygon",
		x: centerX - resolved.width / 2,
		y: centerY - resolved.height / 2,
		width: resolved.width,
		height: resolved.height,
		data: {
			nodeType: CONDITION_NODE_TYPE,
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
				refPoints: "0,10 10,0 20,10 10,20",
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
				textWrap: CONDITION_LABEL_WRAP,
			},
		},
		ports: createConditionPorts({
			...resolved,
			id: nodeId,
			portIds: config.portIds,
		}),
	};
}

export function isConditionNode(cell) {
	return cell?.isNode?.() && cell.getData?.()?.nodeType === CONDITION_NODE_TYPE;
}

export function getConditionNodePayload(cell) {
	const data = cell.getData?.() || {};

	return {
		id: cell.id,
		nodeType: CONDITION_NODE_TYPE,
		label: cell.attr("label/text") ?? "",
		fontSize: Number(cell.attr("label/fontSize")) || CONDITION_DEFAULTS.fontSize,
		width: Math.round(cell.size().width),
		height: Math.round(cell.size().height),
		bodyFill: cell.attr("body/fill") || data.bodyFill || CONDITION_DEFAULTS.bodyFill,
		bodyStroke:
			cell.attr("body/stroke") || data.bodyStroke || CONDITION_DEFAULTS.bodyStroke,
		bodyStrokeWidth:
			Number(cell.attr("body/strokeWidth")) ||
			data.bodyStrokeWidth ||
			CONDITION_DEFAULTS.bodyStrokeWidth,
		labelColor:
			cell.attr("label/fill") || data.labelColor || CONDITION_DEFAULTS.labelColor,
		labelFontWeight:
			Number(cell.attr("label/fontWeight")) ||
			data.labelFontWeight ||
			CONDITION_DEFAULTS.labelFontWeight,
		portStroke: data.portStroke || CONDITION_DEFAULTS.portStroke,
		portFill: data.portFill || CONDITION_DEFAULTS.portFill,
		portStrokeWidth: data.portStrokeWidth || CONDITION_DEFAULTS.portStrokeWidth,
		portRadius: data.portRadius || CONDITION_DEFAULTS.portRadius,
	};
}

export default defineComponent({
	name: "Condition",
	props: {
		draggable: { type: Boolean, default: false },
		title: { type: String, default: CONDITION_DEFAULTS.title },
		description: { type: String, default: CONDITION_DEFAULTS.description },
		label: { type: String, default: CONDITION_DEFAULTS.label },
		fontSize: { type: [Number, String], default: CONDITION_DEFAULTS.fontSize },
		width: { type: [Number, String], default: CONDITION_DEFAULTS.width },
		height: { type: [Number, String], default: CONDITION_DEFAULTS.height },
		bodyFill: { type: String, default: CONDITION_DEFAULTS.bodyFill },
		bodyStroke: { type: String, default: CONDITION_DEFAULTS.bodyStroke },
		bodyStrokeWidth: {
			type: [Number, String],
			default: CONDITION_DEFAULTS.bodyStrokeWidth,
		},
		labelColor: { type: String, default: CONDITION_DEFAULTS.labelColor },
		labelFontWeight: {
			type: [Number, String],
			default: CONDITION_DEFAULTS.labelFontWeight,
		},
		portStroke: { type: String, default: CONDITION_DEFAULTS.portStroke },
		portFill: { type: String, default: CONDITION_DEFAULTS.portFill },
		portStrokeWidth: {
			type: [Number, String],
			default: CONDITION_DEFAULTS.portStrokeWidth,
		},
		portRadius: { type: [Number, String], default: CONDITION_DEFAULTS.portRadius },
	},
	emits: ["dragstart"],
	setup(props, { emit }) {
		const resolved = computed(() => normalizeConditionConfig(props));
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
	transform: rotate(45deg);
	border-radius: 10px;
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
