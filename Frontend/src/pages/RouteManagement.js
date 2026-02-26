import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import { CardSpotlight } from "../components/ui/CardEffects";
import { motion } from "framer-motion";
import { routesAPI, driversAPI } from "../services/api";

const RouteManagement = () => {
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [newRoute, setNewRoute] = useState({
    driverId: "",
    driverName: "",
    startLocationName: "",
    endLocationName: "",
    distance: "",
    estimatedDuration: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [routesRes, driversRes] = await Promise.all([
        routesAPI.getAll(),
        driversAPI.getAll(),
      ]);

      console.log("Routes response:", routesRes);
      console.log("Drivers response:", driversRes);

      const routesData = routesRes.data?.data || routesRes.data || [];
      const driversData = driversRes.data?.data || driversRes.data || [];

      console.log("Parsed routes:", routesData);
      console.log("Parsed drivers:", driversData);

      setRoutes(routesData);
      setDrivers(driversData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes =
    selectedDriver === "all"
      ? routes
      : routes.filter((r) => r.driverId === selectedDriver);

  const getStatusColor = (status) => {
    switch (status) {
      case "assigned":
        return "bg-yellow-600";
      case "in_progress":
        return "bg-green-600";
      case "completed":
        return "bg-blue-600";
      case "cancelled":
        return "bg-red-600";
      default:
        return "bg-slate-600";
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
        return status;
    }
  };

  const handleCreateRoute = () => {
    setNewRoute({
      driverId: "",
      driverName: "",
      driverUsername: "",
      startLocationName: "",
      endLocationName: "",
      distance: "",
      estimatedDuration: "",
      notes: "",
    });
    setShowCreateModal(true);
  };

  const handleDriverSelect = (e) => {
    const driverId = e.target.value;
    const driver = drivers.find((d) => d.id === driverId);
    setNewRoute({
      ...newRoute,
      driverId,
      driverName: driver ? driver.name || driver.username : "",
      driverUsername: driver ? driver.username : "",
    });
  };

  const handleSubmitRoute = async (e) => {
    e.preventDefault();

    if (
      !newRoute.driverId ||
      !newRoute.startLocationName ||
      !newRoute.endLocationName
    ) {
      alert(
        "Please fill in all required fields (Driver, Start Location, End Location)"
      );
      return;
    }

    try {
      setCreateLoading(true);

      const routeData = {
        driverId: newRoute.driverId,
        driverName: newRoute.driverName,
        driverUsername: newRoute.driverUsername,
        startLocationName: newRoute.startLocationName,
        endLocationName: newRoute.endLocationName,
        distance: newRoute.distance ? parseFloat(newRoute.distance) : 0,
        estimatedDuration: newRoute.estimatedDuration
          ? parseInt(newRoute.estimatedDuration)
          : 0,
        notes: newRoute.notes,
        createdByUsername: localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user")).username
          : "fleet_manager",
      };

      console.log("Creating route with data:", routeData);
      const response = await routesAPI.create(routeData);
      console.log("Route creation response:", response);

      alert("Route created and assigned successfully!");
      setShowCreateModal(false);
      await fetchData(); // Ensure we wait for the fetch to complete
    } catch (error) {
      console.error("Error creating route:", error);
      alert(error.response?.data?.message || "Failed to create route");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteRoute = async (routeId) => {
    if (!window.confirm("Are you sure you want to delete this route?")) {
      return;
    }

    try {
      await routesAPI.delete(routeId);
      alert("Route deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Error deleting route:", error);
      alert("Failed to delete route");
    }
  };

  const getDriverRoutesCount = (driverId) => {
    return routes.filter(
      (r) => r.driverId === driverId && r.status !== "completed"
    ).length;
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
              Route Management
            </h1>
            <p className="text-slate-400">
              Create and manage routes for all drivers
            </p>
          </div>
          <button
            onClick={handleCreateRoute}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all font-semibold flex items-center gap-2"
          >
            <span className="text-xl">+</span> Create New Route
          </button>
        </motion.header>

        {/* Driver Filter and Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Filter by Driver
          </label>
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="w-full md:w-64 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Drivers ({routes.length} routes)</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name || driver.username} (
                {getDriverRoutesCount(driver.id)} active)
              </option>
            ))}
          </select>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <CardSpotlight>
            <div className="p-4 text-center">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text mb-1">
                {routes.length}
              </div>
              <div className="text-slate-400 text-sm">Total Routes</div>
            </div>
          </CardSpotlight>

          <CardSpotlight>
            <div className="p-4 text-center">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text mb-1">
                {routes.filter((r) => r.status === "assigned").length}
              </div>
              <div className="text-slate-400 text-sm">Pending</div>
            </div>
          </CardSpotlight>

          <CardSpotlight>
            <div className="p-4 text-center">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text mb-1">
                {routes.filter((r) => r.status === "in_progress").length}
              </div>
              <div className="text-slate-400 text-sm">Active</div>
            </div>
          </CardSpotlight>

          <CardSpotlight>
            <div className="p-4 text-center">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text mb-1">
                {routes.filter((r) => r.status === "completed").length}
              </div>
              <div className="text-slate-400 text-sm">Completed</div>
            </div>
          </CardSpotlight>
        </motion.div>

        {/* Routes List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {filteredRoutes.length === 0 ? (
            <CardSpotlight>
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No Routes Found
                </h3>
                <p className="text-slate-400 mb-6">
                  {selectedDriver === "all"
                    ? "Create your first route to get started"
                    : "No routes assigned to this driver"}
                </p>
                <button
                  onClick={handleCreateRoute}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all font-semibold"
                >
                  Create Route
                </button>
              </div>
            </CardSpotlight>
          ) : (
            filteredRoutes.map((route, index) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <CardSpotlight>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          Route #{route.id?.slice(-8)}
                        </h3>
                        <p className="text-sm text-slate-400">
                          Driver: {route.driverName}
                        </p>
                        {route.createdAt && (
                          <p className="text-xs text-slate-500">
                            Created:{" "}
                            {new Date(route.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded text-xs font-medium text-white ${getStatusColor(
                          route.status
                        )}`}
                      >
                        {getStatusLabel(route.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <p className="text-xs text-slate-400 mb-1">
                          📍 Start Location
                        </p>
                        <p className="text-white font-semibold">
                          {route.startLocationName}
                        </p>
                        {route.startLatitude && route.startLongitude && (
                          <p className="text-xs text-slate-500 mt-1">
                            {route.startLatitude}, {route.startLongitude}
                          </p>
                        )}
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <p className="text-xs text-slate-400 mb-1">
                          🎯 End Location
                        </p>
                        <p className="text-white font-semibold">
                          {route.endLocationName}
                        </p>
                        {route.endLatitude && route.endLongitude && (
                          <p className="text-xs text-slate-500 mt-1">
                            {route.endLatitude}, {route.endLongitude}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      {route.distance > 0 && (
                        <div>
                          <p className="text-slate-400">Distance</p>
                          <p className="text-white">{route.distance} km</p>
                        </div>
                      )}
                      {route.estimatedDuration > 0 && (
                        <div>
                          <p className="text-slate-400">Est. Duration</p>
                          <p className="text-white">
                            {route.estimatedDuration} min
                          </p>
                        </div>
                      )}
                      {route.startedAt && (
                        <div>
                          <p className="text-slate-400">Started At</p>
                          <p className="text-white">
                            {new Date(route.startedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {route.completedAt && (
                        <div>
                          <p className="text-slate-400">Completed At</p>
                          <p className="text-white">
                            {new Date(route.completedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {route.notes && (
                      <div className="bg-slate-800/50 p-3 rounded-lg mb-4">
                        <p className="text-xs text-slate-400 mb-1">Notes</p>
                        <p className="text-white text-sm">{route.notes}</p>
                      </div>
                    )}

                    {route.status === "assigned" && (
                      <button
                        onClick={() => handleDeleteRoute(route.id)}
                        className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 px-4 py-2 rounded-lg transition-all font-semibold"
                      >
                        Delete Route
                      </button>
                    )}
                  </div>
                </CardSpotlight>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Create Route Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Create New Route
              </h2>

              <form onSubmit={handleSubmitRoute} className="space-y-4">
                {/* Driver Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Driver *
                  </label>
                  <select
                    value={newRoute.driverId}
                    onChange={handleDriverSelect}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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

                {/* Start Location */}
                <div className="bg-slate-800/30 p-4 rounded-lg space-y-3">
                  <h3 className="text-lg font-semibold text-white">
                    Start Location
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Location Name *
                    </label>
                    <input
                      type="text"
                      value={newRoute.startLocationName}
                      onChange={(e) =>
                        setNewRoute({
                          ...newRoute,
                          startLocationName: e.target.value,
                        })
                      }
                      required
                      placeholder="e.g., Main Office, 123 Street Name"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* End Location */}
                <div className="bg-slate-800/30 p-4 rounded-lg space-y-3">
                  <h3 className="text-lg font-semibold text-white">
                    End Location
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Location Name *
                    </label>
                    <input
                      type="text"
                      value={newRoute.endLocationName}
                      onChange={(e) =>
                        setNewRoute({
                          ...newRoute,
                          endLocationName: e.target.value,
                        })
                      }
                      required
                      placeholder="e.g., Customer Site, 456 Street Name"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Distance (km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newRoute.distance}
                      onChange={(e) =>
                        setNewRoute({ ...newRoute, distance: e.target.value })
                      }
                      placeholder="e.g., 15.5"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Est. Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={newRoute.estimatedDuration}
                      onChange={(e) =>
                        setNewRoute({
                          ...newRoute,
                          estimatedDuration: e.target.value,
                        })
                      }
                      placeholder="e.g., 30"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={newRoute.notes}
                    onChange={(e) =>
                      setNewRoute({ ...newRoute, notes: e.target.value })
                    }
                    rows="3"
                    placeholder="Additional information about this route..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={createLoading}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-lg transition-all font-semibold disabled:opacity-50"
                  >
                    {createLoading ? "Creating..." : "Create Route"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RouteManagement;
