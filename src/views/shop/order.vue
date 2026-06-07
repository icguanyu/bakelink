<script setup>
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { orderStatusOptions } from "@/utils/constants";
import { Schedules } from "@/api/schedules";
import { Orders } from "@/api/orders";
import { Users } from "@/api/auth";
import { ElNotification } from "element-plus";

const router = useRouter();
const scrollContainerRef = ref(null);
const orderCreate = ref(null);
const shopData = ref(null);
// 訂單狀態
const activeTab = ref("all");
const searchQuery = ref("");
const selectedDate = ref(dayjs().format("YYYY-MM-DD"));
const viewMode = ref(localStorage.getItem("order-view-mode") || "detailed");
const loading = ref(false);
const showStats = ref(localStorage.getItem("order-show-stats") !== "false");

watch(viewMode, (v) => localStorage.setItem("order-view-mode", v));
watch(showStats, (v) => localStorage.setItem("order-show-stats", String(v)));

// 當日開單
const schedule = reactive({
  schedule_date: "",
  status: "DRAFT",
  order_start_at: null,
  order_end_at: null,
  items: [],
  orders: [],
});

const statusOptions = orderStatusOptions;

// 計算當前日期各狀態數量
const statusCounts = computed(() => {
  const counts = {};
  const dateOrders = schedule.orders.filter((o) =>
    o.pickup_time.startsWith(selectedDate.value),
  );
  dateOrders.forEach((order) => {
    counts[order.status] = (counts[order.status] || 0) + 1;
  });
  return counts;
});

// 更新狀態選項的計數
statusOptions.forEach((option) => {
  if (option.value !== "all") {
    Object.defineProperty(option, "count", {
      get: () => statusCounts.value[option.value] || 0,
    });
  }
});

// 日期統計
const dateStats = computed(() => {
  return {
    total: schedule.orders.length,
    placed: schedule.orders.filter((o) => o.status === "PLACED").length,
    completed: schedule.orders.filter((o) => o.status === "COMPLETED").length,
    cancelled: schedule.orders.filter((o) => o.status === "CANCELLED").length,
    revenue: schedule.orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.total_amount, 0),
  };
});

// 日期星期顯示
const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
const dayName = computed(
  () => `週${dayNames[dayjs(selectedDate.value).day()]}`,
);

// 日期顯示標籤
const dateLabel = computed(() => {
  const today = dayjs().format("YYYY-MM-DD");
  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  if (selectedDate.value === today) return "今日";
  if (selectedDate.value === tomorrow) return "明日";
  if (selectedDate.value === yesterday) return "昨日";
  return dayjs(selectedDate.value).format("M/D");
});

// 篩選訂單
const filteredOrders = computed(() => {
  let result = schedule.orders;

  // 狀態篩選
  if (activeTab.value !== "all") {
    result = result.filter((o) => o.status === activeTab.value);
  }

  // 搜尋篩選
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (o) =>
        o.id.toLowerCase().includes(query) ||
        o.customer_name.toLowerCase().includes(query) ||
        o.customer_phone.includes(query),
    );
  }
  return result;
});

const getStatusLabel = (status) => {
  const map = {
    PLACED: "已下單",
    COMPLETED: "已完成",
    CANCELLED: "已取消",
  };
  return map[status] || status;
};

const updateStatus = async (order, newStatus) => {
  loading.value = true;
  try {
    await Orders.UpdateStatus(order.id, { status: newStatus });
    ElNotification({
      title: "成功",
      message: `顧客 ${order.customer_name} 的訂單已更新為${getStatusLabel(newStatus)}`,
      type: "success",
    });
  } catch (error) {
    console.log("Error updating order status:", error);
  } finally {
    loading.value = false;
    // 重新載入當天的排程資料，以獲得最新的訂單列表
    await initScheduleDataByDate(selectedDate.value);
  }
};

// 快捷日期選擇
const setToday = () => {
  selectedDate.value = dayjs().format("YYYY-MM-DD");
};

const setTomorrow = () => {
  selectedDate.value = dayjs().add(1, "day").format("YYYY-MM-DD");
};

