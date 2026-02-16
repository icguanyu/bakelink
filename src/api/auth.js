import request from "./index";

export const Auth = {
  Login: (data) => {
    return request.post("/auth/login", data);
  },
  Me: () => {
    return request.get("/auth/me");
  },
};
