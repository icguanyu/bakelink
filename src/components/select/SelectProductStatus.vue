<script setup>
const props = defineProps({
  modelValue: Boolean,
  placeholder: {
    type: String,
    default: "請選擇",
  },
});
const emits = defineEmits(["update:modelValue"]);
const list = ref([
  { value: true, label: "啟用" },
  { value: false, label: "下架" },
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
      v-for="i in list"
      :key="i.id"
      :label="i.label"
      :value="i.value"
    />
  </el-select>
</template>
