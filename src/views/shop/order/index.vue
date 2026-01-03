<script setup>
import { computed, nextTick, ref } from "vue";
import dayjs from "dayjs";

// 撈出最近10筆訂單資料(每日)，並根據月份分類為不同object
const data = ref([
  {
    month: "2026-01",
    orders: [
      {
        id: 13,
        date: "2026-01-15",
        status: "收單中",
        totalOrders: 30,
        pickedUp: 0,
        pending: 0,
        breached: 0,
      },
      {
        id: 14,
        date: "2026-01-12",
        status: "收單中",
        totalOrders: 13,
        pickedUp: 0,
        pending: 0,
        breached: 0,
      },
      {
        id: 15,
        date: "2026-01-11",
        status: "收單中",
        totalOrders: 25,
        pickedUp: 0,
        pending: 0,
        breached: 0,
      },
      {
        id: 0,
        date: "2026-01-10",
        status: "已結單",
        totalOrders: 20,
        pickedUp: 18,
        pending: 2,
        breached: 0,
      },
      {
        id: 1,
        date: "2026-01-03",
        status: "已結單",
        totalOrders: 15,
        pickedUp: 8,
        pending: 7,
        breached: 0,
      },
    ],
  },
  {
    month: "2025-12",
    orders: [
      {
        id: 2,
        date: "2025-12-28",

        status: "已結單",
        totalOrders: 23,
        pickedUp: 20,
        pending: 3,
        breached: 0,
      },
      {
        id: 3,
        date: "2025-12-25",

        status: "出貨結束",
        totalOrders: 8,
        pickedUp: 8,
        pending: 0,
        breached: 0,
      },
      {
        id: 4,
        date: "2025-12-20",

        status: "已結單",
        totalOrders: 12,
        pickedUp: 10,
        pending: 2,
        breached: 0,
      },
      {
        id: 5,
        date: "2025-12-15",

        status: "出貨結束",
        totalOrders: 10,
        pickedUp: 10,
        pending: 0,
        breached: 0,
      },
      {
        id: 6,
        date: "2025-12-10",

        status: "出貨結束",
        totalOrders: 18,
        pickedUp: 18,
        pending: 0,
        breached: 0,
      },
      {
        id: 7,
        date: "2025-12-05",

        status: "出貨結束",
        totalOrders: 6,
        pickedUp: 6,
        pending: 0,
        breached: 0,
      },
    ],
  },
  {
    month: "2025-11",
    orders: [
      {
        id: 10,
        date: "2025-11-30",

        status: "出貨結束",
        totalOrders: 13,
        pickedUp: 11,
        pending: 0,
        breached: 2,
      },
      {
        id: 11,
        date: "2025-11-25",
        status: "出貨結束",
        totalOrders: 9,
        pickedUp: 8,
        pending: 0,
        breached: 1,
      },
    ],
  },
]);

const getStatusClass = (status) => {
  const statusMap = {
    收單中: "status-collecting",
    已結單: "status-closed",
    出貨結束: "status-completed",
  };
  return statusMap[status] || "";
};

const formatMonth = (monthStr) => dayjs(monthStr).format("M月");
const formatDate = (dateStr) => dayjs(dateStr).format("YYYY/MM/DD");

const getProgress = (order) => {
  if (!order?.totalOrders) return 0;
  return Math.round((order.pickedUp / order.totalOrders) * 100);
};

const isToday = (order) => dayjs(order.date).isSame(dayjs(), "day");

// 取得今日日期 (格式: YYYY-MM-DD)
const getTodayDate = () => dayjs().format("YYYY-MM-DD");

// 找出今日訂單
const todayOrder = computed(() => {
  const today = getTodayDate();
  for (const monthGroup of data.value) {
    const order = monthGroup.orders.find((o) => o.date === today);
    if (order) return order;
  }
  return null;
});

const scrollToToday = async () => {
  await nextTick();
  const target = document.getElementById("today-order-anchor");
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};
</script>

