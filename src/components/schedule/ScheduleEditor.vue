<script setup>
import { ref, reactive, watch, computed } from "vue";
import dayjs from "dayjs";
import { Schedules } from "@/api/schedules";
import { scheduleStatusOptions } from "@/utils/constants";
import { ElNotification, ElMessage } from "element-plus";

const formRef = ref(null);
const statusOptions = scheduleStatusOptions;

const props = defineProps({
  schedule: {
    type: Object,
    default: () => ({
      schedule_date: "",
      status: "DRAFT",
      order_start_at: null,
      order_end_at: null,
      items: [],
    }),
  },
});

const emit = defineEmits(["close", "update"]);
const loading = ref(false);

// 分開的日期時間欄位
const orderStartDate = ref("");
const orderStartTime = ref("");
const orderEndDate = ref("");
const orderEndTime = ref("");

const form = reactive({
  id: props.schedule.id || null,
  schedule_date: props.schedule.schedule_date,
  status: props.schedule.status,
  order_start_at: props.schedule.order_start_at,
  order_end_at: props.schedule.order_end_at,
  items: props.schedule.items.map((item) => ({
    product_id: item.product_id,
    product_name: item.product_name,
    sales_limit: item.sales_limit,
  })),
});

const selectedProducts = ref([]);
const selectedProductId = ref("");
const selectProductRef = ref(null);

// 初始化分開的日期和時間
const initializeDateTimeFields = () => {
  if (form.order_start_at) {
    const startDateTime = dayjs(form.order_start_at);
    orderStartDate.value = startDateTime.format("YYYY-MM-DD");
    orderStartTime.value = startDateTime.format("HH:mm");
  } else {
    // 預設為今日 09:00
    orderStartDate.value = dayjs().format("YYYY-MM-DD");
    orderStartTime.value = "09:00";
  }
  if (form.order_end_at) {
    const endDateTime = dayjs(form.order_end_at);
    orderEndDate.value = endDateTime.format("YYYY-MM-DD");
    orderEndTime.value = endDateTime.format("HH:mm");
  } else {
    // 預設為開單日期和 00:00
    orderEndDate.value = form.schedule_date || "";
    orderEndTime.value = "00:00";
  }
};

watch(
  () => props.schedule,
  (val) => {
    console.log("schedule change:", val);
    Object.assign(form, val);
    initializeDateTimeFields();
  },
  { immediate: true, deep: true },
);

// 監聽截止日期變化，若時間未填則預設為 00:00
watch(orderEndDate, (newDate) => {
  if (newDate && !orderEndTime.value) {
    orderEndTime.value = "00:00";
  }
});

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
    product_name: product.name,
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

const beforeSave = (formRef) => {
  const isEmptyProducts = form.items.length === 0;
  formRef.validate((valid) => {
    if (valid && !isEmptyProducts) {
      saveEditor();
    } else {
      ElMessage.error("請填寫完整的排程資訊，並至少新增一個產品");
    }
  });
};

const saveEditor = async () => {
  // 組合日期和時間
  if (orderStartDate.value && orderStartTime.value) {
    form.order_start_at = `${orderStartDate.value} ${orderStartTime.value}`;
  }
  if (orderEndDate.value) {
    // 若未填時間，預設為當天 00:00
    const endTime = orderEndTime.value || "00:00";
    form.order_end_at = `${orderEndDate.value} ${endTime}`;
  }

  loading.value = true;
  try {
    if (form.id) {
      await Schedules.Update(form.id, form);
    } else {
      await Schedules.Create(form);
    }
    ElNotification({
      title: "成功",
      message: `排程已${form.id ? "更新" : "建立"}成功`,
      type: "success",
    });
    if (!form.id) {
      closeEditor();
    }
    emit("update");
  } catch (error) {
    console.log("catch:", error);
  } finally {
    loading.value = false;
  }
};

const deleteSchedule = async () => {
  if (!form.id) {
    ElMessage.error("無法刪除尚未建立的排程");
    return;
  }
  ElMessageBox.confirm("確定要刪除這個排程嗎？", "警告", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      loading.value = true;
      try {
        await Schedules.Delete(form.id);
        ElNotification({
          title: "成功",
          message: "排程已刪除",
          type: "success",
        });
        closeEditor();
        emit("update");
      } catch (error) {
        console.log("catch:", error);
      } finally {
        loading.value = false;
      }
    })
    .catch(() => {
      // 取消刪除
    });
};
</script>

<template>
  <div class="schedule-editor">
    <div class="editor-header">
      <div class="editor-title">
        編輯 {{ dayjs(form.schedule_date).format("MM-DD") }} 的排程
      </div>
      <div>
        <el-button
          class="editor-back"
          icon="back"
          circle
          @click="closeEditor"
        />
        <el-button
          v-if="form.id"
          circle
          type="danger"
          plain
          icon="delete"
          @click="deleteSchedule"
        />
        <el-button
          class="editor-save"
          type="primary"
          circle
          :loading="loading"
          @click="beforeSave(formRef)"
          icon="Check"
        />
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
            <el-form-item label="開單日期" class="field" prop="schedule_date">
              <div class="field-value">
                {{ form.schedule_date }}
              </div>
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

          <el-form-item label="開單開始時間" class="field" required>
            <div class="datetime-inputs">
              <el-date-picker
                v-model="orderStartDate"
                type="date"
                placeholder="選擇日期"
                value-format="YYYY-MM-DD"
              />
              <el-time-select
                v-model="orderStartTime"
                placeholder="選擇時間"
                start="00:00"
                step="00:30"
                end="23:30"
              />
            </div>
          </el-form-item>
          <el-form-item label="開單截止時間" class="field" required>
            <div class="datetime-inputs">
              <el-date-picker
                v-model="orderEndDate"
                type="date"
                placeholder="選擇日期"
                value-format="YYYY-MM-DD"
              />
              <el-time-select
                v-model="orderEndTime"
                placeholder="選擇時間"
                start="00:00"
                step="00:30"
                end="23:30"
              />
            </div>
          </el-form-item>
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
                  <div class="product-name">{{ item.product_name }}</div>
                  <!-- <div class="product-id">{{ item.id }}</div> -->
                </div>
                <div class="product-limit">
                  <div class="field-label">可售</div>
                  <el-input-number
                    v-model="item.sales_limit"
                    :min="0"
                    :max="999"
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

.datetime-inputs {
  display: flex;
  gap: 8px;
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
  align-items: center;
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

  .datetime-inputs {
    grid-template-columns: 1fr;
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
