<script setup>
import dayjs from "dayjs";

const router = useRouter();
const businessStatus = ref({
  isOpen: true,
  startTime: "09:00",
  endTime: "18:00",
  currentTime: dayjs().format("HH:mm"),
});

const recentOrders = ref([
  {
    id: "ORD001",
    customerId: 1,
    customerName: "王先生",
    items: ["法國長棍 x2", "牛奶吐司 x1"],
    total: 380,
    status: "completed",
    createdAt: dayjs().subtract(1, "hour").format("YYYY-MM-DD HH:mm"),
    note: "要五分熟",
  },
  {
    id: "ORD002",
    customerId: 2,
    customerName: "李小姐",
    items: ["酸種麵包 x1"],
    total: 120,
    status: "completed",
    createdAt: dayjs().subtract(2, "hours").format("YYYY-MM-DD HH:mm"),
    note: "",
  },
  {
    id: "ORD003",
    customerId: 3,
    customerName: "陳先生",
    items: ["可頌 x3", "法國長棍 x1"],
    total: 250,
    status: "ordered",
    createdAt: dayjs().subtract(30, "minutes").format("YYYY-MM-DD HH:mm"),
    note: "",
  },
]);

const handleQuickAction = (action) => {
  switch (action) {
    case "new-order":
      router.push("/shop/order");
      break;
    case "new-product":
      router.push("/shop/products");
      break;
    case "schedule":
      router.push("/shop/schedule");
      break;
    case "settings":
      router.push("/shop/settings");
      break;
  }
};
</script>

<template>
  <div class="dashboard">
    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="header-top">
        <div>
          <h2>總覽</h2>
          <p class="subtitle">
            {{ dayjs().format("YYYY 年 M 月 D 日 (dddd)") }} |
            掌握今日業務進展、訂單狀態與生產排程
          </p>
        </div>
      </div>
    </div>

    <!-- 營業狀態欄 -->
    <div class="business-status">
      <div class="status-content">
        <div class="status-indicator" :class="{ open: businessStatus.isOpen }">
          <div class="status-dot"></div>
          <span>{{ businessStatus.isOpen ? "營業中" : "已打烊" }}</span>
        </div>
        <div class="status-time">
          {{ businessStatus.currentTime }} | 營業時間：{{
            businessStatus.startTime
          }}
          - {{ businessStatus.endTime }}
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <h3 class="section-title">⚡ 快速操作</h3>
      <div class="action-buttons">
        <el-button
          type="primary"
          size="large"
          class="action-btn"
          @click="handleQuickAction('new-order')"
        >
          新增訂單
        </el-button>
        <el-button
          size="large"
          class="action-btn"
          @click="handleQuickAction('new-product')"
        >
          新增產品
        </el-button>
        <el-button
          size="large"
          class="action-btn"
          @click="handleQuickAction('schedule')"
        >
          編輯排程
        </el-button>
        <el-button
          size="large"
          class="action-btn"
          @click="handleQuickAction('settings')"
        >
          商店設定
        </el-button>
      </div>
    </div>

    <!-- 最近訂單 -->
    <div class="today-section">
      <div class="section-header">
        <h3 class="section-title">📋 最近訂單</h3>
        <el-button text type="primary" @click="router.push('/shop/order')">
          查看全部 →
        </el-button>
      </div>
      <div v-if="recentOrders.length > 0" class="orders-list">
        <OrderCard
          v-for="order in recentOrders.slice(0, 2)"
          :key="order.id"
          :order="order"
          view-mode="simple"
        />
      </div>
      <el-empty v-else description="今日暫無訂單" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 8px;

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;

    h2 {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 0;
      font-weight: 500;
    }
  }
}

// 營業狀態欄
.business-status {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .status-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #64748b;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #cbd5e1;
        animation: pulse 2s infinite;
      }

      &.open {
        color: #22c55e;

        .status-dot {
          background-color: #22c55e;
        }
      }
    }

    .status-time {
      text-align: right;
      font-size: 12px;
      color: #94a3b8;
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 快速操作
.quick-actions {
  background: #ffffff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .section-title {
    margin: 0 0 12px 0;
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
  }

  .action-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px;

    .action-btn {
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.3s ease;
      border: none;
      margin-left: 0;
      :deep(.el-icon) {
        margin-right: 4px;
      }
    }
  }
}

// 分組區塊
.today-section {
  background: #ffffff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .section-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
    }
  }

  .schedule-list {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .schedule-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #cbd5e1;
      transition: all 0.3s ease;

      &:hover {
        background: #f1f5f9;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      }

      .schedule-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;

        .schedule-status-badge {
          flex-shrink: 0;
        }

        .schedule-detail {
          .schedule-name {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 2px;
            font-size: 15px;
          }

          .schedule-count {
            font-size: 13px;
            color: #64748b;
          }
        }
      }

      .schedule-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;

        .progress-container {
          display: flex;
          align-items: center;
          gap: 8px;

          .progress-bar-small {
            width: 80px;
            height: 4px;
            background: #e2e8f0;
            border-radius: 2px;
            overflow: hidden;

            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #3b82f6, #06b6d4);
              border-radius: 2px;
              transition: width 0.3s ease;
            }
          }

          .progress-text {
            font-size: 13px;
            font-weight: 600;
            color: #475569;
            min-width: 32px;
            text-align: right;
          }
        }
      }

      &.completed {
        border-left-color: #22c55e;
        background: linear-gradient(to right, rgba(34, 197, 94, 0.05), #f8fafc);
      }

      &.in-progress {
        border-left-color: #f59e0b;
        background: linear-gradient(
          to right,
          rgba(245, 158, 11, 0.05),
          #f8fafc
        );
      }

      &.pending {
        border-left-color: #6366f1;
      }
    }
  }

  .orders-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 12px;
  }
}

// RWD
@media (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 12px;
    gap: 12px;
  }

  .page-header .header-top h2 {
    font-size: 24px;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);

    .stat-card {
      padding: 12px;

      .stat-body .main-value {
        font-size: 24px;
      }
    }
  }

  .quick-actions .action-buttons {
    grid-template-columns: repeat(2, 1fr);
  }

  .today-section .orders-list {
    grid-template-columns: 1fr;
  }

  .schedule-item {
    flex-direction: column;
    align-items: flex-start;

    .schedule-right {
      width: 100%;
      margin-top: 8px;
    }
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 10px;
    gap: 10px;
  }

  .page-header .header-top h2 {
    font-size: 20px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .business-status .status-content {
    flex-direction: column;
    align-items: flex-start;

    .status-time {
      text-align: left;
    }
  }

  .quick-actions .action-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
