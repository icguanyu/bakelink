<script setup>
import { reactive, ref } from "vue";

const paymentOptions = [
  { label: "現金", value: "cash" },
  { label: "銀行轉帳", value: "bank" },
  { label: "Line Pay", value: "linepay" },
  { label: "信用卡", value: "card" },
  { label: "街口支付", value: "jkpay" },
  { label: "Apple Pay", value: "applepay" },
];

const pickupOptions = [
  { label: "門市自取", value: "pickup" },
  { label: "宅配", value: "delivery" },
];

const businessHours = ref(
  ["一", "二", "三", "四", "五", "六", "日"].map((d) => ({
    day: d,
    enabled: !["六", "日"].includes(d) ? true : false,
    time: ["09:00", "18:00"],
  }))
);

const form = reactive({
  avatar: "",
  shopName: "山丘烘焙坊",
  owner: "王麵麥",
  phone: "02-1234-5678",
  email: "hello@bakery.test",
  address: "台北市中山區麵包路 123 號",
  intro: "每日現烤小麥香，主打酸種、歐包與早午餐。",
  orderPickupTime: "14:00",
  paymentMethods: ["cash"],
  pickupMethods: ["pickup", "delivery"],
  shipping: {
    freeThreshold: 800,
    fee: 100,
    note: "滿 $800 免運費，未滿貿 $100 運費。",
  },
  packaging: {
    defaultPack: "紙袋",
    packFee: 5,
    ecoDiscount: 10,
    note: "歡迎自備容器，享環保折扣。",
  },
});

const segment = ref("brand");

const toggleAllWeekday = (enabled) => {
  businessHours.value = businessHours.value.map((i) => ({
    ...i,
    enabled,
  }));
};

const handleSave = () => {
  const payload = {
    ...form,
    businessHours: businessHours.value,
  };
  console.log("儲存商家設定：", payload);
  ElMessage.success("設定已儲存");
  // TODO: 呼叫 API 儲存
};
</script>

