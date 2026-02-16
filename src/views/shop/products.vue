<script setup>
import EditProduct from "@/components/product/EditProduct.vue";
import { ProductCategory, Products } from "@/api/products";
import { reactive } from "vue";
const editCategory = ref();
const editProduct = ref();
const currentCategory = ref(null);
const loading = ref(false);
const props = {
  label: "name",
  value: "id",
};
const form = reactive({
  page: null,
  limit: null,
  keyword: "",
  category_id: null, // 暫時不須透過分類搜尋，撈出全部即可
});
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
    // console.log("product categories", res);
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

onMounted(() => {
  initProductCategories();
  initProducts();
});
</script>

<template>
  <div class="products-manager">
    <!-- 頂部標題 -->
    <div class="page-header">
      <div class="header-top">
        <div>
          <h2>產品管理</h2>
          <p class="subtitle">管理麵包產品資訊，快速編輯與分類</p>
        </div>
        <el-button type="primary" icon="Plus" @click="editProduct.open()">
          新增產品
        </el-button>
      </div>
    </div>

    <EditCategory ref="editCategory" />
    <EditProduct ref="editProduct" @update="initProducts" />
    <div class="toolbar">
      <el-segmented
        v-model="currentCategory"
        :options="categories"
        :props="props"
        v-loading="loading"
      />
      <el-button icon="setting" text @click="editCategory.open()"></el-button>
    </div>

    <div class="columns-2">
      <div class="card" v-for="item in filteredProducts" :key="item.id">
        <div class="thumb" :class="{ disabled: !item.is_active }">
          <img v-if="item.image_url" :src="item.image_url" :alt="item.name" />
          <div v-else class="image-placeholder">
            <span>No Image</span>
          </div>
          <div v-if="!item.is_active" class="overlay">下架</div>
          <div class="category">{{ item.category_name }}</div>
        </div>
        <div class="info">
          <div class="title">
            <span class="text-ellipsis-2">{{ item.name }}</span>
            <el-icon @click="editProduct.open(item)"><MoreFilled /></el-icon>
          </div>
          <p class="description text-ellipsis-2">{{ item.description }}</p>
          <span class="price">${{ item.price }}</span>
        </div>
      </div>
    </div>
    <el-empty
      v-if="filteredProducts.length === 0"
      description="沒有符合條件的產品"
    ></el-empty>

    <!-- <div class="new-product flex justify-end">
      <el-button
        type="primary"
        circle
        icon="plus"
        size="large"
        plain
        @click="editProduct?.open()"
      />
    </div> -->
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/scss/scrollbar.scss" as *;

.products-manager {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  margin-bottom: 8px;

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;

    h2 {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 8px 0;
    }

    .subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }
  }
}

.toolbar {
  padding: 6px 0;
  border-radius: 8px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 16px;
  z-index: 10;
  overflow-x: auto;
  @include scrollbar(rgba(170, 160, 160, 0.7));
  .el-segmented {
    padding: 0 8px;
    background-color: #fff;
    --el-segmented-item-selected-color: var(--el-text-color-primary);
    --el-segmented-item-selected-bg-color: #ffd100;
    --el-segmented-item-hover-bg-color: #f1e9e6;
    --el-segmented-item-active-bg-color: #e7d9d4;
    --el-border-radius-base: 8px;
  }
  .el-button {
    position: sticky;
    right: 0;
    z-index: 1;
    background-color: #fff;
    border-left: 1px solid #dfdfdf;
    border-radius: 0;
  }
}

.card {
  overflow: hidden;
  display: flex;
  background-color: #fff;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 8px;
  gap: 16px;
  transition: box-shadow 0.3s ease;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    .thumb {
      img {
        transform: scale(1.1);
      }
    }
  }
  .thumb {
    flex-shrink: 0;
    width: 160px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.3s ease;
    }
    .image-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #94a3b8;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);

      span {
        font-weight: 500;
      }
    }
    &.disabled {
      filter: grayscale(0.8) brightness(1) opacity(0.7);
    }
    .category {
      position: absolute;
      bottom: 8px;
      left: 8px;
      padding: 4px 8px;
      background-color: rgba(0, 0, 0, 0.6);
      color: #fff;
      font-size: 12px;
      border-radius: 4px;
    }
    .overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 800;
      font-style: italic;
      color: rgba(255, 255, 255, 0.5);
      text-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
      letter-spacing: 4px;
      filter: invert(1);
      pointer-events: none;
    }
  }
  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1.125rem;
      font-weight: 600;
      gap: 8px;
      color: var(--el-text-color-primary);
      .el-icon {
        font-size: 20px;
        cursor: pointer;
      }
    }
    .description {
      margin: 0;
      color: var(--el-text-color-secondary);
      font-size: 14px;
      line-height: 1.4;
    }

    .price {
      font-size: 1.125rem;
      margin-top: auto;
      font-weight: 700;
      color: #1f345f;
      text-align: right;
    }
  }
}

.new-product {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 20;
  padding-bottom: 16px; /* 基礎邊距 */
  padding-bottom: max(16px, env(safe-area-inset-bottom)); /* 增強 */
}

@media (max-width: 640px) {
  .products-manager {
    padding: 12px;
  }

  .page-header {
    .header-top {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;

      .el-button {
        width: 100%;
      }
    }
  }

  .page {
    padding: 12px;
  }
  .card {
    gap: 12px;
    transition: box-shadow 0.3s ease;
    .thumb {
      width: 140px;
      height: 100px;
      .category {
        bottom: 4px;
        left: 4px;
        padding: 2px 4px;
      }
    }
    .info {
      .description {
        font-size: 12px;
        line-height: 1.2;
      }
    }
  }
}
</style>