const setDayAfterTomorrow = () => {
  selectedDate.value = dayjs().add(2, "day").format("YYYY-MM-DD");
};

// 上一天
const goPreviousDay = () => {
  selectedDate.value = dayjs(selectedDate.value)
    .subtract(1, "day")
    .format("YYYY-MM-DD");
};

// 下一天
const goNextDay = () => {
  selectedDate.value = dayjs(selectedDate.value)
    .add(1, "day")
    .format("YYYY-MM-DD");
};

const isSelectedDate = (offset) => {
  const targetDate = dayjs().add(offset, "day").format("YYYY-MM-DD");
  return selectedDate.value === targetDate;
};

const clearSearch = () => {
  searchQuery.value = "";
};

const anchorWindowSize = 8;
const scrollState = ref({ y: 0, max: 0 });
const anchorNavRef = ref(null);

const updateScrollState = () => {
  const container = scrollContainerRef.value;
  if (!container) return;
  const y = container.scrollTop || 0;
  const scrollHeight = container.scrollHeight;
  const max = Math.max(0, scrollHeight - container.clientHeight);
  scrollState.value = { y, max };

  const anchorNav = anchorNavRef.value;
  if (!anchorNav) return;
  const anchorMax = anchorNav.scrollHeight - anchorNav.clientHeight;
  if (anchorMax <= 0) {
    anchorNav.scrollTop = 0;
    return;
  }
  const ratio = max > 0 ? y / max : 0;
  anchorNav.scrollTop = Math.round(anchorMax * ratio);
};

const handleScroll = () => {
  window.requestAnimationFrame(updateScrollState);
};

const getOrderAnchorId = (order) => `order-${order.id}`;

const getOrderNumberLabel = (order) => {
  const raw = order?.order_no ?? order?.id ?? "";
  const match = String(raw).match(/(?:^|[-_])(\d{3})$/);
  return match ? match[1] : "000";
};

const visibleAnchors = computed(() => filteredOrders.value);

const scrollToOrder = (order) => {
  const anchorId = getOrderAnchorId(order);
  const target = document.getElementById(anchorId);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "nearest" });
};

// 處理訂單建立成功
const handleOrderCreated = async (newOrder) => {
  // 重新載入當天的排程資料，以營得最新的訂單列表
  await initScheduleDataByDate(selectedDate.value);
};

const initScheduleDataByDate = async (date) => {
  if (!date) return;
  loading.value = true;
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
    loading.value = false;
  }
};

const handleOrderDeleted = () => {
  console.log("test");
};

onMounted(async () => {
  scrollContainerRef.value = document.querySelector(".container");
  if (scrollContainerRef.value) {
    scrollContainerRef.value.addEventListener("scroll", handleScroll, {
      passive: true,
    });
  }
  window.addEventListener("resize", handleScroll, { passive: true });
  initScheduleDataByDate(selectedDate.value);
  try {
    const res = await Users.Me();
    shopData.value = res.data;
  } catch {}
});

onBeforeUnmount(() => {
  if (scrollContainerRef.value) {
    scrollContainerRef.value.removeEventListener("scroll", handleScroll);
  }
  window.removeEventListener("resize", handleScroll);
});

watch(
  filteredOrders,
  () => {
    nextTick(() => {
      updateScrollState();
    });
  },
  { immediate: true },
);

watch(selectedDate, (val) => {
  console.log("Selected date changed:", val);
  initScheduleDataByDate(val);
});
</script>

