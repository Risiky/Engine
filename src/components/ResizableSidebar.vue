<script setup>
const props = defineProps({
	modelValue: {
		type: Number,
		required: true,
	},
	side: {
		type: String,
		default: "left",
	},
	minWidth: {
		type: Number,
		default: 200,
	},
	maxWidth: {
		type: Number,
		default: 480,
	},
});

const emit = defineEmits(["update:modelValue"]);

const dragging = ref(false);
let startX = 0;
let startWidth = 0;

const sidebarStyle = computed(() => ({
	width: `${props.modelValue}px`,
	flexBasis: `${props.modelValue}px`,
}));

function clampWidth(width) {
	return Math.min(props.maxWidth, Math.max(props.minWidth, width));
}

function stopDragging() {
	dragging.value = false;
	window.removeEventListener("mousemove", onMouseMove);
	window.removeEventListener("mouseup", stopDragging);
	document.body.style.userSelect = "";
	document.body.style.cursor = "";
}

function onMouseMove(event) {
	const delta = event.clientX - startX;
	const nextWidth =
		props.side === "left" ? startWidth + delta : startWidth - delta;

	emit("update:modelValue", clampWidth(nextWidth));
}

function startDragging(event) {
	dragging.value = true;
	startX = event.clientX;
	startWidth = props.modelValue;
	window.addEventListener("mousemove", onMouseMove);
	window.addEventListener("mouseup", stopDragging);
	document.body.style.userSelect = "none";
	document.body.style.cursor = "col-resize";
}

onBeforeUnmount(() => {
	stopDragging();
});
</script>

<template>
	<div class="resizable-shell" :class="[`side-${side}`, { dragging }]">
		<div class="sidebar-frame" :style="sidebarStyle">
			<slot />
		</div>

		<button
			type="button"
			class="resize-handle"
			:aria-label="side === 'left' ? '调整左侧栏宽度' : '调整右侧栏宽度'"
			@mousedown="startDragging"
		></button>
	</div>
</template>

<style scoped>
.resizable-shell {
	position: relative;
	display: flex;
	flex: 0 0 auto;
	align-items: stretch;
	height: 100%;
	min-width: 0;
}

.sidebar-frame {
	display: flex;
	min-width: 0;
	height: 100%;
}

.resize-handle {
	position: absolute;
	top: 6px;
	bottom: 6px;
	width: 14px;
	padding: 0;
	border: 0;
	background: transparent;
	cursor: col-resize;
	z-index: 3;
}

.resize-handle::before {
	content: "";
	position: absolute;
	top: 0;
	bottom: 0;
	left: 50%;
	width: 4px;
	transform: translateX(-50%);
	border-radius: 999px;
	background: rgba(148, 163, 184, 0.22);
	transition:
		background-color 0.18s ease,
		box-shadow 0.18s ease;
}

.resizable-shell:hover .resize-handle::before,
.resizable-shell.dragging .resize-handle::before {
	background: rgba(37, 99, 235, 0.42);
	box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.side-left .resize-handle {
	right: -10px;
}

.side-right .resize-handle {
	left: -10px;
}

@media (max-width: 1080px) {
	.resizable-shell {
		height: auto;
	}

	.sidebar-frame {
		width: 100% !important;
		flex-basis: auto !important;
		height: auto;
	}

	.resize-handle {
		display: none;
	}
}
</style>
