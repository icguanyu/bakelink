<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import Aside from "@/components/Aside.vue";
import AsideMobile from "@/components/AsideMobile.vue";

const year = new Date().getFullYear();

// 從 localStorage 讀取狀態，預設為 true
const isAsideOpen = ref(
  localStorage.getItem("isAsideOpen") !== "false"
);

const route = useRoute();
const isMobile = ref(window.innerWidth <= 640);

const toggleAside = () => {
  isAsideOpen.value = !isAsideOpen.value;
};

// 監聽狀態變化並保存到 localStorage
watch(isAsideOpen, (newValue) => {
  localStorage.setItem("isAsideOpen", String(newValue));
});

// 路由變化時，手機版自動隱藏側邊欄
watch(() => route.path, () => {
  if (isMobile.value && isAsideOpen.value) {
    isAsideOpen.value = false;
  }
});

// 監聽視窗大小變化
watch(() => isMobile.value, () => {
  if (!isMobile.value && !isAsideOpen.value) {
    isAsideOpen.value = true;
  }
});

if (typeof window !== "undefined") {
  window.addEventListener("resize", () => {
    isMobile.value = window.innerWidth <= 640;
  });
}
</script>

<template>
  <div class="shop">
    <Aside
      v-if="!isMobile"
      :class="{ 'is-collapsed': !isAsideOpen }"
      :aria-hidden="!isAsideOpen"
      @toggle="toggleAside"
    />
    <main class="main-content" :class="{ 'is-mobile': isMobile }">
      <button
        v-if="!isMobile && !isAsideOpen"
        class="aside-toggle-tag"
        type="button"
        aria-label="Open aside menu"
        @click="toggleAside"
      >
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>
      <div class="container">
        <router-view></router-view>
        <footer class="shop-footer">
          <span>© {{ year }} Prelo 鋪樂</span>
          <nav>
            <a href="#">服務條款</a>
            <span class="sep" />
            <a href="#">隱私權政策</a>
          </nav>
        </footer>
      </div>
      <AsideMobile v-if="isMobile" />
    </main>
  </div>
</template>

<style lang="scss">
@use "@/assets/scss/scrollbar.scss" as *;
.shop {
  width: 100%;
  height: 100vh;
  display: flex;

  main {
    position: relative;
    background-color: #1c2345;
    flex: 1;
    height: 100dvh;
    overflow-y: hidden;
    display: flex;
    flex-direction: column;

    &.is-mobile {
      .container {
        padding-bottom: max(
          90px,
          calc(60px + env(safe-area-inset-bottom))
        );
      }
    }

    .aside-toggle-tag {
      position: fixed;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      height: 42px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 0 8px 8px 0;
      background: #fcae08;
      cursor: pointer;
      z-index: 6;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

      .bar {
        display: block;
        width: 16px;
        height: 2px;
        background-color: #fff;
        border-radius: 999px;
      }
    }

    .container {
      background-color: #f8fafc;
      flex: 1;
      overflow: auto;
      @include scrollbar(
        rgba(80, 80, 80, 0.7),
        rgba(120, 120, 120, 0.9),
        rgba(255, 255, 255, 0.08)
      );
    }
  }
}

.shop-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid #e2e8f0;
  font-size: 12px;
  color: #94a3b8;

  nav {
    display: flex;
    align-items: center;
    gap: 10px;

    a {
      color: #94a3b8;
      text-decoration: none;
      &:hover { color: #64748b; }
    }
  }

  .sep {
    width: 1px;
    height: 12px;
    background: #cbd5e1;
  }
}

@media (max-width: 640px) {
  .shop {
    main {
      .container {
        border-radius: 0;
      }
    }
  }
}
</style>
