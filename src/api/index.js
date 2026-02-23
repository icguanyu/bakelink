import axios from "axios";
const token = localStorage.getItem("bakelink-token");

let isShowAlert = false; // 避免顯示太多次 ElMessageBox

if (token) {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
}
axios.defaults.baseURL = import.meta.env.VITE_APIURL;

axios.interceptors.response.use(
  (response) => {
    isShowAlert = false;
    return response;
  },
  (err) => {
    if (err && err.response) {
      switch (err.response.status) {
        case 400:
          ElMessage({
            message:
              err.response.data.message instanceof Blob
                ? "尚無資料"
                : err.response.data.message || "400 error",
            center: true,
            iconClass: "el-icon-circle-close",
            type: "error",
          });
          break;
        case 401:
          ElMessage({
            message:
              err.response.data.message || "授權失敗，請重新登入。(401）",
            center: true,
            iconClass: "el-icon-circle-close",
            type: "error",
          });
          break;
        case 403:
          ElMessage({
            message: err.response.data.message || "權限不足。（403）",
            center: true,
            iconClass: "el-icon-circle-close",
            type: "error",
          });
          break;
        case 404:
          ElMessage({
            message: err.response.data.message || "404",
            center: true,
            iconClass: "el-icon-circle-close",
            type: "error",
          });
          break;
        case 409:
          ElMessage({
            message: "資料重複，請重新輸入。",
            center: true,
            iconClass: "el-icon-circle-close",
            type: "warning",
          });

          break;
        case 500:
          ElMessage({
            message:
              err.response.data.message +
                "；若持續出現錯誤，請洽後端工程師。(500)" ||
              "Something went wrong.(500)",
            center: true,
            iconClass: "el-icon-circle-close",
            type: "error",
          });

          break;
        case 503:
          ElMessage({
            message:
              err.response.data.message +
                "；若持續出現錯誤，請洽後端工程師。" ||
              "503 Service Unavailable",
            center: true,
            iconClass: "el-icon-circle-close",
            type: "error",
          });
          break;
        default:
          console.log(`error ${err.response.status}`);
      }
    } else {
      if (!isShowAlert) {
        ElMessageBox.alert(
          "系統更新或維護中，若持續出現此訊息請先聯絡「網路管理員」或「後端工程師」",
          "CORS",
          {
            confirmButtonText: "了解",
            type: "warning",
          },
        );
      } else {
        isShowAlert = true;
      }
    }
    return Promise.reject(err);
  },
);

const request = {
  get(url, config) {
    return new Promise((resolve, reject) => {
      axios
        .get(url, config)
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  post(url, data = {}, config) {
    return new Promise((resolve, reject) => {
      axios
        .post(url, data, config)
        .then(
          (response) => {
            resolve(response);
          },
          (err) => {
            reject(err);
          },
        )
        .catch((err) => {
          reject(err);
        });
    });
  },
  delete(url, data = {}) {
    return new Promise((resolve, reject) => {
      axios.delete(url, { data }).then(
        (response) => {
          resolve(response);
        },
        (err) => {
          reject(err);
        },
      );
    });
  },
  put(url, data = {}) {
    return new Promise((resolve, reject) => {
      axios.put(url, data).then(
        (response) => {
          resolve(response);
        },
        (err) => {
          reject(err);
        },
      );
    });
  },
};

export default request;
