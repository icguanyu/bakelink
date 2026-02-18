<script setup>
import { Products } from "@/api/products";
const uploadPhotos = ref(null);
const uploadPhotosLoading = computed(
  () => uploadPhotos.value?.loading || false,
);
const visible = ref(false);
const value = ref("基本資訊");
const emit = defineEmits(["update"]);
const loading = ref(false);
const formRef = ref(null);
const form = reactive({
  id: null,
  name: "",
  category_id: "",
  price: 0,
  description: "",
  ingredients: "",
  ingredient_details: [],
  image_urls: [],
  is_active: true,
});

const resetForm = () => {
  nextTick(() => {
    formRef.value?.resetFields();
  });
};

const open = (id) => {
  value.value = "基本資訊";
  visible.value = true;
  if (id) {
    initProudctById(id);
  } else {
    resetForm();
  }
};

const close = () => {
  visible.value = false;
};

const initProudctById = async (id) => {
  loading.value = true;
  try {
    const res = await Products.GetById(id);
    Object.assign(form, res.data);
  } catch (err) {
    console.log("get product by id error", err);
    ElMessage.error("載入商品資料失敗，請稍後再試");
    close();
  } finally {
    loading.value = false;
  }
};

const beforeSave = async (formEl) => {
  formEl.validate((valid) => {
    if (valid) {
      save();
    } else {
      return;
    }
  });
};

const save = async () => {
  loading.value = true;
  try {
    let res;
    if (form.id) {
      res = await Products.Update(form.id, form);
    } else {
      res = await Products.Create(form);
    }
    console.log("save product res", res);
    ElNotification({
      title: "成功",
      message: `商品已${form.id ? "更新" : "新增"}成功`,
      type: "success",
    });
    close();
    emit("update");
  } catch (err) {
    console.log("save product error", err);
  } finally {
    loading.value = false;
  }
};

const removeIngredient = (idx) => {
  form.ingredient_details.splice(idx, 1);
};

const deleteProduct = async () => {
  ElMessageBox.confirm("確定要刪除此商品嗎？此操作無法恢復。", "刪除確認", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      loading.value = true;
      try {
        await Products.Delete(form.id);
        ElNotification({
          title: "成功",
          message: "商品已刪除",
          type: "success",
        });
        close();
        emit("update");
      } catch (err) {
        console.log("delete product error", err);
        ElMessage.error("刪除商品失敗，請稍後再試");
      } finally {
        loading.value = false;
      }
    })
    .catch(() => {
      // 使用者取消刪除
    });
};

defineExpose({ open, close });
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="form.id ? '編輯商品' : '新增商品'"
    width="800px"
    append-to-body
  >
    <el-segmented
      v-model="value"
      :options="['基本資訊', '商品圖片', '詳細成分']"
      block
    />
    <br />
    <el-form
      :model="form"
      :loading="loading"
      ref="formRef"
      label-width="120px"
      label-position="left"
    >
      <div v-if="value === '基本資訊'">
        <el-form-item label="產品名稱" required prop="name">
          <el-input
            v-model="form.name"
            placeholder="產品名稱（例：原味軟法）"
          />
        </el-form-item>
        <el-form-item label="產品類別" required prop="category_id">
          <SelectCategory v-model="form.category_id" />
        </el-form-item>
        <el-form-item label="產品定價" required prop="price">
          <el-input v-model.number="form.price" style="width: 100%" />
        </el-form-item>
        <el-form-item label="產品簡介" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="產品簡短介紹"
          />
        </el-form-item>

        <el-form-item label="成分表" prop="ingredients">
          <el-input
            v-model="form.ingredients"
            type="textarea"
            :rows="3"
            placeholder="例如：高筋麵粉、牛奶、酵母、鹽、糖"
          />
        </el-form-item>

        <el-form-item label="狀態" required prop="is_active">
          <SelectProductStatus
            v-model="form.is_active"
            :placeholder="'選擇產品狀態'"
          />
        </el-form-item>
      </div>
      <div v-if="value === '詳細成分'">
        <div class="ing-table">
          <small class="hint"
            >輸入成分與份量，可協助統計訂單所需原料。非必填欄位。</small
          >
          <el-table :data="form.ingredient_details" border size="small">
            <el-table-column label="名稱" align="center">
              <template #default="{ row }">
                <el-input v-model="row.name" placeholder="成分名稱" />
              </template>
            </el-table-column>
            <el-table-column label="份量(公克)" width="110" align="center">
              <template #default="{ row }">
                <el-input
                  inputmode="numeric"
                  v-model="row.grams"
                  placeholder="份量(公克)"
                />
              </template>
            </el-table-column>
            <el-table-column label="顯示" width="60" align="center">
              <template #default="{ row }">
                <el-switch size="small" v-model="row.is_visible" />
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
              form.ingredient_details.push({
                name: '',
                grams: '',
                is_visible: true,
              })
            "
          >
            新增
          </el-button>
        </div>
      </div>
      <div v-if="value === '商品圖片'">
        <el-form-item label="圖片說明" prop="image_urls"> </el-form-item>
        <UploadPhotos
          ref="uploadPhotos"
          v-model="form.image_urls"
          :disabled="false"
          @upload="
            (url) => {
              form.image_urls = url;
            }
          "
        />
      </div>
    </el-form>
    <!-- <pre>{{ form }}</pre> -->
    <template #footer>
      <div
        :style="{
          display: 'flex',
          justifyContent: form.id ? 'space-between' : 'center',
          alignItems: 'center',
          width: '100%',
        }"
      >
        <el-button
          v-if="form.id"
          type="danger"
          plain
          @click="deleteProduct"
          :loading="loading"
        >
          刪除商品
        </el-button>
        <div>
          <el-button @click="close">取消</el-button>
          <el-button
            type="primary"
            @click="beforeSave(formRef)"
            :loading="loading || uploadPhotosLoading"
            >{{
              uploadPhotosLoading ? "上傳中..." : form.id ? "儲存" : "新增"
            }}</el-button
          >
        </div>
      </div>
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
