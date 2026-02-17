<script setup>
import dayjs from "dayjs";
import { Schedules } from "@/api/schedules";
import { scheduleStatusOptions } from "@/utils/constants";

// 排程狀態
const baseDate = ref(dayjs()); // 當前展示的基準月份
const selectedDate = ref(null); // 選中的日期用於右側詳情面板
const scheduleList = ref([]);
const scheduleMap = ref({});
const schedule = reactive({
  schedule_date: "",
  status: "DRAFT",
  order_start_at: null,
  order_end_at: null,
  items: [],
  orders: [],
});
const isEditorOpen = ref(false);
const isMonthLoading = ref(false);
const isDayLoading = ref(false);

const scheduleStatusLabelMap = scheduleStatusOptions.reduce((map, option) => {
  map[option.value] = option.label;
  return map;
}, {});

const getScheduleDateKeys = (scheduleDate) => {
  if (!scheduleDate) return [];
  const localDate = dayjs(scheduleDate).format("YYYY-MM-DD");
  return localDate ? [localDate] : [];
};

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
    const currentMonth = currentDate.format("YYYY-MM");
    const baseMonth = baseDate.value.format("YYYY-MM");
    const isCurrentMonth = currentMonth === baseMonth;

    const scheduleData = scheduleMap.value[date] || null;
    const orderCount = scheduleData?.order_count ?? 0;
    const itemCount = scheduleData?.item_count ?? 0;
    const status = scheduleData?.status || "DRAFT";
    const statusLabel = scheduleStatusLabelMap[status] || status;
    const hasSchedule = Boolean(scheduleData);
    const hasOrders = orderCount > 0;

    list.push({
      date,
      dateObj: currentDate.clone(),
      orderCount,
      itemCount,
      status,
      statusLabel,
      hasSchedule,
      hasOrders,
      isCurrentMonth, // 是否為當月日期
    });

    currentDate = currentDate.add(1, "day");
  }
  return list;
};

const seedScheduleList = () => {
  scheduleList.value = generateScheduleList();
  initScheduleList();
};

// 初始化排程列表
const initScheduleList = () => {
  scheduleList.value = generateScheduleList();

  // 若已有選取且仍在當月就保留
  const currentSelection = selectedDate.value;
  const currentSelectionSchedule = currentSelection
    ? scheduleList.value.find((s) => s.date === currentSelection)
    : null;
  if (currentSelectionSchedule?.isCurrentMonth) {
    selectedDate.value = currentSelection;
    return;
  }

  // 預設開啟今天（若在當月）
  const today = dayjs().format("YYYY-MM-DD");
  const todaySchedule = scheduleList.value.find(
    (s) => s.date === today && s.isCurrentMonth,
  );
  if (todaySchedule) {
    selectedDate.value = today;
    return;
  }

  // 否則顯示當月第一個有排程的日期，沒有就顯示當月第一天
  const firstScheduleDay = scheduleList.value.find(
    (s) => s.hasSchedule && s.isCurrentMonth,
  );
  const firstDayOfMonth = scheduleList.value.find((s) => s.isCurrentMonth);
  selectedDate.value = firstScheduleDay?.date || firstDayOfMonth?.date || null;
};

// 更新排程列表
const updateScheduleList = () => {
  initScheduleList();
};

// 上一個月
const goPreviousMonth = () => {
  baseDate.value = baseDate.value.subtract(1, "month");
  initScheduleDataByMonth();
};

// 下一個月
const goNextMonth = () => {
  baseDate.value = baseDate.value.add(1, "month");
  initScheduleDataByMonth();
};

// 回到今天
const goToday = () => {
  baseDate.value = dayjs();
  selectedDate.value = null;
  initScheduleDataByMonth();
};

// 上一天
const goPreviousDay = () => {
  if (!selectedDate.value) {
    selectedDate.value = dayjs().format("YYYY-MM-DD");
    return;
  }

  const currentDate = dayjs(selectedDate.value);
  const previousDate = currentDate.subtract(1, "day");

  // 檢查是否需要切換月份
  if (previousDate.format("YYYY-MM") !== baseDate.value.format("YYYY-MM")) {
    baseDate.value = previousDate;
    initScheduleDataByMonth();
  }

  selectedDate.value = previousDate.format("YYYY-MM-DD");
};

// 下一天
const goNextDay = () => {
  if (!selectedDate.value) {
    selectedDate.value = dayjs().format("YYYY-MM-DD");
    return;
  }

  const currentDate = dayjs(selectedDate.value);
  const nextDate = currentDate.add(1, "day");

  // 檢查是否需要切換月份
  if (nextDate.format("YYYY-MM") !== baseDate.value.format("YYYY-MM")) {
    baseDate.value = nextDate;
    initScheduleDataByMonth();
  }

  selectedDate.value = nextDate.format("YYYY-MM-DD");
};

// 獲取當前月份顯示文字
const getCurrentMonthLabel = computed(() => {
  return baseDate.value.format("YYYY 年 M 月");
});

// const selectedDateStats = computed(() => {
//   if (!selectedDate.value) return null;
//   const list = Array.isArray(schedule.orders) ? schedule.orders : [];
//   if (list.length === 0) return null;

//   const stats = {
//     total: list.length,
//     ordered: 0,
//     completed: 0,
//     cancelled: 0,
//     revenue: 0,
//   };

