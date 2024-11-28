import axios from "axios";

const BASE_URL = "https://test.vmarmysh.com";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
});
