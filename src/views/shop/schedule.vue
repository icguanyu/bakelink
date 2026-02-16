<script setup>
import { computed, ref } from "vue";
import dayjs from "dayjs";
import { ElMessage, ElMessageBox } from "element-plus";
import ScheduleCalendar from "@/components/schedule/ScheduleCalendar.vue";
import ScheduleEditor from "@/components/schedule/ScheduleEditor.vue";

// 排程狀態
const baseDate = ref(dayjs()); // 當前展示的基準月份
const selectedDateForDetails = ref(null); // 選中的日期用於右側詳情面板
const scheduleList = ref([]);
const isEditorOpen = ref(false);
const editorForm = ref({
  status: "draft",
  startTime: "",
  endTime: "",
  products: [],
});

// 模擬產品資料 - 今日出爐的麵包
const products = ref([
  {
    id: "PROD-001",
    name: "丹麥牛角麵包",
    category: "牛角麵包",
    image: "🥐",
    price: 45,
    stock: 25,
    available: true,
  },
  {
    id: "PROD-002",
    name: "法式長棍麵包",
    category: "吐司",
    image: "🍞",
    price: 65,
    stock: 15,
    available: true,
  },
  {
    id: "PROD-003",
    name: "核桃提子麵包",
    category: "軟麵包",
    image: "🍞",
    price: 55,
    stock: 20,
    available: true,
  },
]);

// 模擬日期與產品的關聯 - 對應日期出爐的產品
const dateProductsMap = {
  "2026-02-16": ["PROD-001", "PROD-002", "PROD-003", "PROD-004", "PROD-006"], // 今天
  "2026-02-15": ["PROD-001", "PROD-003", "PROD-005", "PROD-006"], // 昨天
  "2026-02-17": ["PROD-002", "PROD-004", "PROD-005"], // 明天
  "2026-02-18": ["PROD-001", "PROD-002", "PROD-003", "PROD-004"], // 後天
};

// 模擬排程資料 - 從訂單資料生成
const orders = ref([
  // 今天的訂單
  {
    id: "ORD-20260216-001",
    customerName: "陳小美",
    pickupTime: "2026-02-16 14:00",
    status: "ordered",
    totalAmount: 465,
    items: 2,
  },
  {
    id: "ORD-20260216-002",
    customerName: "王大明",
    pickupTime: "2026-02-16 15:30",
    status: "ordered",
    totalAmount: 605,
    items: 2,
  },
  {
    id: "ORD-20260216-004",
    customerName: "魏志軒",
    pickupTime: "2026-02-16 10:30",
    status: "ordered",
    totalAmount: 1290,
    items: 7,
  },
  {
    id: "ORD-20260216-009",
    customerName: "鄒芊芊",
    pickupTime: "2026-02-16 15:00",
    status: "ordered",
    totalAmount: 895,
    items: 5,
  },
  {
    id: "ORD-20260216-013",
    customerName: "吳昀庭",
    pickupTime: "2026-02-16 17:30",
    status: "ordered",
    totalAmount: 2770,
    items: 6,
  },
  // 昨天的訂單
  {
    id: "ORD-20260215-015",
    customerName: "張雅芳",
    pickupTime: "2026-02-15 18:00",
    status: "completed",
    totalAmount: 540,
    items: 2,
  },
  {
    id: "ORD-20260215-014",
    customerName: "劉建國",
    pickupTime: "2026-02-15 17:30",
    status: "cancelled",
    totalAmount: 330,
    items: 1,
  },
  // 明天的訂單
  {
    id: "ORD-20260217-001",
    customerName: "黃志明",
    pickupTime: "2026-02-17 10:00",
    status: "ordered",
    totalAmount: 555,
    items: 2,
  },
  {
    id: "ORD-20260217-002",
    customerName: "李淑芬",
    pickupTime: "2026-02-17 14:30",
    status: "ordered",
    totalAmount: 300,
    items: 1,
  },
  // 後天的訂單
  {
    id: "ORD-20260218-001",
    customerName: "周美玲",
    pickupTime: "2026-02-18 11:00",
    status: "ordered",
    totalAmount: 580,
    items: 2,
  },
]);

