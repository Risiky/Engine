<script setup>
import { computed, ref } from "vue";
import { AutoComplete } from "ant-design-vue";
import { getNodeFormSchema, SHARED_FONT_SIZE_OPTIONS } from "./nodeFormRegistry.js";

const props = defineProps({
	selectedNode: {
		type: Object,
		default: null,
	},
});

const emit = defineEmits([
	"node-text-change",
	"node-port-position-change",
	"node-font-size-change",
]);

const activeTab = ref("general");
const activeSchema = computed(() => getNodeFormSchema(props.selectedNode?.nodeType));
const hasSelectedSchema = computed(() => Boolean(props.selectedNode && activeSchema.value));

const fontSizeValue = computed(() => {
	const currentSize = Number(props.selectedNode?.fontSize);
	return Number.isFinite(currentSize) && currentSize > 0 ? `${currentSize}px` : "";
});

const fieldValue = (field) => {
	if (field.type === "fontSize") {
		return fontSizeValue.value;
	}

	return props.selectedNode?.[field.key];
};

const metrics = computed(() =>
	activeSchema.value?.metrics?.map((item) => ({
		label: item.label,
		value: item.value(props.selectedNode),
	})) || [],
);

const chips = computed(() => activeSchema.value?.chips || []);

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

function emitFieldChange(field, payload) {
	if (!field?.eventName) {
		return;
	}

	emit(field.eventName, payload);
}

function handleFieldInput(field, eventOrValue) {
	if (field.type === "text") {
		emitFieldChange(field, parseTextValue(eventOrValue));
		return;
	}

	if (field.type === "fontSize") {
		const parsed = parseFontSize(eventOrValue);
		if (parsed != null) {
			emitFieldChange(field, parsed);
		}
		return;
	}

	if (field.type === "radio") {
		emitFieldChange(field, eventOrValue?.target?.value);
	}
}
</script>

<template>
	<aside class="sidebar">
		<div class="sidebar-header">
			<p class="eyebrow">Properties</p>
			<h2>属性区</h2>
			<p class="copy">属性区基于节点类型注册表动态渲染，现有属性已归入常规属性页签，后续业务字段和权限字段可继续扩展。</p>
		</div>

		<section class="sidebar-block sidebar-tabs-block">
			<ATabs v-model:activeKey="activeTab" class="property-tabs">
				<ATabPane key="general" tab="常规属性">
					<div v-if="hasSelectedSchema" class="tab-panel">
						<h3>{{ activeSchema?.title || "节点属性" }}</h3>

						<div class="form-field">
							<p class="field-hint">{{ activeSchema.description }}</p>

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

								<AutoComplete
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

							<dl class="property-list">
								<div v-for="item in metrics" :key="item.label">
									<dt>{{ item.label }}</dt>
									<dd>{{ item.value }}</dd>
								</div>
							</dl>
						</div>

						<section v-if="chips.length" class="inner-block">
							<h3>节点约束</h3>
							<div class="chip-list">
								<ATag v-for="chip in chips" :key="chip.label" :color="chip.color">
									{{ chip.label }}
								</ATag>
							</div>
						</section>
					</div>

					<div v-else class="empty-state">
						<p>未选中节点</p>
						<span>点击开始节点、结束节点、条件节点、通用节点或连线后，这里会展示对应的常规属性表单。</span>
					</div>
				</ATabPane>

				<ATabPane key="business" tab="业务属性">
					<div class="empty-state">
						<p>暂无业务属性</p>
						<span>业务属性页签已预留，后续新增业务字段时可直接挂到这里，不影响现有常规属性结构。</span>
					</div>
				</ATabPane>

				<ATabPane key="permission" tab="权限设置">
					<div class="empty-state">
						<p>暂无权限设置</p>
						<span>权限设置页签已预留，可在后续补充查看、编辑、执行等权限相关配置。</span>
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
.sidebar-block h3,
.field-hint,
.empty-state p,
.empty-state span {
	margin: 0;
}

.eyebrow {
	font-size: 0.75rem;
	font-weight: 700;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	color: #0891b2;
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
	background: linear-gradient(180deg, rgba(236, 254, 255, 0.8), rgba(255, 255, 255, 0.88));
	border: 1px solid rgba(8, 145, 178, 0.08);
}

.sidebar-tabs-block {
	display: flex;
	flex: 1 1 auto;
	min-height: 0;
	overflow: hidden;
}

.sidebar-block h3 {
	font-size: 0.98rem;
	color: #0f172a;
}

.property-tabs {
	flex: 1 1 auto;
	min-height: 0;
	min-width: 0;
}

.tab-panel {
	display: grid;
	gap: 8px;
	min-width: 0;
}

.inner-block {
	padding-top: 2px;
}

.property-list {
	display: grid;
	gap: 6px;
	margin: 6px 0 0;
}

.property-list div {
	display: grid;
	gap: 4px;
	padding-bottom: 6px;
	border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.property-list div:last-child {
	padding-bottom: 0;
	border-bottom: none;
}

.property-list dt {
	font-size: 0.8rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: rgba(15, 23, 42, 0.52);
}

.property-list dd {
	margin: 0;
	color: #0f172a;
	font-weight: 600;
}

.form-field {
	display: grid;
	gap: 6px;
	margin-top: 6px;
	min-width: 0;
}

.field-label {
	font-size: 0.86rem;
	font-weight: 700;
	color: #0f172a;
}

.field-hint {
	font-size: 0.78rem;
	color: rgba(15, 23, 42, 0.6);
}

.empty-state {
	display: grid;
	gap: 6px;
	margin-top: 6px;
	padding: 8px;
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.72);
	color: rgba(15, 23, 42, 0.68);
}

.empty-state p {
	font-weight: 700;
	color: #0f172a;
}

.chip-list {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: 6px;
}

:deep(.property-tabs .ant-tabs-content-holder) {
	min-height: 0;
	min-width: 0;
	overflow: auto;
	padding-right: 2px;
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

:deep(.property-tabs .ant-radio-group) {
	max-width: 100%;
}

:deep(.property-tabs .ant-tabs-nav) {
	margin-bottom: 8px;
}

:deep(.property-tabs .ant-tabs-tab) {
	padding-top: 4px;
	padding-bottom: 8px;
	font-weight: 700;
}

@media (max-width: 1080px) {
	.sidebar {
		width: 100%;
		min-width: 0;
		height: auto;
	}
}
</style>
