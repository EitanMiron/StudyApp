import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api";

export const fetchGroups = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/groups`);
    return response.data;
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw error;
  }
};
