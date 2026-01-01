<script setup>
const props = defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: "請選擇",
  },
});
const emits = defineEmits(["update:modelValue"]);
const list = ref([
  { id: 1, name: "啟用" },
  { id: 2, name: "下架" },
]);
</script>

<template>
  <el-select
    :modelValue="modelValue"
    @clear="$emit('update:modelValue', null)"
    @update:modelValue="$emit('update:modelValue', $event)"
    :placeholder="placeholder"
    filterable
    clearable
  >
    <el-option
      v-for="item in list"
      :key="item.id"
      :label="item.name"
      :value="item.name"
    />
  </el-select>
</template>
