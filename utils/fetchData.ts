import { ROOT_TREE_NAME } from "../src/TreeView";
import { axiosInstance } from "./axiosInstance";

export const fetchTreeData = async () => {
  try {
    const res = await axiosInstance.post(
      `/api.user.tree.get?treeName=${ROOT_TREE_NAME}`
    );
    return res;
  } catch (error: any) {
    alert(error.response.data.data.message);
  }
};
