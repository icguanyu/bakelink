<script setup>
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  disabled: Boolean,
});

const emits = defineEmits(["upload", "delete", "update:modelValue"]);
const loading = ref(false);
const image = ref(props.modelValue || "");

const preview = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const previewUrl = URL.createObjectURL(file);
  image.value = previewUrl;
  emits("upload", previewUrl);
  emits("update:modelValue", previewUrl);

  // 清空 input 以便重複上傳
  e.target.value = "";
};

const handleDelete = (index) => {
  image.value = "";
  emits("delete", index);
  emits("update:modelValue", "");
};

// 監聽 props 變化
watch(
  () => props.modelValue,
  (newVal) => {
    image.value = newVal || "";
  },
  { deep: true }
);
</script>

<template>
  <div class="images-uploader">
    <div class="gallery" :class="{ 'has-image': !!image }">
      <div v-if="image" class="image-item">
        <img :src="image" alt="已上傳圖片" />
        <el-icon class="delete-btn" @click="handleDelete(0)">
          <Delete />
        </el-icon>
      </div>

      <label
        v-else
        for="image-upload"
        :class="{ disabled: loading || disabled }"
        class="upload-box"
      >
        <div class="upload-text">
          {{ loading ? "上傳中..." : "上傳圖片" }}
        </div>
      </label>
    </div>
    <small class="hint">建議尺寸 600x400，檔案小於 1MB</small>
    <input
      type="file"
      id="image-upload"
      accept=".png,.jpg,.jpeg,.webp"
      @change="preview"
    />
  </div>
</template>

<style lang="scss" scoped>
.images-uploader {
  input {
    display: none;
  }
  .gallery {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    .image-item {
      border: 1px solid #e7e7e7;
      position: relative;
      border-radius: 4px;
      overflow: hidden;
      aspect-ratio: 1;
      width: 100%;
      max-width: 220px;
      background-color: #f0f0f0;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      &:hover .delete-btn {
        opacity: 1;
      }

      .delete-btn {
        cursor: pointer;
        background-color: rgba(white, 0.7);
        font-size: 24px;
        padding: 4px;
        border-radius: 3px;
        position: absolute;
        z-index: 1;
        bottom: 0;
        right: 5px;
        top: 5px;
        color: rgb(255, 68, 43);
        &:hover {
          background-color: rgba(white, 0.9);
        }
      }
    }

    .upload-box {
      aspect-ratio: 1;
      display: flex;
      line-height: 1.4rem;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 1px dashed #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      background-color: #fafafa;
      width: 100%;
      max-width: 280px;

      &:hover:not(.disabled) {
        border-color: var(--el-color-primary);
        background-color: #f5f7fa;
      }

      &.disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .upload-text {
        color: #999;
        font-weight: 500;
      }

      small {
        font-size: 10px;
        color: #ccc;
      }
    }
  }

  .hint {
    text-align: center;
    display: block;
    line-height: 1rem;
    margin-top: 8px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}
@media (max-width: 640px) {
  .images-uploader {
    .gallery {
      align-items: stretch;
      gap: 10px;

      .image-item,
      .upload-box {
        max-width: 100%;
      }
    }
  }
}
</style>
