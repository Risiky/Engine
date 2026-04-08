<script setup>
import { storeToRefs } from "pinia";
import { getNodeFormSchema, SHARED_FONT_SIZE_OPTIONS } from "./nodeFormRegistry.js";
import { useWorkflowStore } from "../stores/workflow.js";

const workflowStore = useWorkflowStore();
const { selectedNode } = storeToRefs(workflowStore);

const activeTab = ref("general");
const activeSchema = computed(() => getNodeFormSchema(selectedNode.value?.nodeType));
const hasSelectedSchema = computed(() => Boolean(selectedNode.value && activeSchema.value));

const fontSizeValue = computed(() => {
	const currentSize = Number(selectedNode.value?.fontSize);
	return Number.isFinite(currentSize) && currentSize > 0 ? `${currentSize}px` : "";
});

const fieldValue = (field) => {
	if (field.type === "fontSize") {
		return fontSizeValue.value;
	}

	return selectedNode.value?.[field.key];
};

const metrics = computed(
	() =>
		activeSchema.value?.metrics?.map((item) => ({
			label: item.label,
			value: item.value(selectedNode.value),
		})) || [],
);

const chips = computed(() => activeSchema.value?.chips || []);

const currentFocusTitle = computed(() => {
	if (!selectedNode.value) {
		return "等待选择";
	}

	return activeSchema.value?.title || "未识别对象";
});

function parseTextValue(eventOrValue) {
	return typeof eventOrValue === "string"
		? eventOrValue
		: (eventOrValue?.target?.value ?? "");
}

function parseFontSize(value) {
	if (value == null || value === "") {
		return null;
	}

	const normalized = String(value).trim().toLowerCase().replace("px", "");
	const parsed = Number(normalized);
	return Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
}

function patchSelectedField(field, payload) {
	if (!field?.key || !selectedNode.value) {
		return;
	}

	workflowStore.patchSelectedNode({ [field.key]: payload });
}

function handleFieldInput(field, eventOrValue) {
	if (field.type === "text") {
		patchSelectedField(field, parseTextValue(eventOrValue));
		return;
	}

	if (field.type === "fontSize") {
		const parsed = parseFontSize(eventOrValue);
		if (parsed != null) {
			patchSelectedField(field, parsed);
		}
		return;
	}

	if (field.type === "radio") {
		patchSelectedField(field, eventOrValue?.target?.value);
	}
}
</script>

<template>
	<aside class="sidebar">
		<div class="sidebar-header">
			<p class="eyebrow">Inspector Bay</p>
			<h2>属性检查台</h2>
		</div>

		<section class="focus-card" :class="{ 'focus-card-empty': !hasSelectedSchema }">
			<p class="focus-label">Current Focus</p>
			<h3>{{ currentFocusTitle }}</h3>
		</section>

		<section class="sidebar-block sidebar-tabs-block">
			<ATabs v-model:activeKey="activeTab" class="property-tabs">
				<ATabPane key="general" tab="通用属性">
					<div v-if="hasSelectedSchema" class="tab-panel">
						<div class="form-field">
							<template v-for="field in activeSchema.fields" :key="field.key">
								<label class="field-label" :for="`field-${field.key}`">{{ field.label }}</label>

								<ATextarea
									v-if="field.type === 'text'"
									:id="`field-${field.key}`"
									:value="fieldValue(field)"
									:placeholder="field.placeholder"
									allow-clear
									:auto-size="{ minRows: 2, maxRows: 5 }"
									@update:value="handleFieldInput(field, $event)"
								/>

								<AAutoComplete
									v-else-if="field.type === 'fontSize'"
									:id="`field-${field.key}`"
									:options="SHARED_FONT_SIZE_OPTIONS"
									:value="fieldValue(field)"
									:placeholder="field.placeholder"
									@change="handleFieldInput(field, $event)"
								/>

								<ARadioGroup
									v-else-if="field.type === 'radio'"
									:id="`field-${field.key}`"
									:value="fieldValue(field)"
									button-style="solid"
									@change="handleFieldInput(field, $event)"
								>
									<ARadioButton
										v-for="item in field.options"
										:key="item.value"
										:value="item.value"
									>
										{{ item.label }}
									</ARadioButton>
								</ARadioGroup>

								<p class="field-hint">{{ field.hint }}</p>
							</template>
						</div>

						<dl class="property-list">
							<div v-for="item in metrics" :key="item.label">
								<dt>{{ item.label }}</dt>
								<dd>{{ item.value }}</dd>
							</div>
						</dl>

						<section v-if="chips.length" class="inner-block">
							<h3>对象约束</h3>
							<div class="chip-list">
								<ATag v-for="chip in chips" :key="chip.label" :color="chip.color">
									{{ chip.label }}
								</ATag>
							</div>
						</section>
					</div>

					<div v-else class="empty-state">
						<p>等待选择</p>
					</div>
				</ATabPane>

				<ATabPane key="business" tab="业务字段">
					<div class="empty-state">
						<p>业务字段区预留中</p>
					</div>
				</ATabPane>

				<ATabPane key="permission" tab="权限设置">
					<div class="empty-state">
						<p>权限配置区预留中</p>
					</div>
				</ATabPane>
			</ATabs>
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
.sidebar-header h2,
.field-hint,
.empty-state p,
.focus-label {
	margin: 0;
}

