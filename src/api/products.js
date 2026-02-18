import request from "./index";

export const UploadFile = {
  Upload: (formData) => {
    return request.post("/UploadFile", formData);
  },
};
export const Products = {
  List: (data) => {
    return request.post("/products/list", data);
  },
  GetById: (id) => {
    return request.get(`/products/${id}`);
  },
  Create: (data) => {
    return request.post("/products", data);
  },
  Update: (id, data) => {
    return request.put(`/products/${id}`, data);
  },
  Delete: (id) => {
    return request.delete(`/products/${id}`);
  },
};

export const ProductCategory = {
  List: (data) => {
    return request.post("/product-categories/list", data);
  },
  GetById: (id) => {
    return request.get(`/product-categories/${id}`);
  },
  Create: (data) => {
    return request.post("/product-categories", data);
  },
  Update: (id, data) => {
    return request.put(`/product-categories/${id}`, data);
  },
  Delete: (id) => {
    return request.delete(`/product-categories/${id}`);
  },
};
