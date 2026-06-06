<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const { loading } = storeToRefs(authStore);
const formRef = ref();

const form = reactive({
  email: "admin@bakelink.local",
  password: "Admin123!",
});

const rules = {
  email: [{ required: true, message: "請輸入帳號", trigger: "blur" }],
  password: [{ required: true, message: "請輸入密碼", trigger: "blur" }],
};

const handleLogin = async () => {
  if (loading.value) return;

  const valid = await formRef.value?.validate?.().catch(() => false);
  if (!valid) return;

  try {
    const res = await authStore.login({
      email: form.email,
      password: form.password,
    });
    console.log(res);
    ElMessage.success("登入成功");
    router.push("/shop");
  } catch (err) {
    console.log("catch", err);
  }
};
</script>

<template>
  <div class="login-page">
    <div class="login">
      <div class="login__card">
        <div class="login__brand"></div>
        <div class="login__title">登入</div>
        <div class="login__subtitle">請使用你的帳號與密碼</div>
        <el-form
          ref="formRef"
          class="login__form"
          label-position="top"
          :model="form"
          :rules="rules"
          @keyup.enter="handleLogin"
        >
          <el-form-item label="帳號" prop="email">
            <el-input
              v-model="form.email"
              placeholder="輸入帳號"
              autocomplete="username"
            />
          </el-form-item>
          <el-form-item label="密碼" prop="password">
            <el-input
              v-model="form.password"
              placeholder="輸入密碼"
              type="password"
              autocomplete="current-password"
              show-password
            />
          </el-form-item>
          <el-button
            class="login__submit"
            type="primary"
            size="large"
            :loading="loading"
            :disabled="loading"
            @click="handleLogin"
          >
            登入
          </el-button>
        </el-form>
      </div>
    </div>
    <FooterBar />
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  height: 100dvh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.login {
  flex: 1;
  display: grid;
  place-items: center;
  padding: 32px 16px;
  background:
    radial-gradient(
      circle at 15% 20%,
      rgba(255, 210, 150, 0.4),
      transparent 50%
    ),
    radial-gradient(
      circle at 85% 80%,
      rgba(200, 150, 90, 0.2),
      transparent 50%
    ),
    #f7f3ee;
}

.login__card {
  width: min(420px, 100%);
  background: #fff;
  border-radius: 20px;
  padding: 28px 28px 32px;
  box-shadow: 0 18px 45px rgba(40, 27, 18, 0.12);
}

.login__brand {
  display: flex;
  justify-content: center;
  margin: 0 auto;
  background-image: url("@/assets/images/logo.png");
  background-size: 140%;
  background-repeat: no-repeat;
  background-position: center;
  width: 80px;
  height: 80px;
}

.login__title {
  font-size: 22px;
  font-weight: 700;
  color: #2f2a25;
  text-align: center;
}

.login__subtitle {
  text-align: center;
  color: #7b6b5f;
  margin: 6px 0 20px;
}

.login__form {
  :deep(.el-form-item__label) {
    color: #5c4b3e;
    font-weight: 600;
  }
  :deep(.el-input__wrapper) {
    border-radius: 12px;
    background: #fdf8f2;
    box-shadow: 0 0 0 1px #e8ddd5;

    &:hover {
      box-shadow: 0 0 0 1px #c8a880;
    }
    &.is-focus {
      box-shadow: 0 0 0 2px #c08a50 !important;
    }
  }
  :deep(.el-input__inner) {
    color: #1a120b;
    &::placeholder {
      color: #c0b0a0;
    }
  }
}

.login__submit {
  width: 100%;
  margin-top: 8px;
  border-radius: 12px;
  background: #c08a50 !important;
  border-color: #c08a50 !important;
  box-shadow: 0 4px 14px rgba(192, 138, 80, 0.35);

  &:hover {
    background: #a87440 !important;
    border-color: #a87440 !important;
  }

  &:active {
    background: #8a5e30 !important;
    border-color: #8a5e30 !important;
  }
}

.login__ghost {
  width: 100%;
  margin-top: 10px;
  margin-left: 0;
  border-radius: 12px;
}

@media (max-width: 480px) {
  .login__card {
    padding: 24px 20px 28px;
  }

  .login__brand img {
    width: 110px;
    height: 110px;
  }
}
</style>
