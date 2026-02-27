<script setup>
import { ref, computed, reactive } from "vue";
import { ElMessageBox, ElMessage, ElNotification } from "element-plus";
import { Orders } from "@/api/orders";

const deleteLoading = ref(false);
const updateLoading = ref(false);

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
  availableItems: {
    // 該行程可以下訂的產品
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["delete-order", "update-order"]);
const visible = ref(false);

// 訂單資訊和項目字段
const form = reactive({
  items: [],
  customer_name: "",
  customer_phone: "",
  pickup_time: "",
  note: "",
  payment_method: "",
});
const formRef = ref(null);

// 表單驗證規則
const rules = {
  customer_name: [
    { required: true, message: "請輸入客戶名稱", trigger: "blur" },
  ],
  customer_phone: [
    { required: true, message: "請輸入客戶電話", trigger: "blur" },
  ],
  pickup_time: [
    { required: true, message: "請選擇取件時間", trigger: "change" },
  ],
  payment_method: [
    { required: true, message: "請選擇付款方式", trigger: "change" },
  ],
};

// 從 order 初始化表單數據
const initializeForm = () => {
  form.items = props.order?.items
    ? props.order.items.map((item) => ({ ...item }))
    : [];
  form.customer_name = props.order?.customer_name || "";
  form.customer_phone = props.order?.customer_phone || "";
  form.pickup_time = props.order?.pickup_time || "";
  form.note = props.order?.note || "";
  form.payment_method = props.order?.payment_method || "";
};

// 初始化
initializeForm();

// 按 productId 取得數量
const getItemQuantity = (productId) => {
  return form.items.find((item) => item.product_id === productId)?.quantity || 0;
};

// 按 productId 更新數量
const updateProductQuantity = (productId, delta) => {
  const item = form.items.find((item) => item.product_id === productId);
  if (!item) return;
  
  const newQuantity = item.quantity + delta;
  if (newQuantity > 0) {
    item.quantity = newQuantity;
  } else if (newQuantity === 0) {
    deleteProductByID(productId);
  }
};

// 按 productId 刪除產品
const deleteProductByID = (productId) => {
  const index = form.items.findIndex((item) => item.product_id === productId);
  if (index > -1) {
    form.items.splice(index, 1);
  }
};

// 按 productId 新增或更新產品
const toggleProduct = (productId) => {
  const product = props.availableItems.find(
    (item) => item.product_id === productId,
  );
  if (!product) return;

  const existingItem = form.items.find(
    (item) => item.product_id === productId,
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    form.items.push({
      product_id: product.product_id,
      product_name: product.product_name,
      unit_price: product.unit_price,
      image_url: product.image_url,
      quantity: 1,
    });
  }
};

const handleConfirm = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
  } catch (err) {
    ElMessage.error("請填寫所有必填項");
    return;
  }

  if (!form.items.some((item) => item.quantity > 0)) {
    ElMessage.error("請至少選擇一個產品");
    return;
  }

  updateLoading.value = true;
  try {
    await Orders.Update(props.order.id, form);
    ElNotification({
      title: "成功",
      message: "訂單已更新",
      type: "success",
    });
    visible.value = false;
    emit("update-order", form);
  } catch (err) {
    console.error("update order error", err);
    ElNotification({
      title: "錯誤",
      message: err.response?.data?.message || "更新訂單失敗，請稍後再試",
      type: "error",
    });
  } finally {
    updateLoading.value = false;
  }
};

// 刪除訂單
const handleDeleteOrder = async () => {
  ElMessageBox.confirm(`確定要刪除訂單嗎？此操作無法恢復。`, "刪除確認", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      deleteLoading.value = true;
      try {
        await Orders.Delete(props.order.id);
        ElNotification({
          title: "成功",
          message: "訂單已刪除",
          type: "success",
        });
        visible.value = false;
        emit("delete-order");
      } catch (err) {
        console.error("delete order error", err);
        ElNotification({
          title: "錯誤",
          message: err.response?.data?.message || "刪除訂單失敗，請稍後再試",
          type: "error",
        });
      } finally {
        deleteLoading.value = false;
      }
    })
    .catch(() => {
      // 用戶取消刪除
    });
};

