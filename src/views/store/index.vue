<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Shop } from "@/api/shop";

const router = useRouter();
const route = useRoute();

const dayLabel = ["日", "一", "二", "三", "四", "五", "六"];

const paymentLabel = {
  cash: "現金",
  linepay: "Line Pay",
  bank: "銀行轉帳",
  card: "信用卡",
};

const pickupLabel = {
  pickup: "門市自取",
  delivery: "宅配",
};

const shop = ref(null);
const isLoading = ref(true);
const notFound = ref(false);

const fetchShop = async () => {
  try {
    const res = await Shop.GetInfo(route.params.slug);
    console.log("店家資料", res.data);
    shop.value = res.data;
  } catch (err) {
    if (err?.response?.status === 404) {
      notFound.value = true;
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchShop);

const activeHours = computed(
  () => shop.value?.businessHours?.filter((h) => h.enabled) ?? [],
);

const hasDelivery = computed(
  () => shop.value?.pickupMethods?.includes("delivery") ?? false,
);
</script>

<template>
  <div class="store-page">
    <!-- 載入中 -->
    <div v-if="isLoading" class="state-center">
      <el-skeleton animated>
        <template #template>
          <div class="hero">
            <div class="hero__content">
              <el-skeleton-item
                variant="circle"
                style="width: 88px; height: 88px"
              />
              <el-skeleton-item
                variant="h1"
                style="width: 140px; margin-top: 12px"
              />
              <el-skeleton-item variant="text" style="width: 80px" />
              <el-skeleton-item variant="text" style="width: 260px" />
            </div>
          </div>
          <div class="body">
            <el-skeleton-item
              variant="rect"
              style="width: 100%; height: 80px; border-radius: 16px"
            />
            <el-skeleton-item
              variant="rect"
              style="width: 100%; height: 180px; border-radius: 16px"
            />
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- 找不到店家 -->
    <div v-else-if="notFound" class="state-center state-notfound">
      <i class="bx bx-store-alt"></i>
      <p>找不到此店家</p>
      <small>請確認網址是否正確</small>
    </div>

    <!-- 正常內容 -->
    <template v-else-if="shop">
      <!-- Hero -->
      <div class="hero">
        <div class="hero__content">
          <div class="hero__avatar">
            <img v-if="shop.avatar" :src="shop.avatar" :alt="shop.shopName" />
            <span v-else class="hero__avatar-fallback">
              {{ shop.shopName?.[0] ?? "🍞" }}
            </span>
          </div>
          <h1 class="hero__name">{{ shop.shopName }}</h1>
          <p class="hero__owner">by {{ shop.ownerName }}</p>
          <p v-if="shop.intro" class="hero__intro">{{ shop.intro }}</p>
        </div>
      </div>

      <!-- Body -->
      <div class="body">
        <!-- 聯絡資訊 -->
        <div class="card">
          <div class="card__title"><i class="bx bx-map-pin"></i> 店家資訊</div>
          <div v-if="shop.address" class="info-row">
            <span class="info-row__icon"><i class="bx bx-map"></i></span>
            <span>{{ shop.address }}</span>
          </div>
          <div v-if="shop.phone" class="info-row">
            <span class="info-row__icon"><i class="bx bx-phone"></i></span>
            <a :href="`tel:${shop.phone}`" class="info-row__link">{{
              shop.phone
            }}</a>
          </div>
        </div>

        <!-- 營業時間 -->
        <div class="card">
          <div class="card__title"><i class="bx bx-time"></i> 營業時間</div>
          <div v-if="activeHours.length === 0" class="empty-hint">尚未設定</div>
          <div
            v-for="h in shop.businessHours"
            :key="h.day"
            class="hours-row"
            :class="{ 'hours-row--closed': !h.enabled }"
          >
            <span class="hours-row__day">週{{ dayLabel[h.day] }}</span>
            <span v-if="h.enabled" class="hours-row__time">
              {{ h.time[0] }} – {{ h.time[1] }}
            </span>
            <span v-else class="hours-row__closed">公休</span>
          </div>
        </div>

        <!-- 付款方式 -->
        <div v-if="shop.paymentMethods?.length" class="card">
          <div class="card__title">
            <i class="bx bx-credit-card"></i> 付款方式
          </div>
          <div class="tags">
            <span
              v-for="m in shop.paymentMethods"
              :key="m"
              class="tag tag--payment"
            >
              {{ paymentLabel[m] ?? m }}
            </span>
          </div>
        </div>

        <!-- 取貨方式 -->
        <div v-if="shop.pickupMethods?.length" class="card">
          <div class="card__title"><i class="bx bx-package"></i> 取貨方式</div>
          <div class="tags">
            <span
              v-for="m in shop.pickupMethods"
              :key="m"
              class="tag tag--pickup"
            >
              {{ pickupLabel[m] ?? m }}
            </span>
          </div>
          <div v-if="hasDelivery && shop.shipping?.note" class="shipping-note">
            <i class="bx bx-info-circle"></i>
            {{ shop.shipping.note }}
          </div>
        </div>

        <!-- CTA -->
        <div class="cta-block">
          <el-button
            type="primary"
            rounded
            icon="calendar"
            @click="
              router.push({
                name: 'store-schedules',
                params: { slug: route.params.slug },
              })
            "
          >
            查看接單行程
          </el-button>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.store-page {
  height: 100dvh;
  overflow-y: auto;
  background: #f7f3ee;
  padding-bottom: 40px;
}

.state-center {
  padding: 48px 20px;
}

.state-notfound {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  color: #c0b0a0;

  i {
    font-size: 56px;
    margin-bottom: 12px;
    display: block;
  }
  p {
    font-size: 18px;
    font-weight: 700;
    color: #8a7060;
    margin: 0 0 6px;
  }
  small {
    font-size: 13px;
  }
}

/* Hero */
.hero {
  padding: 48px 20px 32px;
  text-align: center;

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  &__avatar {
    width: 88px;
    height: 88px;
    border-radius: 999px;
    overflow: hidden;
    border: 3px solid #fff;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffd88a;
    margin-bottom: 4px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__avatar-fallback {
    font-size: 36px;
    line-height: 1;
    font-weight: 700;
    color: #7a4f00;
  }

  &__name {
    font-size: 26px;
    font-weight: 800;
    color: #1a120b;
    margin: 0;
    letter-spacing: 0.02em;
  }

  &__owner {
    font-size: 13px;
    color: #8a7060;
    margin: 0;
  }

  &__intro {
    font-size: 14px;
    color: #5c4b3e;
    line-height: 1.7;
    margin: 4px 0 0;
    max-width: 340px;
  }
}

/* Body */
.body {
  max-width: 520px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Card */
.card {
  background: #fff;
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);

  &__title {
    font-size: 13px;
    font-weight: 700;
    color: #8a7060;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 6px;

    i {
      font-size: 15px;
    }
  }
}

/* Info rows */
.info-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: #2f2a25;
  line-height: 1.5;

  & + & {
    margin-top: 10px;
  }

  &__icon {
    flex-shrink: 0;
    width: 20px;
    color: #c08a50;
    font-size: 16px;
    margin-top: 1px;
  }

  &__link {
    color: #2f2a25;
    text-decoration: none;

    &:active {
      color: #c08a50;
    }
  }
}

/* Business hours */
.hours-row {
  display: grid;
  grid-template-columns: 48px 1fr;
  align-items: center;
  font-size: 14px;
  padding: 4px 0;
  color: #2f2a25;
  border-bottom: 1px solid #f3ede8;

  &:last-child {
    border-bottom: none;
  }

  &--closed {
    color: #bbb;
  }

  &__day {
    font-weight: 600;
  }

  &__time {
    color: #4a3728;
  }

  &__closed {
    font-size: 12px;
    color: #ccc;
  }
}

.empty-hint {
  font-size: 13px;
  color: #bbb;
}

/* Tags */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;

  &--payment {
    background: #fff7e6;
    color: #a06020;
    border: 1px solid #f5d89a;
  }

  &--pickup {
    background: #e8f4ff;
    color: #1a6faa;
    border: 1px solid #b8d9f5;
  }
}

/* Shipping note */
.shipping-note {
  margin-top: 12px;
  font-size: 12px;
  color: #8a7060;
  background: #fdf8f2;
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  line-height: 1.5;

  i {
    flex-shrink: 0;
    font-size: 14px;
    margin-top: 1px;
    color: #c08a50;
  }
}

/* CTA */
.cta-block {
  padding: 8px 0 4px;
  .el-button {
    width: 100%;
  }
}
</style>
