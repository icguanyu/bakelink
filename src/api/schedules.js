import request from "./index";

export const Schedules = {
  Create: (data) => {
    return request.post("/schedules", data);
  },
  List: (data) => {
    return request.post("/schedules/list", data);
  },
  GetByDate: (date) => {
    return request.get(`/schedules/${date}`);
  },
  GetByMonth: (month) => {
    return request.get(`/schedules/month/${month}`);
  },
  Update: (id, data) => {
    return request.put(`/schedules/${id}`, data);
  },
  Delete: (id) => {
    return request.delete(`/schedules/${id}`);
  },
};