// 生成排程列表（日曆邏輯）
const generateScheduleList = () => {
  const list = [];
  const monthStart = baseDate.value.startOf("month");
  const monthEnd = baseDate.value.endOf("month");

  // 找到該月第一天是周幾（0 = 周日）
  const firstDayOfWeek = monthStart.day();
  // 計算日曆開始日期（可能是上月的日期）
  const calendarStart = monthStart.subtract(firstDayOfWeek, "day");

  // 計算日曆結束日期（可能是下月的日期）
  const lastDayOfWeek = monthEnd.day();
  const daysToAdd = 6 - lastDayOfWeek; // 到週六還需要多少天
  const calendarEnd = monthEnd.add(daysToAdd, "day");

  let currentDate = calendarStart;
  while (currentDate.isBefore(calendarEnd) || currentDate.isSame(calendarEnd)) {
    const date = currentDate.format("YYYY-MM-DD");
    const dateOrders = orders.value.filter((o) =>
      o.pickupTime.startsWith(date),
    );

    const currentMonth = currentDate.format("YYYY-MM");
    const baseMonth = baseDate.value.format("YYYY-MM");
    const isCurrentMonth = currentMonth === baseMonth;

    const stats = {
      total: dateOrders.length,
      ordered: dateOrders.filter((o) => o.status === "ordered").length,
      completed: dateOrders.filter((o) => o.status === "completed").length,
      cancelled: dateOrders.filter((o) => o.status === "cancelled").length,
      revenue: dateOrders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + o.totalAmount, 0),
    };

    list.push({
      date,
      dateObj: currentDate.clone(),
      orders: dateOrders.sort((a, b) =>
        dayjs(a.pickupTime).diff(dayjs(b.pickupTime)),
      ),
      stats,
      isOpen: true, // 默認開放接單
      hasOrders: dateOrders.length > 0, // 是否有訂單
      isCurrentMonth, // 是否為當月日期
    });

    currentDate = currentDate.add(1, "day");
  }
  return list;
};

scheduleList.value = generateScheduleList();

// 初始化排程列表
const initScheduleList = () => {
  scheduleList.value = generateScheduleList();

  // 預設開啟今日（如果有訂單）或當月的第一天
  const today = dayjs().format("YYYY-MM-DD");
  const todaySchedule = scheduleList.value.find((s) => s.date === today);

  if (todaySchedule && todaySchedule.hasOrders) {
    selectedDateForDetails.value = today;
  } else {
    // 否則顯示當月的第一天
    const firstDayOfMonth = scheduleList.value.find((s) => s.isCurrentMonth);
    selectedDateForDetails.value = firstDayOfMonth?.date || null;
  }
};
initScheduleList();

// 更新排程列表
const updateScheduleList = () => {
  initScheduleList();
};

// 上一個月
const goPreviousMonth = () => {
  baseDate.value = baseDate.value.subtract(1, "month");
  updateScheduleList();
};

// 下一個月
const goNextMonth = () => {
  baseDate.value = baseDate.value.add(1, "month");
  updateScheduleList();
};

// 回到今天
const goToday = () => {
  baseDate.value = dayjs();
  selectedDateForDetails.value = null;
  updateScheduleList();
};

// 獲取當前月份顯示文字
const getCurrentMonthLabel = computed(() => {
  return baseDate.value.format("YYYY 年 M 月");
});

// 取得選中日期的訂單
const selectedDateOrders = computed(() => {
  if (!selectedDateForDetails.value) return [];
  return (
    scheduleList.value.find((s) => s.date === selectedDateForDetails.value)
      ?.orders || []
  );
});

// 取得選中日期的統計
const selectedDateStats = computed(() => {
  if (!selectedDateForDetails.value) return null;
  return (
    scheduleList.value.find((s) => s.date === selectedDateForDetails.value)
      ?.stats || null
  );
});

// 取得選中日期的出爐產品
const selectedDateProducts = computed(() => {
  if (!selectedDateForDetails.value) return [];
  const productIds = dateProductsMap[selectedDateForDetails.value] || [];
  return productIds
    .map((id) => products.value.find((p) => p.id === id))
    .filter(Boolean);
});

const selectedDateLabel = computed(() => {
  if (!selectedDateForDetails.value) return "";
  return dayjs(selectedDateForDetails.value).format("YYYY/MM/DD");
});

const getStatusLabel = (status) => {
  const map = {
    ordered: "已下單",
    completed: "已完成",
    cancelled: "已取消",
  };
  return map[status] || status;
};

const getStatusColor = (status) => {
  const map = {
    ordered: "#3b82f6",
    completed: "#10b981",
    cancelled: "#ef4444",
  };
  return map[status] || "#6b7280";
};

