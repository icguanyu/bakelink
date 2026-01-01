<script setup></script>

<template>
  <div class="home">
    <img src="@/assets/images/image.jpg" alt="" />
    <el-button @click="$router.push('/shop')" type="primary"
      >前往後台</el-button
    >
  </div>
</template>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  img {
    width: 100%;
    max-width: 600px;
  }
}
</style>
