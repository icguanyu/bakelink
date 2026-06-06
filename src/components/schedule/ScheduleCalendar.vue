<script setup>
import dayjs from "dayjs";

const today = dayjs().format("YYYY-MM-DD");

const props = defineProps({
  scheduleList: {
    type: Array,
    required: true,
  },
  selectedDate: {
    type: String,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["select"]);
const selectDate = (date) => emit("select", date);
</script>

<template>
  <div class="schedule-calendar">
    <div class="week-header">
      <span
        v-for="d in ['日', '一', '二', '三', '四', '五', '六']"
        :key="d"
        class="week-label"
        >{{ d }}</span
      >
    </div>
    <div class="calendar-grid">
      <div
        v-for="schedule in scheduleList"
        :key="schedule.date"
        class="cal-cell"
        :class="{
          'is-selected': selectedDate === schedule.date,
          'is-today': schedule.date === today,
          'is-other-month': !schedule.isCurrentMonth,
          'has-schedule': schedule.hasSchedule,
        }"
        @click="selectDate(schedule.date)"
      >
        <div
          class="cell-date"
          :class="{
            saturday: schedule.dateObj.day() === 6,
            sunday: schedule.dateObj.day() === 0,
          }"
        >
          {{ schedule.dateObj.format("D") }}
        </div>

        <div class="cell-body">
          <template v-if="isLoading && !schedule.hasSchedule">
            <span class="cell-dot"></span>
          </template>
          <template v-else-if="schedule.hasSchedule">
            <span v-if="schedule.orderCount > 0" class="cell-badge orders"
              >{{ schedule.orderCount }}筆</span
            >
            <span class="cell-badge status" :class="`status--${schedule.status}`">{{ schedule.statusLabel }}</span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.schedule-calendar {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 12px;
  width: 100%;
  max-width: 600px;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  margin-bottom: 6px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8dfd6;

  .week-label {
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: #7a6a5c;
    padding: 3px 0;
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

.cal-cell {
  border: 1.5px solid #e8dfd6;
  border-radius: 5px;
  background: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 65px;
  min-width: 50px;
  padding: 2px 4px 5px;
  gap: 3px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

  &:hover:not(.is-other-month) {
    border-color: #c0a898;
    box-shadow: 0 2px 6px rgba(100, 60, 20, 0.08);
  }

  &.is-selected {
    border-color: var(--color-primary);
    border-width: 1px;
    background: #fff3eb;
  }

  &.is-today .cell-date {
    background: var(--color-primary);
    color: white;
    border-radius: 4px;
    width: 22px;
    height: 22px;
    font-size: 12px;
    justify-content: center;
  }

  &.is-other-month {
    opacity: 0.25;
    pointer-events: none;
    background: var(--bg-page);
  }
}

.cell-date {
  font-size: 15px;
  font-weight: 700;
  color: #2d1a0e;
  line-height: 12px;
  display: flex;
  align-items: center;
  width: 22px;
  height: 22px;

  &.saturday {
    color: #16a34a;
  }
  &.sunday {
    color: #cf4747;
  }
}

.cell-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
}

.cell-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 3px;
  white-space: nowrap;
  line-height: 1.4;

  &.orders {
    background: #fff3eb;
    color: #c06228;
  }

  &.status {
    background: #fef3c7;
    color: #92400e;

    &.status--CLOSED {
      background: #ede7df;
      color: #8a7a6a;
    }
  }
}

.cell-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #e8dfd6;
  margin: 3px 0 0 2px;
}

// ── 響應式 ──────────────────────────────────
@media (max-width: 1024px) {
  .schedule-calendar {
    max-width: 100%;
  }

  .cal-cell {
    min-height: 58px;
    padding: 4px 3px;
  }

  .cell-date {
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .schedule-calendar {
    padding: 8px;
  }

  .calendar-grid {
    gap: 2px;
  }

  .cal-cell {
    min-height: 42px;
    padding: 3px 3px;
  }

  .cell-date {
    font-size: 12px;
    width: 18px;
    height: 18px;
  }

  .cal-cell.is-today .cell-date {
    width: 18px;
    height: 18px;
    font-size: 11px;
  }

  .cell-body {
    display: none;
  }

  // 有排程時在手機上顯示一個小藍點
  .cal-cell.has-schedule .cell-body {
    display: flex;
    &::before {
      content: "";
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #fe904d;
      display: block;
    }
  }

  .cell-badge {
    display: none;
  }
}
</style>
