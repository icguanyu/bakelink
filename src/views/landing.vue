<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <div class="landing-page">
    <div class="landing">
      <p>Landing Page — 施工中</p>
      <el-button @click="router.push('/login')">登入</el-button>
      <el-button type="primary" @click="router.push('/register')">立即開店</el-button>
    </div>
    <FooterBar />
  </div>
</template>

<style scoped lang="scss">
.landing-page {
  height: 100dvh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: #f7f3ee;
}

.landing {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
</style>
