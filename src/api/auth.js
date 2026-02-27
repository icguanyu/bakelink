import request from "./index";

export const Auth = {
  Login: (data) => {
    return request.post("/auth/login", data);
  },
  Me: () => {
    return request.get("/auth/me");
  },
};

export const Users = {
  Me: () => {
    return request.get("/users/me");
  },
  Put: (data) => {
    return request.put("/users/me", data);
  },
  UploadAvatar: (formData) => {
    return request.post("/UploadAvatar", formData);
  },
};