<template>
  <div class="order-manager">
    <!-- 頂部標題 -->
    <div class="order-header">
      <div class="header-top">
        <div>
          <h2>訂單管理</h2>
          <p class="subtitle">查看與管理每日訂單，追蹤訂單狀態</p>
        </div>
        <div class="header-actions">
          <div class="view-toggles">
            <button
              class="toggle-btn"
              :class="{ active: showStats }"
              @click="showStats = !showStats"
              :title="showStats ? '隱藏統計' : '顯示統計'"
            >
              <el-icon><DataLine /></el-icon>
              <span>統計</span>
            </button>
            <button
              class="toggle-btn"
              :class="{ active: viewMode === 'detailed' }"
              @click="
                viewMode = viewMode === 'detailed' ? 'simple' : 'detailed'
              "
              :title="viewMode === 'detailed' ? '卡片' : '清單'"
            >
              <el-icon><Document /></el-icon>
              <span>{{ viewMode === 'detailed' ? '卡片' : '清單' }}</span>
            </button>
          </div>
          <el-button size="small" @click="setToday">回今天</el-button>
          <el-button
            type="primary"
            icon="Plus"
            :disabled="!schedule.id"
            @click="orderCreate.open(schedule, shopData)"
            >{{ schedule.id ? "新增訂單" : "請先開單" }}</el-button
          >
        </div>
      </div>
    </div>

    <!-- 頂部統計卡片 -->
    <div v-show="showStats" class="stats-cards">
      <div class="stat-card">
        <div class="stat-value">{{ dateStats.total }}</div>
        <div class="stat-label">{{ dateLabel }}訂單</div>
      </div>
      <div class="stat-card">
        <div class="stat-value placed">{{ dateStats.placed }}</div>
        <div class="stat-label">已下單</div>
      </div>
      <div class="stat-card">
        <div class="stat-value completed">{{ dateStats.completed }}</div>
        <div class="stat-label">已完成</div>
      </div>
      <div class="stat-card">
        <div class="stat-value cancelled">{{ dateStats.cancelled }}</div>
        <div class="stat-label">已取消</div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-value">{{ $formatPrice(dateStats.revenue) }}</div>
        <div class="stat-label">{{ dateLabel }}總金額</div>
      </div>
    </div>

    <!-- 日期選擇與搜尋 -->
    <div class="toolbar">
      <div class="date-nav">
        <el-button
          icon="ArrowLeft"
          circle
          size="small"
          :loading="loading"
          @click="goPreviousDay"
        />
        <div class="date-picker-wrap">
          <span class="weekday-label">{{ dayName }}</span>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="選擇日期"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            :clearable="false"
          />
        </div>
        <el-button
          icon="ArrowRight"
          circle
          size="small"
          :loading="loading"
          @click="goNextDay"
        />
      </div>
      <el-input
        v-model="searchQuery"
        placeholder="搜尋姓名、電話、編號"
        prefix-icon="Search"
        clearable
        style="max-width: 260px"
        @clear="clearSearch"
      />
    </div>

    <!-- 狀態分類標籤 -->
    <div class="status-tabs">
      <div
        v-for="tab in statusOptions"
        :key="tab.value"
        class="status-tab"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        <span class="tab-label">{{ tab.label }}</span>
        <span
          v-if="tab.value !== 'all'"
          class="tab-count"
          :style="{ background: tab.color }"
        >
          {{ dateStats[tab.value.toLowerCase()] }}
        </span>
        <span v-else class="tab-count-all">{{ dateStats.total }}</span>
      </div>
    </div>

    <!-- 訂單列表 -->
    <div class="orders-grid" :class="{ 'list-view': viewMode === 'simple' }">
      <!-- 讀取中骨架屏 -->
      <template v-if="loading">
        <div v-for="i in 6" :key="`skeleton-${i}`" class="order-skeleton">
          <el-skeleton animated>
            <template #template>
              <div class="skeleton-header">
                <el-skeleton-item variant="text" style="width: 60%" />
                <el-skeleton-item variant="text" style="width: 30%" />
              </div>
              <div class="skeleton-customer">
                <el-skeleton-item variant="text" style="width: 40%" />
                <el-skeleton-item variant="text" style="width: 50%" />
              </div>
              <div class="skeleton-divider" />
              <div class="skeleton-items">
                <el-skeleton-item
                  variant="text"
                  style="width: 100%; height: 20px"
                />
                <el-skeleton-item
                  variant="text"
                  style="width: 90%; height: 20px"
                />
                <el-skeleton-item
                  variant="text"
                  style="width: 85%; height: 20px"
                />
              </div>
              <div class="skeleton-divider" />
              <div class="skeleton-footer">
                <el-skeleton-item variant="text" style="width: 40%" />
                <el-skeleton-item
                  variant="text"
                  style="width: 35%; height: 30px"
                />
              </div>
              <div class="skeleton-actions">
                <el-skeleton-item
                  variant="button"
                  style="width: 48%; height: 32px"
                />
                <el-skeleton-item
                  variant="button"
                  style="width: 48%; height: 32px"
                />
              </div>
            </template>
          </el-skeleton>
        </div>
      </template>

      <!-- 訂單卡片 -->
      <template v-else>
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="order-card-anchor"
          :id="getOrderAnchorId(order)"
        >
          <OrderCard
            :order="order"
            :items="schedule.items"
            :view-mode="viewMode"
            @status-change="updateStatus"
            @update="initScheduleDataByDate(selectedDate)"
          />
        </div>

        <!-- 空狀態 -->
        <div v-if="filteredOrders.length === 0" class="empty-state">
          <el-icon class="empty-icon"><Document /></el-icon>
          <p class="empty-text">
            {{
              schedule.id
                ? "當前日期沒有符合條件的訂單"
                : "尚未設定當前日期的排程，請先建立排程後再新增訂單"
            }}
          </p>
        </div>
      </template>
    </div>

    <div
      v-if="filteredOrders.length"
      ref="anchorNavRef"
      class="order-anchor-nav"
    >
      <button
        v-for="order in visibleAnchors"
        :key="order.id"
        type="button"
        class="anchor-item"
        @click="scrollToOrder(order)"
      >
        {{ getOrderNumberLabel(order) }}
      </button>
    </div>

    <!-- 建立訂單對話框 -->
    <OrderCreate ref="orderCreate" @created="handleOrderCreated" />
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/scrollbar.scss" as *;

