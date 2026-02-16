<script setup>
import { computed, ref, watch } from "vue";
import SelectProduct from "@/components/select/SelectProduct.vue";

const props = defineProps({
  dateLabel: {
    type: String,
    default: "",
  },
  initialProducts: {
    type: Array,
    default: () => [],
  },
  initialStatus: {
    type: String,
    default: "draft",
  },
  initialStartTime: {
    type: String,
    default: "",
  },
  initialEndTime: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close", "save"]);

const statusOptions = [
  { label: "草稿", value: "draft" },
  { label: "預告", value: "announce" },
  { label: "收單中", value: "open" },
  { label: "已結單", value: "closed" },
  { label: "出貨結束", value: "shipped" },
];

const status = ref(props.initialStatus);
const startTime = ref(props.initialStartTime);
const endTime = ref(props.initialEndTime);
const selectedProducts = ref([]);
const selectedProductId = ref("");
const selectProductRef = ref(null);
const displayDateLabel = computed(() => {
  if (!props.dateLabel) return "";
  const parts = props.dateLabel.split("/");
  if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
  return props.dateLabel;
});

const resetFromProps = () => {
  status.value = props.initialStatus;
  startTime.value = props.initialStartTime;
  endTime.value = props.initialEndTime;
  selectedProducts.value = props.initialProducts.map((item) => ({
    id: item.id,
    name: item.name,
    max: item.max ?? null,
  }));
  selectedProductId.value = "";
};

watch(
  () => [
    props.initialProducts,
    props.initialStatus,
    props.initialStartTime,
    props.initialEndTime,
  ],
  resetFromProps,
  { immediate: true },
);

const excludeProductIds = computed(() => {
  return selectedProducts.value.map((item) => item.id);
});

const addProduct = () => {
  if (!selectProductRef.value) return;
  const product = selectProductRef.value.getProductById(
    selectedProductId.value,
  );
  if (!product) return;

  // 檢查產品是否已存在
  const isDuplicate = selectedProducts.value.some(
    (item) => item.id === product.id,
  );
  if (isDuplicate) {
    ElMessage.warning("此產品已在列表中");
    selectedProductId.value = "";
    return;
  }

  selectedProducts.value.push({
    id: product.id,
    name: product.name,
    max: 0,
  });
  selectedProductId.value = "";
};

const removeProduct = (id) => {
  selectedProducts.value = selectedProducts.value.filter(
    (item) => item.id !== id,
  );
};

const closeEditor = () => {
  emit("close");
};

const saveEditor = () => {
  emit("save", {
    status: status.value,
    startTime: startTime.value,
    endTime: endTime.value,
    products: selectedProducts.value.map((item) => ({
      id: item.id,
      name: item.name,
      max: item.max ?? null,
    })),
  });
};
</script>

<template>
  <div class="schedule-editor">
    <div class="editor-header">
      <div class="editor-title">編輯{{ displayDateLabel }}的排程</div>
      <div>
        <el-button class="editor-back" circle @click="closeEditor">
          <el-icon><Back /></el-icon>
        </el-button>
        <el-button
          class="editor-save"
          type="primary"
          circle
          @click="saveEditor"
        >
          <el-icon><Check /></el-icon>
        </el-button>
      </div>
    </div>
    <div class="editor-body">
      <div class="editor-section">
        <div class="section-title">排程資訊</div>
        <el-form class="schedule-form" label-position="top">
          <div class="field-row">
            <el-form-item label="日期" class="field">
              <div class="field-value">{{ dateLabel || "-" }}</div>
            </el-form-item>
            <el-form-item label="開單狀態" class="field">
              <el-select v-model="status" placeholder="選擇狀態">
                <el-option
                  v-for="option in statusOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </div>
          <div class="field-row">
            <el-form-item label="開單開始時間" class="field">
              <el-time-picker
                v-model="startTime"
                placeholder="開始時間"
                format="HH:mm"
                value-format="HH:mm"
              />
            </el-form-item>
            <el-form-item label="開單截止時間" class="field">
              <el-time-picker
                v-model="endTime"
                placeholder="截止時間"
                format="HH:mm"
                value-format="HH:mm"
              />
            </el-form-item>
          </div>
        </el-form>
      </div>

      <div class="editor-section">
        <div class="section-title">今日出爐產品</div>
        <div class="section-content">
          <div class="field-row add-row">
            <SelectProduct
              ref="selectProductRef"
              v-model="selectedProductId"
              class="product-select"
              :exclude-ids="excludeProductIds"
            />
            <el-button
              type="primary"
              icon="plus"
              circle
              :disabled="!selectedProductId"
              @click="addProduct"
            />
          </div>

          <div v-if="selectedProducts.length === 0" class="empty-products">
            尚未新增產品
          </div>
          <div v-else class="product-list">
            <div
              v-for="item in selectedProducts"
              :key="item.id"
              class="product-wrapper"
            >
              <div class="product-item">
                <div class="product-info">
                  <div class="product-name">{{ item.name }}</div>
                  <!-- <div class="product-id">{{ item.id }}</div> -->
                </div>
                <div class="product-limit">
                  <div class="field-label">可售上限</div>
                  <el-input-number
                    v-model="item.max"
                    :min="0"
                    :max="999"
                    size="small"
                  />
                </div>
              </div>
              <el-button
                type="danger"
                plain
                icon="delete"
                size="small"
                @click="removeProduct(item.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.schedule-editor {
  flex: 1;
  min-width: 420px;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  animation: slideInRight 0.3s ease;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.editor-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.editor-back {
  border: 1px solid #e2e8f0;
}

.editor-save {
  border: 1px solid #1d4ed8;
}

.editor-body {
  flex: 1;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-section {
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
}

.field-label {
  font-size: 12px;
  color: #64748b;
}

.field-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.add-row {
  grid-template-columns: 1fr auto;
  align-items: center;
}

.product-select {
  width: 100%;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-wrapper {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
}

.product-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-weight: 600;
  color: #1e293b;
}

.product-id {
  font-size: 12px;
  color: #94a3b8;
}

.product-limit {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.empty-products {
  color: #94a3b8;
  font-size: 13px;
  padding: 8px 0;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 1024px) {
  .schedule-editor {
    min-width: 100%;
    min-height: 300px;
  }

  .product-item {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    position: relative;
    .product-info {
      width: 100%;
    }
    .product-limit {
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }
}
</style>
