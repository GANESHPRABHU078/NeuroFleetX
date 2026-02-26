import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import { CardSpotlight } from "../components/ui/CardEffects";
import { motion } from "framer-motion";
import { routesAPI } from "../services/api";
import { format } from "date-fns";

const DriverRoutes = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [filter, setFilter] = useState("all"); // all, pending, active, completed
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        if (userData.id) {
          const response = await routesAPI.getByDriver(userData.id);
          const routesData = response.data?.data || response.data || [];
          setRoutes(routesData);
        }
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = routes.filter((route) => {
    if (filter === "all") return true;
    // Map backend statuses to frontend filters
    if (filter === "pending") return route.status === "assigned";
    if (filter === "active") return route.status === "in_progress";
    return route.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "assigned":
        return "bg-yellow-600/30 text-yellow-400 border-yellow-600/50";
      case "in_progress":
        return "bg-green-600/30 text-green-400 border-green-600/50";
      case "completed":
        return "bg-blue-600/30 text-blue-400 border-blue-600/50";
      case "cancelled":
        return "bg-red-600/30 text-red-400 border-red-600/50";
      default:
        return "bg-gray-600/30 text-gray-400 border-gray-600/50";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "assigned":
        return "Pending";
      case "in_progress":
        return "Active";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status || "Unknown";
    }
  };

  const handleStartRoute = async (routeId) => {
    try {
      await routesAPI.startTrip(routeId);
      fetchRoutes();
      alert("Route started successfully!");
    } catch (error) {
      console.error("Error starting route:", error);
      alert("Failed to start route. Please try again.");
    }
  };

  const handleCompleteRoute = async (routeId) => {
    try {
      await routesAPI.endTrip(routeId);
      fetchRoutes();
      alert("Route completed successfully!");
    } catch (error) {
      console.error("Error completing route:", error);
      alert("Failed to complete route. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="landing-page bg-slate-950 min-h-screen">
        <Particles />
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-2xl">Loading routes...</div>
        </div>
      </div>
    );
  }

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
              My Routes
            </h1>
            <p className="text-slate-400">
              View and manage your assigned routes
            </p>
          </div>
          <button
            onClick={() => navigate("/driver-dashboard")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
        </motion.header>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-4 mb-6 overflow-x-auto"
        >
          {["all", "pending", "active", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                filter === status
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-2 px-2 py-1 text-xs rounded bg-slate-900">
                {
                  routes.filter((r) => status === "all" || r.status === status)
                    .length
                }
              </span>
            </button>
          ))}
        </motion.div>

        {/* Routes List */}
        {filteredRoutes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardSpotlight>
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No Routes Found
                </h3>
                <p className="text-slate-400">
                  {filter === "all"
                    ? "You don't have any routes assigned yet."
                    : `No ${filter} routes at the moment.`}
                </p>
              </div>
            </CardSpotlight>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoutes.map((route, index) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CardSpotlight className="h-full">
                  <div className="p-6 flex flex-col h-full">
                    {/* Route Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">
                          Route #{route.id?.slice(-6) || "N/A"}
                        </h3>
                        <span
                          className={`inline-block px-3 py-1 rounded text-xs font-medium border ${getStatusColor(
                            route.status
                          )}`}
                        >
                          {getStatusLabel(route.status)}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedRoute(route)}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <i className="fas fa-eye text-xl"></i>
                      </button>
                    </div>

                    {/* Route Details */}
                    <div className="space-y-3 flex-1">
                      <div className="bg-slate-800/30 p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                          <i className="fas fa-map-marker-alt text-green-400 mt-1"></i>
                          <div className="flex-1">
                            <p className="text-xs text-slate-400">Start</p>
                            <p className="text-sm text-white">
                              {route.startLocationName || "Start Location"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-800/30 p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                          <i className="fas fa-map-marker-alt text-red-400 mt-1"></i>
                          <div className="flex-1">
                            <p className="text-xs text-slate-400">
                              Destination
                            </p>
                            <p className="text-sm text-white">
                              {route.endLocationName || "End Location"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {route.distance && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <i className="fas fa-road"></i>
                          <span className="text-sm">
                            Distance: {route.distance} km
                          </span>
                        </div>
                      )}

                      {route.estimatedDuration && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <i className="fas fa-clock"></i>
                          <span className="text-sm">
                            Duration: {route.estimatedDuration} min
                          </span>
                        </div>
                      )}

                      {route.scheduledTime && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <i className="fas fa-calendar"></i>
                          <span className="text-sm">
                            {format(
                              new Date(route.scheduledTime),
                              "MMM dd, yyyy HH:mm"
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 space-y-2">
                      {route.status === "assigned" && (
                        <button
                          onClick={() => handleStartRoute(route.id)}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg transition-all font-semibold"
                        >
                          <i className="fas fa-play mr-2"></i>
                          Start Route
                        </button>
                      )}

                      {route.status === "in_progress" && (
                        <button
                          onClick={() => handleCompleteRoute(route.id)}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg transition-all font-semibold"
                        >
                          <i className="fas fa-check mr-2"></i>
                          Complete Route
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedRoute(route)}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-all"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </CardSpotlight>
              </motion.div>
            ))}
          </div>
        )}

        {/* Route Details Modal */}
        {selectedRoute && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedRoute(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Route Details
                    </h2>
                    <span
                      className={`inline-block px-3 py-1 rounded text-xs font-medium border ${getStatusColor(
                        selectedRoute.status
                      )}`}
                    >
                      {getStatusLabel(selectedRoute.status)}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedRoute(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <i className="fas fa-times text-2xl"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Location Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">
                          Start Location
                        </p>
                        <p className="text-white">
                          {selectedRoute.startLocationName}
                        </p>
                        <p className="text-sm text-slate-400">
                          Lat: {selectedRoute.startLatitude}, Lng:{" "}
                          {selectedRoute.startLongitude}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">
                          End Location
                        </p>
                        <p className="text-white">
                          {selectedRoute.endLocationName}
                        </p>
                        <p className="text-sm text-slate-400">
                          Lat: {selectedRoute.endLatitude}, Lng:{" "}
                          {selectedRoute.endLongitude}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedRoute.description && (
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Description
                      </h3>
                      <p className="text-slate-300">
                        {selectedRoute.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {selectedRoute.distance && (
                      <div className="bg-slate-800/50 p-4 rounded-lg">
                        <p className="text-sm text-slate-400 mb-1">Distance</p>
                        <p className="text-xl font-bold text-white">
                          {selectedRoute.distance} km
                        </p>
                      </div>
                    )}
                    {selectedRoute.estimatedDuration && (
                      <div className="bg-slate-800/50 p-4 rounded-lg">
                        <p className="text-sm text-slate-400 mb-1">Duration</p>
                        <p className="text-xl font-bold text-white">
                          {selectedRoute.estimatedDuration} min
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    {selectedRoute.status === "pending" && (
                      <button
                        onClick={() => {
                          handleStartRoute(selectedRoute.id);
                          setSelectedRoute(null);
                        }}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg transition-all font-semibold"
                      >
                        Start Route
                      </button>
                    )}
                    {selectedRoute.status === "active" && (
                      <button
                        onClick={() => {
                          handleCompleteRoute(selectedRoute.id);
                          setSelectedRoute(null);
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg transition-all font-semibold"
                      >
                        Complete Route
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedRoute(null)}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DriverRoutes;
