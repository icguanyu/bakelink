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

  // 消費者查詢訂單（以電話驗證身份）
  GetOrder: (slug, orderNo, phone) => {
    return request.get(`/shop/${slug}/orders/${orderNo}`, { params: { phone } });
  },
};
