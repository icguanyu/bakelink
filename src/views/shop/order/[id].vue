<script setup>
const route = useRoute();
const id = route.params.id;
</script>

<template>
  <div>order detail id: {{ id }}</div>
</template>
