<script setup>
import { computed, ref } from "vue";
import EditProduct from "@/components/product/EditProduct.vue";

const editCategory = ref();
const editProduct = ref();
const value = ref("全部");

const options = [
  "全部",
  "吐司",
  "可頌",
  "貝果",
  "法棍",
  "酸種",
  "波蘿",
  "雜糧",
  "甜甜圈",
  "蛋塔",
  "鹽可頌",
  "牛角包",
  "丹麥",
  "未分類",
];

const products = [
  {
    id: 1,
    name: "經典牛奶吐司",
    category: "吐司",
    price: 120,
    desc: "柔軟奶香，當日現烤基底吐司。",
    tag: "招牌",
    image: new URL("@/assets/images/sample/6.jpg", import.meta.url).href,
  },
  {
    id: 2,
    name: "法式厚切吐司",
    category: "吐司",
    price: 140,
    desc: "外脆內軟，適合做法式吐司。",
    tag: "厚切",
    image: new URL("@/assets/images/sample/2.jpg", import.meta.url).href,
  },
  {
    id: 3,
    name: "海鹽奶油可頌",
    category: "可頌",
    price: 75,
    desc: "層次酥脆，帶淡淡海鹽風味。",
    tag: "人氣",
    image: new URL("@/assets/images/sample/3.jpg", import.meta.url).href,
  },
  {
    id: 4,
    name: "伯爵茶貝果",
    category: "貝果",
    price: 90,
    desc: "茶香濃郁，口感紮實。",
    tag: "茶香",
    image: new URL("@/assets/images/sample/4.jpg", import.meta.url).href,
  },
  {
    id: 5,
    name: "煙燻火腿三明治",
    category: "雜糧",
    price: 160,
    desc: "全麥雜糧麵包夾煙燻火腿與起司。",
    tag: "輕食",
    image: new URL("@/assets/images/sample/1.jpg", import.meta.url).href,
  },
  {
    id: 6,
    name: "小麥酸種",
    category: "酸種",
    price: 180,
    desc: "自然發酵 24 小時，帶淡淡酸香。",
    tag: "低酵母",
    image: new URL("@/assets/images/sample/10.jpg", import.meta.url).href,
  },
  {
    id: 7,
    name: "蜂蜜核桃雜糧",
    category: "雜糧",
    price: 150,
    desc: "核桃與蜂蜜增加香氣與口感。",
    tag: "高纖",
    image: new URL("@/assets/images/sample/2.jpg", import.meta.url).href,
  },
  {
    id: 8,
    name: "手作波蘿麵包",
    category: "波蘿",
    price: 65,
    desc: "外層脆皮波蘿，內裡鬆軟奶香。",
    tag: "下午茶",
    image: new URL("@/assets/images/sample/9.jpg", import.meta.url).href,
  },
  {
    id: 9,
    name: "蒜香法棍",
    category: "法棍",
    price: 110,
    desc: "外酥內軟，蒜香奶油均勻滲入。",
    tag: "熱賣",
    image: new URL("@/assets/images/sample/5.jpg", import.meta.url).href,
  },
  {
    id: 10,
    name: "巧克力可頌",
    category: "可頌",
    price: 85,
    desc: "夾入黑巧克力棒，烤後微微融化。",
    tag: "甜點",
    image: new URL("@/assets/images/sample/7.jpg", import.meta.url).href,
  },
  {
    id: 11,
    name: "起司鹹可頌",
    category: "可頌",
    price: 90,
    desc: "表層烤上帕瑪森與切達雙起司。",
    tag: "鹹香",
    image: new URL("@/assets/images/sample/6.jpg", import.meta.url).href,
  },
  {
    id: 12,
    name: "桂圓紅棗吐司",
    category: "吐司",
    price: 150,
    desc: "桂圓與紅棗丁拌入麵糰，香甜耐嚼。",
    tag: "季節",
    image: new URL("@/assets/images/sample/8.jpg", import.meta.url).href,
  },
];

const filteredProducts = computed(() => {
  if (value.value === "全部") return products;
  return products.filter((item) => item.category === value.value);
});

const categoryList = computed(() => {
  return options
    .filter((opt) => opt !== "全部")
    .map((name) => ({ name, value: name }));
});

const handleSaveProduct = (product) => {
  console.log("儲存產品：", product);
  // TODO: 新增或更新產品到 products 列表，或呼叫 API
};
</script>

<template>
  <div class="page">
    <EditCategory ref="editCategory" />
    <EditProduct
      ref="editProduct"
      :categories="categoryList"
      @save="handleSaveProduct"
    />
    <div class="toolbar">
      <el-segmented v-model="value" :options="options" />
      <el-button icon="setting" text @click="editCategory.open()"></el-button>
    </div>

    <div class="columns-2">
      <div class="card" v-for="item in filteredProducts" :key="item.id">
        <div class="thumb">
          <img :src="item.image" :alt="item.name" />
          <div class="category">{{ item.category }}</div>
        </div>
        <div class="info">
          <div class="title">{{ item.name }}</div>
          <p class="desc text-ellipsis-2">{{ item.desc }}</p>
          <span class="price">${{ item.price }}</span>
        </div>
      </div>
    </div>

    <div class="new-product flex justify-end">
      <el-button
        type="primary"
        circle
        icon="plus"
        size="large"
        plain
        @click="editProduct?.open()"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "@/assets/scss/scrollbar.scss" as *;
.page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar {
  padding: 8px;
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
    background-color: #fff;
    --el-segmented-item-selected-color: var(--el-text-color-primary);
    --el-segmented-item-selected-bg-color: #ffd100;
    --el-segmented-item-hover-bg-color: #e7d9d4;
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
  cursor: pointer;
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
        transform: scale(1.2);
      }
    }
  }
  .thumb {
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
  }
  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    .title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    .desc {
      margin: 0;
      color: var(--el-text-color-secondary);
      font-size: 14px;
      line-height: 1.4;
    }

    .price {
      margin-top: auto;
      font-weight: 700;
      color: #1f345f;
      text-align: right;
    }
  }
}

.new-product {
  position: sticky;
  bottom: 20px;
  right: 20px;
  z-index: 20;
}

@media (max-width: 640px) {
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
      .desc {
        font-size: 12px;
        line-height: 1.2;
      }
    }
  }
}
</style>