const toggleScheduleOpen = (scheduleItem) => {
  ElMessageBox.confirm(
    `確定要${scheduleItem.isOpen ? "關閉" : "開放"} ${scheduleItem.date} 的接單嗎？`,
    "提示",
    {
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(() => {
      scheduleItem.isOpen = !scheduleItem.isOpen;
      ElMessage.success(
        `${scheduleItem.date} 已${scheduleItem.isOpen ? "開放" : "關閉"}接單`,
      );
    })
    .catch(() => {});
};

const formatTime = (datetime) => {
  return dayjs(datetime).format("HH:mm");
};

const openEditor = () => {
  editorForm.value = {
    status: "draft",
    startTime: "",
    endTime: "",
    products: selectedDateProducts.value.map((product) => ({
      id: product.id,
      name: product.name,
      limit: product.stock ?? 0,
      max: product.stock ?? null,
    })),
  };
  isEditorOpen.value = true;
};

const closeEditor = () => {
  isEditorOpen.value = false;
};
</script>

<template>
  <div class="schedule-container">
    <!-- 頂部標題與導航 -->
    <div class="schedule-header">
      <div class="header-top">
        <div>
          <h2>接單排程</h2>
          <p class="subtitle">管理每日接單狀況，快速查看訂單資訊</p>
        </div>
        <el-button type="primary" icon="Back" @click="goToday">
          回到今天
        </el-button>
      </div>

      <!-- 月份導航 -->
      <div class="month-navigation">
        <el-button icon="ArrowLeft" circle @click="goPreviousMonth" />
        <span class="month-label">{{ getCurrentMonthLabel }}</span>
        <el-button icon="ArrowRight" circle @click="goNextMonth" />
      </div>
    </div>

    <!-- 排程列表 + 訂單詳情 -->
    <div class="schedule-main">
      <ScheduleEditor
        v-if="isEditorOpen"
        :date-label="selectedDateLabel"
        :available-products="products"
        :initial-products="editorForm.products"
        :initial-status="editorForm.status"
        :initial-start-time="editorForm.startTime"
        :initial-end-time="editorForm.endTime"
        @close="closeEditor"
        @save="closeEditor"
      />
      <!-- 右側：訂單詳情面板 -->
      <div v-else-if="selectedDateForDetails" class="schedule-right">
        <div class="detail-header">
          <div>
            <h3>
              {{
                dayjs(selectedDateForDetails).format("YYYY 年 M 月 DD 日 (ddd)")
              }}
            </h3>
            <p class="detail-stats" v-if="selectedDateStats">
              共 {{ selectedDateStats.total }} 筆訂單 |
              <span class="stat-ordered"
                >↓ {{ selectedDateStats.ordered }}</span
              >
              <span class="stat-completed"
                >✓ {{ selectedDateStats.completed }}</span
              >
              <span class="stat-cancelled"
                >✕ {{ selectedDateStats.cancelled }}</span
              >
              | 營收 ${{ selectedDateStats.revenue }}
            </p>
          </div>
          <div class="detail-actions">
            <el-button
              class="detail-more"
              circle
              @click="isEditorOpen ? closeEditor() : openEditor()"
            >
              <el-icon v-if="isEditorOpen"><Close /></el-icon>
              <el-icon v-else><More /></el-icon>
            </el-button>
          </div>
        </div>

        <div class="detail-content">
          <!-- 今日出爐商品 -->
          <div v-if="selectedDateProducts.length > 0" class="products-section">
            <div class="section-title">
              <span>今日出爐</span>
              <span class="count"
                >{{ selectedDateProducts.length }} 項商品</span
              >
            </div>
            <div class="products-grid">
              <div
                v-for="product in selectedDateProducts"
                :key="product.id"
                class="product-card"
                :class="{ 'out-of-stock': !product.available }"
              >
                <div class="product-info">
                  <h4 class="product-name">{{ product.name }}</h4>
                  <p class="product-category">{{ product.category }}</p>
                  <div class="product-footer">
                    <span class="product-price">${{ product.price }}</span>
                    <span v-if="product.available" class="product-stock"
                      >{{ product.stock }} 個</span
                    >
                    <span v-else class="product-sold-out">已售完</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 訂單列表 -->
          <div v-if="selectedDateOrders.length > 0" class="orders-section">
            <div class="section-title">
              <span>訂單清單</span>
              <span class="count">{{ selectedDateOrders.length }} 筆</span>
            </div>
            <div class="orders-list">
              <div
                v-for="order in selectedDateOrders"
                :key="order.id"
                class="order-row"
                :style="{ borderLeftColor: getStatusColor(order.status) }"
              >
                <div class="order-id">{{ order.id }}</div>
                <div class="order-customer">
                  <span class="name">{{ order.customerName }}</span>
                </div>
                <div class="order-time">
                  {{ formatTime(order.pickupTime) }}
                </div>
                <div class="order-items">{{ order.items }} 項</div>
                <div class="order-amount">${{ order.totalAmount }}</div>
                <div
                  class="order-status"
                  :style="{ background: getStatusColor(order.status) }"
                >
                  {{ getStatusLabel(order.status) }}
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="
              selectedDateOrders.length === 0 &&
              selectedDateProducts.length === 0
            "
            class="empty-orders"
          >
            <el-icon><Document /></el-icon>
            <p>該日期暫無訂單及商品</p>
          </div>
        </div>
      </div>

      <ScheduleCalendar
        :schedule-list="scheduleList"
        :selected-date="selectedDateForDetails"
        @select="selectedDateForDetails = $event"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.schedule-container {
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
}

.schedule-header {
  margin-bottom: 24px;

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    gap: 20px;

    h2 {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 8px 0;
    }

    .subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }
  }

  .month-navigation {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding: 12px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;

    .month-label {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      min-width: 120px;
      text-align: center;
    }
  }
}

