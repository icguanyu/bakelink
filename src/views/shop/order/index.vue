<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  nextTick,
  ref,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";

const router = useRouter();
const scrollContainerRef = ref(null);
// 訂單狀態
const activeTab = ref("all");
const searchQuery = ref("");
const selectedDate = ref(dayjs().format("YYYY-MM-DD"));
const viewMode = ref("detailed"); // 'detailed' 或 'simple'
const showStats = ref(true); // 控制統計卡片顯示

// 模擬訂單資料
const orders = ref([
  // 今天的訂單
  {
    id: "ORD-20260216-001",
    customerName: "陳小美",
    phone: "0912-345-678",
    pickupTime: "2026-02-16 14:00",
    status: "ordered",
    payment: "cash",
    items: [
      { name: "經典牛奶吐司", quantity: 2, price: 120 },
      { name: "海鹽奶油可頌", quantity: 3, price: 75 },
    ],
    totalAmount: 465,
    note: "請幫我切片",
    createdAt: "2026-02-16 09:30",
  },
  {
    id: "ORD-20260216-002",
    customerName: "王大明",
    phone: "0923-456-789",
    pickupTime: "2026-02-16 15:30",
    status: "ordered",
    payment: "linepay",
    items: [
      { name: "巧克力可頌", quantity: 5, price: 85 },
      { name: "伯爵茶貝果", quantity: 2, price: 90 },
    ],
    totalAmount: 605,
    note: "",
    createdAt: "2026-02-16 10:15",
  },
  {
    id: "ORD-20260216-003",
    customerName: "林小華",
    phone: "0934-567-890",
    pickupTime: "2026-02-16 16:00",
    status: "ordered",
    payment: "card",
    items: [
      { name: "小麥酸種", quantity: 1, price: 180 },
      { name: "蜂蜜核桃雜糧", quantity: 1, price: 150 },
    ],
    totalAmount: 330,
    note: "請協助包裝精美一點，要送人的",
    createdAt: "2026-02-16 08:45",
  },
  {
    id: "ORD-20260216-004",
    customerName: "魏志軒",
    phone: "0912-789-456",
    pickupTime: "2026-02-16 10:30",
    status: "ordered",
    payment: "linepay",
    items: [
      { name: "經典牛奶吐司", quantity: 2, price: 120 },
      { name: "伯爵茶貝果", quantity: 3, price: 90 },
      { name: "巧克力可頌", quantity: 2, price: 85 },
      { name: "海鹽奶油可頌", quantity: 4, price: 75 },
      { name: "蜂蜜核桃雜糧", quantity: 1, price: 150 },
      { name: "手作波蘿麵包", quantity: 3, price: 65 },
      { name: "小麥酸種", quantity: 1, price: 180 },
    ],
    totalAmount: 1290,
    note: "公司聚餐用，需要快速準備",
    createdAt: "2026-02-16 09:00",
  },
  {
    id: "ORD-20260216-005",
    customerName: "廖佳穎",
    phone: "0923-654-321",
    pickupTime: "2026-02-16 11:00",
    status: "ordered",
    payment: "cash",
    items: [{ name: "海鹽奶油可頌", quantity: 4, price: 75 }],
    totalAmount: 300,
    note: "",
    createdAt: "2026-02-16 09:15",
  },
  {
    id: "ORD-20260216-006",
    customerName: "陳思翰",
    phone: "0934-123-789",
    pickupTime: "2026-02-16 12:00",
    status: "completed",
    payment: "card",
    items: [
      { name: "巧克力可頌", quantity: 2, price: 85 },
      { name: "手作波蘿麵包", quantity: 2, price: 65 },
    ],
    totalAmount: 330,
    note: "",
    createdAt: "2026-02-16 09:30",
  },
  {
    id: "ORD-20260216-007",
    customerName: "何美言",
    phone: "0945-234-567",
    pickupTime: "2026-02-16 13:30",
    status: "ordered",
    payment: "linepay",
    items: [
      { name: "法式厚切吐司", quantity: 1, price: 140 },
      { name: "起司鹹可頌", quantity: 2, price: 90 },
    ],
    totalAmount: 320,
    note: "要快速取貨",
    createdAt: "2026-02-16 10:00",
  },
  {
    id: "ORD-20260216-008",
    customerName: "黃奕謙",
    phone: "0956-789-012",
    pickupTime: "2026-02-16 14:30",
    status: "ordered",
    payment: "cash",
    items: [{ name: "經典牛奶吐司", quantity: 3, price: 120 }],
    totalAmount: 360,
    note: "請放在一起",
    createdAt: "2026-02-16 10:45",
  },
  {
    id: "ORD-20260216-009",
    customerName: "鄒芊芊",
    phone: "0967-345-678",
    pickupTime: "2026-02-16 15:00",
    status: "ordered",
    payment: "card",
    items: [
      { name: "蒜香法棍", quantity: 2, price: 110 },
      { name: "蜂蜜核桃雜糧", quantity: 1, price: 150 },
      { name: "經典牛奶吐司", quantity: 2, price: 120 },
      { name: "海鹽奶油可頌", quantity: 3, price: 75 },
      { name: "巧克力可頌", quantity: 2, price: 85 },
    ],
    totalAmount: 895,
    note: "公司團購",
    createdAt: "2026-02-16 11:20",
  },
  {
    id: "ORD-20260216-010",
    customerName: "簡郁庭",
    phone: "0978-456-789",
    pickupTime: "2026-02-16 15:45",
    status: "ordered",
    payment: "bank",
    items: [{ name: "伯爵茶貝果", quantity: 5, price: 90 }],
    totalAmount: 450,
    note: "辦公室訂購",
    createdAt: "2026-02-16 11:50",
  },
  {
    id: "ORD-20260216-011",
    customerName: "陳俊宇",
    phone: "0989-567-890",
    pickupTime: "2026-02-16 16:30",
    status: "cancelled",
    payment: "cash",
    items: [
      { name: "海鹽奶油可頌", quantity: 2, price: 75 },
      { name: "巧克力可頌", quantity: 2, price: 85 },
    ],
    totalAmount: 320,
    note: "客戶主動取消",
    createdAt: "2026-02-16 12:30",
  },
  {
    id: "ORD-20260216-012",
    customerName: "葉靖雯",
    phone: "0912-345-012",
    pickupTime: "2026-02-16 17:00",
    status: "ordered",
    payment: "linepay",
    items: [
      { name: "小麥酸種", quantity: 2, price: 180 },
      { name: "桂圓紅棗吐司", quantity: 1, price: 150 },
    ],
    totalAmount: 510,
    note: "送禮用，麻煩精心包裝",
    createdAt: "2026-02-16 13:00",
  },
  {
    id: "ORD-20260216-013",
    customerName: "吳昀庭",
    phone: "0923-678-901",
    pickupTime: "2026-02-16 17:30",
    status: "ordered",
    payment: "card",
    items: [
      { name: "手作波蘿麵包", quantity: 6, price: 65 },
      { name: "經典牛奶吐司", quantity: 4, price: 120 },
      { name: "巧克力可頌", quantity: 5, price: 85 },
      { name: "伯爵茶貝果", quantity: 8, price: 90 },
      { name: "蒜香法棍", quantity: 3, price: 110 },
      { name: "桂圓紅棗吐司", quantity: 2, price: 150 },
    ],
    totalAmount: 2770,
    note: "派對用 請現場計數 需要分開包裝",
    createdAt: "2026-02-16 13:45",
  },
  // 昨天的訂單
  {
    id: "ORD-20260215-015",
    customerName: "張雅芳",
    phone: "0945-678-901",
    pickupTime: "2026-02-15 18:00",
    status: "completed",
    payment: "cash",
    items: [
      { name: "法式厚切吐司", quantity: 2, price: 140 },
      { name: "手作波蘿麵包", quantity: 4, price: 65 },
    ],
    totalAmount: 540,
    note: "",
    createdAt: "2026-02-15 14:20",
  },
  {
    id: "ORD-20260215-014",
    customerName: "劉建國",
    phone: "0956-789-012",
    pickupTime: "2026-02-15 17:30",
    status: "cancelled",
    payment: "bank",
    items: [{ name: "蒜香法棍", quantity: 3, price: 110 }],
    totalAmount: 330,
    note: "客戶臨時取消",
    createdAt: "2026-02-15 12:00",
  },
  // 明天的訂單
  {
    id: "ORD-20260217-001",
    customerName: "黃志明",
    phone: "0967-123-456",
    pickupTime: "2026-02-17 10:00",
    status: "ordered",
    payment: "linepay",
    items: [
      { name: "起司鹹可頌", quantity: 4, price: 90 },
      { name: "手作波蘿麵包", quantity: 3, price: 65 },
    ],
    totalAmount: 555,
    note: "早上要用，麻煩提前準備",
    createdAt: "2026-02-16 16:20",
  },
  {
    id: "ORD-20260217-002",
    customerName: "李淑芬",
    phone: "0978-234-567",
    pickupTime: "2026-02-17 14:30",
    status: "ordered",
    payment: "cash",
    items: [{ name: "桂圓紅棗吐司", quantity: 2, price: 150 }],
    totalAmount: 300,
    note: "",
    createdAt: "2026-02-16 18:00",
  },
  // 後天的訂單
  {
    id: "ORD-20260218-001",
    customerName: "周美玲",
    phone: "0989-345-678",
    pickupTime: "2026-02-18 11:00",
    status: "ordered",
    payment: "card",
    items: [
      { name: "經典牛奶吐司", quantity: 3, price: 120 },
      { name: "蒜香法棍", quantity: 2, price: 110 },
    ],
    totalAmount: 580,
    note: "公司訂購",
    createdAt: "2026-02-16 19:30",
  },
]);

