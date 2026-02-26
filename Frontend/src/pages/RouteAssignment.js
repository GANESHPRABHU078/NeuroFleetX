import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import { CardSpotlight } from "../components/ui/CardEffects";
import { motion } from "framer-motion";
import { bookingsAPI, driversAPI, routesAPI } from "../services/api";

const RouteAssignment = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, driversRes] = await Promise.all([
        bookingsAPI.getAll(),
        driversAPI.getAll(),
      ]);

      setBookings(bookingsRes.data?.data || bookingsRes.data || []);
      setDrivers(driversRes.data?.data || driversRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = (booking) => {
    setSelectedBooking(booking);
    setSelectedDriver("");
    setShowAssignModal(true);
  };

  const confirmAssignment = async () => {
    if (!selectedDriver) {
      alert("Please select a driver");
      return;
    }

    try {
      setAssignmentLoading(true);
      const driver = drivers.find((d) => d.id === selectedDriver);

      // Get current user from localStorage for createdByUsername
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const createdByUsername =
        currentUser.username || currentUser.name || "fleet-manager";

      // Create a route for this booking with driverUsername
      const routeData = {
        driverId: driver.id,
        driverName: driver.name || driver.username,
        driverUsername: driver.username, // Add driver username for route assignment
        startLocationName: selectedBooking.pickupLocation,
        endLocationName: selectedBooking.dropoffLocation,
        distance: 0, // Can be calculated using a map API
        estimatedDuration: 0,
        notes: `Booking: ${selectedBooking.purpose}`,
        createdByUsername: createdByUsername, // Required by backend
      };

      console.log("Creating route with data:", routeData);
      const routeResponse = await routesAPI.create(routeData);
      const route = routeResponse.data?.data || routeResponse.data;
      console.log("Route created:", route);

      // Assign the driver and route to the booking
      await bookingsAPI.assignDriver(selectedBooking.id, {
        driverId: driver.id,
        driverName: driver.name || driver.username,
        routeId: route.id,
      });

      alert("Driver and route assigned successfully!");
      setShowAssignModal(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error assigning driver:", error);
      alert(
        error.response?.data?.message ||
          "Failed to assign driver. Please try again."
      );
    } finally {
      setAssignmentLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-600";
      case "confirmed":
        return "bg-blue-600";
      case "active":
        return "bg-green-600";
      case "completed":
        return "bg-gray-600";
      case "cancelled":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "unassigned") return !booking.assignedDriverId;
    if (filterStatus === "assigned") return booking.assignedDriverId;
    return booking.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="landing-page bg-slate-950 min-h-screen">
        <Particles />
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-2xl">Loading...</div>
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
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text mb-2">
            Route Assignment
          </h1>
          <p className="text-slate-400">
            Assign drivers and routes to customer bookings
          </p>
        </motion.header>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {[
            { key: "all", label: "All" },
            { key: "unassigned", label: "Unassigned" },
            { key: "assigned", label: "Assigned" },
            { key: "pending", label: "Pending" },
            { key: "confirmed", label: "Confirmed" },
            { key: "active", label: "Active" },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === filter.key
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <CardSpotlight>
              <div className="p-12 text-center">
                <p className="text-slate-400 text-lg">No bookings found</p>
              </div>
            </CardSpotlight>
          ) : (
            filteredBookings.map((booking) => (
              <CardSpotlight key={booking.id}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {booking.userName}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Vehicle: {booking.vehicleName} (
                        {booking.vehicleRegistration})
                      </p>
                      <p className="text-sm text-slate-400">
                        Purpose: {booking.purpose}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-medium text-white ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">
                        📍 Pickup Location
                      </p>
                      <p className="text-white font-semibold">
                        {booking.pickupLocation || "Not specified"}
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">
                        🎯 Destination
                      </p>
                      <p className="text-white font-semibold">
                        {booking.dropoffLocation || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-slate-400">Start Date</p>
                      <p className="text-white">
                        {new Date(booking.startDate).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">End Date</p>
                      <p className="text-white">
                        {new Date(booking.endDate).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {booking.assignedDriverId ? (
                    <div className="bg-green-600/20 border border-green-600/50 p-3 rounded-lg">
                      <p className="text-green-400 text-sm">
                        ✓ Assigned to Driver: {booking.assignedDriverName}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAssignDriver(booking)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg transition-all font-semibold"
                    >
                      Assign Driver & Route
                    </button>
                  )}
                </div>
              </CardSpotlight>
            ))
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Assign Driver to Booking
              </h2>

              <div className="bg-slate-800/50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Booking Details
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-300">
                    <span className="text-slate-400">Customer:</span>{" "}
                    {selectedBooking.userName}
                  </p>
                  <p className="text-slate-300">
                    <span className="text-slate-400">Vehicle:</span>{" "}
                    {selectedBooking.vehicleName}
                  </p>
                  <p className="text-slate-300">
                    <span className="text-slate-400">From:</span>{" "}
                    {selectedBooking.pickupLocation}
                  </p>
                  <p className="text-slate-300">
                    <span className="text-slate-400">To:</span>{" "}
                    {selectedBooking.dropoffLocation}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Driver *
                </label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Select a Driver --</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name || driver.username} - {driver.licenseNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowAssignModal(false)}
                  disabled={assignmentLoading}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAssignment}
                  disabled={assignmentLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg transition-all font-semibold disabled:opacity-50"
                >
                  {assignmentLoading ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RouteAssignment;
