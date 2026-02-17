<script setup>
import { Schedules } from "@/api/schedules";
import { scheduleStatusOptions } from "@/utils/constants";
import { ElNotification } from "element-plus";
const statusOptions = scheduleStatusOptions;

const props = defineProps({
  dateLabel: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close", "save"]);
const loading = ref(false);
const form = reactive({
  schedule_date: props.dateLabel,
  status: "DRAFT",
  order_start_at: null,
  order_end_at: null,
  items: [],
});

const selectedProducts = ref([]);
const selectedProductId = ref("");
const selectProductRef = ref(null);

watch(
  () => props.dateLabel,
  (val) => {
    console.log("date change:", val);
  },
  { immediate: true },
);

const excludeProductIds = computed(() => {
  return form.items.map((item) => item.product_id);
});

const addProduct = () => {
  if (!selectProductRef.value) return;
  const product = selectProductRef.value.getProductById(
    selectedProductId.value,
  );
  if (!product) return;

  // 檢查產品是否已存在
  const isDuplicate = form.items.some((item) => item.product_id === product.id);
  if (isDuplicate) {
    ElMessage.warning("此產品已在列表中");
    selectedProductId.value = "";
    return;
  }

  form.items.push({
    product_id: product.id,
    name: product.name,
    sales_limit: 0,
  });
  selectedProductId.value = "";
};

const removeProduct = (id) => {
  form.items = form.items.filter((item) => item.product_id !== id);
};

const closeEditor = () => {
  emit("close");
};

const saveEditor = async () => {
  loading.value = true;
  try {
    await Schedules.Create(form);
    ElNotification({
      title: "成功",
      message: "排程已儲存",
      type: "success",
    });
    closeEditor()
  } catch (error) {
    console.log("catch:", error);
  } finally {
    loading.value = false;
  }
};

const displayDateLabel = computed(() => {
  if (!props.dateLabel) return "";
  const parts = props.dateLabel.split("/");
  if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
  return props.dateLabel;
});
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
          :loading="loading"
          @click="saveEditor"
        >
          <el-icon><Check /></el-icon>
        </el-button>
      </div>
    </div>
    <div class="editor-body" v-loading="loading">
      <div class="editor-section">
        <div class="section-title">排程資訊</div>
        <el-form
          :model="form"
          ref="formRef"
          class="schedule-form"
          label-position="top"
        >
          <div class="field-row">
            <el-form-item label="日期" class="field">
              <div class="field-value">{{ dateLabel || "-" }}</div>
            </el-form-item>
            <el-form-item label="開單狀態" class="field" prop="status">
              <el-select v-model="form.status" placeholder="選擇狀態">
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
            <el-form-item
              label="開單開始時間"
              class="field"
              prop="order_start_at"
            >
              <el-date-picker
                v-model="form.order_start_at"
                type="datetime"
                placeholder="開始時間"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
            <el-form-item
              label="開單截止時間"
              class="field"
              prop="order_end_at"
            >
              <el-date-picker
                v-model="form.order_end_at"
                type="datetime"
                placeholder="截止時間"
                value-format="YYYY-MM-DD HH:mm:ss"
                :default-time="new Date(2000, 1, 1, 12, 0, 0)"
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

          <div v-if="form.items.length === 0" class="empty-products">
            尚未新增產品
          </div>
          <div v-else class="product-list">
            <div
              v-for="item in form.items"
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
                    v-model="item.sales_limit"
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
                @click="removeProduct(item.product_id)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- <pre>{{ form }}</pre> -->
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
