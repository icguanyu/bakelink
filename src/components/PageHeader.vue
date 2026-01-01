<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>
<template>
  <header>
    <div class="page-title">{{ props.title }}</div>
  </header>
</template>

<style lang="scss" scoped>
header {
  padding: 16px 24px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }
}
</style>
