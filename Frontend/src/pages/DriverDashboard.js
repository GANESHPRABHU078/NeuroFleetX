import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LocationTracker from "../components/LocationTracker";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import Map from "../components/Map";
import { CardSpotlight } from "../components/ui/CardEffects";
import { motion } from "framer-motion";
import {
  vehiclesAPI,
  routesAPI,
  bookingsAPI,
  driversAPI,
} from "../services/api";

const DriverDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [driverInfo, setDriverInfo] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [tripStatus, setTripStatus] = useState("idle"); // idle, active, break
  const [tripStartTime, setTripStartTime] = useState(null);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [assignedRoutes, setAssignedRoutes] = useState([]);
  const [assignedBookings, setAssignedBookings] = useState([]);

  const fetchRoutes = useCallback(async () => {
    if (!driverInfo?.id) return;
    try {
      // Try multiple approaches to fetch routes
      let routes = [];

      // Method 1: Try the driver-specific endpoint
      try {
        const response = await routesAPI.getByDriver(driverInfo.id);
        console.log("Routes API response:", response);
        routes = response.data?.data || response.data || [];
        console.log("Parsed routes:", routes);
      } catch (driverError) {
        console.warn("Driver-specific route fetch failed:", driverError);

        // Method 2: Fallback to get all routes and filter client-side
        try {
          const allRoutesResponse = await routesAPI.getAll();
          console.log("All routes response:", allRoutesResponse);
          const allRoutes =
            allRoutesResponse.data?.data || allRoutesResponse.data || [];
          routes = allRoutes.filter(
            (route) => route.driverId === driverInfo.id
          );
          console.log("Filtered routes for driver:", routes);
        } catch (allRoutesError) {
          console.error("Failed to fetch all routes:", allRoutesError);
        }
      }

      setAssignedRoutes(routes);

      // Check for current active route or next route to start
      try {
        // First check for in_progress route
        let activeRoute = routes.find(
          (route) => route.status === "in_progress"
        );

        if (activeRoute) {
          setCurrentRoute(activeRoute);
          setTripStatus("active");
        } else {
          // If no in_progress route, check for assigned route (next to start)
          const assignedRoute = routes.find(
            (route) => route.status === "assigned"
          );
          if (assignedRoute) {
            setCurrentRoute(assignedRoute);
            setTripStatus("idle");
          } else {
            setCurrentRoute(null);
            setTripStatus("idle");
          }
        }
      } catch (currentRouteError) {
        console.warn("Error setting current route:", currentRouteError);
        setCurrentRoute(null);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      setAssignedRoutes([]);
      setCurrentRoute(null);
    }
  }, [driverInfo]);

  const fetchBookings = useCallback(async () => {
    if (!driverInfo?.id) return;
    try {
      // Try multiple approaches to fetch bookings
      let bookings = [];

      // Method 1: Try the driver-specific endpoint
      try {
        const response = await bookingsAPI.getByDriver(driverInfo.id);
        console.log("Bookings API response:", response);
        bookings = response.data?.data || response.data || [];
        console.log("Parsed bookings:", bookings);
      } catch (driverError) {
        console.warn("Driver-specific booking fetch failed:", driverError);

        // Method 2: Fallback to get all bookings and filter client-side
        try {
          const allBookingsResponse = await bookingsAPI.getAll();
          console.log("All bookings response:", allBookingsResponse);
          const allBookings =
            allBookingsResponse.data?.data || allBookingsResponse.data || [];
          bookings = allBookings.filter(
            (booking) => booking.assignedDriverId === driverInfo.id
          );
          console.log("Filtered bookings for driver:", bookings);
        } catch (allBookingsError) {
          console.error("Failed to fetch all bookings:", allBookingsError);
        }
      }

      setAssignedBookings(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setAssignedBookings([]);
    }
  }, [driverInfo]);

  useEffect(() => {
    // Get driver information from localStorage or API
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setDriverInfo(userData);
        // Load selected vehicle from localStorage
        const savedVehicle = localStorage.getItem("selectedVehicle");
        if (savedVehicle) {
          setSelectedVehicle(JSON.parse(savedVehicle));
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    // Fetch available vehicles
    fetchVehicles();
  }, []);

  // Fetch routes when driver info changes
  useEffect(() => {
    if (driverInfo?.id) {
      fetchRoutes();
      fetchBookings();
    }
  }, [driverInfo?.id, fetchRoutes, fetchBookings]);

  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const response = await vehiclesAPI.getAll();
      console.log("Vehicles response:", response);
      // Backend returns { success: true, data: [...vehicles] }
      const vehiclesList = response.data?.data || response.data || [];
      console.log("Vehicles list:", vehiclesList);
      setVehicles(vehiclesList);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]); // Set empty array on error
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    localStorage.setItem("selectedVehicle", JSON.stringify(vehicle));
    setShowVehicleSelector(false);
  };

  const handleStartTrip = async () => {
    if (!selectedVehicle) {
      alert("Please select a vehicle first!");
      setShowVehicleSelector(true);
      return;
    }

    if (!currentRoute) {
      alert("No route assigned. Please contact your fleet manager.");
      return;
    }

    if (
      currentRoute.status !== "assigned" &&
      currentRoute.status !== "in_progress"
    ) {
      alert(`Cannot start trip. Route status is: ${currentRoute.status}`);
      return;
    }

    try {
      await routesAPI.startTrip(currentRoute.id);
      setTripStatus("active");
      setTripStartTime(new Date());
      setTrackingEnabled(true);
      // Refresh routes to get updated status
      fetchRoutes();
      alert("Trip started successfully!");
    } catch (error) {
      console.error("Error starting trip:", error);
      alert("Failed to start trip. Please try again.");
    }
  };

  const handleEndTrip = async () => {
    if (!currentRoute) {
      alert("No active route to end.");
      return;
    }

    try {
      await routesAPI.endTrip(currentRoute.id);
      setTripStatus("idle");
      setTripStartTime(null);
      setTrackingEnabled(false);
      setCurrentRoute(null);
      // Refresh routes to get updated status
      fetchRoutes();
    } catch (error) {
      console.error("Error ending trip:", error);
      alert("Failed to end trip. Please try again.");
    }
  };

  const handleTakeBreak = () => {
    setTripStatus("break");
  };

  const handleResumeTrip = () => {
    setTripStatus("active");
  };

  const handleLogout = () => {
    logout();
    navigate("/driver-login");
  };

  const getTripDuration = () => {
    if (!tripStartTime) return "0h 0m";
    const now = new Date();
    const diff = now - tripStartTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="landing-page bg-slate-950 min-h-screen">
      <Particles />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text mb-2">
              Driver Dashboard
            </h1>
            <p className="text-slate-400">
              Welcome, {currentUser?.username || driverInfo?.name || "Driver"}!
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg transition-all flex items-center gap-2"
          >
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </motion.header>

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            Quick Access
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/driver-profile")}
              className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 hover:from-blue-600/30 hover:to-blue-800/30 border border-blue-500/30 rounded-lg p-4 transition-all group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                👤
              </div>
              <div className="text-white font-semibold">Profile</div>
              <div className="text-slate-400 text-xs">Manage account</div>
            </button>

            <button
              onClick={() => navigate("/driver-routes")}
              className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 hover:from-orange-600/30 hover:to-orange-800/30 border border-orange-500/30 rounded-lg p-4 transition-all group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                🗺️
              </div>
              <div className="text-white font-semibold">Routes</div>
              <div className="text-slate-400 text-xs">View all routes</div>
            </button>

            <button
              onClick={() => navigate("/driver-telemetry")}
              className="bg-gradient-to-br from-green-600/20 to-green-800/20 hover:from-green-600/30 hover:to-green-800/30 border border-green-500/30 rounded-lg p-4 transition-all group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                📍
              </div>
              <div className="text-white font-semibold">Telemetry</div>
              <div className="text-slate-400 text-xs">Live tracking</div>
            </button>

            <button
              onClick={() => navigate("/driver-notifications")}
              className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 hover:from-purple-600/30 hover:to-purple-800/30 border border-purple-500/30 rounded-lg p-4 transition-all group relative"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                🔔
              </div>
              <div className="text-white font-semibold">Notifications</div>
              <div className="text-slate-400 text-xs">Alerts & updates</div>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* GPS Tracking Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CardSpotlight className="h-full">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">📍</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      GPS Tracking
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Real-time location sharing
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trackingEnabled}
                      onChange={async (e) => {
                        const enabled = e.target.checked;
                        setTrackingEnabled(enabled);
                        // Update GPS status on backend
                        if (driverInfo?.id) {
                          try {
                            await driversAPI.toggleGps(driverInfo.id, enabled);
                            console.log(
                              `GPS ${
                                enabled ? "enabled" : "disabled"
                              } on backend`
                            );
                          } catch (error) {
                            console.error(
                              "Failed to update GPS status:",
                              error
                            );
                          }
                        }
                      }}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <span className="text-slate-300">
                      {trackingEnabled
                        ? "Tracking Enabled"
                        : "Enable GPS Tracking"}
                    </span>
                  </label>
                </div>

                <div className="text-sm text-slate-400 space-y-2">
                  <p>✓ Auto-updates every 30 seconds</p>
                  <p>✓ High accuracy GPS</p>
                  <p>✓ Speed monitoring</p>
                  <p>✓ Fleet manager can see your location</p>
                </div>
              </div>
            </CardSpotlight>
          </motion.div>

          {/* Vehicle Selection Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardSpotlight className="h-full">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">�</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Vehicle Selection
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Choose your vehicle
                    </p>
                  </div>
                </div>

                {selectedVehicle ? (
                  <div className="space-y-3">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <div className="text-sm text-slate-400">
                        Selected Vehicle
                      </div>
                      <div className="text-lg font-bold text-white">
                        {selectedVehicle.model}
                      </div>
                      <div className="text-sm text-slate-300">
                        VIN: {selectedVehicle.vin}
                      </div>
                      <div className="text-sm mt-1">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            selectedVehicle.status === "available"
                              ? "bg-green-600"
                              : selectedVehicle.status === "in_use"
                              ? "bg-blue-600"
                              : "bg-gray-600"
                          }`}
                        >
                          {selectedVehicle.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        fetchVehicles(); // Refresh vehicles list
                        setShowVehicleSelector(true);
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all"
                    >
                      Change Vehicle
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center py-4 text-slate-400 text-sm">
                      No vehicle selected
                    </div>
                    <button
                      onClick={() => {
                        fetchVehicles(); // Refresh vehicles list
                        setShowVehicleSelector(true);
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-lg transition-all"
                    >
                      Select a Vehicle
                    </button>
                  </div>
                )}
              </div>
            </CardSpotlight>
          </motion.div>

          {/* Trip Control Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CardSpotlight className="h-full">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">⚡</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Trip Control
                    </h3>
                    <p className="text-slate-400 text-sm">Manage your trip</p>
                  </div>
                </div>

                <div className="mb-4 bg-slate-800/50 p-3 rounded-lg">
                  <div className="flex justify-between text-slate-300 text-sm">
                    <span>Status:</span>
                    <span
                      className={`font-semibold ${
                        tripStatus === "active"
                          ? "text-green-400"
                          : tripStatus === "break"
                          ? "text-orange-400"
                          : "text-slate-400"
                      }`}
                    >
                      {tripStatus === "active"
                        ? "🚦 Active"
                        : tripStatus === "break"
                        ? "☕ On Break"
                        : "⏸️ Idle"}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300 text-sm mt-2">
                    <span>Duration:</span>
                    <span className="font-semibold">{getTripDuration()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {tripStatus === "idle" && (
                    <button
                      onClick={handleStartTrip}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-3 rounded-lg transition-all font-semibold"
                    >
                      🚦 Start Trip
                    </button>
                  )}

                  {tripStatus === "active" && (
                    <>
                      <button
                        onClick={handleTakeBreak}
                        className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-4 py-3 rounded-lg transition-all font-semibold"
                      >
                        ☕ Take Break
                      </button>
                      <button
                        onClick={handleEndTrip}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-lg transition-all font-semibold"
                      >
                        🛑 End Trip
                      </button>
                    </>
                  )}

                  {tripStatus === "break" && (
                    <>
                      <button
                        onClick={handleResumeTrip}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg transition-all font-semibold"
                      >
                        ▶️ Resume Trip
                      </button>
                      <button
                        onClick={handleEndTrip}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-lg transition-all font-semibold"
                      >
                        🛑 End Trip
                      </button>
                    </>
                  )}
                </div>
              </div>
            </CardSpotlight>
          </motion.div>

          {/* Routes Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CardSpotlight className="h-full">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <i className="fas fa-route text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Assigned Routes
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Your current and assigned routes
                    </p>
                  </div>
                </div>

                {currentRoute ? (
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-orange-500/30 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <i
                        className={`fas ${
                          currentRoute.status === "in_progress"
                            ? "fa-play-circle text-green-400"
                            : "fa-clock text-yellow-400"
                        }`}
                      ></i>
                      <span className="text-white font-semibold">
                        {currentRoute.status === "in_progress"
                          ? "Active Route"
                          : "Next Route"}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">
                      {currentRoute.startLocationName || "Start"} →{" "}
                      {currentRoute.endLocationName || "End"}
                    </p>
                    <div className="flex justify-between text-slate-400 text-xs">
                      <span>
                        Status:{" "}
                        <span
                          className={
                            currentRoute.status === "in_progress"
                              ? "text-green-400"
                              : "text-yellow-400"
                          }
                        >
                          {currentRoute.status === "assigned"
                            ? "Ready to Start"
                            : currentRoute.status}
                        </span>
                      </span>
                      <span>
                        Distance:{" "}
                        {currentRoute.distance
                          ? `${currentRoute.distance} km`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-4">
                    <div className="text-center text-slate-400">
                      <i className="fas fa-route text-2xl mb-2"></i>
                      <p className="text-sm">No active route</p>
                    </div>
                  </div>
                )}

                {assignedRoutes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-white font-semibold text-sm">
                      All Assigned Routes
                    </h4>
                    {assignedRoutes.slice(0, 3).map((route) => (
                      <div
                        key={route.id}
                        className="bg-slate-800/30 p-3 rounded border border-slate-700"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 text-sm">
                            Route #{route.id?.slice(-6)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              route.status === "assigned"
                                ? "bg-yellow-600"
                                : route.status === "in_progress"
                                ? "bg-green-600"
                                : route.status === "completed"
                                ? "bg-blue-600"
                                : "bg-gray-600"
                            }`}
                          >
                            {route.status === "assigned"
                              ? "Pending"
                              : route.status === "in_progress"
                              ? "Active"
                              : route.status === "completed"
                              ? "Completed"
                              : route.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-1">
                          {route.startLocationName || "Start Location"} →{" "}
                          {route.endLocationName || "End Location"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardSpotlight>
          </motion.div>

          {/* Assigned Bookings Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <CardSpotlight>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <i className="fas fa-calendar-check text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Assigned Bookings
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Customer bookings assigned to you
                    </p>
                  </div>
                </div>

                {assignedBookings.length === 0 ? (
                  <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 text-center">
                    <i className="fas fa-inbox text-slate-400 text-3xl mb-2"></i>
                    <p className="text-slate-400 text-sm">
                      No bookings assigned yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignedBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-slate-800/50 p-4 rounded-lg border border-slate-700"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-white font-semibold">
                              {booking.userName}
                            </h4>
                            <p className="text-slate-400 text-sm">
                              {booking.vehicleName} (
                              {booking.vehicleRegistration})
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              booking.status === "confirmed"
                                ? "bg-blue-600"
                                : booking.status === "active"
                                ? "bg-green-600"
                                : booking.status === "completed"
                                ? "bg-gray-600"
                                : "bg-yellow-600"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 mb-3">
                          <div className="bg-slate-700/50 p-2 rounded">
                            <p className="text-xs text-slate-400">📍 Pickup</p>
                            <p className="text-white text-sm font-medium">
                              {booking.pickupLocation || "Not specified"}
                            </p>
                          </div>
                          <div className="bg-slate-700/50 p-2 rounded">
                            <p className="text-xs text-slate-400">
                              🎯 Destination
                            </p>
                            <p className="text-white text-sm font-medium">
                              {booking.dropoffLocation || "Not specified"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-slate-400">Start</p>
                            <p className="text-white">
                              {new Date(booking.startDate).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400">End</p>
                            <p className="text-white">
                              {new Date(booking.endDate).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {booking.purpose && (
                          <div className="mt-2 pt-2 border-t border-slate-700">
                            <p className="text-xs text-slate-400">Purpose</p>
                            <p className="text-white text-sm">
                              {booking.purpose}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardSpotlight>
          </motion.div>
        </div>

        {/* Vehicle Health Monitor - Module 4 (Driver View) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8"
        >
          <CardSpotlight className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <i className="fas fa-heartbeat text-white text-xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  My Vehicle Health Monitor
                </h2>
                <p className="text-slate-400 text-sm">
                  Real-time health status of your assigned vehicle
                </p>
              </div>
            </div>

            {selectedVehicle ? (
              <>
                {/* Vehicle Health Score */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-green-700/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">
                        Overall Health
                      </span>
                      <i className="fas fa-heart text-green-400"></i>
                    </div>
                    <div className="text-3xl font-bold text-green-400">
                      91%
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Excellent</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-700/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">
                        Engine Status
                      </span>
                      <i className="fas fa-cog text-blue-400"></i>
                    </div>
                    <div className="text-2xl font-bold text-blue-400">Good</div>
                    <div className="text-xs text-slate-500 mt-1">
                      No issues detected
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 border border-yellow-700/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">
                        Fuel Level
                      </span>
                      <i className="fas fa-gas-pump text-yellow-400"></i>
                    </div>
                    <div className="text-3xl font-bold text-yellow-400">
                      {Math.floor(50 + 35)}%
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      ~{Math.floor(200 + 120)} km range
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-700/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">
                        Tire Pressure
                      </span>
                      <i className="fas fa-circle text-purple-400"></i>
                    </div>
                    <div className="text-2xl font-bold text-purple-400">
                      Normal
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      All 4 tires OK
                    </div>
                  </div>
                </div>

                {/* Maintenance Alerts */}
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 mb-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <i className="fas fa-bell text-orange-400"></i>
                    Maintenance Alerts
                  </h3>
                  
                  {true ? (
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-exclamation-triangle text-yellow-400 text-sm"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">
                            Oil Change Recommended
                          </p>
                          <p className="text-slate-400 text-xs mt-1">
                            Due in {Math.floor(5 + 8)} days or{" "}
                            {Math.floor(500 + 850)} km
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-info-circle text-blue-400 text-sm"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">
                            Tire Rotation Scheduled
                          </p>
                          <p className="text-slate-400 text-xs mt-1">
                            Scheduled for next maintenance cycle
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-500">
                      <i className="fas fa-check-circle text-green-400 text-2xl mb-2"></i>
                      <p className="text-sm">
                        No maintenance alerts - Vehicle is in great shape!
                      </p>
                    </div>
                  )}
                </div>

                {/* Performance Metrics */}
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <i className="fas fa-tachometer-alt text-cyan-400"></i>
                    Performance Metrics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-slate-400 text-xs mb-1">
                        Avg Speed
                      </div>
                      <div className="text-xl font-bold text-cyan-400">
                        {Math.floor(40 + 15)} km/h
                      </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-slate-400 text-xs mb-1">
                        Fuel Efficiency
                      </div>
                      <div className="text-xl font-bold text-green-400">
                        {(12 + 3.8).toFixed(1)} km/L
                      </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-slate-400 text-xs mb-1">
                        Distance Today
                      </div>
                      <div className="text-xl font-bold text-blue-400">
                        {Math.floor(50 + 95)} km
                      </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-slate-400 text-xs mb-1">
                        Idle Time
                      </div>
                      <div className="text-xl font-bold text-orange-400">
                        {Math.floor(10 + 22)} min
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="mt-4 bg-slate-800/20 rounded-lg p-4 border border-slate-700/30">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <i className="fas fa-car text-purple-400"></i>
                    Vehicle Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-400">Model:</span>
                      <span className="text-white ml-2">
                        {selectedVehicle.model}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Registration:</span>
                      <span className="text-white ml-2">
                        {selectedVehicle.registrationNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Type:</span>
                      <span className="text-white ml-2 capitalize">
                        {selectedVehicle.type}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Status:</span>
                      <span className="text-green-400 ml-2 capitalize">
                        {selectedVehicle.status}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-car text-slate-600 text-5xl mb-4"></i>
                <p className="text-slate-400 mb-4">
                  No vehicle assigned yet. Please select a vehicle to see health
                  monitoring details.
                </p>
                <button
                  onClick={() => setShowVehicleSelector(true)}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Select Vehicle
                </button>
              </div>
            )}
          </CardSpotlight>
        </motion.section>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <CardSpotlight>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                📱 How GPS Tracking Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-300">
                <div>
                  <div className="text-3xl mb-2">1️⃣</div>
                  <h4 className="font-semibold text-white mb-2">
                    Enable Tracking
                  </h4>
                  <p className="text-sm text-slate-400">
                    Turn on GPS tracking to start sharing your location with the
                    fleet manager.
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">2️⃣</div>
                  <h4 className="font-semibold text-white mb-2">
                    Auto Updates
                  </h4>
                  <p className="text-sm text-slate-400">
                    Your location is automatically sent every 30 seconds while
                    tracking is enabled.
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">3️⃣</div>
                  <h4 className="font-semibold text-white mb-2">
                    Real-time Monitoring
                  </h4>
                  <p className="text-sm text-slate-400">
                    Fleet managers can see your position, speed, and route on
                    their dashboard map.
                  </p>
                </div>
              </div>
            </div>
          </CardSpotlight>
        </motion.div>
      </div>

      {/* Route Map Section */}
      {currentRoute && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <CardSpotlight>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <i className="fas fa-map-marked-alt text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Route Navigation
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Follow your assigned route with real-time navigation
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold">Current Route</h4>
                    <p className="text-slate-300 text-sm">
                      {currentRoute.startLocation?.address} →{" "}
                      {currentRoute.endLocation?.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 text-sm">Status</div>
                    <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                      {currentRoute.status}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-slate-300 text-sm">
                  <span>Distance: {currentRoute.distance} km</span>
                  <span>Duration: {currentRoute.duration} min</span>
                </div>
              </div>

              <div className="h-96 rounded-lg overflow-hidden border border-slate-700">
                <Map
                  center={[
                    currentRoute.startLocation?.latitude || 0,
                    currentRoute.startLocation?.longitude || 0,
                  ]}
                  zoom={13}
                  route={currentRoute}
                  showRoute={true}
                  className="w-full h-full"
                />
              </div>

              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-sm">
                <i className="fas fa-info-circle mr-2"></i>
                Blue line shows your navigation route. Follow the path to reach
                your destination.
              </div>
            </div>
          </CardSpotlight>
        </motion.div>
      )}

      {/* Vehicle Selector Modal */}
      {showVehicleSelector && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-slate-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Select a Vehicle
              </h2>
              <button
                onClick={() => setShowVehicleSelector(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadingVehicles ? (
                <div className="col-span-2 text-center py-8">
                  <div className="text-4xl mb-3">🔄</div>
                  <div className="text-slate-400">Loading vehicles...</div>
                </div>
              ) : vehicles.length > 0 ? (
                vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id || vehicle._id}
                    onClick={() => handleVehicleSelect(vehicle)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedVehicle?.id === vehicle.id ||
                      selectedVehicle?._id === vehicle._id
                        ? "border-purple-500 bg-purple-900/20"
                        : "border-slate-700 hover:border-slate-500 bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">🚗</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">
                          {vehicle.model || "Unknown Model"}
                        </h3>
                        <p className="text-sm text-slate-400">
                          VIN: {vehicle.vin || "N/A"}
                        </p>
                        <div className="mt-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              vehicle.status === "available"
                                ? "bg-green-600 text-white"
                                : vehicle.status === "in_use"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-600 text-white"
                            }`}
                          >
                            {vehicle.status || "unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-slate-400">
                  <div className="text-4xl mb-3">🚫</div>
                  <div className="text-lg mb-2">No vehicles available</div>
                  <div className="text-sm">
                    Please contact your fleet manager to add vehicles.
                  </div>
                  <button
                    onClick={fetchVehicles}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    🔄 Refresh
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Location Tracker Component */}
      {trackingEnabled && driverInfo && (
        <LocationTracker
          driverId={driverInfo.id || driverInfo._id || "demo-driver"}
          vehicleId={selectedVehicle?.id || selectedVehicle?._id || null}
          updateInterval={30000} // 30 seconds
          enabled={trackingEnabled}
        />
      )}
    </div>
  );
};

export default DriverDashboard;
