<script setup>
import { ref, computed, reactive } from "vue";
import { ElMessageBox, ElMessage, ElNotification } from "element-plus";
import { Orders } from "@/api/orders";

const selectedProductId = ref("");
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

// 編輯數量
const updateQuantity = (index, newQuantity) => {
  if (newQuantity > 0) {
    form.items[index].quantity = parseInt(newQuantity);
  }
};

// 刪除項目
const deleteItem = (index) => {
  form.items.splice(index, 1);
};

// 新增訂購項目
const addProduct = () => {
  if (!selectedProductId.value) return;

  const product = props.availableItems.find(
    (item) => item.product_id === selectedProductId.value,
  );
  if (!product) return;

  const existingItem = form.value.items.find(
    (item) => item.product_id === product.product_id,
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    form.value.items.push({
      product_id: product.product_id,
      product_name: product.product_name,
      unit_price: product.unit_price,
      quantity: 1,
    });
  }

  selectedProductId.value = "";
};

const handleConfirm = async () => {
  // 驗證表單
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
  } catch (err) {
    ElMessage.error("請填寫所有必填項");
    return;
  }

  // 驗證訂購項目
  if (!form.items || form.items.length === 0) {
    ElMessage.error("請至少新增一個訂購項目");
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
      <!-- 訂單資訊編輯 -->
      <div class="order-info-section">
        <div class="section-header">
          <h3>訂單資訊</h3>
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
                placeholder="請輸入備註信息"
              />
            </el-form-item>
          </div>
        </el-form>
      </div>

      <!-- 訂購項目列表 -->
      <div class="items-section">
        <div class="section-header">
          <h3>訂購項目</h3>
        </div>

        <div v-if="form.items.length > 0" class="items-table">
          <div v-for="(item, idx) in form.items" :key="idx" class="item-card">
            <!-- <div class="item-image-section"></div> -->
            <!-- 圖片佔位符 -->
            <div class="item-name-section">
              {{ item.product_name }}
            </div>
            <div class="item-price-section">
              <span class="label">單價:</span>
              <span class="price">${{ item.unit_price }}</span>
            </div>
            <!-- <div class="item-subtotal-section">
              <span class="label">小計:</span>
              <span class="subtotal">${{ item.price * item.quantity }}</span>
            </div> -->
            <div class="item-quantity-section">
              <span class="quantity-label">數量:</span>
              <el-input-number
                v-model="item.quantity"
                :min="1"
                :max="999"
                @change="(val) => updateQuantity(idx, val)"
              />
            </div>
            <el-button
              size="small"
              icon="delete"
              type="danger"
              plain
              @click="deleteItem(idx)"
            />
          </div>
        </div>

        <div v-else class="no-items">沒有訂購項目</div>
      </div>

      <!-- 總金額 -->
      <div class="total-section">
        <div class="total-row">
          <span class="label">訂單總計：</span>
          <span class="amount">${{ total_amount }}</span>
        </div>
      </div>

      <!-- 新增產品區域 -->
      <div class="add-product-section">
        <div class="add-product-header">
          <h4>新增產品</h4>
        </div>
        <div class="add-product-row">
          <el-select
            v-model="selectedProductId"
            placeholder="選擇產品"
            class="flex-1"
          >
            <el-option
              v-for="item in availableItems"
              :key="item.product_id"
              :label="`${item.product_name} - $${item.unit_price}`"
              :value="item.product_id"
            />
          </el-select>
          <el-button
            type="success"
            :disabled="!selectedProductId"
            @click="addProduct"
          >
            新增
          </el-button>
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

    .items-table {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .item-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 4px;

        .item-image-section {
          flex-shrink: 0;
          width: 50px;
          height: 50px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #cbd5e1;
          font-size: 12px;
        }

        .item-name-section {
          flex: 1;
          font-size: 16px;
          font-weight: 500;
          color: #334155;
        }

        .item-price-section {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;

          .label {
            color: #64748b;
          }

          .price {
            color: #1e293b;
            font-weight: 500;
          }
        }

        .item-subtotal-section {
          display: flex;
          align-items: center;
          gap: 6px;

          .label {
            color: #64748b;
          }

          .subtotal {
            color: #1e293b;
            font-weight: 600;
          }
        }

        .item-quantity-section {
          display: flex;
          align-items: center;
          gap: 6px;

          .quantity-label {
            color: #64748b;
            white-space: nowrap;
          }
        }

        .el-button {
          flex-shrink: 0;
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

  .add-product-section {
    border-top: 1px solid #e2e8f0;
    padding-top: 15px;

    .add-product-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h4 {
        margin: 0;
        font-size: 14px;
        color: #1e293b;
        font-weight: 600;
      }
    }

    .add-product-row {
      display: flex;
      gap: 10px;

      .el-select {
        flex: 1;
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

      .items-table {
        gap: 6px;

        .item-card {
          flex-wrap: wrap;
          gap: 6px;
          padding: 10px;

          .item-image-section {
            display: none;
          }

          .item-name-section {
            flex: 1;
            min-width: 100%;
          }

          .item-price-section {
            order: 1;
          }

          .item-subtotal-section {
            display: none;
          }

          .item-quantity-section {
            order: 2;
            margin-left: auto;

            .quantity-label {
              display: none;
            }
          }

          .el-button {
            order: 3;

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

    .add-product-section {
      padding-top: 12px;

      .add-product-header {
        margin-bottom: 10px;

        h4 {
          font-size: 13px;
        }
      }

      .add-product-row {
        gap: 8px;
        flex-direction: column;

        .el-button {
          width: 100%;
        }
      }
    }
  }
}
</style>