const total_amount = computed(() => {
  return form.items.reduce(
    (total, item) => total + item.unit_price * item.quantity,
    0,
  );
});

defineExpose({ visible });
</script>

<template>
  <el-dialog
    center
    v-model="visible"
    title="訂購明細"
    width="75%"
    class="order-detail-dialog"
  >
    <div class="order-detail">
      <!-- 客戶資訊編輯 -->
      <div class="order-info-section">
        <div class="section-header">
          <h3>客戶資訊</h3>
        </div>
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          class="form-group"
          label-position="left"
        >
          <div class="form-row">
            <el-form-item
              label="客戶名稱"
              prop="customer_name"
              class="form-item"
            >
              <el-input
                v-model="form.customer_name"
                placeholder="請輸入客戶名稱"
              />
            </el-form-item>
            <el-form-item
              label="客戶電話"
              prop="customer_phone"
              class="form-item"
            >
              <el-input
                v-model="form.customer_phone"
                placeholder="請輸入客戶電話"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="取件時間" prop="pickup_time" class="form-item">
              <el-time-select
                v-model="form.pickup_time"
                placeholder="選擇時間"
                start="09:00"
                step="00:30"
                end="22:00"
              />
            </el-form-item>
            <el-form-item
              label="付款方式"
              prop="payment_method"
              class="form-item"
            >
              <el-select
                v-model="form.payment_method"
                placeholder="選擇付款方式"
              >
                <el-option label="現金" value="cash" />
                <el-option label="信用卡" value="credit_card" />
                <el-option label="轉帳" value="transfer" />
              </el-select>
            </el-form-item>
          </div>
          <div class="form-row full-width">
            <el-form-item label="備註" prop="note" class="form-item full-width">
              <el-input
                v-model="form.note"
                type="textarea"
                :rows="3"
                placeholder="請輸入備註"
              />
            </el-form-item>
          </div>
        </el-form>
      </div>

      <!-- 訂購項目列表 -->
      <div class="items-section">
        <div class="section-header">
          <h3>請選擇當天出爐產品</h3>
        </div>

        <div class="items-list">
          <div
            v-for="product in availableItems"
            :key="product.product_id"
            class="item-card"
            :class="{ 'not-selected': !getItemQuantity(product.product_id) }"
          >
            <div class="item-thumb">
              <img v-if="product.image_url" :src="product.image_url" :alt="product.product_name" />
            </div>
            <div class="item-name">{{ product.product_name }}</div>
            <div class="item-price">{{ $formatPrice(product.unit_price) }}</div>
            
            <template v-if="getItemQuantity(product.product_id) > 0">
              <div class="quantity-control">
                <el-button
                  :icon="'Minus'"
                  circle
                  size="small"
                  @click="updateProductQuantity(product.product_id, -1)"
                />
                <span class="quantity-display">{{ getItemQuantity(product.product_id) }}</span>
                <el-button
                  :icon="'Plus'"
                  circle
                  size="small"
                  type="primary"
                  plain
                  @click="updateProductQuantity(product.product_id, 1)"
                />
              </div>
            </template>
            <el-button
              v-else
              type="primary"
              size="small"
              @click="toggleProduct(product.product_id)"
            >
              新增
            </el-button>
          </div>
        </div>

        <div v-if="availableItems.length === 0" class="no-items">沒有可訂購的產品</div>
      </div>

      <!-- 總金額 -->
      <div class="total-section">
        <div class="total-row">
          <span class="label">訂單總計：</span>
          <span class="amount">${{ total_amount }}</span>
        </div>
      </div>
    </div>

    <!-- 對話框按鈕 -->
    <template #footer>
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <el-button
          type="danger"
          plain
          @click="handleDeleteOrder"
          :loading="deleteLoading"
        >
          刪除訂單
        </el-button>
        <div>
          <el-button @click="visible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleConfirm"
            :loading="updateLoading"
            >確認</el-button
          >
        </div>
      </div>
    </template>

    <!-- 選擇商品隐藏 不使用 -->
  </el-dialog>