<template>
  <div class="order-list">
    <div class="order-toolbar">
      <div class="toolbar-title">
        <i class="bx bx-list-check"></i>
        訂單列表
      </div>
      <div class="toolbar-actions">
        <el-button icon="aim" :disabled="!todayOrder" @click="scrollToToday">
          今日
        </el-button>
        <el-button icon="plus" type="primary">開單</el-button>
      </div>
    </div>

    <!-- 原有的月份訂單列表 -->
    <div v-for="monthGroup in data" :key="monthGroup.month" class="month-group">
      <h3 class="month-title">
        <el-icon><Calendar /></el-icon> {{ formatMonth(monthGroup.month) }}
      </h3>
      <div class="orders">
        <div
          class="order-item-box"
          v-for="order in monthGroup.orders"
          :key="order.id"
          :id="isToday(order) ? 'today-order-anchor' : undefined"
        >
          <div class="order-item" :class="{ isToday: isToday(order) }">
            <div class="order-header">
              <div class="order-main-info">
                <span class="order-date">
                  {{ formatDate(order.date) }}
                  <span v-if="isToday(order)" class="today-badge">今日</span>
                </span>

                <span :class="['order-status', getStatusClass(order.status)]">
                  {{ order.status }}
                </span>
              </div>
              <div class="order-progress">
                <div class="progress-text">
                  <span class="count">訂單數：{{ order.totalOrders }}</span>
                  <span v-if="order.status !== '收單中'" class="percent">
                    {{ getProgress(order) }}%
                  </span>
                </div>
                <div v-if="order.status !== '收單中'" class="progress-bar">
                  <div
                    class="progress-fill"
                    :class="{ incomplete: getProgress(order) < 100 }"
                    :style="{ width: getProgress(order) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
            <div v-if="order.status !== '收單中'" class="order-details">
              <div class="detail-item">
                <span class="detail-label">待取貨</span>
                <span class="detail-value pending">{{ order.pending }} 筆</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">已取貨</span>
                <span class="detail-value success"
                  >{{ order.pickedUp }} 筆</span
                >
              </div>
              <div class="detail-item">
                <span class="detail-label">違約單</span>
                <span class="detail-value danger">{{ order.breached }} 筆</span>
              </div>
            </div>
          </div>
          <div class="order-button" :class="{ isToday: isToday(order) }">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.order-list {
  padding: 24px;
  background: #fdfbf6;
  min-height: 100vh;
  .order-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;

    .toolbar-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 700;
      color: #2c3e50;

      i {
        font-size: 20px;
        color: #43291c;
      }
    }
  }

  .month-group {
    .month-title {
      font-size: 18px;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 12px;
      padding: 8px 16px;
      background: #ecf0f1;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
      width: fit-content;
      i {
        font-size: 18px;
        opacity: 0.6;
      }
    }
    .orders {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-left: 24px;
      .order-item {
        padding: 10px 16px;
        background: #fff;
        border-radius: 8px;
        border: 1px solid #e3e6e9;
        transition: all 0.2s ease;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

        .order-header {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: nowrap;
          justify-content: space-between;
          .order-main-info {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 0 0 auto;

            .order-date {
              display: flex;
              gap: 4px;
              align-items: center;
              font-size: 16px;
              color: #7f8c8d;
            }
          }
          .order-progress {
            flex: 1 1 auto;
          }
        }
      }
    }
  }
}
.orders {
  .order-item-box {
    display: flex;
    gap: 8px;
    .order-item {
      position: relative;
      flex: 1 1 auto;
    }
    .order-item.isToday {
      border: 1px solid #2d5f80;
      box-shadow: 0 4px 8px rgba(45, 95, 128, 0.2);
    }
    .order-button {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: 8px;
      padding: 8px;
      border: 1px solid #e3e6e9;
      i {
        font-size: 20px;
        color: #7f8c8d;
      }
    }
    .order-button.isToday {
      border: 1px solid #2d5f80;
    }
  }
}

.today-badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: #ffe9d6;
  color: #d82626;
  font-weight: 700;
  font-size: 12px;
}

.order-details {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  .detail-item {
    flex: 1;
    display: flex;
    justify-content: space-between;
    padding: 6px 10px;
    background: #f6f8fa;
    border-radius: 6px;
    border: 1px solid #e3e6e9;
    font-size: 14px;
    color: #2c3e50;

    .detail-label {
      font-weight: 600;
      color: #7f8c8d;
    }
    .detail-value {
      font-weight: 700;
      &.success {
        color: #2e8b57;
      }
      &.pending {
        color: #c0392b;
      }
    }
  }
}
.order-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 300px;
  .progress-text {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    color: #2c3e50;
    gap: 8px;
  }
  .progress-bar {
    position: relative;
    width: 100%;
    height: 6px;
    background: #eceff1;
    border-radius: 999px;
    overflow: hidden;
    .progress-fill {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: linear-gradient(
        90deg,
        #15a34c 0%,
        #2e8b57 50%,
        #15a34c 100%
      );
      background-size: 200% 100%;
      border-radius: inherit;
      transition: width 0.2s ease;
      animation: shimmer 3s infinite;

      &.incomplete {
        background: linear-gradient(
          90deg,
          #ffd700 0%,
          #ffa500 50%,
          #ffd700 100%
        );
        background-size: 200% 100%;
        animation: shimmer 3s infinite;
      }
    }
  }
}
.order-status {
  padding: 3px 10px;
  border-radius: 4px;
  font-weight: 600;
  letter-spacing: 0.5px;
  white-space: nowrap;

  &.status-collecting {
    background: #d4edda;
    color: #155724;
  }

  &.status-closed {
    background: #fff3cd;
    color: #856404;
  }

  &.status-completed {
    background: #e2e3e5;
    color: #383d41;
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 640px) {
  .order-list {
    padding: 12px;
    /* 今日訂單區塊 */
    .today-section {
      margin-bottom: 24px;
      .today-order {
        .order-progress {
          width: 100%;
          .progress-bar {
            height: 8px;
          }
        }
      }
      .no-order {
        padding: 30px;
        i {
          font-size: 24px;
        }
      }
    }
    .month-group {
      .orders {
        margin-left: 0;
        .order-item {
          .order-header {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            .order-main-info {
              width: 100%;
              justify-content: space-between;
            }
            .order-progress {
              width: 100%;
            }
            .order-details {
              width: 100%;
              grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            }
          }
        }
      }
    }
  }
  .order-progress {
    gap: 4px;
    max-width: 100%;
  }
}
</style>
