import request from "./index";

export const Shop = {
  // 取得店家公開資訊（店名、簡介、付款／取貨方式、營業時間等）
  GetInfo: (slug) => {
    return request.get(`/shop/${slug}`);
  },

  // 取得店家開放中行程列表（ANNOUNCED / OPEN）
  // params: { month: 'YYYY-MM' }（選填）
  GetSchedules: (slug, params) => {
    return request.get(`/shop/${slug}/schedules`, { params });
  },

  // 取得特定日期行程詳細與品項剩餘數量
  GetScheduleByDate: (slug, date) => {
    return request.get(`/shop/${slug}/schedules/${date}`);
  },

  // 消費者下單（行程必須為 OPEN 狀態）
  CreateOrder: (slug, data) => {
    return request.post(`/shop/${slug}/orders`, data);
  },

  // 消費者查詢單筆訂單（以電話驗證身份）
  GetOrder: (slug, orderNo, phone) => {
    return request.get(`/shop/${slug}/orders/${orderNo}`, { params: { phone } });
  },

  // 消費者查詢該電話的所有訂單（不限狀態，找不到回 { data: [] }）
  GetOrdersByPhone: (slug, phone) => {
    return request.get(`/shop/${slug}/orders`, { params: { phone } });
  },

  // 取得店家有上架商品的種類清單（只回傳至少有一個 is_active 商品的種類）
  GetCategories: (slug) => {
    return request.get(`/shop/${slug}/categories`);
  },

  // 取得店家上架商品清單（is_active = true）
  // params: { category_id: uuid }（選填）
  GetProducts: (slug, params) => {
    return request.get(`/shop/${slug}/products`, { params });
  },
};