orders.value.sort((a, b) => {
  const getNumber = (order) => {
    const match = order.id.match(/(\d{3})$/);
    return match ? Number(match[1]) : 0;
  };
  const numberDiff = getNumber(a) - getNumber(b);
  if (numberDiff !== 0) return numberDiff;
  return a.id.localeCompare(b.id);
});

const statusOptions = [
  { label: "全部", value: "all", color: "" },
  { label: "已下單", value: "ordered", color: "#3b82f6", count: 0 },
  { label: "已完成", value: "completed", color: "#10b981", count: 0 },
  { label: "已取消", value: "cancelled", color: "#ef4444", count: 0 },
];

// 計算當前日期各狀態數量
const statusCounts = computed(() => {
  const counts = {};
  const dateOrders = orders.value.filter((o) =>
    o.pickupTime.startsWith(selectedDate.value),
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
  const dateOrders = orders.value.filter((o) =>
    o.pickupTime.startsWith(selectedDate.value),
  );

  return {
    total: dateOrders.length,
    ordered: dateOrders.filter((o) => o.status === "ordered").length,
    completed: dateOrders.filter((o) => o.status === "completed").length,
    cancelled: dateOrders.filter((o) => o.status === "cancelled").length,
    revenue: dateOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.totalAmount, 0),
  };
});

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
  let result = orders.value;

  // 日期篩選
  result = result.filter((o) => o.pickupTime.startsWith(selectedDate.value));

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
        o.customerName.toLowerCase().includes(query) ||
        o.phone.includes(query),
    );
  }

  // 依訂單號碼排序（由小到大）
  return result.sort((a, b) => {
    const getNumber = (order) => {
      const match = order.id.match(/(\d{3})$/);
      return match ? Number(match[1]) : 0;
    };
    const numberDiff = getNumber(a) - getNumber(b);
    if (numberDiff !== 0) return numberDiff;
    return a.id.localeCompare(b.id);
  });
});

