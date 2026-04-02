<script setup>
import { END_NODE_MIME_TYPE, END_NODE_TYPE } from "./End.vue";
import {
	CONDITION_NODE_MIME_TYPE,
	CONDITION_NODE_TYPE,
} from "./Condition.vue";
import { NODE_NODE_MIME_TYPE, NODE_NODE_TYPE } from "./Node.vue";
import { START_NODE_MIME_TYPE, START_NODE_TYPE } from "./Start.vue";

function setDragPayload(event, mimeType, nodeType) {
	event.dataTransfer?.setData(mimeType, nodeType);
	event.dataTransfer.effectAllowed = "copy";
}

function onStartNodeDragStart(event) {
	setDragPayload(event, START_NODE_MIME_TYPE, START_NODE_TYPE);
}

function onRectNodeDragStart(event) {
	setDragPayload(event, NODE_NODE_MIME_TYPE, NODE_NODE_TYPE);
}

function onConditionNodeDragStart(event) {
	setDragPayload(event, CONDITION_NODE_MIME_TYPE, CONDITION_NODE_TYPE);
}

function onEndNodeDragStart(event) {
	setDragPayload(event, END_NODE_MIME_TYPE, END_NODE_TYPE);
}
</script>

<template>
	<aside class="sidebar">
		<div class="sidebar-header">
			<p class="eyebrow">Tools</p>
			<h2>工具区</h2>
			<p class="copy">默认宽度 240px，可通过右下角拖动改变宽度。</p>
		</div>

		<section class="sidebar-block">
			<h3>画布操作</h3>
			<div class="action-list">
				<AButton type="primary" block>拖拽组件</AButton>
				<AButton block>连接模式</AButton>
				<AButton block>视图对齐</AButton>
			</div>
		</section>

		<section class="sidebar-block">
			<h3>节点库</h3>
			<Start draggable @dragstart="onStartNodeDragStart" />
			<End draggable @dragstart="onEndNodeDragStart" />
			<Node draggable @dragstart="onRectNodeDragStart" />
			<Condition draggable @dragstart="onConditionNodeDragStart" />
			<div class="chip-list">
				<ATag color="blue">Rect</ATag>
				<ATag color="cyan">Port</ATag>
				<ATag color="geekblue">Edge</ATag>
				<ATag color="processing">Group</ATag>
			</div>
		</section>

		<section class="sidebar-block">
			<h3>使用提示</h3>
			<ul class="hint-list">
				<li>从右侧端口拖向另一节点左侧端口创建连线。</li>
				<li>点击连线后可拖动中间控制点调整线段。</li>
				<li>按住 Ctrl 或 Cmd 并滚轮可缩放画布。</li>
			</ul>
		</section>
	</aside>
</template>

<style scoped>
.sidebar {
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	gap: 6px;
	width: 100%;
	min-width: 0;
	height: 100%;
	min-height: 0;
	padding: 6px;
	border: 1px solid rgba(15, 23, 42, 0.08);
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.84);
	box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
	backdrop-filter: blur(12px);
	overflow: hidden;
}

.eyebrow,
.copy,
.sidebar-header h2,
.sidebar-block h3 {
	margin: 0;
}

.eyebrow {
	font-size: 0.75rem;
	font-weight: 700;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	color: #2563eb;
}

.sidebar-header h2 {
	margin-top: 8px;
	font-size: 1.8rem;
	line-height: 1;
	letter-spacing: -0.04em;
	color: #0f172a;
}

.copy {
	margin-top: 6px;
	color: rgba(15, 23, 42, 0.66);
}

.sidebar-block {
	padding: 6px;
	border-radius: 8px;
	background: linear-gradient(180deg, rgba(239, 246, 255, 0.8), rgba(255, 255, 255, 0.88));
	border: 1px solid rgba(37, 99, 235, 0.08);
}

.sidebar-block h3 {
	font-size: 0.98rem;
	color: #0f172a;
}

.action-list {
	display: grid;
	gap: 6px;
	margin-top: 6px;
}

.chip-list {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: 6px;
}

.hint-list {
	margin: 6px 0 0;
	padding-left: 18px;
	color: rgba(15, 23, 42, 0.72);
}

.hint-list li + li {
	margin-top: 6px;
}

@media (max-width: 1080px) {
	.sidebar {
		width: 100%;
		min-width: 0;
		height: auto;
	}
}
</style>
