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
    <el-form label-width="100px" label-position="left">
      <div class="flex flex-col gap-2">
        <el-card class="card" shadow="hover">
          <div class="card__title">商店設定</div>
          <small class="hint">請填寫商家基本資料，使用者可於前台查看</small>

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
        <el-card class="card" shadow="hover">
          <div class="card__title">取貨與付款</div>
          <small class="hint">設定取貨方式與接受的付款方式</small>
          <el-form-item label="取貨時間">
            <div class="flex">
              <el-time-select
                v-model="form.orderPickupTime"
                placeholder="開始"
                start="06:00"
                step="00:30"
                end="22:00"
                inputmode="numeric"
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
                  :label="item.value"
                  border
                >
                  {{ item.label }}
                </el-checkbox>
              </el-space>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="取貨方式" prop="pickupMethods">
            <el-checkbox-group v-model="form.pickupMethods">
              <el-space wrap>
                <el-checkbox
                  v-for="item in pickupOptions"
                  :key="item.value"
                  :label="item.value"
                  border
                >
                  {{ item.label }}
                </el-checkbox>
              </el-space>
            </el-checkbox-group>
          </el-form-item>

          <div
            v-if="form.pickupMethods.includes('delivery')"
            class="shipping-config"
          >
            <el-form label-width="100px" label-position="left" size="default">
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
            </el-form>
          </div>
        </el-card>
        <el-card class="card" shadow="hover">
          <div class="card__title">營業時間</div>
          <small class="hint">門市實際營業時間</small>
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
              />
              <el-time-select
                v-model="row.time[1]"
                :disabled="!row.enabled"
                placeholder="結束"
                start="06:00"
                step="00:30"
                end="22:00"
              />
            </div>
          </div>
        </el-card>
        <el-card class="card" shadow="hover">
          <div class="card__title">包裝設定</div>
          <small class="hint">是否提供包裝選項</small>
          <el-form label-width="90px" label-position="left">
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
          </el-form>
        </el-card>
      </div>
    </el-form>

    <div class="actions">
      <el-button size="large" @click="$router.go(-1)">取消</el-button>
      <el-button type="primary" size="large" @click="handleSave">
        儲存設定
      </el-button>
    </div>
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

.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.hint {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  display: block;
  margin-bottom: 8px;
}

.uploader {
  width: 180px;
  height: 180px;
  border: 1px dashed #ddd;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  background: #fafafa;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    color: #999;
    font-size: 13px;
    text-align: center;
    padding: 8px;
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
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