// 左右分割主容器
.schedule-main {
  display: flex;
  gap: 16px;
  min-height: calc(100vh - 280px);
}

.schedule-right {
  flex: 1;
  min-width: 530px;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  animation: slideInRight 0.3s ease;
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

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  gap: 12px;

  h3 {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 4px 0;
  }

  .detail-stats {
    font-size: 12px;
    color: #64748b;
    margin: 0;

    .stat-ordered {
      color: #3b82f6;
      font-weight: 600;
      margin: 0 4px;
    }

    .stat-completed {
      color: #10b981;
      font-weight: 600;
      margin: 0 4px;
    }

    .stat-cancelled {
      color: #ef4444;
      font-weight: 600;
      margin: 0 4px;
    }
  }
}

.detail-actions {
  display: flex;
  align-items: flex-start;
}

.detail-more {
  border: 1px solid #e2e8f0;
}

.detail-content {
  flex: 1;
  padding: 16px 20px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;

    &:hover {
      background: #94a3b8;
    }
  }
}

// 商品區塊
.products-section {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;

  .count {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 400;
  }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.product-card {
  background: #f8fafc;
  border-radius: 6px;
  padding: 8px;
  text-align: center;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: white;
    border-color: #cbd5e1;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  &.out-of-stock {
    opacity: 0.6;
    background: #f1f5f9;

    &:hover {
      transform: none;
    }
  }
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
  word-break: break-word;
}

.product-category {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid #e2e8f0;
  gap: 2px;
}

.product-price {
  font-weight: 700;
  color: #2e3d5f;
  flex-shrink: 0;
}

.product-stock {
  font-size: 12px;
  color: #64748b;
  flex-shrink: 0;
}

.product-sold-out {
  font-size: 9px;
  color: #ef4444;
  font-weight: 600;
  flex-shrink: 0;
}

// 訂單區塊
.orders-section {
  margin-top: 24px;
}

.empty-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #94a3b8;

  .el-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-x: auto;
}

.order-row {
  display: grid;
  min-width: 520px;
  grid-template-columns: 140px 70px 50px 50px 70px 70px;
  gap: 8px;
  align-items: center;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;

  transition: all 0.2s ease;
  overflow: hidden;

  &:hover {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .order-id {
    font-weight: 600;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .order-customer {
    .name {
      font-weight: 600;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .order-time {
    color: #64748b;
    font-weight: 600;
  }

  .order-items {
    color: #94a3b8;
  }

  .order-amount {
    font-weight: 700;
    color: #1e293b;
  }

  .order-status {
    color: white;
    font-weight: 600;
    padding: 4px 6px;
    border-radius: 4px;
    text-align: center;
    font-size: 11px;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 響應式
@media (max-width: 1024px) {
  .schedule-main {
    flex-direction: column;
    min-height: auto;
  }

  .schedule-right {
    min-width: 100%;
    min-height: 300px;
  }

  .products-grid {
    display: flex;
    flex-wrap: wrap;
  }

  .order-row {
    grid-template-columns:
      minmax(80px, 1fr) minmax(80px, 0.8fr)
      50px 45px 60px 70px;
    gap: 6px;
    padding: 8px;
  }
}
</style>
