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
			<p class="eyebrow">Palette Console</p>
			<h2>节点面板</h2>
		</div>

		<section class="sidebar-block">
			<div class="node-list">
				<Start draggable @dragstart="onStartNodeDragStart" />
				<Node draggable @dragstart="onRectNodeDragStart" />
				<Condition draggable @dragstart="onConditionNodeDragStart" />
				<End draggable @dragstart="onEndNodeDragStart" />
			</div>
		</section>
	</aside>
</template>

<style scoped>
.sidebar {
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	gap: 12px;
	width: 100%;
	min-width: 0;
	height: 100%;
	min-height: 0;
	padding: 16px;
	border: 1px solid var(--border-strong);
	border-radius: 28px;
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03)),
		var(--panel);
	box-shadow: var(--shadow);
	backdrop-filter: blur(20px);
	overflow: hidden;
}

.eyebrow,
.sidebar-header h2 {
	margin: 0;
}

.eyebrow {
	font-family: "IBM Plex Mono", monospace;
	font-size: 0.72rem;
	font-weight: 500;
	letter-spacing: 0.16em;
	text-transform: uppercase;
	color: var(--accent-cool);
}

.sidebar-header h2 {
	margin-top: 10px;
	font-family: "Cormorant Garamond", serif;
	font-size: 2.2rem;
	font-weight: 600;
	line-height: 0.96;
	letter-spacing: -0.04em;
	color: var(--text-1);
}

.sidebar-block {
	position: relative;
	padding: 14px;
	border-radius: 22px;
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02)),
		rgba(255, 255, 255, 0.03);
	border: 1px solid var(--line-mid);
}

.node-list {
	display: grid;
	gap: 10px;
}

@media (max-width: 1080px) {
	.sidebar {
		height: auto;
	}
}

@media (max-width: 640px) {
	.sidebar {
		padding: 14px;
		border-radius: 22px;
	}
}
</style>
