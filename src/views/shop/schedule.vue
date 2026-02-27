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
        order_count: 0,
        item_count: 0,
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
          今日
        </el-button>
      </div>
    </div>
    <!-- 排程列表 + 訂單詳情 -->
    <div class="schedule-main">
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

      <!-- 左側：訂單詳情面板 -->
      <div v-else-if="selectedDate" class="schedule-left">
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
              plain
              type="primary"
              @click="isEditorOpen ? closeEditor() : openEditor(schedule)"
            >
              <el-icon v-if="isEditorOpen"><Close /></el-icon>
              <el-icon v-else><More /></el-icon>
            </el-button>
          </div>
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

        <div v-if="isDayLoading" class="detail-loading">資料載入中...</div>
        <div v-else class="detail-content">
          <!-- 今日出爐商品 -->
          <div class="products-section">
            <div class="section-title">
              <span>今日出爐</span>
              <span class="count">{{ schedule.items.length }} 項商品</span>
            </div>
            <div class="items-list">
              <div
                v-for="product in schedule.items"
                :key="product.id"
                class="item-card"
              >
                <div class="item-thumb">
                  <img
                    v-if="product.image_url"
                    :src="product.image_url"
                    :alt="product.product_name"
                  />
                </div>
                <div class="item-name">{{ product.product_name }}</div>
                <div class="item-price">
                  {{ $formatPrice(product.unit_price) }}
                </div>
              </div>
            </div>
          </div>
          <div v-if="schedule.items.length === 0" class="empty-orders">
            <el-icon><ShoppingCart /></el-icon>
            <p>尚未開單</p>
          </div>

          <!-- 訂單列表 -->
          <!-- <div class="orders-section">
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
                <div class="order-id">{{ order.order_no }}</div>
                <div class="order-customer">
                  <span class="name">{{ order.customer_name }}</span>
                </div>
                <div class="order-time">{{ order.pickup_time }}</div>
                <div class="order-items">{{ order.items.length }} 項</div>
                <div class="order-amount">
                  {{ $formatPrice(order.total_amount) }}
                </div>
                <div
                  class="order-status"
                  :style="{ background: getStatusColor(order.status) }"
                >
                  {{ getStatusLabel(order.status) }}
                </div>
              </div>
            </div>
            <div v-if="schedule.orders.length === 0" class="empty-orders">
              <el-icon><Document /></el-icon>
              <p>該日期暫無訂單</p>
            </div>
          </div> -->
        </div>

        <!-- <pre>{{ schedule }}</pre> -->
      </div>

      <div class="schedule-right">
        <!-- 月份導航 -->
        <div class="month-navigation">
          <el-button icon="ArrowLeft" circle @click="goPreviousMonth" />
          <span class="month-label">{{ getCurrentMonthLabel }}</span>
          <el-button icon="ArrowRight" circle @click="goNextMonth" />
        </div>
        <ScheduleCalendar
          :schedule-list="scheduleList"
          :selected-date="selectedDate"
          :is-loading="isMonthLoading"
          @select="selectedDate = $event"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/scrollbar.scss" as *;
.schedule-container {
  padding: 12px;
  background: #f8fafc;
  min-height: 100vh;
}

.schedule-header {
  margin-bottom: 12px;

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
    gap: 12px;

    h2 {
      font-size: 26px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 6px 0;
    }

    .subtitle {
      font-size: 12px;
      color: #64748b;
      margin: 0;
    }

    .el-button {
      height: 40px;
      padding: 0 12px;
      font-size: 14px;
      font-weight: 600;
    }
  }
}

.month-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;

  .el-button {
    width: 36px;
    height: 36px;
    border: 1px solid #e2e8f0;
  }

  .month-label {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    min-width: 110px;
    text-align: center;
  }
}

// 左右分割主容器
.schedule-main {
  display: flex;
  gap: 12px;
  min-height: calc(100vh - 200px);
}

.schedule-left {
  flex: 1;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  animation: slideInRight 0.3s ease;
}

