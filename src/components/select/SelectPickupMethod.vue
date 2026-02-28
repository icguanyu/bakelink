<template>
  <el-select v-model="modelValueProxy" :placeholder="placeholder">
    <el-option
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    />
  </el-select>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
const props = defineProps({
  modelValue: [String, Number],
  placeholder: {
    type: String,
    default: "請選擇取貨方式",
  },
});
const optionsMap = {
  pickup: "自取",
  delivery: "宅配",
};
const emit = defineEmits(["update:modelValue"]);
const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
const authStore = useAuthStore ? useAuthStore() : {};
const options = computed(() => {
  return (
    authStore?.user?.pickupMethods?.map((method) => ({
      label: optionsMap[method] || method,
      value: method,
    })) || []
  );
});
</script>
