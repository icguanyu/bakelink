<script setup>
import { ref, computed, onMounted } from "vue";
import EditProduct from "@/components/product/EditProduct.vue";
import { ProductCategory, Products } from "@/api/products";
import { Setting, Plus, Delete, Edit } from "@element-plus/icons-vue";
import { ElNotification } from "element-plus";

const editCategory = ref();
const editProduct = ref();
const currentCategory = ref(null);
const loading = ref(false);

const props = {
  label: "name",
  value: "id",
};

const categories = ref([{ name: "全部", id: null }]);
const products = ref([]);

const filteredProducts = computed(() => {
  if (currentCategory.value === null) return products.value;
  return products.value.filter(
    (item) => item.category_id === currentCategory.value,
  );
});

const initProductCategories = async () => {
  loading.value = true;
  try {
    const res = await ProductCategory.List();
    categories.value = [{ name: "全部", id: null }, ...res.data.data];
  } catch (error) {
    console.log("catch", error);
  } finally {
    loading.value = false;
  }
};

const initProducts = async () => {
  loading.value = true;
  try {
    const res = await Products.List();
    console.log("products", res);
    products.value = res.data.data;
  } catch (error) {
    console.log("catch", error);
  } finally {
    loading.value = false;
  }
};

const beforeDelete = (id) => {
  ElMessageBox.confirm("確定要刪除此產品嗎？此操作無法恢復。", "刪除確認", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      deleteProduct(id);
    })
    .catch(() => {
      // 使用者取消刪除
    });
};

const deleteProduct = async (id) => {
  try {
    await Products.Delete(id);
    ElNotification({
      title: "成功",
      message: "產品已刪除",
      type: "success",
    });
    initProducts();
  } catch (error) {
    console.error("刪除產品失敗", error);
    ElMessage.error("刪除產品失敗，請稍後再試");
  }
};

onMounted(() => {
  initProductCategories();
  initProducts();
});
</script>

<template>
  <div class="products-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="header-top">
        <div class="header-info">
          <h2>產品管理</h2>
          <p class="subtitle">管理麵包產品資訊，快速編輯與分類</p>
        </div>
        <el-button
          type="primary"
          size="large"
          class="btn-add"
          @click="editProduct.open()"
        >
          <el-icon><Plus /></el-icon>
          新增產品
        </el-button>
      </div>
    </div>

    <!-- 分類工具欄 -->
    <div class="filter-bar">
      <div class="filter-wrapper">
        <div class="segmented-wrapper">
          <el-segmented
            v-model="currentCategory"
            :options="categories"
            :props="props"
            v-loading="loading"
          />
        </div>
        <el-button
          icon="Setting"
          text
          class="btn-settings"
          @click="editCategory.open()"
        >
          分類設定
        </el-button>
      </div>
    </div>

    <!-- 隱藏的組件 -->
    <EditCategory ref="editCategory" />
    <EditProduct ref="editProduct" @update="initProducts" />

    <!-- 產品網格 -->
    <div class="products-grid">
      <template v-if="filteredProducts.length > 0">
        <div
          v-for="item in filteredProducts"
          :key="item.id"
          class="product-card"
          :class="{ inactive: !item.is_active }"
        >
          <!-- 圖片區域 -->
          <div class="product-image">
            <img
              v-if="item.image_url"
              :src="item.image_url"
              :alt="item.name"
              class="image"
            />
            <div v-else class="image-placeholder">
              <span>No Image</span>
            </div>

            <!-- 狀態標籤 -->
            <div class="status-badges">
              <el-tag v-if="!item.is_active" type="danger" effect="dark">
                下架中
              </el-tag>
              <el-tag class="category-tag">{{ item.category_name }}</el-tag>
            </div>

            <!-- 懸停操作按鈕 -->
            <div class="card-actions">
              <el-button
                type="primary"
                icon="More"
                circle
                size="small"
                @click="editProduct.open(item)"
              />
              <el-button
                icon="Delete"
                circle
                size="small"
                @click="beforeDelete(item.id)"
              />
            </div>
          </div>

          <!-- 信息區域 -->
          <div class="product-info">
            <div class="info-header">
              <h3 class="product-name">{{ item.name }}</h3>
              <span class="product-price">${{ item.price }}</span>
            </div>

            <p class="product-description">{{ item.description }}</p>

            <!-- 底部操作欄 -->
            <!-- <div class="info-footer">
              <div class="product-meta">
                <span class="meta-item">
                  <span class="label">編號:</span>
                  <span class="value">{{ item.id }}</span>
                </span>
              </div>
              <el-button
                type="primary"
                text
                size="small"
                @click="editProduct.open(item)"
              >
                編輯
              </el-button>
            </div> -->
          </div>
        </div>
      </template>

      <!-- 空狀態 -->
      <div v-else class="empty-state">
        <el-empty description="沒有符合條件的產品" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.products-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

