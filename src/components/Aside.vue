<script setup></script>

<template>
  <aside>
    <router-link class="link" to="/shop/schedule">
      <div class="icon">
        <img src="@/assets/images/icons/calendar.png" alt="" />
      </div>
      <div class="title">行事曆</div>
    </router-link>
    <router-link class="link" to="/shop/order">
      <el-badge :value="100" :max="99" :offset="[-10, 4]">
        <div class="icon">
          <img src="@/assets/images/icons/receipt.png" alt="" />
        </div>
      </el-badge>
      <div class="title">訂單</div>
    </router-link>
    <router-link class="link" to="/shop/products">
      <div class="icon">
        <img src="@/assets/images/icons/baguette.png" alt="" />
      </div>
      <div class="title">商品</div>
    </router-link>
    <router-link class="link" to="/shop/settings">
      <div class="icon">
        <img src="@/assets/images/icons/store.png" alt="" />
      </div>
      <div class="title">設定</div>
    </router-link>
  </aside>
</template>

<style lang="scss" scoped>
aside {
  position: sticky;
  top: 0;
  flex-shrink: 0;
  height: 100dvh;
  background-color: #1c2345;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  .link {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #fff;
    text-decoration: none;
    padding: 8px 16px;
    .el-badge {
      &::v-deep(sup) {
        border: none;
      }
    }
    .icon {
      width: 35px;
      height: 35px;
      img {
        user-select: none;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
    .title {
      font-size: 12px;
    }
  }
  .link.router-link-active {
    background-color: #303758;
    &:after {
      content: "";
      display: block;
      width: 10px;
      height: 10px;
      background-color: white;
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%) translateX(50%) rotate(45deg);
    }
  }
}
@media (max-width: 640px) {
  aside {
    .link {
      padding: 4px 8px;
      .el-badge {
        &::v-deep(sup) {
          display: none;
        }
      }
      .icon {
        width: 28px;
        height: 28px;
      }
      .title {
        display: none;
      }
    }
  }
}
</style>
