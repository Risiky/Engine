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
		description: "连线支持设置显示形式和文本内容，修改后会实时反映到画布。",
		fields: [
			{
				key: "label",
				type: "text",
				label: "连线文本",
				placeholder: "可清空连线文本",
				hint: "输入框允许清空，连线标签会实时同步更新。",
				eventName: "edge-text-change",
			},
			{
				key: "lineStyle",
				type: "radio",
				label: "显示形式",
				hint: "切换后会同步修改连线显示形式。",
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
			{ color: "blue", label: "line editable" },
			{ color: "cyan", label: "text editable" },
		],
	},
	[START_NODE_TYPE]: {
		title: "开始节点属性",
		description: "开始节点支持文本、文本大小、输出端口位置和尺寸状态。",
		fields: [
			{
				key: "label",
				type: "text",
				label: "节点文本",
				placeholder: "可清空文本内容",
				hint: "输入框允许清空，节点标签会实时同步更新。",
				eventName: "node-text-change",
			},
			{
				key: "fontSize",
				type: "fontSize",
				label: "文本大小",
				placeholder: "输入字号像素",
				hint: "可直接选择 12px、14px、16px，也可以输入自定义值，例如 `18` 或 `18px`。",
				eventName: "node-font-size-change",
			},
			{
				key: "portPosition",
				type: "radio",
				label: "发出连接端口位置",
				hint: "切换后会同步移动开始节点的输出端口，并改变连接线发出位置。",
				eventName: "node-port-position-change",
				options: START_PORT_POSITION_OPTIONS,
			},
		],
		metrics: [
			{
				label: "当前尺寸",
				value: (node) => `${node.width} x ${node.height}`,
			},
			{
				label: "节点类型",
				value: () => "Start",
			},
		],
		chips: [
			{ color: "green", label: "start unique" },
			{ color: "blue", label: "text editable" },
			{ color: "cyan", label: "font scalable" },
			{ color: "processing", label: "resizable" },
		],
	},
	[NODE_NODE_TYPE]: {
		title: "通用节点属性",
		description: "通用节点支持文本、文本大小和尺寸状态，端口默认四向输入输出。",
		fields: [
			{
				key: "label",
				type: "text",
				label: "节点文本",
				placeholder: "可清空文本内容",
				hint: "输入框允许清空，节点标签会实时同步更新。",
				eventName: "node-text-change",
			},
			{
				key: "fontSize",
				type: "fontSize",
				label: "文本大小",
				placeholder: "输入字号像素",
				hint: "可直接选择 12px、14px、16px，也可以输入自定义值，例如 `18` 或 `18px`。",
				eventName: "node-font-size-change",
			},
		],
		metrics: [
			{
				label: "当前尺寸",
				value: (node) => `${node.width} x ${node.height}`,
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
			{ color: "blue", label: "rect shape" },
			{ color: "cyan", label: "text editable" },
			{ color: "processing", label: "font scalable" },
			{ color: "geekblue", label: "4-way io ports" },
		],
	},
	[CONDITION_NODE_TYPE]: {
		title: "条件节点属性",
		description: "条件节点支持文本、文本大小和尺寸状态，并默认带四向输入输出端口。",
		fields: [
			{
				key: "label",
				type: "text",
				label: "节点文本",
				placeholder: "可清空文本内容",
				hint: "输入框允许清空，节点标签会实时同步更新。",
				eventName: "node-text-change",
			},
			{
				key: "fontSize",
				type: "fontSize",
				label: "文本大小",
				placeholder: "输入字号像素",
				hint: "可直接选择 12px、14px、16px，也可以输入自定义值，例如 `18` 或 `18px`。",
				eventName: "node-font-size-change",
			},
		],
		metrics: [
			{
				label: "当前尺寸",
				value: (node) => `${node.width} x ${node.height}`,
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
			{ color: "orange", label: "diamond shape" },
			{ color: "cyan", label: "text editable" },
			{ color: "processing", label: "font scalable" },
			{ color: "geekblue", label: "4-way io ports" },
		],
	},
	[END_NODE_TYPE]: {
		title: "结束节点属性",
		description: "结束节点支持文本、文本大小、接收端口位置和尺寸状态，只允许作为连接目标。",
		fields: [
			{
				key: "label",
				type: "text",
				label: "节点文本",
				placeholder: "可清空文本内容",
				hint: "输入框允许清空，节点标签会实时同步更新。",
				eventName: "node-text-change",
			},
			{
				key: "fontSize",
				type: "fontSize",
				label: "文本大小",
				placeholder: "输入字号像素",
				hint: "可直接选择 12px、14px、16px，也可以输入自定义值，例如 `18` 或 `18px`。",
				eventName: "node-font-size-change",
			},
			{
				key: "portPosition",
				type: "radio",
				label: "接收连接端口位置",
				hint: "切换后会同步移动结束节点的输入端口，并改变连接线接入位置。",
				eventName: "node-port-position-change",
				options: END_PORT_POSITION_OPTIONS,
			},
		],
		metrics: [
			{
				label: "当前尺寸",
				value: (node) => `${node.width} x ${node.height}`,
			},
			{
				label: "节点类型",
				value: () => "End",
			},
		],
		chips: [
			{ color: "red", label: "incoming only" },
			{ color: "blue", label: "text editable" },
			{ color: "cyan", label: "font scalable" },
			{ color: "processing", label: "resizable" },
		],
	},
};

export function getNodeFormSchema(nodeType) {
	return NODE_FORM_REGISTRY[nodeType] || null;
}
