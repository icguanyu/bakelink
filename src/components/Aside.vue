<script setup>
import { computed } from "vue";
import dayjs from "dayjs";

const emit = defineEmits(["toggle"]);

const currentYear = computed(() => dayjs().format("YYYY"));
const currentMonth = computed(() => dayjs().format("MMM").toUpperCase());
const currentDate = computed(() => dayjs().format("DD"));
</script>

<template>
  <aside>
    <div
      class="aside-toggle"
      aria-label="Toggle aside menu"
      @click="emit('toggle')"
    >
      <div class="icon">
        <img src="@/assets/images/icons/expand_left.svg" alt="" />
      </div>
    </div>
    <div class="date-box">
      <div class="year">{{ currentYear }}</div>
      <div class="month">{{ currentMonth }}</div>
      <div class="date">{{ currentDate }}</div>
    </div>
    <router-link class="link" to="/shop">
      <div class="icon">
        <img src="@/assets/images/icons/home.png" alt="" />
      </div>
      <div class="title">總覽</div>
    </router-link>
    <router-link class="link" to="/shop/schedule">
      <div class="icon">
        <img src="@/assets/images/icons/calendar.png" alt="" />
      </div>
      <div class="title">接單</div>
    </router-link>
    <router-link class="link" to="/shop/order">
      <el-badge :value="100" :max="99" :offset="[-10, 4]">
        <div class="icon">
          <img src="@/assets/images/icons/receipt.png" alt="" />
        </div>
      </el-badge>
      <div class="title">訂單</div>
    </router-link>
    <router-link class="link" to="/shop/products">
      <div class="icon">
        <img src="@/assets/images/icons/baguette.png" alt="" />
      </div>
      <div class="title">商品</div>
    </router-link>
    <router-link class="link" to="/shop/settings">
      <div class="icon">
        <img src="@/assets/images/icons/store.png" alt="" />
      </div>
      <div class="title">設定</div>
    </router-link>
  </aside>
</template>

<style lang="scss" scoped>
aside {
  position: sticky;
  top: 0;
  flex-shrink: 0;
  width: 70px;
  flex-basis: 70px;
  height: 100dvh;
  background-color: #1c2345;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  gap: 8px;
  overflow: hidden;
  transition:
    width 0.2s ease,
    flex-basis 0.2s ease,
    opacity 0.2s ease;

  .date-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    margin: 0 8px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #fff;

    .year {
      font-size: 10px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.6);
      letter-spacing: 0.5px;
    }
    .month {
      font-size: 12px;
      font-weight: 700;
      color: #ffd700;
      margin: 0;
      letter-spacing: 1px;
    }
    .date {
      font-size: 24px;

      line-height: 1;
      color: #fff;
    }
  }

  .link {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #fff;
    text-decoration: none;
    padding: 8px 16px;
    .el-badge {
      &::v-deep(sup) {
        border: none;
      }
    }
    .icon {
      width: 35px;
      height: 35px;
      img {
        user-select: none;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
    .title {
      font-size: 12px;
    }
  }
  .link.router-link-exact-active {
    background-color: #303758;
    &:after {
      content: "";
      display: block;
      width: 10px;
      height: 10px;
      background-color: white;
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%) translateX(50%) rotate(45deg);
    }
  }
  .aside-toggle {
    text-align: center;
    cursor: pointer;
    img {
      width: 36px;
      height: 36px;
      object-fit: contain;
    }
  }
}

aside.is-collapsed {
  width: 0;
  flex-basis: 0;
  opacity: 0;
  padding: 0;
  pointer-events: none;
}
@media (max-width: 640px) {
  aside {
    .date-box {
      .year {
        font-size: 9px;
      }
      .date {
        font-size: 22px;
      }
    }
    .link {
      padding: 4px 8px;
      .el-badge {
        &::v-deep(sup) {
          display: none;
        }
      }
      .icon {
        width: 28px;
        height: 28px;
      }
      .title {
        display: none;
      }
    }
  }
}
</style>
