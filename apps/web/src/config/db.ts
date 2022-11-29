import axios, { AxiosInstance } from 'axios';

let axiosInstance: AxiosInstance;

const API_BASE = import.meta.env.VITE_API_URL;

function connectAxios() {
  if (!axiosInstance) {
    axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  return { axiosInstance };
}

export { API_BASE, connectAxios };