// 頁面標題
.page-header {
  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    flex-wrap: wrap;

    .header-info {
      flex: 1;
      min-width: 250px;

      h2 {
        font-size: 24px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 8px 0;
        letter-spacing: -0.5px;
      }

      .subtitle {
        font-size: 14px;
        color: #64748b;
        margin: 0;
        font-weight: 500;
      }
    }

    .btn-add {
      flex-shrink: 0;
      min-width: 120px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;

      :deep(.el-icon) {
        margin-right: 4px;
      }
    }
  }
}

// 分類工具欄
.filter-bar {
  background: #ffffff;
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 20px;
  z-index: 10;

  .filter-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    .segmented-wrapper {
      flex: 1;
      min-width: 200px;
      overflow-x: auto;

      :deep(.el-segmented) {
        background-color: #f8fafc;
        --el-segmented-item-selected-color: var(--el-text-color-primary);
        --el-segmented-item-selected-bg-color: #ffd100;
        --el-segmented-item-hover-bg-color: #f1e9e6;
        --el-segmented-item-active-bg-color: #e7d9d4;
        --el-border-radius-base: 8px;
      }
    }

    .btn-settings {
      flex-shrink: 0;
      color: #64748b;
      font-weight: 500;
      font-size: 14px;

      &:hover {
        color: #0f172a;
      }
    }
  }
}

// 產品網格
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;

  .empty-state {
    grid-column: 1 / -1;
    padding: 60px 20px;
    text-align: center;
  }
}

// 產品卡片
.product-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
    border-color: #cbd5e1;

    .product-image {
      .image {
        transform: scale(1.08);
      }
    }
  }

  &.inactive {
    opacity: 0.7;

    .product-image {
      filter: grayscale(0.8) brightness(0.95);
    }
  }

  // 圖片區域
  .product-image {
    position: relative;
    width: 100%;
    padding-top: 75%;
    overflow: hidden;
    background: #f8fafc;

    .image,
    .image-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      transition: transform 0.3s ease;
    }

    .image-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      color: #94a3b8;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);

      span {
        font-weight: 500;
      }
    }

    // 狀態標籤
    .status-badges {
      position: absolute;
      top: 12px;
      left: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .category-tag {
        --el-tag-text-color: #ffffff;
        --el-tag-bg-color: rgba(15, 23, 42, 0.8);
        --el-tag-border-color: transparent;
        backdrop-filter: blur(4px);
        font-size: 12px;
        font-weight: 500;
      }
    }

    // 懸停操作按鈕
    .card-actions {
      position: absolute;
      bottom: 12px;
      right: 12px;
      display: flex;
      gap: 6px;
      opacity: 1;
      visibility: visible;
      transition: all 0.3s ease;

      .el-button {
        backdrop-filter: blur(4px);
        margin-left: 0;
        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
      }
    }
  }

  // 信息區域
  .product-info {
    padding: 16px;
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 12px;

    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;

      .product-name {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #0f172a;
        line-height: 1.4;
        flex: 1;
        word-break: break-word;
      }

      .product-price {
        flex-shrink: 0;
        font-size: 18px;
        font-weight: 800;
        color: #109b5a;
        line-height: 1;
      }
    }

    .product-description {
      margin: 0;
      font-size: 13px;
      color: #64748b;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }

    .info-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      margin-top: auto;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;

      .product-meta {
        display: flex;
        gap: 12px;
        flex: 1;
        min-width: 0;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          .label {
            font-weight: 500;
            color: #64748b;
          }

          .value {
            color: #475569;
            font-weight: 600;
          }
        }
      }
    }
  }
}

// 響應式設計
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .products-container {
    padding: 12px;
    gap: 16px;
  }

  .page-header {
    .header-top {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;

      .header-info h2 {
        font-size: 24px;
      }

      .btn-add {
        width: 100%;
        min-width: auto;
      }
    }
  }

  .filter-bar {
    top: 12px;
    padding: 10px 12px;

    .filter-wrapper {
      flex-direction: column;
      align-items: stretch;

      .segmented-wrapper,
      .btn-settings {
        width: 100%;
      }
    }
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .product-card {
    .product-info {
      padding: 12px;
      gap: 8px;

      .info-header {
        .product-name {
          font-size: 14px;
        }

        .product-price {
          font-size: 16px;
        }
      }

      .product-description {
        font-size: 12px;
      }

      .info-footer {
        flex-direction: column;
        align-items: flex-start;
        border: none;
        padding-top: 8px;

        .product-meta {
          width: 100%;
        }
      }
    }

    &:hover {
      transform: translateY(-2px);
    }
  }
}


</style>
