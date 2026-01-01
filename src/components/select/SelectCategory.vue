<script setup>
const props = defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: "請選擇",
  },
});
const emits = defineEmits(["update:modelValue"]);
const categories = ref([
  { id: 1, name: "吐司" },
  { id: 2, name: "可頌" },
  { id: 3, name: "貝果" },
  { id: 4, name: "法棍" },
  { id: 5, name: "雜糧" },
  { id: 6, name: "酸種" },
  { id: 7, name: "波蘿" },
  { id: 8, name: "甜甜圈" },
  { id: 9, name: "蛋塔" },
  { id: 10, name: "鹽可頌" },
  { id: 11, name: "牛角包" },
  { id: 12, name: "丹麥" },
  { id: 14, name: "佛卡夏" },
  { id: 15, name: "帕尼尼" },
  { id: 16, name: "軟法" },
  { id: 17, name: "雜糧" },
  { id: 18, name: "全麥" },
  { id: 19, name: "司康" },
]);
</script>

<template>
  <el-select
    :modelValue="modelValue"
    @clear="$emit('update:modelValue', null)"
    @update:modelValue="$emit('update:modelValue', $event)"
    :placeholder="placeholder"
  >
    <el-option
      v-for="category in categories"
      :key="category.id"
      :label="category.name"
      :value="category.name"
    />
  </el-select>
</template>
