<script setup>
import { ref, watch } from "vue";

// 從 localStorage 讀取狀態，預設為 true
const isAsideOpen = ref(
  localStorage.getItem("isAsideOpen") !== "false"
);

const toggleAside = () => {
  isAsideOpen.value = !isAsideOpen.value;
};

// 監聽狀態變化並保存到 localStorage
watch(isAsideOpen, (newValue) => {
  localStorage.setItem("isAsideOpen", String(newValue));
});
</script>

<template>
  <div class="shop">
    <Aside
      :class="{ 'is-collapsed': !isAsideOpen }"
      :aria-hidden="!isAsideOpen"
      @toggle="toggleAside"
    />
    <main>
      <button
        v-if="!isAsideOpen"
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
        <!-- <header>Header Content</header> -->
        <router-view></router-view>
      </div>
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
      height: 100%;
      overflow: auto;
      @include scrollbar(
        rgba(80, 80, 80, 0.7),
        rgba(120, 120, 120, 0.9),
        rgba(255, 255, 255, 0.08)
      );
    }
  }
}
@media (max-width: 640px) {
  .shop {
    main {
      .container {
        border-radius: 0;
        // padding-bottom: 80px;
      }
    }
  }
}
</style>