.schedule-right {
  flex: 0 0 auto;
 
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  padding: 12px 16px;
  gap: 8px;

  .detail-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .day-nav-btn {
    flex-shrink: 0;
    border: 1px solid #e2e8f0;
    width: 34px;
    height: 34px;
  }

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .detail-stats {
    font-size: 11px;
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
  width: 36px;
  height: 36px;
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
  background: white;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 80px;
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
      font-size: 24px;
      color: #1e293b;
      line-height: 1.2;
      word-break: break-word;
    }

    .stat-label {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
      white-space: nowrap;
    }
  }
}

.detail-content {
  flex: 1;
  padding: 12px 16px;

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
  padding: 30px 16px;
  color: #94a3b8;
  font-size: 13px;
  min-height: 200px;
}

// 商品區塊
.products-section {
  margin-bottom: 10px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 15px;
  .count {
    color: #94a3b8;
    font-weight: 400;
  }
}

.products-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

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

.product-card {
  width: 120px;
  background: #f8fafc;
  border-radius: 6px;
  padding: 6px 8px;
  text-align: center;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: white;
    border-color: #cbd5e1;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
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

.product-thumb {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 4px;
  background: linear-gradient(135deg, #e2e8f0 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  margin-bottom: 6px;
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

.product-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.product-name {
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-category {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.product-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 3px;
  padding-top: 3px;
  border-top: 1px solid #e2e8f0;
  gap: 2px;
}

.product-price {
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
  margin-top: 12px;
}

.empty-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 16px;
  color: #94a3b8;

  .el-icon {
    font-size: 28px;
    margin-bottom: 6px;
  }

  p {
    margin: 0;
    font-size: 13px;
  }
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  @include scrollbar(rgb(160, 160, 160), rgb(255, 0, 0), rgb(245, 245, 245));
}

.order-row {
  display: grid;
  min-width: 480px;
  grid-template-columns: 130px 70px 50px 45px 70px 70px;
  gap: 6px;
  align-items: center;
  padding: 8px;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 4px solid #3b82f6;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  .order-id {
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
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
    color: #475569;
    font-weight: 600;
    font-size: 13px;
  }

  .order-items {
    color: #64748b;
    font-weight: 500;
  }

  .order-amount {
    font-weight: 700;
    color: #1e293b;
    font-size: 15px;
  }

  .order-status {
    color: white;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 4px;
    text-align: center;
    font-size: 12px;
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
@media (max-width: 1200px) {
  .schedule-main {
    min-height: auto;
  }

  .schedule-left {
    min-width: 350px;
  }
}

@media (max-width: 1024px) {
  .schedule-container {
    padding: 10px 4%;
  }

  .schedule-main {
    flex-direction: column;
    min-height: auto;
    gap: 10px;
  }

  .schedule-left {
    min-width: 100%;
    min-height: 300px;
    max-height: 50vh;
  }
}

@media (max-width: 768px) {
  .schedule-container {
    padding: 8px 2%;
  }

  .schedule-main {
    flex-direction: column;
    gap: 8px;
  }

  .schedule-left {
    min-height: 250px;
    max-height: 45vh;
  }

  .detail-header {
    padding: 8px 10px;
    gap: 6px;

    .detail-header-left {
      gap: 6px;

      h3 {
        font-size: 14px;
      }
    }
  }

  .detail-content {
    padding: 8px 10px;
  }

  .products-section {
    margin-bottom: 8px;
  }

  .items-list {
    gap: 6px;
  }

  .item-card {
    padding: 6px 10px;
    gap: 10px;

    .item-thumb {
      width: 36px;
      height: 36px;
    }

    .item-name {
      font-size: 14px;
    }

    .item-price {
      font-size: 14px;
      min-width: 60px;
    }
  }

  .stats-grid {
    gap: 4px;
    padding: 6px;
  }

  .stat-item {
    min-width: 70px;
    padding: 6px 4px;
    min-height: 50px;

    .stat-text {
      .stat-value {
        font-size: 20px;
      }

      .stat-label {
        font-size: 11px;
      }
    }
  }
}
</style>
