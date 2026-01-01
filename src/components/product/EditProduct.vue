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
const imageUrl = ref("");
const formRef = ref(null);
const form = reactive({
  id: null,
  name: "",
  category: "",
  price: null,
  description: "",
  ingredients: "",
  status: null,
});

const resetForm = () => {
  formRef.value.resetFields();
  imageUrl.value = "";
};

const open = (product = {}) => {
  Object.assign(form, product);
  visible.value = true;
};

const close = () => {
  visible.value = false;
};

const handleImageChange = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    imageUrl.value = e.target.result;
  };
  reader.readAsDataURL(file.raw);
  return false; // 阻止自動上傳
};

const submit = () => {
  if (!form.name || !form.category || !form.price) {
    ElMessage.warning("請填寫必填欄位（品名、類別、定價）");
    return;
  }
  const payload = {
    ...form,
    image: imageUrl.value,
  };

  emit("save", payload);
  visible.value = false;
};

defineExpose({ open, close });
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="form.id ? '編輯商品' : '新增商品'"
    width="480px"
    append-to-body
    destroy-on-close
  >
    <el-segmented v-model="value" :options="['基本資訊', '商品圖片']" block />
    <br />
    <el-form :model="form" label-width="120px" label-position="left">
      <div v-if="value === '基本資訊'">
        <el-form-item  required>
          <el-input v-model="form.name" placeholder="輸入產品名稱" />
        </el-form-item>
        <el-form-item label="類別" required>
          <SelectCategory v-model="form.category" />
        </el-form-item>
        <el-form-item label="定價" required>
          <el-input-number
            v-model="form.price"
            :min="0"
            :precision="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="介紹">
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
            v-model="form.status"
            :placeholder="'選擇產品狀態'"
          />
        </el-form-item>
      </div>
      <div v-else>
        <el-form-item label="產品圖片">
          <!-- <el-upload
            class="image-uploader"
            action="#"
            :show-file-list="false"
            :on-change="handleImageChange"
            :before-upload="beforeImageUpload"
            :auto-upload="false"
          >
            <img v-if="imageUrl" :src="imageUrl" class="preview" />
            <el-icon v-else class="uploader-icon"><Plus /></el-icon>
          </el-upload> -->
          <small class="hint">建議尺寸 600x400，檔案小於 2MB</small>
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="submit">儲存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
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

.hint {
  display: block;
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
