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

const selectedDateStats = computed(() => {
  if (!selectedDate.value) return null;
  const list = Array.isArray(schedule.orders) ? schedule.orders : [];
  if (list.length === 0) return null;

  const stats = {
    total: list.length,
    ordered: list.filter((o) => o.status === "PLACED").length || 0,
    completed: list.filter((o) => o.status === "COMPLETED").length || 0,
    cancelled: list.filter((o) => o.status === "CANCELLED").length || 0,
    total_amount: getOrderAmount(schedule.orders) || 0,
  };

  return stats;
});

const getOrderAmount = (orders) => {
  if (!orders || orders.length === 0) return 0;
  return orders.reduce((total, order) => {
    const amount = order.total_amount || 0;
    return total + amount;
  }, 0);
};

const getStatusLabel = (status) => {
  const map = {
    PLACED: "已下單",
    COMPLETED: "已完成",
    CANCELLED: "已取消",
  };
  return map[status] || status;
};

const getStatusColor = (status) => {
  const map = {
    PLACED: "#3b82f6",
    COMPLETED: "#10b981",
    CANCELLED: "#ef4444",
  };
  return map[status] || "#6b7280";
};

const openEditor = (schedule) => {
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
        id: null,
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
    <!-- 頂部導航 -->
    <div class="header-bar">
      <div class="header-left">
        <h1>接單排程</h1>
        <el-button type="primary" icon="Back" @click="goToday" size="large">
          返回今日
        </el-button>
      </div>

      <!-- 月份導航 -->
      <div class="month-nav">
        <el-button icon="ArrowLeft" @click="goPreviousMonth" />
        <span>{{ getCurrentMonthLabel }}</span>
        <el-button icon="ArrowRight" @click="goNextMonth" />
      </div>
    </div>

    <!-- 編輯器或日期詳情 -->
    <ScheduleEditor
      v-if="isEditorOpen"
      :schedule="schedule"
      @close="closeEditor"
      @update="
        () => {
          initScheduleDataByMonth(selectedDate);
          initScheduleDataByDate(selectedDate);
        }
      "
    />

    <!-- 主容器 -->
    <div v-else class="content-wrapper">
      <!-- 日曆左側 -->
      <div class="calendar-panel">
        <ScheduleCalendar
          :schedule-list="scheduleList"
          :selected-date="selectedDate"
          :is-loading="isMonthLoading"
          @select="selectedDate = $event"
        />
      </div>

      <!-- 詳情右側 -->
      <div v-if="selectedDate" class="detail-panel">
        <!-- 日期頭部卡片 -->
        <div class="date-card">
          <div class="date-header">
            <div class="date-nav">
              <el-button
                icon="ArrowLeft"
                circle
                @click="goPreviousDay"
              />
              <span class="date-text">
                {{ dayjs(selectedDate).format("M月DD日 (ddd)") }}
              </span>
              <el-button
                icon="ArrowRight"
                circle
                @click="goNextDay"
              />
            </div>
            <el-button
              type="primary"
              plain
              icon="Edit"
              @click="openEditor(schedule)"
            >
              設定
            </el-button>
          </div>

          <!-- 統計信息卡片 -->
          <div v-if="selectedDateStats" class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon" style="color: #3b82f6">
                <el-icon><ShoppingCart /></el-icon>
              </div>
              <div class="stat-text">
                <div class="stat-value">{{ selectedDateStats.total }}</div>
                <div class="stat-label">訂單</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon" style="color: #3b82f6">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stat-text">
                <div class="stat-value">{{ selectedDateStats.ordered }}</div>
                <div class="stat-label">已下單</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon" style="color: #10b981">
                <el-icon><SuccessFilled /></el-icon>
              </div>
              <div class="stat-text">
                <div class="stat-value">{{ selectedDateStats.completed }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon" style="color: #ef4444">
                <el-icon><Close /></el-icon>
              </div>
              <div class="stat-text">
                <div class="stat-value">{{ selectedDateStats.cancelled }}</div>
                <div class="stat-label">已取消</div>
              </div>
            </div>
            <div class="stat-item highlight">
              <div class="stat-icon" style="color: #f59e0b">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stat-text">
                <div class="stat-value">
                  {{ $formatPrice(selectedDateStats.total_amount) }}
                </div>
                <div class="stat-label">營收</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 內容區 -->
        <div v-if="isDayLoading" class="loading-state">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <p>載入中...</p>
        </div>

        <div v-else class="content-area">
          <!-- 商品區 -->
          <div v-if="schedule.items.length > 0" class="section">
            <h3 class="section-header">
              <el-icon><Goods /></el-icon>
              今日出爐 <span class="count">{{ schedule.items.length }}</span>
            </h3>
            <div class="products-grid">
              <div
                v-for="product in schedule.items"
                :key="product.id"
                class="product-item"
              >
                <div class="product-name">{{ product.product_name }}</div>
                <div class="product-price">
                  {{ $formatPrice(product.unit_price) }}
                </div>
              </div>
            </div>
          </div>

          <!-- 訂單區 -->
          <div v-if="schedule.orders.length > 0" class="section">
            <h3 class="section-header">
              <el-icon><List /></el-icon>
              訂單清單 <span class="count">{{ schedule.orders.length }}</span>
            </h3>
            <div class="orders-container">
              <div
                v-for="order in schedule.orders"
                :key="order.id"
                class="order-card"
              >
                <div class="order-card-header">
                  <div class="order-id">{{ order.order_no }}</div>
                  <div
                    class="order-badge"
                    :style="{ background: getStatusColor(order.status) }"
                  >
                    {{ getStatusLabel(order.status) }}
                  </div>
                </div>
                <div class="order-card-body">
                  <div class="order-row">
                    <span class="label">顧客</span>
                    <span class="value">{{ order.customer_name }}</span>
                  </div>
                  <div class="order-row">
                    <span class="label">取貨</span>
                    <span class="value">{{ order.pickup_time }}</span>
                  </div>
                  <div class="order-row">
                    <span class="label">項目</span>
                    <span class="value">{{ order.items.length }} 項</span>
                  </div>
                  <div class="order-row amount">
                    <span class="label">合計</span>
                    <span class="value">
                      {{ $formatPrice(order.total_amount) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空狀態 -->
          <div v-if="schedule.items.length === 0 && schedule.orders.length === 0" class="empty-state">
            <el-icon><Document /></el-icon>
            <p>該日期暫無內容</p>
          </div>
        </div>
      </div>

      <!-- 未選日期 -->
      <div v-else class="empty-panel">
        <el-icon><CalendarBlank /></el-icon>
        <p>請選擇日期</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.schedule-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
}

// 頂部導航欄
.header-bar {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    h1 {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .el-button {
      height: 40px;
      font-weight: 600;
    }
  }

  .month-nav {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 12px;
    background: #f8fafc;
    border-radius: 6px;
    border: 1px solid #e2e8f0;

    .el-button {
      padding: 0 6px;
      height: 32px;
    }

    span {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      min-width: 90px;
      text-align: center;
    }
  }
}

// 主容器
.content-wrapper {
  flex: 1;
  display: flex;
  gap: 12px;
  padding: 12px;
  overflow: hidden;
}

.calendar-panel {
  flex-shrink: 0;
  width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.detail-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.empty-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  color: #94a3b8;

  .el-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: 16px;
  }
}

// 日期卡片
.date-card {
  flex-shrink: 0;
  background: white;
  border-radius: 8px;
  padding: 12px 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;

  .date-nav {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-button {
      padding: 0 6px;
      height: 32px;
    }

    .date-text {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      min-width: 100px;
      text-align: center;
    }
  }

  .el-button {
    height: 32px;
    font-weight: 600;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 6px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  text-align: center;
  min-height: 60px;

  &.highlight {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-color: #fbbf24;
  }

  .stat-icon {
    flex-shrink: 0;
    font-size: 18px;
    line-height: 1;
  }

  .stat-text {
    min-width: 0;
    width: 100%;

    .stat-value {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.2;
      word-break: break-word;
    }

    .stat-label {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
      white-space: nowrap;
    }
  }
}

// 內容區
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  color: #94a3b8;

  .loading-icon {
    font-size: 32px;
    margin-bottom: 8px;
    animation: spin 2s linear infinite;
  }

  p {
    margin: 0;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.content-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 6px;

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

.section {
  flex-shrink: 0;
  background: white;
  border-radius: 8px;
  padding: 12px 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 10px 0;

  .el-icon {
    font-size: 16px;
  }

  .count {
    font-size: 12px;
    font-weight: 400;
    color: #64748b;
    margin-left: auto;
  }
}

// 商品網格
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 8px;
  width: 100%;
}

.product-item {
  background: linear-gradient(135deg, #f0f9ff 0%, #f3f4f6 100%);
  border: 1px solid #dbeafe;
  border-radius: 6px;
  padding: 8px;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
  }

  .product-name {
    font-size: 12px;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-word;
  }

  .product-price {
    font-size: 13px;
    font-weight: 700;
    color: #3b82f6;
  }
}

// 訂單卡片
.orders-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;
  }
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: #f0f4f8;
  border-bottom: 1px solid #e2e8f0;
  gap: 8px;
  min-width: 0;

  .order-id {
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .order-badge {
    font-size: 11px;
    font-weight: 700;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    flex-shrink: 0;
    white-space: nowrap;
  }
}

.order-card-body {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;

  .order-row {
    display: grid;
    grid-template-columns: 50px 1fr;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    min-width: 0;

    .label {
      color: #64748b;
      font-weight: 500;
      white-space: nowrap;
    }

    .value {
      color: #1e293b;
      font-weight: 600;
      text-align: right;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &.amount {
      padding-top: 4px;
      border-top: 1px solid #e2e8f0;
      margin-top: 4px;

      .value {
        font-size: 13px;
        font-weight: 700;
        color: #f59e0b;
      }
    }
  }
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  color: #94a3b8;

  .el-icon {
    font-size: 40px;
    margin-bottom: 8px;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

// 響應式
@media (max-width: 1280px) {
  .calendar-panel {
    width: 300px;
  }
}

@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
    padding: 10px;
  }

  .calendar-panel {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
}

@media (max-width: 768px) {
  .header-bar {
    padding: 10px 12px;
    flex-direction: column;
    gap: 10px;

    .header-left {
      width: 100%;
      gap: 8px;

      h1 {
        font-size: 20px;
      }

      .el-button {
        width: 100%;
      }
    }

    .month-nav {
      width: 100%;
      justify-content: center;
    }
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  }

  .products-grid {
    gap: 6px;
  }

  .product-item {
    padding: 6px;
  }

  .order-card-body {
    padding: 6px 8px;
  }
}
</style>
