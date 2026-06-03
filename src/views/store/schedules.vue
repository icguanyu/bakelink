<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import dayjs from "dayjs";
import { Shop } from "@/api/shop";

const router = useRouter();
const route = useRoute();

const today = dayjs();
const currentMonth = ref(today.startOf("month"));
const isLoading = ref(false);
const schedules = ref([]);

const fetchSchedules = async () => {
  isLoading.value = true;
  try {
    const res = await Shop.GetSchedules(route.params.slug, {
      month: currentMonth.value.format("YYYY-MM"),
    });
    console.log("行程資料", res.data);
    schedules.value = res.data?.data ?? [];
  } catch {
    schedules.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchSchedules);
watch(currentMonth, fetchSchedules);

const prevMonth = () => { currentMonth.value = currentMonth.value.subtract(1, "month"); };
const nextMonth = () => { currentMonth.value = currentMonth.value.add(1, "month"); };

const monthLabel = computed(() =>
  currentMonth.value.format("YYYY 年 M 月")
);

const scheduleMap = computed(() => {
  const map = {};
  schedules.value.forEach((s) => { map[s.schedule_date] = s; });
  return map;
});

// 產生月曆格子（含前後補空格）
const calendarCells = computed(() => {
  const start = currentMonth.value.startOf("month");
  const end = currentMonth.value.endOf("month");
  const cells = [];

  // 補前面的空格（週日=0開始）
  for (let i = 0; i < start.day(); i++) {
    cells.push(null);
  }
  for (let d = start; !d.isAfter(end); d = d.add(1, "day")) {
    cells.push(d);
  }
  return cells;
});

// API 已按月篩好，直接排序即可
const monthSchedules = computed(() =>
  [...schedules.value].sort((a, b) =>
    a.schedule_date.localeCompare(b.schedule_date)
  )
);

const statusConfig = {
  OPEN:      { label: "接單中", class: "badge--open" },
  ANNOUNCED: { label: "即將開放", class: "badge--announced" },
};

const isPastSchedule = (s) =>
  s.status === "CLOSED" || dayjs(s.schedule_date).isBefore(today, "day");

const expandedIds = ref(new Set());
const toggleExpand = (id) => {
  const s = new Set(expandedIds.value);
  s.has(id) ? s.delete(id) : s.add(id);
  expandedIds.value = s;
};

const goOrder = (schedule) => {
  router.push({
    name: "store-order",
    params: { slug: route.params.slug, date: schedule.schedule_date },
  });
};

const formatDeadline = (iso) =>
  dayjs(iso).format("M/D HH:mm");
</script>

<template>
  <div class="schedules-page">
    <!-- 頂部導覽 -->
    <div class="topbar">
      <button class="topbar__back" @click="router.back()">
        <i class="bx bx-chevron-left"></i>
      </button>
      <span class="topbar__title">接單行程</span>
      <span class="topbar__spacer"></span>
    </div>

    <div class="content">
      <!-- 月份切換 -->
      <div class="month-nav">
        <button class="month-nav__btn" @click="prevMonth">
          <i class="bx bx-chevron-left"></i>
        </button>
        <span class="month-nav__label">{{ monthLabel }}</span>
        <button class="month-nav__btn" @click="nextMonth">
          <i class="bx bx-chevron-right"></i>
        </button>
      </div>

      <!-- 月曆 -->
      <div class="calendar" :class="{ 'calendar--loading': isLoading }">
        <div class="calendar__week-header">
          <span v-for="d in ['日','一','二','三','四','五','六']" :key="d">{{ d }}</span>
        </div>
        <div class="calendar__grid">
          <div
            v-for="(cell, i) in calendarCells"
            :key="i"
            class="cal-cell"
            :class="{
              'cal-cell--empty': !cell,
              'cal-cell--today': cell && cell.isSame(today, 'day'),
              'cal-cell--open': cell && scheduleMap[cell.format('YYYY-MM-DD')]?.status === 'OPEN',
              'cal-cell--announced': cell && scheduleMap[cell.format('YYYY-MM-DD')]?.status === 'ANNOUNCED',
            }"
          >
            <span v-if="cell" class="cal-cell__day">{{ cell.date() }}</span>
            <span
              v-if="cell && scheduleMap[cell.format('YYYY-MM-DD')]"
              class="cal-cell__dot"
            ></span>
          </div>
        </div>
      </div>

      <!-- 圖例 -->
      <div class="legend">
        <span class="legend__item">
          <span class="legend__dot legend__dot--open"></span>接單中
        </span>
        <span class="legend__item">
          <span class="legend__dot legend__dot--announced"></span>即將開放
        </span>
      </div>

      <!-- 行程列表 -->
      <div class="section-title">本月行程</div>

      <!-- 載入中骨架 -->
      <template v-if="isLoading">
        <div v-for="n in 2" :key="n" class="schedule-card">
          <el-skeleton animated>
            <template #template>
              <div style="display:flex;gap:14px;align-items:flex-start">
                <el-skeleton-item variant="rect" style="width:48px;height:52px;border-radius:12px;flex-shrink:0" />
                <div style="flex:1;display:flex;flex-direction:column;gap:8px">
                  <el-skeleton-item variant="text" style="width:60%" />
                  <el-skeleton-item variant="text" style="width:40%" />
                </div>
              </div>
              <el-skeleton-item variant="rect" style="width:100%;height:36px;border-radius:12px;margin-top:4px" />
            </template>
          </el-skeleton>
        </div>
      </template>

      <!-- 無資料 -->
      <div v-else-if="monthSchedules.length === 0" class="empty">
        <i class="bx bx-calendar-x"></i>
        <p>本月尚無開放行程</p>
      </div>

      <!-- 行程卡片 -->
      <div
        v-for="s in monthSchedules"
        :key="s.id"
        class="schedule-card"
        :class="{
          'schedule-card--announced': s.status === 'ANNOUNCED',
          'schedule-card--past': isPastSchedule(s),
        }"
      >
        <!-- 已過去：可收合的標題列 -->
        <div
          v-if="isPastSchedule(s)"
          class="schedule-card__collapsed"
          @click="toggleExpand(s.id)"
        >
          <div class="schedule-card__collapsed-left">
            <span class="schedule-card__collapsed-date">
              {{ dayjs(s.schedule_date).format("M/D") }}
              （週{{ ["日","一","二","三","四","五","六"][dayjs(s.schedule_date).day()] }}）
            </span>
            <span class="badge badge--closed">已結單</span>
          </div>
          <i
            class="bx schedule-card__collapsed-chevron"
            :class="expandedIds.has(s.id) ? 'bx-chevron-up' : 'bx-chevron-down'"
          ></i>
        </div>

        <!-- 未過去：完整標題 -->
        <div v-else class="schedule-card__head">
          <div class="schedule-card__date">
            <span class="schedule-card__day">{{ dayjs(s.schedule_date).date() }}</span>
            <span class="schedule-card__month">{{ dayjs(s.schedule_date).format("M 月") }}</span>
          </div>
          <div class="schedule-card__info">
            <div class="schedule-card__top">
              <span class="schedule-card__weekday">
                週{{ ["日","一","二","三","四","五","六"][dayjs(s.schedule_date).day()] }}
              </span>
              <span class="badge" :class="statusConfig[s.status]?.class">
                {{ statusConfig[s.status]?.label }}
              </span>
            </div>
            <div class="schedule-card__deadline">
              截單：{{ formatDeadline(s.order_end_at) }}
            </div>
            <div v-if="s.note" class="schedule-card__note">
              <i class="bx bx-info-circle"></i> {{ s.note }}
            </div>
          </div>
        </div>

        <!-- 展開內容（已過去時需手動展開；未過去時永遠顯示） -->
        <template v-if="!isPastSchedule(s) || expandedIds.has(s.id)">
          <!-- 品項列表 -->
          <div v-if="s.items?.length" class="schedule-card__items">
            <div
              v-for="item in s.items"
              :key="item.id"
              class="item-chip"
            >
              <div class="item-chip__main">
                <span class="item-chip__name">{{ item.product_name }}</span>
                <span class="item-chip__price">${{ item.unit_price }}</span>
              </div>
              <span
                v-if="item.sales_limit > 0 && !isPastSchedule(s)"
                class="item-chip__stock"
                :class="{ 'item-chip__stock--low': item.remaining <= 5 }"
              >
                限量 {{ item.remaining }}
              </span>
            </div>
          </div>
          <div v-else class="schedule-card__items-empty">品項即將公告</div>

          <el-button
            v-if="s.status === 'OPEN'"
            type="primary"
            class="schedule-card__btn"
            @click="goOrder(s)"
          >
            我要訂購
          </el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.schedules-page {
  height: 100dvh;
  overflow-y: auto;
  background: #f7f3ee;
  padding-bottom: 40px;
}

