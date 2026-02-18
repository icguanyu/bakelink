<script setup>
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

const selectDate = (date) => {
  emit("select", date);
};
</script>

<template>
  <div class="schedule-left">
    <div class="schedule-week-header">
      <div class="week-day">日</div>
      <div class="week-day">一</div>
      <div class="week-day">二</div>
      <div class="week-day">三</div>
      <div class="week-day">四</div>
      <div class="week-day">五</div>
      <div class="week-day">六</div>
    </div>
    <div class="schedule-list">
      <div
        v-for="schedule in scheduleList"
        :key="schedule.date"
        class="schedule-item"
        :class="{
          'item-selected': selectedDate === schedule.date,
          'not-current-month': !schedule.isCurrentMonth,
        }"
        @click="selectDate(schedule.date)"
      >
        <div
          class="schedule-header-row"
          :class="{ 'no-orders': !schedule.hasSchedule }"
        >
          <div class="date-section">
            <div
              class="date-box"
              :class="{
                saturday: schedule.dateObj.day() === 6,
                sunday: schedule.dateObj.day() === 0,
              }"
            >
              <div class="date-value">
                {{ schedule.dateObj.format("DD") }}
              </div>
            </div>
          </div>

          <div v-if="isLoading && !schedule.hasSchedule" class="mini-stats">
            <span class="stat-badge muted">載入中</span>
          </div>
          <div v-else-if="schedule.hasSchedule" class="mini-stats">
            <span v-if="schedule.orderCount > 0" class="stat-badge ordered">
              訂 {{ schedule.orderCount }}
            </span>
            <span v-if="schedule.itemCount > 0" class="stat-badge completed">
              品 {{ schedule.itemCount }}
            </span>
            <span class="stat-badge highlight">
              {{ schedule.statusLabel }}
            </span>
          </div>
          <div v-else class="no-orders-tag">未開單</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.schedule-left {
  flex: 0 0 auto;
  width: 100%;
  max-width: 800px;
  overflow-y: auto;
  padding-right: 12px;

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

.schedule-list {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 12px;
}

.schedule-week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 8px;
  padding: 0 0 8px 0;
  border-bottom: 1px solid #e2e8f0;

  .week-day {
    text-align: center;
    font-weight: 700;
    color: #1c2345;
    font-size: 13px;
    padding: 6px 0;
    letter-spacing: 0.5px;
  }
}

.schedule-item {
  background: white;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border: 2px solid transparent;
  min-height: 100px;
  position: relative;

  &:hover {
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
    border-color: #cbd5e1;
  }

  &.item-selected {
    border-color: #1c2345;
    box-shadow: 0 3px 12px rgba(28, 35, 69, 0.15);
    background: linear-gradient(
      135deg,
      rgba(28, 35, 69, 0.02) 0%,
      rgba(46, 61, 95, 0.04) 100%
    );
  }
}

.schedule-header-row {
  display: flex;
  flex-direction: column;
  padding: 6px;
  gap: 6px;
  flex: 1;
  background: white;
  transition: all 0.2s ease;
  border-bottom: none;

  &.no-orders {
    background: #f8fafc;
    opacity: 0.6;

    .date-box {
      background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
    }

    .mini-stats {
      opacity: 0.4;
    }
  }
}

.date-section {
  flex-shrink: 0;
}

.date-box {
  background: linear-gradient(135deg, #1c2345 0%, #2e3d5f 100%);
  border-radius: 4px;
  padding: 4px 5px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-width: auto;
  box-shadow: 0 1px 3px rgba(28, 35, 69, 0.1);

  .date-value {
    font-size: 22px;
    display: block;
  }

  .weekday {
    opacity: 0.8;
  }
}

.stats-section {
  display: none;
}

.mini-stats {
  display: flex;
  gap: 3px;
  font-size: 10px;
  flex-wrap: wrap;
  justify-content: center;
  min-height: 16px;

  .stat-badge {
    padding: 1px 4px;
    background: #f0f9ff;
    border-radius: 3px;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.2;

    &.ordered {
      background: #dbeafe;
      color: #1e40af;
    }

    &.completed {
      background: #dcfce7;
      color: #166534;
    }

    &.cancelled {
      background: #fee2e2;
      color: #991b1b;
    }

    &.highlight {
      background: #fef3c7;
      color: #92400e;
    }

    &.muted {
      background: #f1f5f9;
      color: #94a3b8;
    }
  }
}

.no-orders-tag {
  color: #94a3b8;
  padding: 2px 3px;
  background: #f1f5f9;
  border-radius: 3px;
  text-align: center;
  flex: 1;
  min-height: 16px;
}

@media (max-width: 1024px) {
  .schedule-left {
    width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .schedule-left {
    width: 100%;
    max-width: 100%;
  }

  .schedule-list {
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  .schedule-item {
    min-height: 40px;
  }

  .item-selected {
    border-width: 1px;
  }

  .date-section {
    width: 100%;
    height: 100%;
  }

  .date-box {
    width: 100%;
    height: 100%;

    .date-value {
      font-size: 14px;
    }
  }

  .mini-stats {
    display: none;
    font-size: 10px;
    gap: 3px;

    .stat-badge {
      padding: 1px 4px;
    }
  }

  .no-orders-tag {
    display: none;
  }

  .schedule-header-row {
    flex-direction: column;
    align-items: flex-start;
    padding: 3px;
    gap: 0;
  }
}
</style>
