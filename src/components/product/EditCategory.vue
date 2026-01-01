<script setup>
import { computed, reactive, ref, watch } from "vue";

const emit = defineEmits(["save"]);

const visible = ref(false);
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

const localCategories = ref([]);

const form = reactive({
  name: "",
});

const hasCategories = computed(() => localCategories.value.length > 0);

const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
};

const addCategory = () => {
  categories.value.push({
    id: Date.now(),
    name: form.name,
  });
  form.name = "";
};

const removeCategory = (id) => {
  categories.value = categories.value.filter((item) => item.id !== id);
};

const submit = () => {
  emit("save", [...localCategories.value]);
  visible.value = false;
};

defineExpose({ open, close });
</script>

<template>
  <el-dialog
    v-model="visible"
    title="編輯商品種類"
    width="800px"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
  >
    <div class="layout">
      <section class="list">
        <header>
          <h3>現有種類</h3>
          <small>點擊叉號可移除</small>
        </header>
        <div v-if="categories.length" class="chips">
          <div class="chip" v-for="item in categories" :key="item.id">
            <div class="chip__title">{{ item.name }}</div>
            <el-button
              size="small"
              icon="Minus"
              circle 
              plain
              @click="removeCategory(item.id)"
            />
          </div>
        </div>
        <el-empty v-else description="目前沒有種類" />
      </section>

      <section class="form">
        <header>
          <h3>新增種類</h3>
          <small>名稱必填，備註可留空</small>
        </header>
        <el-form :model="form" label-width="60px" label-position="top">
          <el-form-item label="名稱" prop="name">
            <el-input v-model="form.name" placeholder="輸入種類名稱" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="addCategory">新增</el-button>
          </el-form-item>
        </el-form>
      </section>
    </div>

    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="submit">儲存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

section header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
  h3 {
    margin: 0;
    font-weight: 600;
  }
  small {
    color: var(--el-text-color-secondary);
  }
}

.chips {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  .chip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background-color: #f5f5f5;
    border-radius: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .chip__title {
      font-weight: 600;
    }
  }
}

@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