// ── 色彩變數 ──────────────────────────────────────────────
$accent: #fe904d;
$accent-light: #fff3eb;
$text-primary: #1e293b;
$text-secondary: #64748b;
$border: #e8dfd6;
$bg-page: #faf7f4;
$bg-card: #ffffff;

.order-manager {
  padding: 16px;
  background: $bg-page;
  min-height: 100vh;
}

// ── 頂部標題 ────────────────────────────────────────────
.order-header {
  margin-bottom: 12px;

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;

    h2 {
      font-size: 24px;
      font-weight: 700;
      color: $text-primary;
      margin: 0 0 4px 0;
      letter-spacing: -0.3px;
    }

    .subtitle {
      font-size: 13px;
      color: $text-secondary;
      margin: 0;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .el-button {
      margin: 0;
    }

    .view-toggles {
      display: flex;

      border-radius: 8px;
      overflow: hidden;
      background: $bg-card;
    }

    .toggle-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 10px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.15s;

      & + .toggle-btn {
        border-left: 1px solid $border;
      }

      &:hover {
        background: $bg-page;
      }

      &.active {
        background: $accent;
        color: #fff;
      }

      .el-icon {
        font-size: 14px;
      }
    }
  }
}

// ── 統計卡片 ────────────────────────────────────────────
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.stat-card {
  background: $bg-card;
  border-radius: 8px;
  padding: 10px 14px;
  border: 1px solid $border;

  &.highlight {
    border-color: var(--color-primary);
  }

  .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: $text-primary;
    line-height: 1;
    margin-bottom: 3px;

    &.placed {
      color: var(--color-primary);
    }
    &.completed {
      color: #16a34a;
    }
    &.cancelled {
      color: #cf4747;
    }
  }

  .stat-label {
    font-size: 12px;
    color: $text-secondary;
    font-weight: 500;
  }
}

// ── 工具列 ──────────────────────────────────────────────
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
  flex-wrap: wrap;

  .date-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    .el-button[circle] {
      flex-shrink: 0;
      border: 1px solid $border;
      width: 32px;
      height: 32px;
    }

    .date-picker-wrap {
      display: flex;
      align-items: center;
      gap: 0;
      background: $bg-card;
      border: 1px solid $border;
      border-radius: 8px;
      overflow: hidden;

      .weekday-label {
        padding: 0 10px;
        font-size: 13px;
        font-weight: 600;
        color: $accent;
        white-space: nowrap;
        border-right: 1px solid $border;
        height: 32px;
        display: flex;
        align-items: center;
      }

      :deep(.el-date-editor.el-input) {
        border: none;
        box-shadow: none;
        border-radius: 0;
        width: 130px;

        .el-input__wrapper {
          box-shadow: none !important;
          border-radius: 0;
          padding: 0 8px;
        }
      }
    }
  }
}

