<script setup>
import { ref, reactive, computed, nextTick, watch } from "vue";
import { Orders } from "@/api/orders";
import { ElMessage, ElNotification } from "element-plus";
import SelectPaymentMethod from "@/components/select/SelectPaymentMethod.vue";

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
    image_url: item.image_url,
  }));
});

// 根據 product_id 找到對應的 schedule_item
const findScheduleItemByProductId = (productId) => {
  return availableProducts.value.find((item) => item.product_id === productId);
};

// 產品數量追蹤（key 為 product_id，value 為數量）
const productQuantities = ref({});

const form = reactive({
  schedule_id: "",
  customer_name: "",
  customer_phone: "",
  pickup_time: "",
  note: "",
  payment_method: "cash",
});

const paymentOptions = [];

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
    customer_name: "Nick_Test",
    customer_phone: "0933895891",
    pickup_time: "15:00",
    note: "",
    payment_method: "cash",
  });
  // 重置所有產品數量為 0
  productQuantities.value = {};
  availableProducts.value.forEach((product) => {
    productQuantities.value[product.product_id] = 0;
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

// 增加產品數量
const incrementQuantity = (productId) => {
  if (!productQuantities.value[productId]) {
    productQuantities.value[productId] = 0;
  }
  productQuantities.value[productId]++;
};

// 減少產品數量
const decrementQuantity = (productId) => {
  if (productQuantities.value[productId] > 0) {
    productQuantities.value[productId]--;
  }
};

// 獲取產品數量
const getQuantity = (productId) => {
  return productQuantities.value[productId] || 0;
};

// 計算已選產品總數
const selectedItemsCount = computed(() => {
  return Object.values(productQuantities.value).reduce(
    (sum, qty) => sum + qty,
    0,
  );
});

// 計算小計金額
const totalAmount = computed(() => {
  let total = 0;
  Object.keys(productQuantities.value).forEach((productId) => {
    const quantity = productQuantities.value[productId];
    if (quantity > 0) {
      const product = findScheduleItemByProductId(productId);
      if (product) {
        total += product.unit_price * quantity;
      }
    }
  });
  return total;
});

const handleSubmit = async () => {
  if (!formRef.value) return;

  // 檢查是否至少選擇了一個產品
  if (selectedItemsCount.value === 0) {
    ElMessage.warning("請至少選擇一個產品");
    return;
  }

  formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning("請完整填寫必填欄位");
      return;
    }

    // 構建訂單項目
    const items = [];
    Object.keys(productQuantities.value).forEach((productId) => {
      const quantity = productQuantities.value[productId];
      if (quantity > 0) {
        const product = findScheduleItemByProductId(productId);
        if (product) {
          items.push({
            schedule_item_id: product.schedule_item_id,
            product_id: productId,
            quantity: quantity,
          });
        }
      }
    });

    const submitData = {
      ...form,
      items: items,
    };

    console.log("提交數據:", submitData);

    loading.value = true;
    try {
      const res = await Orders.Create(submitData);
      ElNotification({
        title: "成功",
        message: "訂單已建立成功",
        type: "success",
      });
      emit("created", res.data);
      close();
    } catch (err) {
      console.error("create order error", err);
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
    >
      <!-- 顧客資訊 -->
      <!-- <el-divider content-position="left">顧客資訊</el-divider> -->

      <div class="form-row">
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
      </div>

      <!-- 取貨資訊 -->
      <!-- <el-divider content-position="left">取貨資訊</el-divider> -->

      <div class="form-row">
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
          <SelectPaymentMethod
            v-model="form.payment_method"
            placeholder="選擇付款方式"
          />
        </el-form-item>
      </div>

      <el-form-item label="訂單備註" prop="note">
        <el-input
          v-model="form.note"
          type="textarea"
          :rows="3"
          placeholder="請輸入訂單備註（選填）"
        />
      </el-form-item>

      <!-- 訂單項目 -->
      <el-divider content-position="left">
        訂單項目
        <span
          v-if="selectedItemsCount > 0"
          style="color: #409eff; margin-left: 8px"
        >
          (已選 {{ selectedItemsCount }} 項 | 小計
          {{ $formatPrice(totalAmount) }})
        </span>
      </el-divider>

      <div class="products-list">
        <div
          v-for="product in availableProducts"
          :key="product.product_id"
          class="product-item"
          :class="{ 'product-selected': getQuantity(product.product_id) > 0 }"
        >
          <div class="product-thumb">
            <img
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.product_name"
            />
          </div>
          <div class="product-info">
            <div class="product-name">{{ product.product_name }}</div>
            <div class="product-price">
              {{ $formatPrice(product.unit_price) }}
            </div>
          </div>
          <div class="quantity-control">
            <el-button
              :icon="'Minus'"
              circle
              :disabled="getQuantity(product.product_id) === 0"
              @click="decrementQuantity(product.product_id)"
            />
            <span class="quantity-display">{{
              getQuantity(product.product_id)
            }}</span>
            <el-button
              :icon="'Plus'"
              circle
              type="primary"
              plain
              @click="incrementQuantity(product.product_id)"
            />
          </div>
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="close" :disabled="loading">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ loading ? "建立中..." : "建立訂單" }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0px;
  }
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  &.product-selected {
    background: #eff6ff;
    border-color: #3b82f6;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
  }

  .product-thumb {
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    border-radius: 4px;
    background: linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%);
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .product-name {
    font-weight: 600;
    color: #1e293b;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .product-price {
    font-weight: 700;
    color: #1c2345;
  }

  .product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  .quantity-display {
    font-weight: 700;
    color: #1e293b;
    min-width: 28px;
    text-align: center;
  }
}

:deep(.el-divider__text) {
  font-weight: 500;
  color: #409eff;
}
</style>
