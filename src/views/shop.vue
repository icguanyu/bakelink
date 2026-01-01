<template>
  <div class="shop">
    <Aside />
    <main>
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
    background-color: #6d3112;
    flex: 1;
    height: 100dvh;
    overflow-y: hidden;

    .container {
      border-radius: 10px 0 0 10px;
      background-color: #fdfbf6;
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