// ── 狀態標籤 ────────────────────────────────────────────
.status-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  width: 100%;
}

.status-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 8px;
  background: $bg-card;
  border: 1px solid $border;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  flex: 1;

  &:hover {
    background: #fafaf9;
    border-color: #d6d3d1;
  }

  &.active {
    border-color: $accent;
    background: $accent-light;

    .tab-label {
      color: $accent;
      font-weight: 600;
    }
  }

  .tab-label {
    font-size: 14px;
    color: $text-secondary;
    font-weight: 500;
  }

  .tab-count {
    padding: 1px 7px;
    border-radius: 4px;
    color: white;
    font-size: 12px;
    line-height: 16px;
    font-weight: 700;
    min-width: 22px;
    text-align: center;
  }

  .tab-count-all {
    padding: 1px 7px;
    border-radius: 4px;
    background: #fff;
    color: $text-secondary;
    font-size: 12px;
    font-weight: 700;
    min-width: 22px;
    text-align: center;
  }
}

// ── 訂單網格 ────────────────────────────────────────────
.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  grid-auto-rows: 1fr;
  gap: 10px;

  &.list-view {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
  }
}

.order-card-anchor {
  scroll-margin-top: 80px;
}

// ── 訂單骨架屏 ──────────────────────────────────────────
.order-skeleton {
  background: $bg-card;
  border-radius: 0;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(28, 25, 23, 0.08);
  border: 1px solid $border;
  min-height: 480px;

  .skeleton-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .skeleton-customer {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
  }

  .skeleton-divider {
    height: 1px;
    background: $border;
    margin: 16px 0;
  }

  .skeleton-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .skeleton-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .skeleton-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }
}

// ── 快速錨點導覽 ────────────────────────────────────────
.order-anchor-nav {
  position: fixed;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  max-height: 40vh;
  overflow-y: auto;
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 4px;
  border: 1px solid $border;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  @include scrollbar(
    rgba(192, 192, 192, 0.7),
    rgba(120, 120, 120, 0.9),
    rgba(133, 133, 133, 0.08)
  );
  .anchor-item {
    width: 38px;
    height: 24px;
    flex-shrink: 0;
    border-radius: 4px;
    border: 1px solid $border;
    background: $bg-card;
    color: $text-secondary;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .anchor-item:hover {
    border-color: $accent;
    color: $accent;
    background: $accent-light;
  }

  .anchor-ellipsis {
    font-size: 12px;
    color: #a8a29e;
    line-height: 1;
  }
}

// ── 空狀態 ──────────────────────────────────────────────
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;

  .empty-icon {
    font-size: 56px;
    color: #d6d3d1;
    margin-bottom: 14px;
  }

  .empty-text {
    font-size: 15px;
    color: #a8a29e;
    text-align: center;
    max-width: 320px;
    line-height: 1.6;
  }
}

// ── 響應式 ──────────────────────────────────────────────
@media (max-width: 768px) {
  .order-manager {
    padding: 10px 4%;
  }

  .order-header {
    margin-bottom: 16px;

    .header-top {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .header-actions {
      justify-content: stretch;
      flex-wrap: wrap;

      .el-button:first-child {
        display: none;
      }

      .el-button {
        flex: 1;
        min-width: calc(50% - 4px);
        height: 44px;
        font-size: 15px;
      }
    }
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;

    .date-selector {
      flex-wrap: wrap;

      .el-date-editor {
        flex: 1;
        width: 100% !important;
        order: 2;
      }

      .el-button[circle] {
        flex-shrink: 0;
      }

      .el-button[circle]:first-child {
        order: 1;
      }

      .el-button[circle]:nth-child(3) {
        order: 3;
      }
    }

    .el-input {
      max-width: 100% !important;
    }
  }

  .orders-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .order-skeleton {
    min-height: 400px;
  }

  .order-anchor-nav {
    display: flex;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 10px 14px;
  }
}
</style>
