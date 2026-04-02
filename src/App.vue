<script setup>
import { isSameSelectedNodePayload } from "./utils/selectedNode.js";

const X6GraphDemo = defineAsyncComponent(() => import("./components/X6GraphDemo.vue"));
const ToolSidebar = defineAsyncComponent(() => import("./components/ToolSidebar.vue"));
const PropertySidebar = defineAsyncComponent(() => import("./components/PropertySidebar.vue"));

const LEFT_SIDEBAR = {
	initial: 224,
	min: 208,
	max: 360,
};

const RIGHT_SIDEBAR = {
	initial: 320,
	min: 280,
	max: 480,
};

const leftSidebarWidth = ref(LEFT_SIDEBAR.initial);
const rightSidebarWidth = ref(RIGHT_SIDEBAR.initial);
const selectedNode = ref(null);

function handleNodeSelection(payload) {
	if (isSameSelectedNodePayload(selectedNode.value, payload)) {
		return;
	}

	selectedNode.value = payload;
}

function updateSelectedNode(patch) {
	if (!selectedNode.value) {
		return;
	}

	const nextValue = {
		...selectedNode.value,
		...patch,
	};

	if (isSameSelectedNodePayload(selectedNode.value, nextValue)) {
		return;
	}

	selectedNode.value = nextValue;
}

function handleNodeTextChange(value) {
	updateSelectedNode({ label: value });
}

function handleNodePortPositionChange(value) {
	updateSelectedNode({ portPosition: value });
}

function handleNodeFontSizeChange(value) {
	updateSelectedNode({ fontSize: value });
}

function handleEdgeTextChange(value) {
	updateSelectedNode({ label: value });
}

function handleEdgeStyleChange(value) {
	updateSelectedNode({ lineStyle: value });
}
</script>

<template>
	<Suspense>
		<main class="workspace-layout">
			<ResizableSidebar
				v-model="leftSidebarWidth"
				side="left"
				:min-width="LEFT_SIDEBAR.min"
				:max-width="LEFT_SIDEBAR.max"
			>
				<ToolSidebar />
			</ResizableSidebar>
			<X6GraphDemo
				:selected-node="selectedNode"
				@node-selection-change="handleNodeSelection"
			/>
			<ResizableSidebar
				v-model="rightSidebarWidth"
				side="right"
				:min-width="RIGHT_SIDEBAR.min"
				:max-width="RIGHT_SIDEBAR.max"
			>
				<PropertySidebar
					:selected-node="selectedNode"
					@node-text-change="handleNodeTextChange"
					@node-port-position-change="handleNodePortPositionChange"
					@node-font-size-change="handleNodeFontSizeChange"
					@edge-text-change="handleEdgeTextChange"
					@edge-style-change="handleEdgeStyleChange"
				/>
			</ResizableSidebar>
		</main>

		<template #fallback>
			<main class="app-loading">
				<section class="loading-card">
					<p class="loading-eyebrow">Loading Module</p>
					<h1>正在按需加载 X6 工作台</h1>
					<p class="loading-copy">中间编辑器会在页面进入后异步加载，左侧工具栏和右侧属性面板由主入口负责组合。</p>
				</section>
			</main>
		</template>
	</Suspense>
</template>

<style scoped>
.workspace-layout {
	display: flex;
	gap: 6px;
	height: 100dvh;
	padding: 6px;
	align-items: stretch;
	overflow: hidden;
}

.app-loading {
	display: grid;
	place-items: center;
	height: 100dvh;
	padding: 6px;
	overflow: hidden;
}

.loading-card {
	width: min(640px, 100%);
	padding: 6px;
	border: 1px solid rgba(15, 23, 42, 0.08);
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.84);
	box-shadow: 0 30px 80px rgba(15, 23, 42, 0.08);
	backdrop-filter: blur(12px);
}

.loading-eyebrow {
	margin: 0 0 12px;
	font-size: 0.78rem;
	font-weight: 700;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	color: #2563eb;
}

.loading-card h1 {
	margin: 0;
	font-size: clamp(2rem, 5vw, 3rem);
	line-height: 1;
	letter-spacing: -0.04em;
}

.loading-copy {
	margin: 18px 0 0;
	color: rgba(15, 23, 42, 0.72);
}

@media (max-width: 1080px) {
	.workspace-layout {
		flex-direction: column;
		padding: 6px;
	}
}
</style>
