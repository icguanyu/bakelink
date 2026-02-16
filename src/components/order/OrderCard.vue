<script setup>
import { computed } from "vue";
import dayjs from "dayjs";
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

const statusOptions = [
  { label: "全部", value: "all", color: "" },
  { label: "已下單", value: "ordered", color: "#3b82f6", count: 0 },
  { label: "已完成", value: "completed", color: "#10b981", count: 0 },
  { label: "已取消", value: "cancelled", color: "#ef4444", count: 0 },
];

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
</script>

<template>
  <div class="order-card" @click="openOrder">
    <!-- 訂單頭部 -->
    <div class="order-header">
      <div class="order-id">
        <span class="id-prefix">{{ orderIdParts.prefix }}</span>
        <span class="id-highlight">{{ orderIdParts.lastThree }}</span>
      </div>
      <div
        class="order-status-badge"
        :style="{ background: getStatusColor(order.status) }"
      >
        {{ getStatusLabel(order.status) }}
      </div>
    </div>

    <!-- 客戶資訊 -->
    <div class="order-customer">
      <div class="customer-info">
        <el-icon class="customer-icon"><User /></el-icon>
        <span class="customer-name">{{ order.customerName }}</span>
      </div>
      <div v-if="viewMode === 'detailed'" class="customer-phone">
        <el-icon><Phone /></el-icon>
        {{ order.phone }}
      </div>
      <div v-if="viewMode === 'detailed'" class="customer-pickup">
        <el-icon><AlarmClock /></el-icon>
        <span class="pickup-time">
          <span v-if="!isToday(order.pickupTime)" class="pickup-date">{{
            dayjs(order.pickupTime).format("MM/DD")
          }}</span>
          {{ dayjs(order.pickupTime).format("HH:mm") }}
        </span>
      </div>
    </div>

    <!-- 訂購項目 -->
    <div v-if="viewMode === 'detailed'" class="order-items">
      <div v-for="(item, idx) in order.items" :key="idx" class="order-item">
        <span class="item-name">{{ item.name }}</span>
        <span class="item-quantity">× {{ item.quantity }}</span>
      </div>
    </div>

    <!-- 備註 -->
    <div v-if="viewMode === 'detailed' && order.note" class="order-note">
      <el-icon><Document /></el-icon>
      <span>{{ order.note }}</span>
    </div>

    <!-- 訂單底部 -->
    <div class="order-footer">
      <div class="order-amount">
        <span class="amount-label">總金額</span>
        <span class="amount-value">${{ order.totalAmount }}</span>
      </div>
      <div v-if="viewMode === 'detailed'" class="order-payment">
        <el-tag size="small">{{ getPaymentLabel(order.payment) }}</el-tag>
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
        取消
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
  </div>
</template>

<style scoped lang="scss">
.order-card {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    border-color: #e2e8f0;
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #f1f5f9;

    .order-id {
      font-size: 14px;
      display: flex;
      gap: 2px;
      align-items: center;
      .id-prefix {
        color: #b7bcc4;
      }
      .id-highlight {
        color: #277ccc;
        font-weight: 700;
      }
    }

    .order-status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      color: white;
      font-weight: 600;
    }
  }

  .order-customer {
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: space-between;

    .customer-info {
      display: flex;
      align-items: center;
      gap: 4px;

      .customer-icon {
        color: #3b82f6;
        font-size: 18px;
      }

      .customer-name {
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
      }
    }

    .customer-phone,
    .customer-pickup {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #64748b;
      margin-left: 18px;

      .el-icon {
        font-size: 14px;
      }
    }
  }

  .order-items {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    background: #f0f9ff;
    border-radius: 8px;
    border-left: 3px solid #3b82f6;
    max-height: 140px;
    overflow-y: auto;
    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;

      .item-name {
        color: #1e40af;
        font-weight: 500;
      }

      .item-quantity {
        color: #60a5fa;
        font-weight: 600;
      }
    }
  }

  .order-note {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #64748b;

    .el-icon {
      flex-shrink: 0;
      margin-top: 2px;
      color: #94a3b8;
    }
  }

  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
    margin-top: auto;

    .order-amount {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .amount-label {
        font-size: 11px;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .amount-value {
        font-size: 20px;
        font-weight: 700;
        color: #1e293b;
      }
    }
  }

  .order-actions {
    display: flex;
    flex-wrap: wrap;

    .complete {
      flex: 1;
    }
  }
}
</style>
