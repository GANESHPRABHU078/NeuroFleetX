import axios from "axios";
import baseUrl from "./api-backend-switch";

// Create axios instance with default config
const api = axios.create({
  baseURL: (baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl) + "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // NeuroFleetX authentication endpoints
  fleetLogin: (credentials) =>
    api.post("/auth/fleet-manager/login", credentials),
  fleetSignup: (data) => api.post("/auth/fleet-manager/signup", data),
  driverLogin: (credentials) => api.post("/auth/driver/login", credentials),
  driverSignup: (data) => api.post("/auth/driver/signup", data),
  getAllFleetManagers: () => api.get("/auth/fleet-managers"),
  getAllDrivers: () => api.get("/auth/drivers"),
  changePassword: (data) => api.post("/auth/change-password", data),
};

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
  updateLocation: (id, locationData) =>
    api.post(`/drivers/${id}/update-location`, locationData),
  getLiveTracking: () => api.get("/drivers/live-tracking"),
  toggleGps: (id, gpsEnabled) =>
    api.post(`/drivers/${id}/toggle-gps`, { gpsEnabled }),
};

// Telemetry API
export const telemetryAPI = {
  getAll: () => api.get("/telemetry"),
  getById: (id) => api.get(`/telemetry/${id}`),
  create: (data) => api.post("/telemetry", data),
  update: (id, data) => api.put(`/telemetry/${id}`, data),
  delete: (id) => api.delete(`/telemetry/${id}`),
  getByDriver: (driverId) => api.get(`/telemetry/driver/${driverId}`),
  getByVehicle: (vehicleId) => api.get(`/telemetry/vehicle/${vehicleId}`),
  getByDate: (date) => api.get(`/telemetry/date/${date}`),
  updateLocation: (locationData) =>
    api.post("/telemetry/update-location", locationData),
};

// Fleet Managers API
export const fleetManagersAPI = {
  getProfile: () => api.get("/fleet-managers/profile"),
  updateProfile: (data) => api.put("/fleet-managers/profile", data),
  getVehicles: (managerId) => api.get(`/fleet-managers/${managerId}/vehicles`),
  getDrivers: (managerId) => api.get(`/fleet-managers/${managerId}/drivers`),
};

// Routes API
export const routesAPI = {
  getAll: () => api.get("/routes"),
  getById: (id) => api.get(`/routes/${id}`),
  create: (data) => api.post("/routes", data),
  update: (id, data) => api.put(`/routes/${id}`, data),
  delete: (id) => api.delete(`/routes/${id}`),
  assignToDriver: (routeId, driverId) =>
    api.post(`/routes/${routeId}/assign/${driverId}`),
  startTrip: (routeId) => api.post(`/routes/${routeId}/start`),
  endTrip: (routeId) => api.post(`/routes/${routeId}/end`),
  getByDriver: (driverId) => api.get(`/routes/driver/${driverId}`),
  getCurrentRouteForDriver: (driverId) =>
    api.get(`/routes/driver/${driverId}/current`),
};

// Notifications API
export const notificationsAPI = {
  getPreferences: (userId) => api.get(`/notifications/preferences/${userId}`),
  savePreferences: (data) => api.post("/notifications/preferences", data),
  sendTest: (userId, data) => api.post(`/notifications/test/${userId}`, data),
};

// Bookings API
export const bookingsAPI = {
  getAll: () => api.get("/bookings"),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post("/bookings", data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
  getByUser: (userId) => api.get(`/bookings/user/${userId}`),
  getByVehicle: (vehicleId) => api.get(`/bookings/vehicle/${vehicleId}`),
  getByStatus: (status) => api.get(`/bookings/status/${status}`),
  getByDriver: (driverId) => api.get(`/bookings/driver/${driverId}`),
  getUpcoming: (userId) => api.get(`/bookings/user/${userId}/upcoming`),
  checkAvailability: (data) => api.post("/bookings/check-availability", data),
  confirm: (id) => api.put(`/bookings/${id}/confirm`),
  start: (id) => api.put(`/bookings/${id}/start`),
  complete: (id) => api.put(`/bookings/${id}/complete`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  assignDriver: (id, data) => api.put(`/bookings/${id}/assign-driver`, data),
};

// Customers API
export const customersAPI = {
  getAll: () => api.get("/customers"),
  getById: (id) => api.get(`/customers/${id}`),
  signup: (data) => api.post("/customers/signup", data),
  login: (credentials) => api.post("/customers/login", credentials),
  update: (id, data) => api.put(`/customers/${id}`, data),
  changePassword: (id, data) =>
    api.put(`/customers/${id}/change-password`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  getByStatus: (status) => api.get(`/customers/status/${status}`),
  suspend: (id) => api.put(`/customers/${id}/suspend`),
  activate: (id) => api.put(`/customers/${id}/activate`),
};

export default api;
