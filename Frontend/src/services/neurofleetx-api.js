import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Vehicles API
export const vehiclesAPI = {
  getAll: () => api.get("/vehicles"),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post("/vehicles", data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// Drivers API
export const driversAPI = {
  getAll: () => api.get("/drivers"),
  getById: (id) => api.get(`/drivers/${id}`),
  create: (data) => api.post("/drivers", data),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  delete: (id) => api.delete(`/drivers/${id}`),
};

// Telemetry API
export const telemetryAPI = {
  getAll: () => api.get("/telemetry"),
  getByVehicle: (vehicleId) => api.get(`/telemetry/vehicle/${vehicleId}`),
  create: (data) => api.post("/telemetry", data),
  delete: (id) => api.delete(`/telemetry/${id}`),
};

export default api;