/* 月曆載入中淡化 */
.calendar--loading {
  opacity: 0.45;
  pointer-events: none;
  transition: opacity 0.2s;
}

/* Topbar */
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f7f3ee;

  &__back {
    width: 36px;
    height: 36px;
    border: none;
    background: #fff;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    font-size: 20px;
    color: #2f2a25;
  }

  &__title {
    flex: 1;
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    color: #1a120b;
  }

  &__spacer {
    width: 36px;
  }
}

/* Content */
.content {
  max-width: 520px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 月份切換 */
.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 14px;
  padding: 10px 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);

  &__btn {
    width: 36px;
    height: 36px;
    border: none;
    background: #f7f3ee;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 20px;
    color: #5c4b3e;

    &:active { background: #ede5dc; }
  }

  &__label {
    font-size: 16px;
    font-weight: 700;
    color: #1a120b;
  }
}

/* 月曆 */
.calendar {
  background: #fff;
  border-radius: 16px;
  padding: 16px 12px 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);

  &__week-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    margin-bottom: 6px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0ebe5;

    span {
      font-size: 11px;
      font-weight: 700;
      color: #6b5040;
      letter-spacing: 0.03em;

      &:first-child { color: #e07060; }  /* 日 */
      &:last-child  { color: #6080c0; }  /* 六 */
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 3px;
  }
}

.cal-cell {
  aspect-ratio: 1;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: default;
  transition: background 0.15s;

  &--empty { pointer-events: none; }

  &__day {
    font-size: 13px;
    font-weight: 600;
    color: #3a2e28;
    line-height: 1;
  }

  &__dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
  }

  /* 有行程但不是今天 */
  &--open {
    background: #edfaf3;
    .cal-cell__day { color: #1e7a48; }
    .cal-cell__dot { background: #2eaa62; }
  }

  &--announced {
    background: #eef2ff;
    .cal-cell__day { color: #3050a0; }
    .cal-cell__dot { background: #6080d0; }
  }

  /* 今天：品牌黃圈，覆蓋其他背景 */
  &--today {
    .cal-cell__day {
      width: 28px;
      height: 28px;
      background: #fcae08;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 800;
      box-shadow: 0 2px 6px rgba(252, 174, 8, 0.45);
    }
  }

  /* 今天同時有行程：保留底色 + 黃圈 */
  &--today.cal-cell--open {
    background: #edfaf3;
    .cal-cell__dot { background: #2eaa62; }
  }

  &--today.cal-cell--announced {
    background: #eef2ff;
    .cal-cell__dot { background: #6080d0; }
  }
}

/* 圖例 */
.legend {
  display: flex;
  gap: 16px;
  justify-content: center;

  &__item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #523828;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &--open { background: #2eaa62; }
    &--announced { background: #6080d0; }
  }
}

/* Section title */
.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #523828;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 4px;
}

/* Empty */
.empty {
  text-align: center;
  padding: 40px 0;
  color: #7a5040;

  i { font-size: 40px; display: block; margin-bottom: 8px; }
  p { font-size: 14px; margin: 0; }
}

/* 行程卡片 */
.schedule-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;

  &--announced {
    opacity: 0.85;
  }

  &--past {
    padding: 10px 16px;
    background: #f5f2ef;
    box-shadow: none;
    border: 1px solid #e8e0d8;
  }

  &__collapsed {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
    padding: 2px 0;
    &:active { opacity: 0.6; }
  }

  &__collapsed-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__collapsed-date {
    font-size: 14px;
    font-weight: 600;
    color: #6b4838;
  }

  &__collapsed-chevron {
    font-size: 18px;
    color: #7a5040;
  }

  &__head {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }

  &__date {
    flex-shrink: 0;
    width: 48px;
    height: 52px;
    background: #f7f3ee;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
  }

  &__day {
    font-size: 22px;
    font-weight: 800;
    color: #1a120b;
    line-height: 1;
  }

  &__month {
    font-size: 11px;
    color: #523828;
    font-weight: 600;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__top {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__weekday {
    font-size: 15px;
    font-weight: 700;
    color: #2f2a25;
  }

  &__deadline {
    font-size: 12px;
    color: #6b4838;
  }

  &__note {
    font-size: 12px;
    color: #523828;
    display: flex;
    align-items: center;
    gap: 4px;

    i { font-size: 13px; color: #c08a50; }
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__items-empty {
    font-size: 12px;
    color: #7a5040;
  }

  &__btn {
    width: 100%;
    height: 44px;
    font-size: 15px;
    font-weight: 700;
  }
}

/* Badge */
.badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;

  &--open {
    background: #e0f7ec;
    color: #1a7a45;
  }

  &--announced {
    background: #e8eeff;
    color: #3050a0;
  }

  &--closed {
    background: #ede8e2;
    color: #6b4838;
  }
}

/* 品項 chip */
.item-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: #fdf8f2;
  border: 1px solid #ede0d0;
  border-radius: 6px;
  padding: 8px 12px;
  width: 100%;

&__main {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: #3a2e28;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__price {
    font-size: 14px;
    color: #6b4838;
    white-space: nowrap;
    flex-shrink: 0;
  }

  &__stock {
    font-size: 11px;
    font-weight: 700;
    color: #6b4838;
    white-space: nowrap;
    flex-shrink: 0;

    &--low { color: #d06020; }
  }
}
</style>
