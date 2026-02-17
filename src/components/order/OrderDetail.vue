<script setup>
import { ref, computed } from "vue";
import SelectProduct from "../select/SelectProduct.vue";

const showSelectProduct = ref(false);
const selectProductRef = ref(null);
const selectedProductId = ref("");

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "update-items"]);
const visible = ref(false);

// 本地狀態管理訂購項目
const items = ref([]);

// 從 order 初始化 items
const initializeItems = () => {
  items.value = props.order?.items
    ? props.order.items.map((item) => ({ ...item }))
    : [];
};

// 初始化
if (props.order?.items) {
  initializeItems();
}

// 編輯數量
const updateQuantity = (index, newQuantity) => {
  if (newQuantity > 0) {
    items.value[index].quantity = parseInt(newQuantity);
  }
};

// 刪除項目
const deleteItem = (index) => {
  items.value.splice(index, 1);
};

// 新增訂購項目
const addProduct = () => {
  if (!selectedProductId.value || !selectProductRef.value) return;

  const product = selectProductRef.value.getProductById(
    selectedProductId.value,
  );
  if (!product) return;

  const existingItem = items.value.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    items.value.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }

  selectedProductId.value = "";
  showSelectProduct.value = false;
};

// 計算總金額
const totalAmount = computed(() => {
  return items.value.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
});

const handleClose = () => {
  visible.value = false;
  emit("close");
};

const handleConfirm = () => {
  emit("update-items", items.value);
  visible.value = false;
  emit("close");
};

defineExpose({ visible });
</script>

<template>
  <el-dialog
    center
    v-model="visible"
    title="訂購明細"
    width="75%"
    @close="handleClose"
    class="order-detail-dialog"
  >
    <div class="order-detail">
      <!-- 訂購項目列表 -->
      <div class="items-section">
        <div class="section-header">
          <h3>訂購項目</h3>
          <el-button type="success" @click="showSelectProduct = true">
            新增項目
          </el-button>
        </div>

        <div v-if="items.length > 0" class="items-table">
          <div v-for="(item, idx) in items" :key="idx" class="item-card">
            <div class="item-image-section">
              <!-- 圖片佔位符 -->
            </div>
            <div class="item-name-section">
              {{ item.name }}
            </div>
            <div class="item-price-section">
              <span class="label">單價:</span>
              <span class="price">${{ item.price }}</span>
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
          <span class="amount">${{ totalAmount }}</span>
        </div>
      </div>

      <!-- 新增產品區域 -->
      <div v-if="showSelectProduct" class="add-product-section">
        <div class="add-product-header">
          <h4>新增產品</h4>
          <el-button text @click="showSelectProduct = false">關閉</el-button>
        </div>
        <div class="add-product-row">
          <SelectProduct
            ref="selectProductRef"
            v-model="selectedProductId"
            class="flex-1"
          />
          <el-button
            type="primary"
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
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">確認</el-button>
    </template>

    <!-- 選擇商品隐藏 不使用 -->
  </el-dialog>
</template>

<style scoped lang="scss">
.order-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .items-section {
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
