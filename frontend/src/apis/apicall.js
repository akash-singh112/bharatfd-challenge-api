import axios from "axios";

export const call = async (details, type, route, params) => {
  try {
    if (type == "post") {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/${route}/${params || "en"}`,
        details
      );
      return response.data;
    } else if (type == "get") {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/${route}`,
        details
      );
      return response.data;
    } else if (type == "patch") {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/${route}`,
        details
      );
      return response.data;
    } else if (type == "delete") {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/${route}/${params}`,
        details
      );
      return response.data;
    }
  } catch (error) {
    console.log("Error while making API call", error.message);
  }
};
