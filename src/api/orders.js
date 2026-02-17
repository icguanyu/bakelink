import request from "./index";

export const Orders = {
  Create: (data) => {
    return request.post("/orders", data);
  },
  List: (data) => {
    return request.post("/orders/list", data);
  },
  GetById: (id) => {
    return request.get(`/orders/${id}`);
  },
  Update: (id, data) => {
    return request.put(`/orders/${id}`, data);
  },
  Delete: (id) => {
    return request.delete(`/orders/${id}`);
  },
};
