<script setup>
import { ref, computed } from "vue";
import dayjs from "dayjs";
import { orderStatusOptions } from "@/utils/constants";
import OrderDetail from "./OrderDetail.vue";

const orderDetail = ref(null);

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
  viewMode: {
    type: String,
    required: true,
  },
});

const statusOptions = orderStatusOptions;

const emit = defineEmits(["open", "status-change"]);

const getStatusLabel = (status) => {
  const map = {
    ordered: "已下單",
    completed: "已完成",
    cancelled: "已取消",
  };
  return map[status] || status;
};

const getStatusColor = (status) => {
  const option = statusOptions.find((o) => o.value === status);
  return option?.color || "#6b7280";
};

const getPaymentLabel = (payment) => {
  const map = {
    cash: "現金",
    bank: "匯款",
    linepay: "Line Pay",
    card: "信用卡",
  };
  return map[payment] || payment;
};

const isToday = (datetime) => {
  return dayjs(datetime).isSame(dayjs(), "day");
};

const orderIdParts = computed(() => {
  const id = props.order?.id || "";
  const lastThree = id.slice(-3);
  const prefix = id.slice(0, -3);
  return { prefix, lastThree };
});

const openOrder = () => {
  emit("open", props.order.id);
};

const updateStatus = (status) => {
  emit("status-change", props.order, status);
};

const handleUpdateItems = (updatedItems) => {
  // 更新訂單中的訂購項目
  props.order.items = updatedItems;
  // 重新計算總金額
  props.order.totalAmount = updatedItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
};
</script>

<template>
  <div
    class="order-card"
    :class="{ 'simple-mode': viewMode === 'simple' }"
    @click="openOrder"
  >
    <!-- 订单顶部装饰 -->
    <div class="order-ticket-top"></div>

    <!-- 訂單頭部 -->
    <div class="order-header">
      <div class="order-id-section">
        <div class="order-label">訂單編號</div>
        <div class="order-id">
          <span class="id-prefix">{{ orderIdParts.prefix }}</span>
          <span class="id-highlight">{{ orderIdParts.lastThree }}</span>
        </div>
      </div>
      <div
        class="order-status-stamp"
        :style="{
          borderColor: getStatusColor(order.status),
          color: getStatusColor(order.status),
        }"
      >
        <span>{{ getStatusLabel(order.status) }}</span>
      </div>
    </div>

    <!-- 客戶資訊 -->
    <div class="order-customer">
      <div class="info-row">
        <div class="info-label">
          <el-icon><User /></el-icon>
          <span>顧客</span>
        </div>
        <span class="info-value">{{ order.customerName }}</span>
      </div>
      <div v-if="viewMode === 'detailed'" class="info-row">
        <div class="info-label">
          <el-icon><Phone /></el-icon>
          <span>電話</span>
        </div>
        <span class="info-value">{{ order.phone }}</span>
      </div>
      <div v-if="viewMode === 'detailed'" class="info-row">
        <div class="info-label">
          <el-icon><AlarmClock /></el-icon>
          <span>取貨</span>
        </div>
        <span class="info-value pickup-time">
          <span v-if="!isToday(order.pickupTime)" class="pickup-date">{{
            dayjs(order.pickupTime).format("MM/DD")
          }}</span>
          {{ dayjs(order.pickupTime).format("HH:mm") }}
        </span>
      </div>
    </div>

    <!-- 分隔線 -->
    <div class="order-divider"></div>

    <!-- 訂購項目 -->
    <div v-if="viewMode === 'detailed'" class="order-items">
      <div class="items-header">
        <span>訂購明細</span>
        <el-button
          type="primary"
          size="small"
          @click="orderDetail.visible = true"
          >詳細</el-button
        >
      </div>
      <div class="items-list">
        <div v-for="(item, idx) in order.items" :key="idx" class="order-item">
          <span class="item-name">{{ item.name }}</span>
          <span class="item-quantity">× {{ item.quantity }}</span>
          <span class="item-price">${{ item.price * item.quantity }}</span>
        </div>
        <pre>{{ order.items }}</pre>
      </div>
    </div>

    <!-- 備註 -->
    <div v-if="viewMode === 'detailed' && order.note" class="order-note">
      <div class="note-label">
        <el-icon><Document /></el-icon>
        <span>備註</span>
      </div>
      <div class="note-content">{{ order.note }}</div>
    </div>

    <!-- 分隔線 -->
    <!-- <div class="order-divider dashed"></div> -->

    <!-- 訂單底部 -->
    <div class="order-footer">
      <div class="footer-info">
        <div v-if="viewMode === 'detailed'" class="payment-method">
          <span class="label">付款方式</span>
          <el-tag size="small" type="info">{{
            getPaymentLabel(order.payment)
          }}</el-tag>
        </div>
      </div>
      <div class="order-total">
        <span class="total-label">總計</span>
        <span class="total-amount">${{ order.totalAmount }}</span>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="order-actions" @click.stop>
      <el-button
        v-if="order.status === 'ordered'"
        type="danger"
        plain
        size="small"
        @click="updateStatus('cancelled')"
      >
        取消訂單
      </el-button>
      <el-button
        v-if="order.status === 'ordered'"
        class="complete"
        type="success"
        size="small"
        @click="updateStatus('completed')"
      >
        完成訂單
      </el-button>
      <el-button
        v-if="order.status === 'completed' || order.status === 'cancelled'"
        type="primary"
        plain
        size="small"
        @click="updateStatus('ordered')"
      >
        復原為已下單
      </el-button>
    </div>

    <!-- 订单底部装饰 -->
    <div class="order-ticket-bottom"></div>
  </div>

  <!-- 訂購明細模態框 -->
  <OrderDetail
    ref="orderDetail"
    :order="order"
    @update-items="handleUpdateItems"
  />