</template>

<style scoped lang="scss">
.order-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .order-info-section {
    .section-header {
      margin-bottom: 15px;

      h3 {
        margin: 0;
        font-size: 16px;
        color: #1e293b;
        font-weight: 600;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0;

      .form-row {
        display: flex;
        gap: 20px;

        &.full-width {
          width: 100%;
        }

        .form-item {
          flex: 1;

          &.full-width {
            flex: 1;
          }

          label {
            font-size: 14px;
            font-weight: 500;
            color: #334155;
          }

          .el-input,
          .el-date-picker,
          .el-select,
          .el-textarea {
            width: 100%;
          }
        }
      }
    }

    :deep(.el-form) {
      .el-form-item {
        margin-bottom: 12px;

        &__label {
          color: #334155;
          font-weight: 500;
        }
      }
    }
  }
  .items-section {
    border-top: 1px solid #e2e8f0;
    padding-top: 15px;
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      h3 {
        margin: 0;
        font-size: 16px;
        color: #1e293b;
        font-weight: 600;
      }
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .item-card {
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

        &.not-selected {
          opacity: 0.6;
          background: #f1f5f9;

          &:hover {
            opacity: 0.8;
            background: #e0e7ff;
            border-color: #a5b4fc;
          }
        }

        .item-thumb {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
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

        .item-name {
          flex: 1;
          font-weight: 600;
          color: #1e293b;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-price {
          font-weight: 700;
          color: #1c2345;
          min-width: 70px;
          text-align: right;
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
      }
    }

    .no-items {
      text-align: center;
      padding: 20px;
      color: #94a3b8;
      font-size: 14px;
    }
  }

  .total-section {
    border-top: 1px solid #e2e8f0;
    padding-top: 12px;

    .total-row {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;

      .label {
        color: #64748b;
        font-size: 15px;
        font-weight: 500;
      }

      .amount {
        color: #1e293b;
        font-weight: 600;
        font-size: 20px;
      }
    }
  }
}

@media (max-width: 768px) {
  .order-detail {
    gap: 12px;

    .order-info-section {
      .section-header {
        margin-bottom: 10px;

        h3 {
          font-size: 15px;
        }
      }

      .form-group {
        .form-row {
          flex-direction: column;
          gap: 0;

          &.full-width {
            width: 100%;
          }

          .form-item {
            width: 100%;
          }
        }
      }

      :deep(.el-form) {
        .el-form-item {
          margin-bottom: 12px;

          &__label {
            font-size: 13px;
            padding-bottom: 4px;
          }

          .el-input__inner,
          .el-textarea__inner {
            font-size: 14px;
          }
        }
      }
    }

    .items-section {
      .section-header {
        margin-bottom: 12px;
      }

      .items-list {
        gap: 6px;

        .item-card {
          padding: 8px 12px;

          .item-thumb {
            width: 36px;
            height: 36px;
          }

          .item-name {
            font-size: 14px;
          }

          .item-price {
            min-width: 60px;
            font-size: 14px;
          }

          .quantity-control {
            gap: 6px;

            .el-button {
              width: 28px;
              height: 28px;
              padding: 0 !important;
            }

            .quantity-display {
              min-width: 24px;
              font-size: 14px;
            }
          }

          .el-button {
            padding: 4px 8px;
          }
        }
      }

      .no-items {
        padding: 15px;
      }
    }

    .total-section {
      padding-top: 10px;

      .total-row {
        gap: 10px;
      }
    }
  }
}
</style>
