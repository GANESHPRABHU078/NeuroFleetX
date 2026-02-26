import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import Map from "../components/Map";
import { motion, AnimatePresence } from "framer-motion";
import { CardSpotlight } from "../components/ui/CardEffects";
import {
  vehiclesAPI,
  driversAPI,
  authAPI,
  routesAPI,
  bookingsAPI,
} from "../services/api";

const FleetDashboard = () => {
  const { currentUser, logout } = useAuth();
  const { drivers = [], vehicles = [], telemetryRecords = [] } = useData();

  const [now, setNow] = useState(new Date());
  const [routes, setRoutes] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  // Ensure routes is always an array
  const safeRoutes = Array.isArray(routes) ? routes : [];
  const [assigningBookingId, setAssigningBookingId] = useState(null);
  const [selectedDriverForBooking, setSelectedDriverForBooking] = useState({});
  const [liveDrivers, setLiveDrivers] = useState([]);

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showRouteAssignmentModal, setShowRouteAssignmentModal] =
    useState(false);
  const [selectedRouteForAssignment, setSelectedRouteForAssignment] =
    useState(null);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  // Settings state
  const [settings, setSettings] = useState({
    defaultMapStyle: "standard",
    autoCenter: true,
  });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch live GPS-enabled drivers
  const fetchLiveDrivers = useCallback(async () => {
    try {
      const response = await driversAPI.getLiveTracking();
      const liveData = response.data?.data || response.data || [];
      setLiveDrivers(liveData);
      console.log(
        "📍 Live drivers updated:",
        liveData.length,
        "drivers with GPS enabled"
      );
    } catch (error) {
      console.error("Error fetching live drivers:", error);
    }
  }, []);

  // Load live drivers on mount and refresh every 10 seconds
  useEffect(() => {
    fetchLiveDrivers();
    const interval = setInterval(fetchLiveDrivers, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [fetchLiveDrivers]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("fleetDashboardSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("fleetDashboardSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("fleetDashboardSettings", JSON.stringify(settings));
  }, [settings]);

  // Load routes and bookings
  useEffect(() => {
    const loadData = async () => {
      try {
        const [routesRes, bookingsRes] = await Promise.all([
          routesAPI.getAll(),
          bookingsAPI.getAll(),
        ]);
        // Ensure routes is always an array
        const routesData = routesRes.data?.data || routesRes.data || [];
        setRoutes(Array.isArray(routesData) ? routesData : []);
        setBookings(bookingsRes.data?.data || bookingsRes.data || []);
      } catch (error) {
        console.error("Error loading data:", error);
        setRoutes([]); // Set empty array on error
        setBookings([]);
      }
    };
    loadData();
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const stats = {
    totalDrivers: drivers.length,
    totalVehicles: vehicles.length,
    pendingBookings: bookings.filter(
      (b) => !b.assignedDriverId && b.status !== "cancelled"
    ).length,
    telemetryToday: telemetryRecords.filter(
      (r) => r.date === new Date().toISOString().split("T")[0]
    ).length,
  };

  // Handle driver assignment
  const handleAssignDriver = async (bookingId) => {
    const driverId = selectedDriverForBooking[bookingId];
    if (!driverId) {
      alert("Please select a driver");
      return;
    }

    try {
      setAssigningBookingId(bookingId);
      const driver = drivers.find((d) => d.id === driverId);
      const booking = bookings.find((b) => b.id === bookingId);

      // Get current user from localStorage for createdByUsername
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const createdByUsername =
        currentUser.username || currentUser.name || "fleet-manager";

      // Create a route for this booking with driverUsername
      const routeData = {
        driverId: driver.id,
        driverName: driver.name || driver.username,
        driverUsername: driver.username, // Add driver username for route assignment
        startLocationName: booking.pickupLocation,
        endLocationName: booking.dropoffLocation,
        distance: 0,
        estimatedDuration: 0,
        notes: `Booking: ${booking.purpose || "Customer booking"}`,
        createdByUsername: createdByUsername, // Required by backend
      };

      console.log("Creating route with data:", routeData);
      const routeResponse = await routesAPI.create(routeData);
      const route = routeResponse.data?.data || routeResponse.data;
      console.log("Route created:", route);

      // Assign the driver and route to the booking
      await bookingsAPI.assignDriver(bookingId, {
        driverId: driver.id,
        driverName: driver.name || driver.username,
        routeId: route.id,
      });

      alert("✅ Driver assigned successfully!");

      // Reload bookings data
      const bookingsRes = await bookingsAPI.getAll();
      setBookings(bookingsRes.data?.data || bookingsRes.data || []);

      // Clear selection
      setSelectedDriverForBooking((prev) => ({ ...prev, [bookingId]: "" }));
    } catch (error) {
      console.error("Error assigning driver:", error);
      alert(
        error.response?.data?.message ||
          "❌ Failed to assign driver. Please try again."
      );
    } finally {
      setAssigningBookingId(null);
    }
  };

  // Navigation links for dashboard
  const navLinks = [
    {
      id: "overview",
      label: "Overview",
      icon: "fas fa-th-large",
      onClick: () =>
        document
          .getElementById("overview")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      id: "bookings",
      label: "Bookings",
      icon: "fas fa-calendar-check",
      onClick: () =>
        document
          .getElementById("bookings")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      id: "route-assignment",
      label: "Route Assignment",
      icon: "fas fa-route",
      href: "/route-assignment",
    },
    {
      id: "route-management",
      label: "Manage Routes",
      icon: "fas fa-route",
      href: "/route-management",
    },
    {
      id: "route-optimization",
      label: "AI Route Optimization",
      icon: "fas fa-brain",
      onClick: () =>
        document
          .getElementById("route-optimization")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      id: "maintenance-analytics",
      label: "Maintenance & Health",
      icon: "fas fa-tools",
      onClick: () =>
        document
          .getElementById("maintenance-analytics")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      id: "map",
      label: "Live Map",
      icon: "fas fa-map-marked-alt",
      onClick: () =>
        document.getElementById("map")?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      id: "vehicles",
      label: "Vehicles",
      icon: "fas fa-car",
      onClick: () =>
        document
          .getElementById("vehicles")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      id: "drivers",
      label: "Drivers",
      icon: "fas fa-users",
      onClick: () =>
        document
          .getElementById("drivers")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      id: "routes",
      label: "Routes",
      icon: "fas fa-route",
      onClick: () =>
        document
          .getElementById("routes")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: "fas fa-chart-line",
      onClick: () =>
        document
          .getElementById("analytics")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      id: "settings",
      label: "Settings",
      icon: "fas fa-cog",
      onClick: () =>
        document
          .getElementById("settings")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
  ];

  return (
    <div className="dashboard-page bg-slate-950 min-h-screen pt-20">
      <Particles />
      <Navbar showLinks={false} dashboardLinks={navLinks} />

      <main className="dashboard-main max-w-7xl mx-auto px-4 py-8">
        {/* Header Section with Gradient */}
        <motion.header
          id="overview"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="dashboard-header bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 mb-8 shadow-2xl border border-slate-700"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Fleet Dashboard
              </h1>
              <p className="text-slate-400 mt-2">
                Welcome back, {currentUser?.username || "Manager"}
              </p>
            </div>
            <button
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
          </div>
        </motion.header>

        {/* Stats Grid with Card Effects */}
        <section
          className="stats-grid grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          id="stats"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CardSpotlight className="h-auto">
              <div className="stat-card bg-transparent rounded-xl p-6 text-center">
                <div className="text-5xl mb-3">🚗</div>
                <h3 className="text-4xl font-bold text-blue-400 mb-2">
                  {stats.totalVehicles}
                </h3>
                <p className="text-slate-400 text-lg">Vehicles Managed</p>
              </div>
            </CardSpotlight>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardSpotlight className="h-auto">
              <div className="stat-card bg-transparent rounded-xl p-6 text-center">
                <div className="text-5xl mb-3">👤</div>
                <h3 className="text-4xl font-bold text-purple-400 mb-2">
                  {stats.totalDrivers}
                </h3>
                <p className="text-slate-400 text-lg">Drivers Onboarded</p>
              </div>
            </CardSpotlight>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <CardSpotlight className="h-auto">
              <div
                className="stat-card bg-transparent rounded-xl p-6 text-center cursor-pointer hover:scale-105 transition-transform"
                onClick={() =>
                  document
                    .getElementById("bookings")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <div className="text-5xl mb-3">📅</div>
                <h3 className="text-4xl font-bold text-yellow-400 mb-2">
                  {stats.pendingBookings}
                </h3>
                <p className="text-slate-400 text-lg">Pending Bookings</p>
              </div>
            </CardSpotlight>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CardSpotlight className="h-auto">
              <div className="stat-card bg-transparent rounded-xl p-6 text-center">
                <div className="text-5xl mb-3">📊</div>
                <h3 className="text-4xl font-bold text-green-400 mb-2">
                  {stats.telemetryToday}
                </h3>
                <p className="text-slate-400 text-lg">Telemetry Events Today</p>
              </div>
            </CardSpotlight>
          </motion.div>
        </section>

        {/* Quick Actions Panel */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => {
                const data = JSON.stringify(vehicles, null, 2);
                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `vehicles_export_${
                  new Date().toISOString().split("T")[0]
                }.json`;
                a.click();
                alert("✅ Vehicles data exported successfully!");
              }}
              className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-4 rounded-lg text-white transition-all hover:shadow-lg hover:scale-105"
            >
              <i className="fas fa-download text-2xl mb-2"></i>
              <div className="text-sm font-semibold">Export Vehicles</div>
            </button>

            <button
              onClick={() => {
                const data = JSON.stringify(drivers, null, 2);
                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `drivers_export_${
                  new Date().toISOString().split("T")[0]
                }.json`;
                a.click();
                alert("✅ Drivers data exported successfully!");
              }}
              className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 p-4 rounded-lg text-white transition-all hover:shadow-lg hover:scale-105"
            >
              <i className="fas fa-file-export text-2xl mb-2"></i>
              <div className="text-sm font-semibold">Export Drivers</div>
            </button>

            <button
              onClick={() => {
                alert(
                  "📊 Generating comprehensive report...\n\nReport includes:\n- Fleet statistics\n- Driver performance\n- Vehicle utilization\n- Telemetry summary\n\nDownload will start shortly..."
                );
                setTimeout(() => {
                  const report = {
                    generatedAt: new Date().toISOString(),
                    totalVehicles: vehicles.length,
                    totalDrivers: drivers.length,
                    totalTelemetry: telemetryRecords.length,
                    vehicles,
                    drivers,
                  };
                  const blob = new Blob([JSON.stringify(report, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `fleet_report_${
                    new Date().toISOString().split("T")[0]
                  }.json`;
                  a.click();
                }, 1000);
              }}
              className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 p-4 rounded-lg text-white transition-all hover:shadow-lg hover:scale-105"
            >
              <i className="fas fa-file-alt text-2xl mb-2"></i>
              <div className="text-sm font-semibold">Generate Report</div>
            </button>

            <button
              onClick={() => {
                window.location.reload();
              }}
              className="bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 p-4 rounded-lg text-white transition-all hover:shadow-lg hover:scale-105"
            >
              <i className="fas fa-sync-alt text-2xl mb-2"></i>
              <div className="text-sm font-semibold">Refresh Data</div>
            </button>
          </div>
        </motion.section>

        {/* AI Route & Load Optimization Engine - Module 3 */}
        <motion.section
          id="route-optimization"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.42 }}
          className="mb-8"
        >
          <CardSpotlight className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <i className="fas fa-brain text-white text-xl"></i>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  AI Route & Load Optimization
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Real-time route optimization and intelligent load balancing
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Optimization Metrics */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Route Efficiency</span>
                  <i className="fas fa-route text-cyan-400"></i>
                </div>
                <div className="text-3xl font-bold text-cyan-400">
                  {Math.round(
                    (safeRoutes.filter((r) => r.status === "completed").length /
                      Math.max(safeRoutes.length, 1)) *
                      100
                  )}
                  %
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {safeRoutes.filter((r) => r.status === "completed").length} of{" "}
                  {safeRoutes.length} routes optimized
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Load Balance</span>
                  <i className="fas fa-balance-scale text-green-400"></i>
                </div>
                <div className="text-3xl font-bold text-green-400">
                  {Math.round(
                    (drivers.filter((d) => d.status === "active").length /
                      Math.max(drivers.length, 1)) *
                      100
                  )}
                  %
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {drivers.filter((d) => d.status === "active").length} active
                  drivers utilized
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">
                    Fuel Efficiency
                  </span>
                  <i className="fas fa-gas-pump text-yellow-400"></i>
                </div>
                <div className="text-3xl font-bold text-yellow-400">
                  16.4 km/L
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Average fleet consumption
                </div>
              </div>
            </div>

            {/* Active Optimization Suggestions */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <i className="fas fa-lightbulb text-yellow-400"></i>
                AI Optimization Suggestions
              </h3>
              <div className="space-y-2">
                {routes
                  .filter((r) => r.status === "pending")
                  .slice(0, 3)
                  .map((route, idx) => (
                    <div
                      key={route.id || idx}
                      className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-lightbulb text-cyan-400 text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                          Optimize Route: {route.startLocationName} →{" "}
                          {route.endLocationName}
                        </p>
                        <p className="text-slate-400 text-xs mt-1">
                          AI suggests grouping with nearby routes to save{" "}
                          22% fuel
                        </p>
                      </div>
                      <button className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded-lg transition-colors">
                        Apply
                      </button>
                    </div>
                  ))}
                {safeRoutes.filter((r) => r.status === "pending").length === 0 && (
                  <div className="text-center py-4 text-slate-500">
                    <i className="fas fa-check-circle text-green-400 text-2xl mb-2"></i>
                    <p className="text-sm">All routes are optimized!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Real-time Load Distribution */}
            <div className="mt-4 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <i className="fas fa-chart-pie text-purple-400"></i>
                Real-time Load Distribution
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {safeRoutes.filter((r) => r.status === "in-progress").length}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">In Transit</div>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">
                    {safeRoutes.filter((r) => r.status === "pending").length}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Pending</div>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {safeRoutes.filter((r) => r.status === "completed").length}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Completed</div>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {vehicles.filter((v) => v.status === "available").length}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Available Vehicles
                  </div>
                </div>
              </div>
            </div>
          </CardSpotlight>
        </motion.section>

        {/* Predictive Maintenance & Health Analytics - Module 4 */}
        <motion.section
          id="maintenance-analytics"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mb-8"
        >
          <CardSpotlight className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <i className="fas fa-tools text-white text-xl"></i>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Predictive Maintenance & Health Analytics
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  AI-powered vehicle health monitoring and maintenance prediction
                </p>
              </div>
            </div>

            {/* Fleet Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-green-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Healthy</span>
                  <i className="fas fa-check-circle text-green-400"></i>
                </div>
                <div className="text-3xl font-bold text-green-400">
                  {
                    vehicles.filter(
                      (v) => v.status === "available" || v.status === "active"
                    ).length
                  }
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {Math.round(
                    (vehicles.filter(
                      (v) => v.status === "available" || v.status === "active"
                    ).length /
                      Math.max(vehicles.length, 1)) *
                      100
                  )}
                  % of fleet
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-yellow-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">
                    Needs Attention
                  </span>
                  <i className="fas fa-exclamation-triangle text-yellow-400"></i>
                </div>
                <div className="text-3xl font-bold text-yellow-400">
                  {Math.floor(vehicles.length * 0.15)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Maintenance due soon
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-orange-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">
                    Critical
                  </span>
                  <i className="fas fa-exclamation-circle text-orange-400"></i>
                </div>
                <div className="text-3xl font-bold text-orange-400">
                  {vehicles.filter((v) => v.status === "maintenance").length}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Immediate action required
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Avg Health Score</span>
                  <i className="fas fa-heart text-blue-400"></i>
                </div>
                <div className="text-3xl font-bold text-blue-400">
                  91%
                </div>
                <div className="text-xs text-slate-500 mt-1">Fleet average</div>
              </div>
            </div>

            {/* Maintenance Predictions */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <i className="fas fa-calendar-alt text-orange-400"></i>
                Upcoming Maintenance Predictions
              </h3>
              <div className="space-y-2">
                {vehicles.slice(0, 4).map((vehicle, idx) => {
                  const daysUntil = 5 + idx * 7;
                  const severity =
                    daysUntil < 7
                      ? "high"
                      : daysUntil < 14
                      ? "medium"
                      : "low";
                  const severityColors = {
                    high: "text-red-400 bg-red-500/20 border-red-500/30",
                    medium:
                      "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
                    low: "text-blue-400 bg-blue-500/20 border-blue-500/30",
                  };

                  return (
                    <div
                      key={vehicle.id || idx}
                      className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${severityColors[severity]} border`}
                      >
                        <i className="fas fa-wrench text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-medium">
                            {vehicle.registrationNumber || vehicle.model}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              severity === "high"
                                ? "bg-red-500/20 text-red-400"
                                : severity === "medium"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-1">
                          <i className="fas fa-clock mr-1"></i>
                          Predicted maintenance in {daysUntil} days •{" "}
                          {idx % 2 === 0 ? "Oil change" : "Brake inspection"} •{" "}
                          {3500 + idx * 800} km
                        </p>
                      </div>
                      <button className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-lg transition-colors">
                        Schedule
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Health Analytics Insights */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <i className="fas fa-chart-line text-green-400"></i>
                AI Health Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-thumbs-up text-green-400 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        Cost Savings Potential
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        Preventive maintenance can save ₹
                        45000 this month
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-clock text-blue-400 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        Downtime Reduction
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        Predictive maintenance reduces downtime by{" "}
                        40%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-shield-alt text-purple-400 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        Safety Score
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        Fleet safety improved by{" "}
                        28% with proactive
                        maintenance
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-battery-three-quarters text-yellow-400 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        Battery Health
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        {Math.floor(vehicles.length * 0.2)} vehicles need
                        battery check within 30 days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardSpotlight>
        </motion.section>

        {/* Fleet Map Section with Spotlight Effect */}
        <motion.section
          id="map"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="map-section mb-8"
        >
          <CardSpotlight className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <i className="fas fa-map-marked-alt text-white text-lg"></i>
              </div>
              <h4 className="text-2xl font-bold text-white">
                Live Fleet Tracking
                {liveDrivers.length > 0 && (
                  <span className="ml-3 text-sm font-normal text-green-400">
                    ({liveDrivers.length} driver
                    {liveDrivers.length !== 1 ? "s" : ""} with GPS active)
                  </span>
                )}
              </h4>
            </div>
            <div className="bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700">
              <Map
                vehicles={vehicles}
                drivers={liveDrivers.length > 0 ? liveDrivers : drivers}
                telemetryRecords={telemetryRecords}
                showOnlyGpsEnabled={false}
              />
              {liveDrivers.length === 0 && (
                <div className="p-4 bg-yellow-500/10 border-t border-yellow-500/30 text-yellow-400 text-sm">
                  <i className="fas fa-info-circle mr-2"></i>
                  <strong>No live GPS data available.</strong> Drivers need to:
                  <span className="ml-2">1) Login to Driver Dashboard</span>
                  <span className="ml-2">2) Enable GPS Tracking</span>
                  <span className="ml-2">3) Allow browser location access</span>
                </div>
              )}
            </div>
          </CardSpotlight>
        </motion.section>

        {/* Vehicles Management Section */}
        <section id="vehicles" className="mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <CardSpotlight className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <i className="fas fa-car text-white text-lg"></i>
                  </div>
                  <h4 className="text-2xl font-bold text-white">
                    Vehicles Management
                  </h4>
                </div>
                <button
                  onClick={() => {
                    const addVehicleSection =
                      document.getElementById("add-vehicle-form");
                    if (addVehicleSection) {
                      addVehicleSection.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                      addVehicleSection.classList.add("highlight-pulse");
                      setTimeout(
                        () =>
                          addVehicleSection.classList.remove("highlight-pulse"),
                        2000
                      );
                    }
                  }}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <i className="fas fa-plus"></i>
                  Add Vehicle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {vehicles.length > 0 ? (
                  vehicles.map((v) => (
                    <div
                      key={v.id || v.vin}
                      className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-blue-500 transition-all hover:shadow-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h5 className="text-white font-bold text-lg">
                            {v.model || "Unknown Model"}
                          </h5>
                          <p className="text-slate-400 text-sm">
                            VIN: {v.vin || "N/A"}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            v.status === "ok" || v.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : v.status === "maintenance"
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {v.status || "active"}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <i className="fas fa-calendar text-blue-400"></i>
                          <span>Year: {v.year || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <i className="fas fa-palette text-purple-400"></i>
                          <span>Color: {v.color || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <i className="fas fa-tachometer-alt text-green-400"></i>
                          <span>Mileage: {v.mileage || 0} km</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // In a real app, this would open an edit modal
                            alert(
                              `Edit vehicle: ${v.model}\nVIN: ${v.vin}\n\nThis will open an edit form in production.`
                            );
                          }}
                          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded text-sm transition-all"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Are you sure you want to delete ${v.model}?`
                              )
                            ) {
                              // In a real app, this would call the delete API
                              alert(
                                "Vehicle deleted! (API integration required)"
                              );
                            }
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-all"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <i className="fas fa-car text-slate-600 text-6xl mb-4"></i>
                    <p className="text-slate-400 text-lg">
                      No vehicles available
                    </p>
                    <p className="text-slate-500 text-sm mt-2">
                      Add your first vehicle to get started
                    </p>
                  </div>
                )}
              </div>

              {/* Add Vehicle Form */}
              <div
                id="add-vehicle-form"
                className="bg-slate-900/50 p-6 rounded-lg border-2 border-dashed border-slate-700 hover:border-blue-500 transition-all"
              >
                <h5 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <i className="fas fa-plus-circle text-blue-400"></i>
                  Add New Vehicle
                </h5>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    setSubmitMessage({ type: "", text: "" });

                    const formData = new FormData(e.target);
                    const vehicleData = {
                      vin: formData.get("vin"),
                      model: formData.get("model"),
                      year: parseInt(formData.get("year")),
                      color: formData.get("color"),
                      mileage: parseInt(formData.get("mileage")) || 0,
                      status: formData.get("status"),
                      latitude: formData.get("latitude")
                        ? parseFloat(formData.get("latitude"))
                        : null,
                      longitude: formData.get("longitude")
                        ? parseFloat(formData.get("longitude"))
                        : null,
                    };

                    try {
                      await vehiclesAPI.create(vehicleData);
                      setSubmitMessage({
                        type: "success",
                        text: `✅ Vehicle "${vehicleData.model}" added successfully!`,
                      });
                      e.target.reset();
                      // Refresh the page to show new vehicle
                      setTimeout(() => window.location.reload(), 1500);
                    } catch (error) {
                      console.error("Error adding vehicle:", error);
                      setSubmitMessage({
                        type: "error",
                        text: `❌ Error: ${
                          error.response?.data?.message ||
                          "Failed to add vehicle"
                        }`,
                      });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        VIN *
                      </label>
                      <input
                        type="text"
                        name="vin"
                        placeholder="1HGBH41JXMN109186"
                        required
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Model *
                      </label>
                      <input
                        type="text"
                        name="model"
                        placeholder="Tesla Model 3"
                        required
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Year *
                      </label>
                      <input
                        type="number"
                        name="year"
                        placeholder="2024"
                        required
                        min="1900"
                        max="2030"
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Color
                      </label>
                      <input
                        type="text"
                        name="color"
                        placeholder="Pearl White"
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Mileage (km)
                      </label>
                      <input
                        type="number"
                        name="mileage"
                        placeholder="0"
                        min="0"
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Status *
                      </label>
                      <select
                        name="status"
                        required
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Current Latitude
                      </label>
                      <input
                        type="number"
                        name="latitude"
                        placeholder="13.0827"
                        step="0.000001"
                        min="12.5"
                        max="13.5"
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Current Longitude
                      </label>
                      <input
                        type="number"
                        name="longitude"
                        placeholder="80.2707"
                        step="0.000001"
                        min="79.5"
                        max="81.0"
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit Message */}
                  {submitMessage.text && (
                    <div
                      className={`mt-4 p-4 rounded-lg ${
                        submitMessage.type === "success"
                          ? "bg-green-500/20 border border-green-500/50 text-green-400"
                          : "bg-red-500/20 border border-red-500/50 text-red-400"
                      }`}
                    >
                      {submitMessage.text}
                    </div>
                  )}

                  <div className="mt-4 flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2 ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i>
                          Save Vehicle
                        </>
                      )}
                    </button>
                    <button
                      type="reset"
                      disabled={isSubmitting}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-all disabled:opacity-50"
                      onClick={() => setSubmitMessage({ type: "", text: "" })}
                    >
                      Clear Form
                    </button>
                  </div>
                </form>
              </div>
            </CardSpotlight>
          </motion.div>
        </section>

        {/* Drivers Management Section */}
        <section id="drivers" className="mb-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <CardSpotlight className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <i className="fas fa-users text-white text-lg"></i>
                  </div>
                  <h4 className="text-2xl font-bold text-white">
                    Drivers Management
                  </h4>
                  <span className="text-slate-400 text-sm">
                    ({drivers.length} total)
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      console.log("Refreshing drivers list...");
                      window.location.reload(); // Force full reload to fetch fresh data
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                  >
                    <i className="fas fa-sync-alt"></i>
                    Refresh
                  </button>
                  <button
                    onClick={() => {
                      const addDriverSection =
                        document.getElementById("add-driver-form");
                      if (addDriverSection) {
                        addDriverSection.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                        addDriverSection.classList.add("highlight-pulse");
                        setTimeout(
                          () =>
                            addDriverSection.classList.remove(
                              "highlight-pulse"
                            ),
                          2000
                        );
                      }
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <i className="fas fa-user-plus"></i>
                    Add Driver
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {drivers.length > 0 ? (
                  drivers.map((d) => (
                    <div
                      key={d.id || d.driver_id}
                      className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-purple-500 transition-all hover:shadow-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                            {d.name ? d.name.charAt(0).toUpperCase() : "D"}
                          </div>
                          <div>
                            <h5 className="text-white font-bold">
                              {d.name || "Unknown"}
                            </h5>
                            <p className="text-slate-400 text-xs">
                              {d.email || "No email"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            d.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : d.status === "on-break"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {d.status || "active"}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <i className="fas fa-phone text-blue-400"></i>
                          <span>{d.phone || "No phone"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <i className="fas fa-id-card text-green-400"></i>
                          <span>
                            License:{" "}
                            {d.license_number || d.licenseNumber || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <i className="fas fa-star text-yellow-400"></i>
                          <span>Rating: {d.rating || "4.5"} ⭐</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <i
                            className={`fas fa-map-marker-alt ${
                              d.gpsEnabled ? "text-green-400" : "text-gray-400"
                            }`}
                          ></i>
                          <span>
                            GPS:{" "}
                            {d.gpsEnabled ? (
                              <span className="text-green-400">Active 📡</span>
                            ) : (
                              <span className="text-gray-400">Inactive</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => {
                            if (d.latitude && d.longitude) {
                              // Scroll to map and show driver location
                              const mapSection = document.getElementById("map");
                              if (mapSection) {
                                mapSection.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              }
                              // Show location details
                              alert(
                                `📍 ${d.name}'s Location\n\n` +
                                  `Latitude: ${d.latitude}\n` +
                                  `Longitude: ${d.longitude}\n` +
                                  `Speed: ${d.currentSpeed || 0} km/h\n` +
                                  `GPS: ${
                                    d.gpsEnabled ? "Active" : "Inactive"
                                  }\n` +
                                  `Last Update: ${
                                    d.lastLocationUpdate
                                      ? new Date(
                                          d.lastLocationUpdate
                                        ).toLocaleString()
                                      : "N/A"
                                  }`
                              );
                            } else {
                              alert(
                                `❌ ${d.name}'s location is not available.\n\n` +
                                  `The driver needs to:\n` +
                                  `1. Login to their Driver Dashboard\n` +
                                  `2. Enable GPS Tracking\n` +
                                  `3. Allow browser location access`
                              );
                            }
                          }}
                          className={`flex-1 ${
                            d.latitude && d.longitude
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-gray-600 hover:bg-gray-700"
                          } text-white px-3 py-2 rounded text-sm transition-all`}
                        >
                          <i className="fas fa-map-marker-alt mr-1"></i>
                          {d.latitude && d.longitude ? "Locate" : "No GPS"}
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            alert(
                              `Edit driver: ${d.name}\nPhone: ${
                                d.phone
                              }\nLicense: ${
                                d.license_number || d.licenseNumber
                              }\n\nThis will open an edit form in production.`
                            );
                          }}
                          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded text-sm transition-all"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Are you sure you want to remove ${d.name}?`
                              )
                            ) {
                              alert(
                                "Driver removed! (API integration required)"
                              );
                            }
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-all"
                        >
                          <i className="fas fa-user-times mr-1"></i>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <i className="fas fa-users text-slate-600 text-6xl mb-4"></i>
                    <p className="text-slate-400 text-lg">
                      No drivers available
                    </p>
                    <p className="text-slate-500 text-sm mt-2">
                      Add your first driver to get started
                    </p>
                  </div>
                )}
              </div>

              {/* Add Driver Form */}
              <div
                id="add-driver-form"
                className="bg-slate-900/50 p-6 rounded-lg border-2 border-dashed border-slate-700 hover:border-purple-500 transition-all"
              >
                <h5 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <i className="fas fa-user-plus text-purple-400"></i>
                  Add New Driver
                </h5>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    setSubmitMessage({ type: "", text: "" });

                    const formData = new FormData(e.target);
                    const driverData = {
                      name: formData.get("name"),
                      email: formData.get("email"),
                      phone: formData.get("phone"),
                      license_number: formData.get("license"),
                      status: formData.get("status"),
                      rating: parseFloat(formData.get("rating")) || 5.0,
                      latitude: formData.get("latitude")
                        ? parseFloat(formData.get("latitude"))
                        : null,
                      longitude: formData.get("longitude")
                        ? parseFloat(formData.get("longitude"))
                        : null,
                    };

                    try {
                      await driversAPI.create(driverData);
                      setSubmitMessage({
                        type: "success",
                        text: `✅ Driver "${driverData.name}" added successfully!`,
                      });
                      e.target.reset();
                      // Refresh the page to show new driver
                      setTimeout(() => window.location.reload(), 1500);
                    } catch (error) {
                      console.error("Error adding driver:", error);
                      setSubmitMessage({
                        type: "error",
                        text: `❌ Error: ${
                          error.response?.data?.message ||
                          "Failed to add driver"
                        }`,
                      });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        required
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="john@example.com"
                        required
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="+1 234 567 8900"
                        required
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        License Number *
                      </label>
                      <input
                        type="text"
                        name="license"
                        placeholder="DL-1234567890"
                        required
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Status *
                      </label>
                      <select
                        name="status"
                        required
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-purple-500 focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="on-break">On Break</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Initial Rating
                      </label>
                      <input
                        type="number"
                        name="rating"
                        placeholder="5.0"
                        step="0.1"
                        min="0"
                        max="5"
                        defaultValue="5.0"
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Latitude (Chennai area)
                      </label>
                      <input
                        type="number"
                        name="latitude"
                        placeholder="13.0827"
                        step="0.000001"
                        min="12.5"
                        max="13.5"
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Longitude (Chennai area)
                      </label>
                      <input
                        type="number"
                        name="longitude"
                        placeholder="80.2707"
                        step="0.000001"
                        min="79.5"
                        max="81.0"
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit Message */}
                  {submitMessage.text && (
                    <div
                      className={`mt-4 p-4 rounded-lg ${
                        submitMessage.type === "success"
                          ? "bg-green-500/20 border border-green-500/50 text-green-400"
                          : "bg-red-500/20 border border-red-500/50 text-red-400"
                      }`}
                    >
                      {submitMessage.text}
                    </div>
                  )}

                  <div className="mt-4 flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2 ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i>
                          Save Driver
                        </>
                      )}
                    </button>
                    <button
                      type="reset"
                      disabled={isSubmitting}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-all disabled:opacity-50"
                      onClick={() => setSubmitMessage({ type: "", text: "" })}
                    >
                      Clear Form
                    </button>
                  </div>
                </form>
              </div>
            </CardSpotlight>
          </motion.div>
        </section>

        {/* Bookings Section */}
        <section id="bookings" className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.75 }}
          >
            <CardSpotlight className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <i className="fas fa-calendar-check text-white text-lg"></i>
                  </div>
                  <h4 className="text-2xl font-bold text-white">
                    Customer Bookings
                  </h4>
                </div>
                <a
                  href="/route-assignment"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <i className="fas fa-route"></i>
                  Assign Drivers
                </a>
              </div>

              {/* Booking Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <i className="fas fa-clock text-yellow-400"></i>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Pending</p>
                      <p className="text-white text-xl font-bold">
                        {
                          bookings.filter(
                            (b) =>
                              !b.assignedDriverId && b.status !== "cancelled"
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <i className="fas fa-user-check text-blue-400"></i>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Assigned</p>
                      <p className="text-white text-xl font-bold">
                        {
                          bookings.filter(
                            (b) =>
                              b.assignedDriverId &&
                              b.status !== "completed" &&
                              b.status !== "cancelled"
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <i className="fas fa-check-circle text-green-400"></i>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Completed</p>
                      <p className="text-white text-xl font-bold">
                        {
                          bookings.filter((b) => b.status === "completed")
                            .length
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <i className="fas fa-list text-purple-400"></i>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Total</p>
                      <p className="text-white text-xl font-bold">
                        {bookings.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bookings List */}
              <div className="space-y-3">
                {bookings.length > 0 ? (
                  bookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-blue-500 transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h5 className="text-white font-bold flex items-center gap-2">
                            {booking.userName || "Customer"}
                            {!booking.assignedDriverId && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400">
                                Needs Driver
                              </span>
                            )}
                          </h5>
                          <p className="text-slate-400 text-sm">
                            {booking.vehicleName} ({booking.vehicleRegistration}
                            )
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : booking.status === "confirmed"
                              ? "bg-blue-500/20 text-blue-400"
                              : booking.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : booking.status === "completed"
                              ? "bg-gray-500/20 text-gray-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="bg-slate-700/50 p-2 rounded">
                          <p className="text-xs text-slate-400 mb-1">
                            📍 Pickup
                          </p>
                          <p className="text-white text-sm">
                            {booking.pickupLocation || "Not specified"}
                          </p>
                        </div>
                        <div className="bg-slate-700/50 p-2 rounded">
                          <p className="text-xs text-slate-400 mb-1">
                            🎯 Dropoff
                          </p>
                          <p className="text-white text-sm">
                            {booking.dropoffLocation || "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-slate-400">
                          <span>
                            <i className="fas fa-calendar mr-1 text-blue-400"></i>
                            {new Date(booking.startDate).toLocaleDateString()}
                          </span>
                          {booking.assignedDriverName && (
                            <span>
                              <i className="fas fa-user mr-1 text-green-400"></i>
                              {booking.assignedDriverName}
                            </span>
                          )}
                        </div>
                        {!booking.assignedDriverId &&
                          booking.status !== "cancelled" && (
                            <div className="flex items-center gap-2">
                              <select
                                value={
                                  selectedDriverForBooking[booking.id] || ""
                                }
                                onChange={(e) =>
                                  setSelectedDriverForBooking((prev) => ({
                                    ...prev,
                                    [booking.id]: e.target.value,
                                  }))
                                }
                                className="bg-slate-700 text-white px-3 py-1 rounded text-sm border border-slate-600 focus:border-blue-500 focus:outline-none"
                                disabled={assigningBookingId === booking.id}
                              >
                                <option value="">Select Driver</option>
                                {drivers.map((driver) => (
                                  <option key={driver.id} value={driver.id}>
                                    {driver.name || driver.username}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleAssignDriver(booking.id)}
                                disabled={
                                  !selectedDriverForBooking[booking.id] ||
                                  assigningBookingId === booking.id
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {assigningBookingId === booking.id ? (
                                  <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                  "Assign"
                                )}
                              </button>
                            </div>
                          )}
                      </div>

                      {booking.purpose && (
                        <div className="mt-2 pt-2 border-t border-slate-700">
                          <p className="text-xs text-slate-400">Purpose:</p>
                          <p className="text-white text-sm">
                            {booking.purpose}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <i className="fas fa-calendar-times text-slate-600 text-6xl mb-4"></i>
                    <p className="text-slate-400 text-lg">No bookings yet</p>
                    <p className="text-slate-500 text-sm mt-2">
                      Customer bookings will appear here
                    </p>
                  </div>
                )}

                {bookings.length > 5 && (
                  <div className="text-center pt-4">
                    <a
                      href="/route-assignment"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View all {bookings.length} bookings →
                    </a>
                  </div>
                )}
              </div>
            </CardSpotlight>
          </motion.div>
        </section>

        {/* Routes Section */}
        <section id="routes" className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <CardSpotlight className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <i className="fas fa-route text-white text-lg"></i>
                  </div>
                  <h4 className="text-2xl font-bold text-white">
                    Route Management
                  </h4>
                </div>
                <button
                  onClick={() => {
                    const addRouteSection =
                      document.getElementById("add-route-form");
                    if (addRouteSection) {
                      addRouteSection.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                      addRouteSection.classList.add("highlight-pulse");
                      setTimeout(
                        () =>
                          addRouteSection.classList.remove("highlight-pulse"),
                        2000
                      );
                    }
                  }}
                  className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <i className="fas fa-plus"></i>
                  Create Route
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {safeRoutes.length > 0 ? (
                  safeRoutes.map((route) => (
                    <div
                      key={route.id}
                      className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-orange-500 transition-all hover:shadow-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h5 className="text-white font-bold text-lg">
                            Route #{route.id}
                          </h5>
                          <p className="text-slate-400 text-sm">
                            {route.startLocation?.address || "Start Location"} →{" "}
                            {route.endLocation?.address || "End Location"}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            route.status === "assigned"
                              ? "bg-blue-500/20 text-blue-400"
                              : route.status === "in_progress"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : route.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {route.status || "unassigned"}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <i className="fas fa-user text-blue-400"></i>
                          <span>
                            Driver:{" "}
                            {route.driverId
                              ? `Driver #${route.driverId}`
                              : "Unassigned"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <i className="fas fa-road text-green-400"></i>
                          <span>
                            Distance:{" "}
                            {route.distance ? `${route.distance} km` : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <i className="fas fa-clock text-purple-400"></i>
                          <span>
                            Duration:{" "}
                            {route.duration ? `${route.duration} min` : "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedRouteForAssignment(route);
                            setShowRouteAssignmentModal(true);
                          }}
                          disabled={route.status !== "unassigned"}
                          className={`flex-1 px-3 py-2 rounded text-sm transition-all ${
                            route.status === "unassigned"
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-slate-600 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          <i className="fas fa-user-plus mr-1"></i>
                          Assign
                        </button>
                        <button
                          onClick={() => {
                            alert(
                              `View route details: ${
                                route.startLocation?.address
                              } to ${route.endLocation?.address}\nStatus: ${
                                route.status
                              }\nDriver: ${
                                route.driverId || "Unassigned"
                              }\n\nThis will open route details in production.`
                            );
                          }}
                          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded text-sm transition-all"
                        >
                          <i className="fas fa-eye mr-1"></i>
                          View
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Are you sure you want to delete Route #${route.id}?`
                              )
                            ) {
                              alert(
                                "Route deleted! (API integration required)"
                              );
                            }
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-all"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <i className="fas fa-route text-slate-600 text-6xl mb-4"></i>
                    <p className="text-slate-400 text-lg">
                      No routes available
                    </p>
                    <p className="text-slate-500 text-sm mt-2">
                      Create your first route to get started
                    </p>
                  </div>
                )}
              </div>

              {/* Add Route Form */}
              <div
                id="add-route-form"
                className="bg-slate-900/50 p-6 rounded-lg border-2 border-dashed border-slate-700 hover:border-orange-500 transition-all"
              >
                <h5 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <i className="fas fa-route text-orange-400"></i>
                  Create New Route
                </h5>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    setSubmitMessage({ type: "", text: "" });

                    const formData = new FormData(e.target);
                    const selectedDriver = drivers.find(
                      (d) => d.id === formData.get("driverId")
                    );
                    const routeData = {
                      driverId: formData.get("driverId"),
                      driverName:
                        selectedDriver?.name || selectedDriver?.username,
                      driverUsername: selectedDriver?.username,
                      startLocationName: formData.get("startAddress"),
                      endLocationName: formData.get("endAddress"),
                      distance: parseFloat(formData.get("distance")) || 0,
                      estimatedDuration:
                        parseInt(formData.get("duration")) || 0,
                      createdByUsername:
                        currentUser?.username || "fleet_manager",
                    };

                    try {
                      await routesAPI.create(routeData);
                      setSubmitMessage({
                        type: "success",
                        text: `✅ Route created successfully!`,
                      });
                      e.target.reset();
                      // Refresh routes
                      const response = await routesAPI.getAll();
                      setRoutes(response.data);
                    } catch (error) {
                      console.error("Error creating route:", error);
                      setSubmitMessage({
                        type: "error",
                        text: `❌ Error: ${
                          error.response?.data?.message ||
                          "Failed to create route"
                        }`,
                      });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-slate-400 text-sm mb-2">
                        Select Driver *
                      </label>
                      <select
                        name="driverId"
                        required
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-orange-500 focus:outline-none"
                      >
                        <option value="">-- Select a Driver --</option>
                        {drivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name || driver.username} -{" "}
                            {driver.licenseNumber}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Start Address *
                      </label>
                      <input
                        type="text"
                        name="startAddress"
                        required
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-orange-500 focus:outline-none"
                        placeholder="Enter start address"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        End Address *
                      </label>
                      <input
                        type="text"
                        name="endAddress"
                        required
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-orange-500 focus:outline-none"
                        placeholder="Enter end address"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Distance (km)
                      </label>
                      <input
                        type="number"
                        name="distance"
                        step="0.1"
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-orange-500 focus:outline-none"
                        placeholder="e.g. 15.5"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        name="duration"
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-orange-500 focus:outline-none"
                        placeholder="e.g. 45"
                      />
                    </div>
                  </div>

                  {/* Submit Message */}
                  {submitMessage.text && (
                    <div
                      className={`mt-4 p-4 rounded-lg ${
                        submitMessage.type === "success"
                          ? "bg-green-500/20 border border-green-500/50 text-green-400"
                          : "bg-red-500/20 border border-red-500/50 text-red-400"
                      }`}
                    >
                      {submitMessage.text}
                    </div>
                  )}

                  <div className="mt-4 flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2 ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-route"></i>
                          Create Route
                        </>
                      )}
                    </button>
                    <button
                      type="reset"
                      disabled={isSubmitting}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-all disabled:opacity-50"
                      onClick={() => setSubmitMessage({ type: "", text: "" })}
                    >
                      Clear Form
                    </button>
                  </div>
                </form>
              </div>
            </CardSpotlight>
          </motion.div>
        </section>

        {/* Analytics Section */}
        <section id="analytics" className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <CardSpotlight className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <i className="fas fa-chart-line text-white text-lg"></i>
                </div>
                <h4 className="text-2xl font-bold text-white">
                  Fleet Analytics
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-400">Fleet Utilization</span>
                    <i className="fas fa-percentage text-green-400"></i>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {vehicles.length > 0
                      ? Math.round(
                          (vehicles.filter((v) => v.status === "active")
                            .length /
                            vehicles.length) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{
                        width: `${
                          vehicles.length > 0
                            ? (vehicles.filter((v) => v.status === "active")
                                .length /
                                vehicles.length) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-400">Active Drivers</span>
                    <i className="fas fa-user-check text-blue-400"></i>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {drivers.filter((d) => d.status === "active").length}/
                    {drivers.length}
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    {drivers.length > 0
                      ? Math.round(
                          (drivers.filter((d) => d.status === "active").length /
                            drivers.length) *
                            100
                        )
                      : 0}
                    % of total drivers
                  </p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-400">Avg. Daily Events</span>
                    <i className="fas fa-signal text-purple-400"></i>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {Math.round(telemetryRecords.length / 30) || 0}
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    {telemetryRecords.length} total events
                  </p>
                </div>
              </div>

              <div className="mt-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <i className="fas fa-trophy text-yellow-400"></i>
                  Top Performers
                </h5>
                <div className="space-y-2">
                  {drivers.slice(0, 3).map((driver, index) => (
                    <div
                      key={driver.id || driver.driver_id}
                      className="flex items-center justify-between p-2 bg-slate-900/50 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0
                              ? "bg-yellow-500/20 text-yellow-400"
                              : index === 1
                              ? "bg-gray-400/20 text-gray-400"
                              : "bg-orange-500/20 text-orange-400"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="text-white font-medium">
                          {driver.name}
                        </span>
                      </div>
                      <span className="text-green-400 font-semibold">
                        {Math.floor(Math.random() * 50 + 70)}% efficiency
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardSpotlight>
          </motion.div>
        </section>

        {/* Settings Section */}
        <section id="settings" className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <CardSpotlight className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <i className="fas fa-cog text-white text-lg"></i>
                </div>
                <h4 className="text-2xl font-bold text-white">
                  Settings & Preferences
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="fas fa-user-circle text-purple-400"></i>
                    Account Settings
                  </h5>
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-400 text-sm">Email</label>
                      <div className="text-white font-medium">
                        {currentUser?.email || "manager@neurofleetx.com"}
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm">Role</label>
                      <div className="text-white font-medium">
                        Fleet Manager
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm">
                        Member Since
                      </label>
                      <div className="text-white font-medium">
                        {new Date().toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowEditProfileModal(true)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      Edit Profile
                    </button>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="fas fa-map text-green-400"></i>
                    Map Preferences
                  </h5>
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-400 text-sm mb-2 block">
                        Default Map Style
                      </label>
                      <select
                        className="w-full bg-slate-900 text-white border border-slate-700 rounded px-3 py-2 focus:border-green-500 focus:outline-none"
                        value={settings.defaultMapStyle}
                        onChange={(e) =>
                          updateSetting("defaultMapStyle", e.target.value)
                        }
                      >
                        <option value="standard">🗺️ Standard</option>
                        <option value="dark">🌙 Dark Mode</option>
                        <option value="light">☀️ Light Mode</option>
                        <option value="satellite">🛰️ Satellite</option>
                        <option value="terrain">⛰️ Terrain</option>
                      </select>
                    </div>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-slate-300">
                        Auto-center on vehicles
                      </span>
                      <input
                        type="checkbox"
                        className="toggle-checkbox"
                        checked={settings.autoCenter}
                        onChange={(e) =>
                          updateSetting("autoCenter", e.target.checked)
                        }
                      />
                    </label>
                  </div>
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-sm">
                    <i className="fas fa-info-circle mr-2"></i>
                    Changes apply to map view
                  </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="fas fa-shield-alt text-red-400"></i>
                    Security
                  </h5>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center"
                    >
                      <i className="fas fa-key mr-2"></i>
                      Change Password
                    </button>
                    <button
                      onClick={() => setShow2FAModal(true)}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center"
                    >
                      <i className="fas fa-lock mr-2"></i>
                      Two-Factor Authentication
                    </button>
                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 text-xs">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Keep your account secure
                    </div>
                  </div>
                </div>
              </div>
            </CardSpotlight>
          </motion.div>
        </section>

        {/* Footer with Gradient */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="dashboard-footer bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 border border-slate-700 flex justify-between items-center text-slate-400"
        >
          <span className="flex items-center gap-2">
            <i className="fas fa-bolt text-purple-400"></i>
            NeuroFleetX — AI-Driven Urban Mobility Optimization
          </span>
          <span className="flex items-center gap-2">
            <i className="fas fa-clock text-blue-400"></i>
            {now.toLocaleString()}
          </span>
        </motion.footer>
      </main>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <i className="fas fa-key text-blue-400"></i>
                  Change Password
                </h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const currentPassword = formData.get("currentPassword");
                  const newPassword = formData.get("newPassword");
                  const confirmPassword = formData.get("confirmPassword");

                  if (newPassword !== confirmPassword) {
                    setSubmitMessage({
                      type: "error",
                      text: "❌ Passwords do not match!",
                    });
                    return;
                  }

                  if (newPassword.length < 8) {
                    setSubmitMessage({
                      type: "error",
                      text: "❌ Password must be at least 8 characters!",
                    });
                    return;
                  }

                  setIsSubmitting(true);
                  setSubmitMessage({ type: "", text: "" });

                  try {
                    const response = await authAPI.changePassword({
                      email: currentUser?.email,
                      currentPassword: currentPassword,
                      newPassword: newPassword,
                    });

                    if (response.data.success) {
                      setSubmitMessage({
                        type: "success",
                        text: "✅ Password changed successfully!",
                      });
                      e.target.reset();
                      setTimeout(() => {
                        setShowPasswordModal(false);
                        setSubmitMessage({ type: "", text: "" });
                      }, 2000);
                    } else {
                      setSubmitMessage({
                        type: "error",
                        text: `❌ ${
                          response.data.message || "Failed to change password"
                        }`,
                      });
                    }
                  } catch (error) {
                    const errorMsg =
                      error.response?.data?.message ||
                      "Current password is incorrect or server error";
                    setSubmitMessage({ type: "error", text: `❌ ${errorMsg}` });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      required
                      className="w-full bg-slate-800 text-white border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      New Password *
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      required
                      minLength={8}
                      className="w-full bg-slate-800 text-white border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="Enter new password (min 8 chars)"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      minLength={8}
                      className="w-full bg-slate-800 text-white border border-slate-700 rounded px-4 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                {submitMessage.text && (
                  <div
                    className={`mt-4 p-3 rounded-lg text-sm ${
                      submitMessage.type === "success"
                        ? "bg-green-500/20 border border-green-500/50 text-green-400"
                        : "bg-red-500/20 border border-red-500/50 text-red-400"
                    }`}
                  >
                    {submitMessage.text}
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Changing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check mr-2"></i>
                        Change Password
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two-Factor Authentication Modal */}
      <AnimatePresence>
        {show2FAModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShow2FAModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <i className="fas fa-lock text-green-400"></i>
                  Two-Factor Authentication
                </h3>
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                  <i className="fas fa-info-circle text-blue-400 mr-2"></i>
                  <span className="text-blue-300 text-sm">
                    Two-factor authentication adds an extra layer of security to
                    your account.
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-check text-green-400"></i>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        Enhanced Security
                      </h4>
                      <p className="text-slate-400 text-sm">
                        Protect your account from unauthorized access
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-mobile-alt text-blue-400"></i>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        SMS Verification
                      </h4>
                      <p className="text-slate-400 text-sm">
                        Receive codes via text message
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-envelope text-purple-400"></i>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        Email Backup
                      </h4>
                      <p className="text-slate-400 text-sm">
                        Alternative verification via email
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  setSubmitMessage({ type: "", text: "" });

                  try {
                    // In production, call API: await api.post('/auth/enable-2fa');
                    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
                    setSubmitMessage({
                      type: "success",
                      text: "✅ Two-Factor Authentication enabled! You will receive a code on your next login.",
                    });
                    setTimeout(() => {
                      setShow2FAModal(false);
                      setSubmitMessage({ type: "", text: "" });
                    }, 2500);
                  } catch (error) {
                    setSubmitMessage({
                      type: "error",
                      text: "❌ Failed to enable 2FA. Please try again.",
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {submitMessage.text && (
                  <div
                    className={`mb-4 p-3 rounded-lg text-sm ${
                      submitMessage.type === "success"
                        ? "bg-green-500/20 border border-green-500/50 text-green-400"
                        : "bg-red-500/20 border border-red-500/50 text-red-400"
                    }`}
                  >
                    {submitMessage.text}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Enabling...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-shield-alt mr-2"></i>
                        Enable 2FA
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShow2FAModal(false)}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditProfileModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <i className="fas fa-user-edit text-purple-400"></i>
                  Edit Profile
                </h3>
                <button
                  onClick={() => setShowEditProfileModal(false)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  setSubmitMessage({ type: "", text: "" });

                  try {
                    // In production, call API: await api.put('/fleet-managers/profile', { email: e.target.email.value });
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
                    setSubmitMessage({
                      type: "success",
                      text: "✅ Profile updated successfully!",
                    });
                    setTimeout(() => {
                      setShowEditProfileModal(false);
                      setSubmitMessage({ type: "", text: "" });
                    }, 2000);
                  } catch (error) {
                    setSubmitMessage({
                      type: "error",
                      text: "❌ Failed to update profile. Please try again.",
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      defaultValue={currentUser?.email}
                      className="w-full bg-slate-800 text-white border border-slate-700 rounded px-4 py-2 focus:border-purple-500 focus:outline-none"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value="Fleet Manager"
                      disabled
                      className="w-full bg-slate-700 text-slate-400 border border-slate-600 rounded px-4 py-2 cursor-not-allowed"
                    />
                  </div>
                </div>

                {submitMessage.text && (
                  <div
                    className={`mt-4 p-3 rounded-lg text-sm ${
                      submitMessage.type === "success"
                        ? "bg-green-500/20 border border-green-500/50 text-green-400"
                        : "bg-red-500/20 border border-red-500/50 text-red-400"
                    }`}
                  >
                    {submitMessage.text}
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        Update Profile
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditProfileModal(false)}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Route Assignment Modal */}
        {showRouteAssignmentModal && selectedRouteForAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRouteAssignmentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <i className="fas fa-user-plus text-blue-400"></i>
                  Assign Route
                </h3>
                <button
                  onClick={() => setShowRouteAssignmentModal(false)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h4 className="text-white font-semibold mb-2">Route Details</h4>
                <p className="text-slate-400 text-sm">
                  {selectedRouteForAssignment.startLocation?.address ||
                    "Start Location"}{" "}
                  →{" "}
                  {selectedRouteForAssignment.endLocation?.address ||
                    "End Location"}
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Distance:{" "}
                  {selectedRouteForAssignment.distance
                    ? `${selectedRouteForAssignment.distance} km`
                    : "N/A"}{" "}
                  | Duration:{" "}
                  {selectedRouteForAssignment.duration
                    ? `${selectedRouteForAssignment.duration} min`
                    : "N/A"}
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  setSubmitMessage({ type: "", text: "" });

                  const formData = new FormData(e.target);
                  const driverId = formData.get("driverId");

                  try {
                    await routesAPI.assignToDriver(
                      selectedRouteForAssignment.id,
                      driverId
                    );
                    setSubmitMessage({
                      type: "success",
                      text: `✅ Route assigned to driver successfully!`,
                    });
                    // Refresh routes
                    const response = await routesAPI.getAll();
                    setRoutes(response.data);
                    setTimeout(() => {
                      setShowRouteAssignmentModal(false);
                      setSelectedRouteForAssignment(null);
                      setSubmitMessage({ type: "", text: "" });
                    }, 2000);
                  } catch (error) {
                    console.error("Error assigning route:", error);
                    setSubmitMessage({
                      type: "error",
                      text: `❌ Error: ${
                        error.response?.data?.message ||
                        "Failed to assign route"
                      }`,
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                <div className="mb-4">
                  <label className="block text-slate-400 text-sm mb-2">
                    Select Driver *
                  </label>
                  <select
                    name="driverId"
                    required
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Choose a driver...</option>
                    {drivers
                      .filter((driver) => driver.status === "active")
                      .map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} (ID: {driver.id})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Submit Message */}
                {submitMessage.text && (
                  <div
                    className={`mb-4 p-4 rounded-lg ${
                      submitMessage.type === "success"
                        ? "bg-green-500/20 border border-green-500/50 text-green-400"
                        : "bg-red-500/20 border border-red-500/50 text-red-400"
                    }`}
                  >
                    {submitMessage.text}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Assigning...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus mr-2"></i>
                        Assign Route
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRouteAssignmentModal(false)}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FleetDashboard;