//   list.forEach((order) => {
//     const status = order?.status;
//     if (status === "ordered") stats.ordered += 1;
//     if (status === "completed") stats.completed += 1;
//     if (status === "cancelled") stats.cancelled += 1;
//     if (status !== "cancelled") stats.revenue += getOrderAmount(order);
//   });

//   return stats;
// });

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

const openEditor = () => {
  isEditorOpen.value = true;
};

const closeEditor = () => {
  isEditorOpen.value = false;
};

const initScheduleDataByMonth = async () => {
  const month = baseDate.value.format("YYYY-MM");
  isMonthLoading.value = true;
  scheduleMap.value = {};
  seedScheduleList();
  try {
    const res = await Schedules.GetByMonth(month);
    const list = Array.isArray(res?.data.data) ? res.data.data : [];
    console.log("Schedules.GetByMonth:", month, list);
    scheduleMap.value = list.reduce((map, item) => {
      const keys = getScheduleDateKeys(item.schedule_date);
      keys.forEach((key) => {
        map[key] = item;
      });
      return map;
    }, {});
    updateScheduleList();
  } catch (error) {
  } finally {
    isMonthLoading.value = false;
  }
};

const initScheduleDataByDate = async (date) => {
  if (!date) return;
  isDayLoading.value = true;
  try {
    const res = await Schedules.GetByDate(date);
    console.log("Schedules.GetByDate:", date, res);
    if (res.data === null) {
      Object.assign(schedule, {
        schedule_date: date,
        status: "DRAFT",
        order_start_at: null,
        order_end_at: null,
        items: [],
        orders: [],
      });
      return;
    }
    Object.assign(schedule, res.data);
  } catch (error) {
  } finally {
    isDayLoading.value = false;
  }
};

watch(
  () => selectedDate.value,
  (val) => {
    initScheduleDataByDate(val);
  },
);

onMounted(() => {
  seedScheduleList();
  initScheduleDataByMonth();
});
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
        :date-label="selectedDate"
        @close="closeEditor"
        @save="closeEditor"
      />
      <!-- 右側：訂單詳情面板 -->
      <div v-else-if="selectedDate" class="schedule-right">
        <div class="detail-header">
          <div class="detail-header-left">
            <el-button
              class="day-nav-btn"
              icon="ArrowLeft"
              circle
              size="small"
              @click="goPreviousDay"
            />
            <div>
              <h3>
                {{ dayjs(selectedDate).format("YYYY 年 M 月 DD 日 (ddd)") }}
              </h3>
              <p class="detail-stats">
                共 N 筆訂單 |
                <span class="stat-ordered">↓ N</span>
                <span class="stat-completed">✓ N</span>
                <span class="stat-cancelled">✕ N</span>
                | 營收 $???
              </p>
            </div>
            <el-button
              class="day-nav-btn"
              icon="ArrowRight"
              circle
              size="small"
              @click="goNextDay"
            />
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

        <div v-if="isDayLoading" class="detail-loading">
          資料載入中...
        </div>
        <div v-else class="detail-content">
          <!-- 今日出爐商品 -->
          <div v-if="schedule.items.length > 0" class="products-section">
            <div class="section-title">
              <span>今日出爐</span>
              <span class="count">{{ schedule.items.length }} 項商品</span>
            </div>
            <div class="products-grid">
              <div
                v-for="product in schedule.items"
                :key="product.id"
                class="product-card"
              >
                <!-- :class="{ 'out-of-stock': !product.available }" -->
                <div class="product-info">
                  <h4 class="product-name">{{ product.product_name }}</h4>
                  <p class="product-category">{{ product.category }}</p>
                  <div class="product-footer">
                    <span class="product-price">${{ product.unit_price }}</span>
                    <!-- <span v-if="product.available" class="product-stock"
                      >{{ product.stock }} 個</span
                    >
                    <span v-else class="product-sold-out">已售完</span> -->
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 訂單列表 -->
          <div class="orders-section">
            <div class="section-title">
              <span>訂單清單</span>
              <span class="count">{{ schedule.orders.length }} 筆</span>
            </div>
            <div class="orders-list">
              <div
                v-for="order in schedule.orders"
                :key="order.id"
                class="order-row"
                :style="{ borderLeftColor: getStatusColor(order.status) }"
              >
                <div class="order-id">{{ order.id }}</div>
                <div class="order-customer">
                  <span class="name">Customer</span>
                </div>
                <div class="order-time">--:--</div>
                <div class="order-items">0 項</div>
                <div class="order-amount">$00</div>
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
            v-if="schedule.orders.length === 0 && schedule.items.length === 0"
            class="empty-orders"
          >
            <el-icon><Document /></el-icon>
            <p>該日期暫無訂單及商品</p>
          </div>
        </div>

        <!-- <pre>{{ schedule }}</pre> -->
      </div>

      <ScheduleCalendar
        :schedule-list="scheduleList"
        :selected-date="selectedDate"
        :is-loading="isMonthLoading"
        @select="selectedDate = $event"
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

  .detail-header-left {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .day-nav-btn {
    flex-shrink: 0;
    border: 1px solid #e2e8f0;
  }

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

.detail-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #94a3b8;
  font-size: 14px;
  min-height: 280px;
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
