import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/home.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/home.vue"),
    },
    {
      path: "/shop",
      name: "shop",
      component: () => import("../views/shop.vue"),
      children: [
        {
          path: "",
          name: "shop-dashboard",
          component: () => import("../views/shop/index.vue"),
        },
        {
          path: "products",
          name: "shop-products",
          component: () => import("../views/shop/products.vue"),
        },
        {
          path: "order",
          name: "shop-order",
          component: () => import("../views/shop/order.vue"),
          children: [
            {
              path: "",
              name: "shop-order-list",
              component: () => import("../views/shop/order/index.vue"),
            },
            {
              path: ":id",
              name: "shop-order-details",
              component: () => import("../views/shop/order/[id].vue"),
            },
          ],
        },
        {
          path: "schedule",
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
});

export default router;
