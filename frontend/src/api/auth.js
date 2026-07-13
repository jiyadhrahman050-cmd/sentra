import axios from "axios";

const BASE_URL = "https://sentra-1-lqhm.onrender.com";

export const login = async (data) => {
  console.log("Sending login data:", data);

  try {
    const response = await axios.post(`${BASE_URL}/login/`, data);

    console.log("Login response:", response.data);

    return response.data;
  } catch (error) {
    console.log("Login error:");
    console.log(error.response?.status);
    console.log(error.response?.data);
    throw error;
  }
};

export const register = async (data) => {
  const response = await axios.post(`${BASE_URL}/api/register/`, data);
  return response.data;
};

export const me = async () => {
  const token = localStorage.getItem("access");

  console.log("Access token:", token);

  const response = await axios.get(`${BASE_URL}/api/me/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};