<template>
  <div class="page">
    <div class="segmented">
      <el-segmented
        v-model="segment"
        :options="[
          { label: '01 基本', value: 'brand' },
          { label: '02 取貨付款', value: 'pay' },
          { label: '03 營業時間', value: 'hours' },
          { label: '04 包裝', value: 'pack' },
        ]"
      />
    </div>
    <el-form label-width="80px" label-position="left">
      <div class="flex flex-col gap-2">
        <el-card class="card" shadow="never" v-show="segment === 'brand'">
          <div class="panel">
            <div class="panel__header">
              <span class="badge">01</span>
              <div>
                <p class="label">品牌</p>
                <h3>商店設定</h3>
              </div>
            </div>
            <small class="hint">請填寫商家基本資料，使用者可於前台查看</small>
          </div>

          <div class="card__subtitle">標誌/LOGO</div>
          <UploadPhoto
            v-model="form.avatar"
            :disabled="false"
            @upload="
              (url) => {
                form.avatar = url;
              }
            "
          />
          <br />
          <div class="card__subtitle">基本資訊</div>
          <el-form-item label="店名">
            <el-input v-model="form.shopName" placeholder="輸入店名" />
          </el-form-item>
          <el-form-item label="負責人">
            <el-input v-model="form.owner" placeholder="負責人姓名" />
          </el-form-item>
          <el-form-item label="電話">
            <el-input v-model="form.phone" placeholder="聯絡電話" />
          </el-form-item>
          <el-form-item label="Email">
            <el-input v-model="form.email" placeholder="聯絡信箱" />
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="form.address" placeholder="門市地址" />
          </el-form-item>

          <el-form-item label="介紹">
            <el-input
              v-model="form.intro"
              type="textarea"
              :rows="3"
              placeholder="品牌故事、主打品項"
            />
          </el-form-item>
        </el-card>
        <el-card class="card" shadow="never" v-show="segment === 'pay'">
          <div class="panel">
            <div class="panel__header">
              <span class="badge">02</span>
              <div>
                <p class="label">取貨與付款</p>
                <h3>支付、取貨與宅配</h3>
              </div>
            </div>
            <small class="hint">設定取貨方式與接受的付款方式</small>
          </div>

          <el-form-item label="取貨時間">
            <div class="flex">
              <el-time-select
                v-model="form.orderPickupTime"
                placeholder="開始"
                start="06:00"
                step="00:30"
                end="22:00"
                :filterable="false"
                style="width: 120px"
              />
              <span class="white-space-nowrap">後，開放取貨</span>
            </div>
          </el-form-item>
          <el-form-item label="付款方式" prop="paymentMethods">
            <el-checkbox-group v-model="form.paymentMethods">
              <el-space wrap>
                <el-checkbox
                  v-for="item in paymentOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  border
                />
              </el-space>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="取貨方式" prop="pickupMethods">
            <el-checkbox-group v-model="form.pickupMethods">
              <el-space wrap>
                <el-checkbox
                  v-for="item in pickupOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  border
                />
              </el-space>
            </el-checkbox-group>
          </el-form-item>

          <div
            v-if="form.pickupMethods.includes('delivery')"
            class="shipping-config"
          >
            <el-form-item label="運費">
              <el-input-number
                v-model="form.shipping.fee"
                :min="0"
                :max="500"
                :precision="0"
              />
              <span class="suffix">元</span>
            </el-form-item>
            <el-form-item label="免運門檻">
              <el-input-number
                v-model="form.shipping.freeThreshold"
                :min="0"
                :max="5000"
                :step="100"
                :precision="0"
              />
              <span class="suffix">元（設 0 = 不提供免運）</span>
            </el-form-item>
            <el-form-item label="備註">
              <el-input
                v-model="form.shipping.note"
                type="textarea"
                :rows="2"
                placeholder="運費說明、配送範圍等"
              />
            </el-form-item>
          </div>
        </el-card>
        <el-card class="card" shadow="never" v-show="segment === 'hours'">
          <div class="panel">
            <div class="panel__header">
              <span class="badge">03</span>
              <div>
                <p class="label">營業</p>
                <h3>營業時間</h3>
              </div>
            </div>
            <small class="hint">門市實際營業時間</small>
          </div>

          <div class="hours-head">
            <span>週一～週日</span>
            <el-space>
              <el-button size="small" text @click="toggleAllWeekday(true)"
                >全開</el-button
              >
              <el-button size="small" text @click="toggleAllWeekday(false)"
                >全關</el-button
              >
            </el-space>
          </div>
          <div class="hours">
            <div
              v-for="(row, idx) in businessHours"
              :key="row.day"
              class="hour-row"
            >
              <el-switch v-model="row.enabled" />
              <span class="day">週{{ row.day }}</span>
              <el-time-select
                v-model="row.time[0]"
                :disabled="!row.enabled"
                placeholder="開始"
                start="06:00"
                step="00:30"
                end="22:00"
                :filterable="false"
              />
              <el-time-select
                v-model="row.time[1]"
                :disabled="!row.enabled"
                placeholder="結束"
                start="06:00"
                step="00:30"
                end="22:00"
                :filterable="false"
              />
            </div>
          </div>
        </el-card>
        <el-card class="card" shadow="never" v-show="segment === 'pack'">
          <div class="panel">
            <div class="panel__header">
              <span class="badge">04</span>
              <div>
                <p class="label">包裝</p>
                <h3>包裝設定</h3>
              </div>
            </div>
            <small class="hint">是否提供包裝選項</small>
          </div>

          <el-form-item label="預設包裝">
            <el-input
              v-model="form.packaging.defaultPack"
              placeholder="紙袋/紙盒/裸裝"
            />
          </el-form-item>
          <el-form-item label="包裝費">
            <el-input-number
              v-model="form.packaging.packFee"
              :min="0"
              :max="50"
              :precision="0"
            />
            <span class="suffix">元/單</span>
          </el-form-item>
          <el-form-item label="環保折抵">
            <el-input-number
              v-model="form.packaging.ecoDiscount"
              :min="0"
              :max="50"
              :precision="0"
            />
            <span class="suffix">元/單</span>
          </el-form-item>
          <el-form-item label="備註">
            <el-input
              v-model="form.packaging.note"
              type="textarea"
              :rows="2"
              placeholder="自備餐具優惠、保冷袋租借等"
            />
          </el-form-item>
        </el-card>
      </div>
    </el-form>

    <el-card class="actions" shadow="never">
      <el-button @click="$router.go(-1)">取消</el-button>
      <el-button type="primary" @click="handleSave"> 儲存設定 </el-button>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
h2 {
  margin: 0;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.segmented {
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
  .el-segmented {
    padding: 0 8px;
    background-color: #fff;
    --el-segmented-item-selected-color: var(--el-text-color-primary);
    --el-segmented-item-selected-bg-color: #ffd100;
    --el-segmented-item-hover-bg-color: #f1e9e6;
    --el-segmented-item-active-bg-color: #e7d9d4;
    --el-border-radius-base: 8px;
  }
}

.el-card {
  border-radius: 8px;
}
.panel {
  margin-bottom: 16px;
  .panel__header {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 4px;
    .badge {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: #0f172a;
      color: white;
      font-weight: 700;
      font-size: 14px;
    }

    h3 {
      margin: 0;
      font-size: 18px;
      line-height: 20px;
      color: #0f172a;
      white-space: nowrap;
    }
    .label {
      margin: 0;
      font-size: 12px;
      color: #748096;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
  }
  .hint {
    color: var(--el-text-color-secondary);
    display: block;
    margin-bottom: 8px;
    margin-left: auto;
  }
}

.shipping-config {
  margin-top: 12px;
}

.card__subtitle {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  font-size: 14px;
}

.suffix {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.hours-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  color: var(--el-text-color-secondary);
}

.hours {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hour-row {
  display: grid;
  grid-template-columns: auto 48px 1fr 1fr;
  align-items: center;
  gap: 8px;
}

.day {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.actions {
  position: sticky;
  background-color: #fff;
  bottom: 0;
  gap: 12px;
}

@media (max-width: 640px) {
  .page {
    padding: 12px;
  }
}
</style>