.eyebrow,
.focus-label {
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

.focus-card,
.sidebar-block,
.empty-state {
	border-radius: 22px;
	border: 1px solid var(--line-mid);
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02)),
		rgba(255, 255, 255, 0.03);
}

.focus-card {
	padding: 14px;
}

.focus-card h3 {
	margin: 8px 0 0;
	font-size: 1.08rem;
	color: var(--text-1);
}

.focus-card-empty {
	border-style: dashed;
}

.sidebar-block {
	padding: 14px;
}

.sidebar-tabs-block {
	display: flex;
	flex: 1 1 auto;
	min-height: 0;
	overflow: hidden;
}

.property-tabs {
	flex: 1 1 auto;
	min-height: 0;
	min-width: 0;
}

.tab-panel {
	display: grid;
	gap: 14px;
	min-width: 0;
}

.inner-block h3 {
	margin: 0 0 10px;
	font-size: 0.96rem;
	color: var(--text-1);
}

.property-list {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 10px;
	margin: 0;
}

.property-list div {
	padding: 12px;
	border-radius: 18px;
	background: rgba(255, 251, 245, 0.7);
	border: 1px solid rgba(35, 121, 109, 0.14);
}

.property-list dt {
	font-family: "IBM Plex Mono", monospace;
	font-size: 0.72rem;
	font-weight: 500;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: var(--text-3);
}

.property-list dd {
	margin: 8px 0 0;
	color: var(--text-1);
	font-weight: 600;
}

.form-field {
	display: grid;
	gap: 8px;
	min-width: 0;
}

.field-label {
	font-size: 0.86rem;
	font-weight: 700;
	color: var(--text-1);
}

.field-hint {
	font-size: 0.78rem;
	color: var(--text-3);
}

.empty-state {
	display: grid;
	gap: 8px;
	padding: 16px;
	color: var(--text-2);
}

.empty-state p {
	font-weight: 700;
	color: var(--text-1);
}

.chip-list {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

:deep(.property-tabs .ant-tabs-content-holder) {
	min-height: 0;
	min-width: 0;
	overflow: auto;
	padding-right: 2px;
}

:deep(.property-tabs .ant-tabs-nav) {
	margin-bottom: 12px;
}

:deep(.property-tabs .ant-tabs-tab) {
	padding-top: 4px;
	padding-bottom: 10px;
	font-weight: 700;
}

:deep(.property-tabs .ant-tabs-content),
:deep(.property-tabs .ant-tabs-tabpane),
:deep(.property-tabs .ant-form-item),
:deep(.property-tabs .ant-input),
:deep(.property-tabs .ant-input-affix-wrapper),
:deep(.property-tabs .ant-input-textarea),
:deep(.property-tabs .ant-input-textarea textarea),
:deep(.property-tabs .ant-select),
:deep(.property-tabs .ant-select-selector),
:deep(.property-tabs .ant-select-selection-search-input),
:deep(.property-tabs .ant-select-auto-complete) {
	width: 100%;
	min-width: 0;
	max-width: 100%;
	box-sizing: border-box;
}

@media (max-width: 1080px) {
	.sidebar {
		height: auto;
	}
}

@media (max-width: 680px) {
	.sidebar {
		padding: 14px;
		border-radius: 22px;
	}

	.property-list {
		grid-template-columns: 1fr;
	}
}
</style>