const getStatusLabel = (status) => {
  const map = {
    ordered: "已下單",
    completed: "已完成",
    cancelled: "已取消",
  };
  return map[status] || status;
};

const updateStatus = (order, newStatus) => {
  order.status = newStatus;
  ElMessage.success(`訂單 ${order.id} 已更新為${getStatusLabel(newStatus)}`);
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
  const match = order.id.match(/(\d{3})$/);
  return match ? match[1] : "000";
};

const visibleAnchors = computed(() => filteredOrders.value);

const scrollToOrder = (order) => {
  const anchorId = getOrderAnchorId(order);
  const target = document.getElementById(anchorId);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
};

onMounted(() => {
  scrollContainerRef.value = document.querySelector(".container");
  if (scrollContainerRef.value) {
    scrollContainerRef.value.addEventListener("scroll", handleScroll, {
      passive: true,
    });
  }
  window.addEventListener("resize", handleScroll, { passive: true });
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
          <el-button
            :icon="showStats ? 'View' : 'Hide'"
            @click="showStats = !showStats"
          >
            {{ showStats ? "顯示統計" : "隱藏統計" }}
          </el-button>
          <el-button
            :icon="viewMode === 'detailed' ? 'Document' : 'List'"
            @click="viewMode = viewMode === 'detailed' ? 'simple' : 'detailed'"
          >
            {{ viewMode === "detailed" ? "詳細模式" : "簡易模式" }}
          </el-button>

          <el-button icon="Back" @click="setToday"> 回到今天 </el-button>
          <el-button type="primary" icon="Plus">新增訂單</el-button>
        </div>
      </div>
    </div>

    <!-- 頂部統計卡片 -->
    <div v-show="showStats" class="stats-cards">
      <div class="stat-card">
        <div
          class="stat-icon"
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        >
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ dateStats.total }}</div>
          <div class="stat-label">{{ dateLabel }}訂單</div>
        </div>
      </div>
      <div class="stat-card">
        <div
          class="stat-icon"
          style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        >
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ dateStats.ordered }}</div>
          <div class="stat-label">已下單</div>
        </div>
      </div>
      <div class="stat-card">
        <div
          class="stat-icon"
          style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
        >
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ dateStats.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card">
        <div
          class="stat-icon"
          style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        >
          <el-icon><Warning /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ dateStats.cancelled }}</div>
          <div class="stat-label">已取消</div>
        </div>
      </div>
      <div class="stat-card highlight">
        <div
          class="stat-icon"
          style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
        >
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">
            ${{ dateStats.revenue.toLocaleString() }}
          </div>
          <div class="stat-label">{{ dateLabel }}營收</div>
        </div>
      </div>
    </div>

    <!-- 日期選擇與搜尋 -->
    <div class="toolbar">
      <div class="date-selector">
        <el-button
          icon="ArrowLeft"
          circle
          size="small"
          @click="goPreviousDay"
        />
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="選擇日期"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          style="width: 160px"
        />
        <el-button icon="ArrowRight" circle size="small" @click="goNextDay" />
      </div>
      <div style="display: flex; gap: 8px; align-items: center">
        <el-input
          v-model="searchQuery"
          placeholder="搜尋編號、姓名、電話..."
          prefix-icon="Search"
          style="max-width: 280px"
        />
        <el-button
          icon="Refresh"
          @click="clearSearch"
          :disabled="!searchQuery"
        />
      </div>
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
          {{ tab.count }}
        </span>
        <span v-else class="tab-count-all">{{ dateStats.total }}</span>
      </div>
    </div>

    <!-- 訂單列表 -->
    <div class="orders-grid">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-card-anchor"
        :id="getOrderAnchorId(order)"
      >
        <OrderCard
          :order="order"
          :view-mode="viewMode"
          @status-change="updateStatus"
        />
      </div>

      <!-- 空狀態 -->
      <div v-if="filteredOrders.length === 0" class="empty-state">
        <el-icon class="empty-icon"><Document /></el-icon>
        <p class="empty-text">目前沒有訂單</p>
      </div>
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
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/scrollbar.scss" as *;
.order-manager {
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
}