</template>

<style scoped lang="scss">
.order-card {
  position: relative;
  background: white;
  border-radius: 0;
  padding: 0;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  min-height: 480px;
  height: 100%;

  &.simple-mode {
    min-height: 240px;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.12),
      0 2px 4px rgba(0, 0, 0, 0.06);
  }

  // 票据顶部锯齿装饰
  .order-ticket-top {
    height: 8px;
    background:
      linear-gradient(-45deg, white 6px, transparent 0),
      linear-gradient(45deg, white 6px, transparent 0);
    background-repeat: repeat-x;
    background-size: 12px 12px;
    background-position: 0 0;
    background-color: #f1f5f9;
  }

  // 票据底部锯齿装饰
  .order-ticket-bottom {
    height: 8px;
    background:
      linear-gradient(135deg, white 6px, transparent 0),
      linear-gradient(-135deg, white 6px, transparent 0);
    background-repeat: repeat-x;
    background-size: 12px 12px;
    background-position: 0 100%;
    background-color: #f1f5f9;
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px 20px 10px;
    background: linear-gradient(to bottom, #fafbfc 0%, white 100%);

    .order-id-section {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .order-label {
        font-size: 11px;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
      }

      .order-id {
        font-size: 16px;
        font-family: "Courier New", monospace;
        display: flex;
        gap: 2px;
        align-items: center;

        .id-prefix {
          color: #64748b;
          font-weight: 500;
        }

        .id-highlight {
          color: #1e40af;
          font-weight: 700;
          font-size: 18px;
        }
      }
    }

    .order-status-stamp {
      position: relative;
      padding: 6px 14px;
      border: 2.5px solid;
      border-radius: 4px;
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transform: rotate(-2deg);
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  .order-customer {
    padding: 12px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: white;

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;

      .info-label {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #64748b;
        font-weight: 500;
        min-width: 80px;

        .el-icon {
          font-size: 16px;
          color: #94a3b8;
        }
      }

      .info-value {
        color: #1e293b;
        font-weight: 600;
        text-align: right;

        &.pickup-time {
          font-family: "Courier New", monospace;
          font-size: 15px;

          .pickup-date {
            color: #64748b;
            margin-right: 4px;
          }
        }
      }
    }
  }

  .order-divider {
    height: 1px;
    background: #e2e8f0;
    margin: 0 20px;

    &.dashed {
      height: 0;
      border-top: 2px dashed #cbd5e1;
      margin: 8px 20px;
    }
  }

  .order-items {
    padding: 12px 20px;
    background: #fafbfc;
    flex: 1;
    display: flex;
    flex-direction: column;

    .items-header {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      height: 160px;
      overflow-y: auto;
      padding-right: 4px;
      flex-shrink: 0;
      pre {
        font-size: 12px;
      }
      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 2px;
      }

      .order-item {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 12px;
        align-items: center;
        font-size: 14px;
        padding: 6px 10px;
        background: white;
        border-radius: 4px;
        border: 1px solid #e2e8f0;

        .item-name {
          color: #334155;
          font-weight: 500;
        }

        .item-quantity {
          color: #64748b;
          font-weight: 600;
          min-width: 40px;
          text-align: center;
        }

        .item-price {
          color: #1e293b;
          font-weight: 700;
          font-family: "Courier New", monospace;
          min-width: 60px;
          text-align: right;
        }
      }
    }
  }

  .order-note {
    padding: 10px 20px;
    background: #fffbeb;
    border-left: 3px solid #fbbf24;
    margin: 0 20px;
    border-radius: 0 4px 4px 0;
    min-height: 60px;
    display: flex;
    flex-direction: column;

    .note-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #92400e;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;

      .el-icon {
        font-size: 14px;
      }
    }

    .note-content {
      font-size: 13px;
      color: #78350f;
      line-height: 1.5;
    }
  }

  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background: linear-gradient(to bottom, white 0%, #fafbfc 100%);

    .footer-info {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .payment-method {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;

        .label {
          color: #64748b;
          font-weight: 500;
        }
      }
    }

    .order-total {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;

      .total-label {
        font-size: 11px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
      }

      .total-amount {
        font-size: 24px;
        font-weight: 700;
        color: #1e293b;
        font-family: "Courier New", monospace;
        line-height: 1;
      }
    }
  }

  .order-actions {
    display: flex;
    gap: 8px;
    padding: 12px 20px 16px;
    background: #fafbfc;
    border-top: 1px solid #e2e8f0;

    .el-button {
      flex: 1;
    }

    .complete {
      flex: 2;
    }
  }
}
</style>
