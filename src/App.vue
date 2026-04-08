<script setup>

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

const STACK_BREAKPOINT = 1080;
const WORKSPACE_GAP = 14;
const WORKSPACE_GAP_COUNT = 2;
const CENTER_MIN_WIDTH = 360;

const workspaceLayoutRef = ref(null);
const leftSidebarWidth = ref(LEFT_SIDEBAR.initial);
const rightSidebarWidth = ref(RIGHT_SIDEBAR.initial);

let workspaceResizeObserver = null;

function clampWidth(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function getWorkspaceWidth() {
	return workspaceLayoutRef.value?.clientWidth || 0;
}

function getSidebarMaxWidth(side) {
	const workspaceWidth = getWorkspaceWidth();

	if (!workspaceWidth || workspaceWidth <= STACK_BREAKPOINT) {
		return side === "left" ? LEFT_SIDEBAR.max : RIGHT_SIDEBAR.max;
	}

	const otherWidth = side === "left" ? rightSidebarWidth.value : leftSidebarWidth.value;
	const ownConfig = side === "left" ? LEFT_SIDEBAR : RIGHT_SIDEBAR;
	const availableWidth =
		workspaceWidth - otherWidth - CENTER_MIN_WIDTH - WORKSPACE_GAP * WORKSPACE_GAP_COUNT;

	return Math.max(ownConfig.min, Math.min(ownConfig.max, availableWidth));
}

function setLeftSidebarWidth(nextWidth) {
	leftSidebarWidth.value = clampWidth(
		nextWidth,
		LEFT_SIDEBAR.min,
		getSidebarMaxWidth("left"),
	);
}

function setRightSidebarWidth(nextWidth) {
	rightSidebarWidth.value = clampWidth(
		nextWidth,
		RIGHT_SIDEBAR.min,
		getSidebarMaxWidth("right"),
	);
}

function syncSidebarWidthsToWorkspace() {
	setLeftSidebarWidth(leftSidebarWidth.value);
	setRightSidebarWidth(rightSidebarWidth.value);
}

onMounted(() => {
	if (window.ResizeObserver && workspaceLayoutRef.value) {
		workspaceResizeObserver = new ResizeObserver(() => {
			syncSidebarWidthsToWorkspace();
		});
		workspaceResizeObserver.observe(workspaceLayoutRef.value);
	}

	window.addEventListener("resize", syncSidebarWidthsToWorkspace);
	nextTick(() => {
		syncSidebarWidthsToWorkspace();
	});
});

onBeforeUnmount(() => {
	workspaceResizeObserver?.disconnect();
	workspaceResizeObserver = null;
	window.removeEventListener("resize", syncSidebarWidthsToWorkspace);
});
</script>

<template>
	<main class="app-shell">
		<div class="shell-glow shell-glow-left"></div>
		<div class="shell-glow shell-glow-right"></div>
		<div class="shell-grid"></div>

		<Suspense>
			<section class="workspace-stage">
				<div ref="workspaceLayoutRef" class="workspace-layout">
					<ResizableSidebar
						:model-value="leftSidebarWidth"
						side="left"
						:min-width="LEFT_SIDEBAR.min"
						:max-width="LEFT_SIDEBAR.max"
						@update:modelValue="setLeftSidebarWidth"
					>
						<ToolSidebar />
					</ResizableSidebar>

					<X6GraphDemo />

					<ResizableSidebar
						:model-value="rightSidebarWidth"
						side="right"
						:min-width="RIGHT_SIDEBAR.min"
						:max-width="RIGHT_SIDEBAR.max"
						@update:modelValue="setRightSidebarWidth"
					>
						<PropertySidebar />
					</ResizableSidebar>
				</div>
			</section>

			<template #fallback>
				<section class="app-loading">
					<section class="loading-card">
						<p class="loading-eyebrow">Loading Module</p>
						<h2>正在加载流程工作台</h2>
						<p class="loading-copy">画布与两侧面板会按需挂载，首屏只保留必要结构。</p>
					</section>
				</section>
			</template>
		</Suspense>
	</main>
</template>

<style scoped>
.app-shell {
	position: relative;
	display: flex;
	min-height: 100dvh;
	padding: 14px;
	overflow: hidden;
}

.shell-glow,
.shell-grid {
	position: absolute;
	inset: 0;
	pointer-events: none;
}

.shell-glow-left {
	background: radial-gradient(circle at 10% 12%, rgba(35, 121, 109, 0.16), transparent 28%);
}

.shell-glow-right {
	background: radial-gradient(circle at 92% 8%, rgba(185, 125, 44, 0.18), transparent 30%);
}

.shell-grid {
	opacity: 0.36;
	background-image:
		linear-gradient(var(--line-soft) 1px, transparent 1px),
		linear-gradient(90deg, var(--line-soft) 1px, transparent 1px);
	background-size: 48px 48px;
	mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.52), transparent 94%);
}

.workspace-stage {
	position: relative;
	display: flex;
	flex: 1 1 auto;
	min-width: 0;
	min-height: 0;
	z-index: 1;
}

.workspace-layout {
	display: flex;
	flex: 1 1 auto;
	gap: 14px;
	min-height: 0;
	align-items: stretch;
	overflow: hidden;
}

.app-loading {
	display: grid;
	place-items: center;
	flex: 1 1 auto;
	min-height: 0;
}

.loading-card {
	width: min(520px, 100%);
	padding: 28px;
	border: 1px solid var(--border-strong);
	border-radius: 28px;
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 248, 240, 0.96)),
		var(--panel);
	box-shadow: var(--shadow);
	backdrop-filter: blur(18px);
}

.loading-eyebrow {
	margin: 0;
	font-family: "IBM Plex Mono", monospace;
	font-size: 0.74rem;
	font-weight: 500;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	color: var(--accent-cool);
}

.loading-card h2 {
	margin: 10px 0 0;
	font-family: "Cormorant Garamond", serif;
	font-size: clamp(2rem, 5vw, 3rem);
	font-weight: 600;
	line-height: 0.96;
	letter-spacing: -0.03em;
	color: var(--text-1);
}

.loading-copy {
	margin: 14px 0 0;
	color: var(--text-2);
}

@media (max-width: 1080px) {
	.app-shell {
		padding: 12px;
	}

	.workspace-layout {
		flex-direction: column;
	}
}

@media (max-width: 720px) {
	.loading-card {
		border-radius: 22px;
	}
}
</style>