.order-header {
  margin-bottom: 24px;

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
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

  .header-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    .el-button {
      margin: 0;
    }
  }
}

// 統計卡片
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  &.highlight {
    border: 2px solid #fee140;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    flex-shrink: 0;
  }

  .stat-content {
    flex: 1;
    min-width: 0;

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
  }
}

// 工具列
.toolbar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;

  .date-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;

    .el-button[circle] {
      flex-shrink: 0;
      border: 1px solid #e2e8f0;
    }
  }
}

// 狀態標籤
.status-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
}

.status-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  &.active {
    border-color: #3b82f6;
    background: #eff6ff;

    .tab-label {
      color: #3b82f6;
      font-weight: 600;
    }
  }

  .tab-label {
    font-size: 1.125rem;
    color: #475569;
    font-weight: 500;
  }

  .tab-count {
    padding: 2px 8px;
    border-radius: 10px;
    color: white;
    font-weight: 700;
    min-width: 24px;
    text-align: center;
  }

  .tab-count-all {
    padding: 2px 8px;
    border-radius: 10px;
    background: #e2e8f0;
    color: #475569;
    font-weight: 700;
    min-width: 24px;
    text-align: center;
  }
}

// 訂單網格
.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: 1fr;
  gap: 16px;
}

.order-card-anchor {
  scroll-margin-top: 80px;
}

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
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  backdrop-filter: blur(6px);
  @include scrollbar(
    rgba(192, 192, 192, 0.7),
    rgba(120, 120, 120, 0.9),
    rgba(133, 133, 133, 0.08)
  );
  .anchor-item {
    width: 36px;
    height: 22px;
    flex-shrink: 0;
    border-radius: 4px;
    border: 1px solid #cbd5e1;
    background: #fff;
    color: #334155;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .anchor-item:hover {
    border-color: #3b82f6;
    color: #1d4ed8;
  }

  .anchor-ellipsis {
    font-size: 12px;
    color: #94a3b8;
    line-height: 1;
  }
}

// 空狀態
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;

  .empty-icon {
    font-size: 64px;
    color: #cbd5e1;
    margin-bottom: 16px;
  }

  .empty-text {
    font-size: 16px;
    color: #94a3b8;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.85;
  }
}

// 響應式
@media (max-width: 768px) {
  .order-manager {
    padding: 12px;
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
      }
    }
  }

  .stats-cards {
    display: none;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;

    .date-selector {
      flex-wrap: wrap;

      .el-date-editor {
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
    grid-template-columns: 1fr;
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
    padding: 16px;

    .stat-icon {
      width: 48px;
      height: 48px;
      font-size: 20px;
    }

    .stat-content .stat-value {
      font-size: 24px;
    }
  }
}
</style>
