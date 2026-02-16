<script setup>
import { ProductCategory } from "@/api/products";
const props = defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: "請選擇種類",
  },
});
const loading = ref(false);
const emits = defineEmits(["update:modelValue"]);
const categories = ref([]);

const initProductCategories = async () => {
  loading.value = true;
  try {
    const res = await ProductCategory.List();
    console.log("res", res);
    categories.value = res.data.data;
  } catch (err) {
    console.log("fetch categories error", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  initProductCategories();
});
</script>

<template>
  <el-select
    :modelValue="modelValue"
    @clear="$emit('update:modelValue', null)"
    @update:modelValue="$emit('update:modelValue', $event)"
    :placeholder="placeholder"
    :loading="loading"
  >
    <el-option
      v-for="category in categories"
      :key="category.id"
      :label="category.name"
      :value="category.id"
    />
  </el-select>
</template>
