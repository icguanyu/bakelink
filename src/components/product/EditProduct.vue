<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["save"]);

const visible = ref(false);
const value = ref("基本資訊");

const formRef = ref(null);
const form = reactive({
  id: null,
  name: "",
  category: "",
  price: 100,
  description: "",
  ingredients: "",
  imageUrls: [],
  isEnabled: null,
});

const ingredientsTable = ref([]);
const newIngredient = reactive({ name: "", amount: "", visible: true });

const resetForm = () => {
  formRef.value.resetFields();
  ingredientsTable.value = [];
  newIngredient.name = "";
  newIngredient.amount = "";
  newIngredient.visible = true;
};

const open = (product = {}) => {
  Object.assign(form, product);
  ingredientsTable.value = product.ingredientsTable
    ? product.ingredientsTable.map((i) => ({ ...i }))
    : [];
  visible.value = true;
};

const close = () => {
  visible.value = false;
};

const submit = () => {
  if (!form.name || !form.category || !form.price) {
    ElMessage.warning("請填寫必填欄位（品名、類別、定價）");
    return;
  }

  const payload = {
    ...form,
    ingredientsTable: ingredientsTable.value,
  };

  emit("save", payload);
  visible.value = false;
};

const addIngredient = () => {
  if (!newIngredient.name.trim()) {
    ElMessage.warning("請填寫成分名稱");
    return;
  }
  ingredientsTable.value.push({
    name: newIngredient.name.trim(),
    amount: newIngredient.amount.trim(),
    visible: newIngredient.visible,
  });
  newIngredient.name = "";
  newIngredient.amount = "";
  newIngredient.visible = true;
};

const removeIngredient = (idx) => {
  ingredientsTable.value.splice(idx, 1);
};

defineExpose({ open, close });
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="form.id ? '編輯商品' : '新增商品'"
    width="800px"
    append-to-body
    destroy-on-close
  >
    <el-segmented
      v-model="value"
      :options="['基本資訊', '詳細成分', '商品圖片']"
      block
    />
    <br />
    <el-form :model="form" label-width="120px" label-position="left">
      <div v-if="value === '基本資訊'">
        <el-form-item label="產品名稱" required>
          <el-input
            v-model="form.name"
            placeholder="產品名稱（例：原味軟法）"
          />
        </el-form-item>
        <el-form-item label="產品類別" required>
          <SelectCategory v-model="form.category" />
        </el-form-item>
        <el-form-item label="產品定價" required>
          <el-input-number
            v-model="form.price"
            :min="0"
            :precision="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="產品簡介">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="產品簡短介紹"
          />
        </el-form-item>

        <el-form-item label="成分表">
          <el-input
            v-model="form.ingredients"
            type="textarea"
            :rows="3"
            placeholder="例如：高筋麵粉、牛奶、酵母、鹽、糖"
          />
        </el-form-item>

        <el-form-item label="狀態">
          <SelectProductStatus
            v-model="form.isEnabled"
            :placeholder="'選擇產品狀態'"
          />
        </el-form-item>
      </div>
      <div v-if="value === '詳細成分'">
        <div class="ing-table">
          <small class="hint"
            >輸入成分與份量，可協助統計訂單所需原料。非必填欄位。</small
          >
          <el-table :data="ingredientsTable" border size="small">
            <el-table-column label="名稱">
              <template #default="{ row }">
                <el-input v-model="row.name" placeholder="成分名稱" />
              </template>
            </el-table-column>
            <el-table-column label="份量(公克)" width="110">
              <template #default="{ row }">
                <el-input
                  inputmode="numeric"
                  v-model="row.amount"
                  placeholder="份量(公克)"
                />
              </template>
            </el-table-column>
            <el-table-column label="顯示" width="60" align="center">
              <template #default="{ row }">
                <el-switch size="small" v-model="row.visible" />
              </template>
            </el-table-column>
            <el-table-column label="" width="50" align="center">
              <template #default="{ $index }">
                <el-icon class="delete-btn" @click="removeIngredient($index)">
                  <Delete />
                </el-icon>
              </template>
            </el-table-column>
          </el-table>

          <el-button
            type="primary"
            plain
            size="small"
            @click="
              ingredientsTable.push({ name: '', amount: '', visible: true })
            "
          >
            新增
          </el-button>
        </div>
      </div>
      <div v-if="value === '商品圖片'">
        <UploadPhoto
          v-model="form.imageUrls"
          :disabled="false"
          @upload="
            (url) => {
              form.imageUrls = url;
            }
          "
        />
      </div>
    </el-form>

    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="submit">儲存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.ing-table {
  display: flex;
  flex-direction: column;
  gap: 10px;
  .hint {
    color: #8c939d;
    font-size: 12px;
  }
  .delete-btn {
    cursor: pointer;
    font-size: 14px;
  }
  .ing-add {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.image-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--el-color-primary);
  }

  .preview {
    width: 180px;
    height: 120px;
    object-fit: cover;
    display: block;
  }

  .uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 180px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
  }
}
</style>
