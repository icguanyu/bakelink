<script setup>
import { ref, reactive, computed, nextTick, watch } from "vue";
import { Orders } from "@/api/orders";
import { ElMessage, ElNotification } from "element-plus";

const visible = ref(false);
const loading = ref(false);
const formRef = ref(null);
const currentSchedule = ref(null);

const emit = defineEmits(["created"]);

// 可用的產品選項（來自 schedule.items）
const availableProducts = computed(() => {
  if (!currentSchedule.value?.items) return [];
  return currentSchedule.value.items.map((item) => ({
    schedule_item_id: item.id,
    product_id: item.product_id,
    product_name: item.product_name,
    unit_price: item.unit_price,
    sales_limit: item.sales_limit,
  }));
});

// 根據 product_id 找到對應的 schedule_item
const findScheduleItemByProductId = (productId) => {
  return availableProducts.value.find((item) => item.product_id === productId);
};
const form = reactive({
  schedule_id: "",
  customer_name: "",
  customer_phone: "",
  pickup_time: "",
  note: "",
  payment_method: "cash",
  items: [
    {
      schedule_item_id: "",
      product_id: "",
      quantity: 1,
    },
  ],
});

const paymentOptions = [
  { label: "現金", value: "cash" },
  { label: "Line Pay", value: "linepay" },
];

const rules = {
  schedule_id: [{ required: true, message: "請選擇排程", trigger: "change" }],
  customer_name: [
    { required: true, message: "請輸入顧客姓名", trigger: "blur" },
  ],
  customer_phone: [
    { required: true, message: "請輸入顧客電話", trigger: "blur" },
  ],
  pickup_time: [
    { required: true, message: "請選擇取貨時間", trigger: "change" },
  ],
  payment_method: [
    { required: true, message: "請選擇付款方式", trigger: "change" },
  ],
};

const resetForm = () => {
  Object.assign(form, {
    schedule_id: currentSchedule.value?.id || "",
    customer_name: "",
    customer_phone: "",
    pickup_time: "",
    note: "",
    payment_method: "cash",
    items: [
      {
        schedule_item_id: "",
        product_id: "",
        quantity: 1,
      },
    ],
  });
  nextTick(() => {
    formRef.value?.clearValidate();
  });
};

const open = (schedule) => {
  if (!schedule || !schedule.items || schedule.items.length === 0) {
    ElMessage.warning("此排程尚無可訂購的產品");
    return;
  }
  currentSchedule.value = schedule;
  resetForm();
  visible.value = true;
};

const close = () => {
  visible.value = false;
};

// 當選擇產品時，自動設定對應的 schedule_item_id
const handleProductChange = (index) => {
  const item = form.items[index];
  if (item.product_id) {
    const scheduleItem = findScheduleItemByProductId(item.product_id);
    if (scheduleItem) {
      item.schedule_item_id = scheduleItem.schedule_item_id;
    }
  } else {
    item.schedule_item_id = "";
  }
};

const addItem = () => {
  form.items.push({
    schedule_item_id: "",
    product_id: "",
    quantity: 1,
  });
};

const removeItem = (index) => {
  if (form.items.length > 1) {
    form.items.splice(index, 1);
  } else {
    ElMessage.warning("至少需要一個訂單項目");
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning("請完整填寫必填欄位");
      return;
    }

    loading.value = true;
    try {
      const res = await Orders.Create(form);
      ElNotification({
        title: "成功",
        message: "訂單已建立成功",
        type: "success",
      });
      emit("created", res.data);
      close();
    } catch (err) {
      console.error("create order error", err);
      ElMessage.error(
        err.response?.data?.message || "建立訂單失敗，請稍後再試",
      );
    } finally {
      loading.value = false;
    }
  });
};

defineExpose({ open, close });
</script>

<template>
  <el-dialog
    v-model="visible"
    title="建立訂單"
    width="700px"
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="left"
      v-loading="loading"
    >
      <!-- 顧客資訊 -->
      <el-divider content-position="left">顧客資訊</el-divider>

      <el-form-item label="顧客姓名" prop="customer_name">
        <el-input
          v-model="form.customer_name"
          placeholder="請輸入顧客姓名"
          clearable
        />
      </el-form-item>

      <el-form-item label="顧客電話" prop="customer_phone">
        <el-input
          v-model="form.customer_phone"
          placeholder="例如：0912345678"
          clearable
          maxlength="10"
        />
      </el-form-item>

      <!-- 取貨資訊 -->
      <el-divider content-position="left">取貨資訊</el-divider>

      <el-form-item label="取貨時間" prop="pickup_time">
        <el-time-select
          v-model="form.pickup_time"
          placeholder="選擇時間"
          start="09:00"
          step="00:30"
          end="22:00"
        />
      </el-form-item>

      <el-form-item label="付款方式" prop="payment_method">
        <el-select
          v-model="form.payment_method"
          placeholder="選擇付款方式"
          style="width: 100%"
        >
          <el-option
            v-for="option in paymentOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="訂單備註" prop="note">
        <el-input
          v-model="form.note"
          type="textarea"
          :rows="3"
          placeholder="請輸入訂單備註（選填）"
        />
      </el-form-item>

      <!-- 訂單項目 -->
      <el-divider content-position="left">訂單項目</el-divider>

      <div v-for="(item, index) in form.items" :key="index" class="order-item">
        <el-form-item
          :prop="'items.' + index + '.product_id'"
          label="產品"
          label-width="60px"
          style="margin-bottom: 0; flex: 1"
          :rules="[
            { required: true, message: '請選擇產品', trigger: 'change' },
          ]"
        >
          <div class="item-row">
            <el-select
              v-model="item.product_id"
              placeholder="請選擇產品"
              clearable
              @change="handleProductChange(index)"
            >
              <el-option
                v-for="product in availableProducts"
                :key="product.product_id"
                :label="`${product.product_name} - $${product.unit_price}`"
                :value="product.product_id"
              />
            </el-select>
            <el-input-number
              v-model="item.quantity"
              :min="1"
              :max="99"
              style="width: 100%"
            />
          </div>
          <el-button
            type="danger"
            size="small"
            text
            @click="removeItem(index)"
            :disabled="form.items.length === 1"
            style="margin-left: 12px"
          >
            刪除
          </el-button>
        </el-form-item>
      </div>

      <el-button type="primary" plain style="width: 100%" @click="addItem">
        + 新增項目
      </el-button>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="close" :disabled="loading">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          建立訂單
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.order-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  .item-row {
    display: flex;
    gap: 12px;
    flex: 1;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-divider__text) {
  font-weight: 500;
  color: #409eff;
}
</style>
