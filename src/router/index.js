import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "landing",
      component: () => import("../views/landing.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/home.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/register.vue"),
    },
    {
      path: "/terms",
      name: "terms",
      component: () => import("../views/terms.vue"),
    },
    {
      path: "/privacy",
      name: "privacy",
      component: () => import("../views/privacy.vue"),
    },
    {
      path: "/s/:slug",
      name: "store",
      component: () => import("../views/store/index.vue"),
    },
    {
      path: "/s/:slug/schedules",
      name: "store-schedules",
      component: () => import("../views/store/schedules.vue"),
    },
    {
      path: "/s/:slug/schedules/:date",
      name: "store-order",
      component: () => import("../views/store/order.vue"),
    },
    {
      path: "/s/:slug/orders",
      name: "store-order-lookup",
      component: () => import("../views/store/order-lookup.vue"),
    },
    {
      path: "/shop",
      name: "shop",
      meta: { requireAuth: true },
      component: () => import("../views/shop.vue"),
      children: [
        // {
        //   path: "",
        //   name: "shop-dashboard",
        //   component: () => import("../views/shop/index.vue"),
        // },
        {
          path: "",
          name: "shop-order",
          component: () => import("../views/shop/order.vue"),
        },
        {
          path: "products",
          name: "shop-products",
          component: () => import("../views/shop/products.vue"),
        },
        {
          path: "order",
          name: "shop-schedule",
          component: () => import("../views/shop/schedule.vue"),
        },
        {
          path: "settings",
          name: "shop-settings",
          component: () => import("../views/shop/settings.vue"),
        },
      ],
    },
  ],
  scrollBehavior() {
    if (typeof window !== "undefined") {
      const container = document.querySelector(".container");
      if (container) {
        container.scrollTop = 0;
      }
    }
    return { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("prelo-token");

  if (to.matched.some((m) => m.meta.requireAuth)) {
    // requireAuth = true = 需驗證
    if (!token) {
      ElMessage.error("請重新登入");
      next("/login");
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
