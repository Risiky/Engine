import {
	START_FONT_SIZE_OPTIONS,
	START_NODE_TYPE,
	START_PORT_POSITION_OPTIONS,
} from "./Start.vue";
import { END_NODE_TYPE, END_PORT_POSITION_OPTIONS } from "./End.vue";
import { CONDITION_NODE_TYPE } from "./Condition.vue";
import { NODE_NODE_TYPE } from "./Node.vue";

export const SHARED_FONT_SIZE_OPTIONS = START_FONT_SIZE_OPTIONS.map((size) => ({
	value: `${size}px`,
}));

export const NODE_FORM_REGISTRY = {
	edge: {
		title: "连线属性",
		description: "编辑当前连线的文案和显示样式。",
		fields: [
			{
				key: "label",
				type: "text",
				label: "连线文本",
				placeholder: "可留空，作为无文案连接使用",
				hint: "输入框允许清空，标签会随输入即时同步。",
				eventName: "edge-text-change",
			},
			{
				key: "lineStyle",
				type: "radio",
				label: "显示样式",
				hint: "切换后会同步修改当前连线的描边形式。",
				eventName: "edge-style-change",
				options: [
					{ label: "实线", value: "solid" },
					{ label: "虚线", value: "dashed" },
					{ label: "点线", value: "dotted" },
				],
			},
		],
		metrics: [
			{
				label: "对象类型",
				value: () => "Edge",
			},
		],
		chips: [
			{ color: "blue", label: "文本可编辑" },
			{ color: "cyan", label: "线型可切换" },
		],
	},
	[START_NODE_TYPE]: {
		title: "开始节点属性",
		description: "开始节点支持编辑文本、字号和输出端口位置。",
		fields: [
			{
				key: "label",
				type: "text",
				label: "节点文本",
				placeholder: "例如：开始、受理、初始化",
				hint: "留空后节点标签会同步清空。",
				eventName: "node-text-change",
			},
			{
				key: "fontSize",
				type: "fontSize",
				label: "文本大小",
				placeholder: "输入字号像素值",
				hint: "可选 12px、14px、16px，也可手动输入 18 或 18px。",
				eventName: "node-font-size-change",
			},
			{
				key: "portPosition",
				type: "radio",
				label: "输出端口位置",
				hint: "调整后会同步改变连线从开始节点发出的方向。",
				eventName: "node-port-position-change",
				options: START_PORT_POSITION_OPTIONS,
			},
		],
		metrics: [
			{
				label: "当前尺寸",
				value: (node) => `${node.width} × ${node.height}`,
			},
			{
				label: "节点类型",
				value: () => "Start",
			},
		],
		chips: [
			{ color: "green", label: "唯一开始节点" },
			{ color: "blue", label: "文本可编辑" },
			{ color: "cyan", label: "字号可调" },
			{ color: "processing", label: "支持缩放" },
		],
	},
	[NODE_NODE_TYPE]: {
		title: "通用节点属性",
		description: "通用节点支持文本、字号和尺寸调整。",
		fields: [
			{
				key: "label",
				type: "text",
				label: "节点文本",
				placeholder: "例如：资料校验、人工审核、发送通知",
				hint: "编辑结果会即时同步到节点内容。",
				eventName: "node-text-change",
			},
			{
				key: "fontSize",
				type: "fontSize",
				label: "文本大小",
				placeholder: "输入字号像素值",
				hint: "可选 12px、14px、16px，也可手动输入更大字号。",
				eventName: "node-font-size-change",
			},
		],
		metrics: [
			{
				label: "当前尺寸",
				value: (node) => `${node.width} × ${node.height}`,
			},
			{
				label: "端口能力",
				value: () => "上 / 下 / 左 / 右，均支持输入输出",
			},
			{
				label: "节点类型",
				value: () => "Node",
			},
		],
		chips: [
			{ color: "blue", label: "矩形节点" },
			{ color: "cyan", label: "文本可编辑" },
			{ color: "processing", label: "字号可调" },
			{ color: "geekblue", label: "四向端口" },
		],
	},
	[CONDITION_NODE_TYPE]: {
		title: "条件节点属性",
		description: "条件节点支持文本、字号和尺寸调整。",
		fields: [
			{
				key: "label",
				type: "text",
				label: "节点文本",
				placeholder: "例如：是否通过、是否超时、是否命中规则",
				hint: "编辑结果会即时同步到节点内容。",
				eventName: "node-text-change",
			},
			{
				key: "fontSize",
				type: "fontSize",
				label: "文本大小",
				placeholder: "输入字号像素值",
				hint: "可选 12px、14px、16px，也可手动输入更大字号。",
				eventName: "node-font-size-change",
			},
		],
		metrics: [
			{
				label: "当前尺寸",
				value: (node) => `${node.width} × ${node.height}`,
			},
			{
				label: "端口能力",
				value: () => "上 / 下 / 左 / 右，均支持输入输出",
			},
			{
				label: "节点类型",
				value: () => "Condition",
			},
		],
		chips: [
			{ color: "orange", label: "菱形节点" },
			{ color: "cyan", label: "文本可编辑" },
			{ color: "processing", label: "字号可调" },
			{ color: "geekblue", label: "四向端口" },
		],
	},
	[END_NODE_TYPE]: {
		title: "结束节点属性",
		description: "结束节点支持文本、字号和输入端口位置调整。",
		fields: [
			{
				key: "label",
				type: "text",
				label: "节点文本",
				placeholder: "例如：结束、完成、归档",
				hint: "留空后节点标签会同步清空。",
				eventName: "node-text-change",
			},
			{
				key: "fontSize",
				type: "fontSize",
				label: "文本大小",
				placeholder: "输入字号像素值",
				hint: "可选 12px、14px、16px，也可手动输入 18 或 18px。",
				eventName: "node-font-size-change",
			},
			{
				key: "portPosition",
				type: "radio",
				label: "输入端口位置",
				hint: "调整后会同步改变连线接入结束节点的方向。",
				eventName: "node-port-position-change",
				options: END_PORT_POSITION_OPTIONS,
			},
		],
		metrics: [
			{
				label: "当前尺寸",
				value: (node) => `${node.width} × ${node.height}`,
			},
			{
				label: "节点类型",
				value: () => "End",
			},
		],
		chips: [
			{ color: "red", label: "仅接受输入" },
			{ color: "blue", label: "文本可编辑" },
			{ color: "cyan", label: "字号可调" },
			{ color: "processing", label: "支持缩放" },
		],
	},
};

export function getNodeFormSchema(nodeType) {
	return NODE_FORM_REGISTRY[nodeType] || null;
}
