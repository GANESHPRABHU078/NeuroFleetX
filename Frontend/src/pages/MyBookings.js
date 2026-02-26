import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import { CardSpotlight } from "../components/ui/CardEffects";
import { motion } from "framer-motion";
import { bookingsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const MyBookings = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      if (!currentUser) {
        console.log("No current user, redirecting to login");
        navigate("/customer-login");
        return;
      }

      console.log("Fetching bookings for customer:", currentUser.id);
      const response = await bookingsAPI.getByUser(currentUser.id);
      console.log("MyBookings response:", response);

      const bookingsData = response.data?.data || response.data || [];
      console.log("Parsed bookings data:", bookingsData);

      // Sort by created date (newest first)
      bookingsData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBookings(bookingsData);
      console.log("Bookings set in state:", bookingsData.length, "bookings");
    } catch (error) {
      console.error("Error fetching bookings:", error);
      console.error("Error response:", error.response?.data);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (activeFilter === "all") {
      setFilteredBookings(bookings);
    } else if (activeFilter === "upcoming") {
      const now = new Date();
      setFilteredBookings(
        bookings.filter(
          (b) =>
            new Date(b.startDate) > now &&
            (b.status === "pending" || b.status === "confirmed")
        )
      );
    } else {
      setFilteredBookings(bookings.filter((b) => b.status === activeFilter));
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const response = await bookingsAPI.cancel(bookingId);
      if (response.data.success) {
        alert("Booking cancelled successfully");
        fetchBookings();
        setShowDetailsModal(false);
      } else {
        alert(response.data.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert(error.response?.data?.message || "Failed to cancel booking");
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
        return "bg-slate-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "confirmed":
        return "✓";
      case "active":
        return "🚗";
      case "completed":
        return "✔";
      case "cancelled":
        return "✗";
      default:
        return "📋";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canCancelBooking = (booking) => {
    return booking.status === "pending" || booking.status === "confirmed";
  };

  const BookingDetailsModal = ({ booking, onClose }) => {
    if (!booking) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">Booking Details</h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg">
                <span className="text-slate-400">Status</span>
                <span
                  className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {getStatusIcon(booking.status)} {booking.status.toUpperCase()}
                </span>
              </div>

              {/* Vehicle Info */}
              <div className="bg-slate-800/50 p-4 rounded-lg space-y-3">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Vehicle Name</p>
                    <p className="text-white">{booking.vehicleName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Registration</p>
                    <p className="text-white">{booking.vehicleRegistration}</p>
                  </div>
                </div>
              </div>

              {/* Booking Period */}
              <div className="bg-slate-800/50 p-4 rounded-lg space-y-3">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Booking Period
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Start Date & Time</p>
                    <p className="text-white">
                      {formatDate(booking.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">End Date & Time</p>
                    <p className="text-white">{formatDate(booking.endDate)}</p>
                  </div>
                </div>
              </div>

              {/* Purpose and Locations */}
              <div className="bg-slate-800/50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-slate-400">Purpose</p>
                  <p className="text-white">{booking.purpose}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Pickup Location</p>
                  <p className="text-white">{booking.pickupLocation}</p>
                </div>
                {booking.dropoffLocation && (
                  <div>
                    <p className="text-sm text-slate-400">Dropoff Location</p>
                    <p className="text-white">{booking.dropoffLocation}</p>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <p className="text-sm text-slate-400">Contact Number</p>
                <p className="text-white">{booking.contactNumber}</p>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-400">Additional Notes</p>
                  <p className="text-white">{booking.notes}</p>
                </div>
              )}

              {/* Estimated Cost */}
              {booking.estimatedCost && (
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-400">Estimated Cost</p>
                  <p className="text-white text-xl font-bold">
                    ${booking.estimatedCost}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-slate-800/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Booking Created</span>
                  <span className="text-white">
                    {formatDate(booking.createdAt)}
                  </span>
                </div>
                {booking.updatedAt &&
                  booking.updatedAt !== booking.createdAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Last Updated</span>
                      <span className="text-white">
                        {formatDate(booking.updatedAt)}
                      </span>
                    </div>
                  )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                {canCancelBooking(booking) && (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-all font-semibold"
                  >
                    Cancel Booking
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg transition-all font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="landing-page bg-slate-950 min-h-screen">
        <Particles />
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-2xl">Loading bookings...</div>
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
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text mb-2">
                My Bookings
              </h1>
              <p className="text-slate-400">
                Manage your vehicle bookings and view history
              </p>
            </div>
            <button
              onClick={() => navigate("/book-vehicle")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all font-semibold"
            >
              + New Booking
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "all", label: "All" },
              { key: "upcoming", label: "Upcoming" },
              { key: "pending", label: "Pending" },
              { key: "confirmed", label: "Confirmed" },
              { key: "active", label: "Active" },
              { key: "completed", label: "Completed" },
              { key: "cancelled", label: "Cancelled" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  activeFilter === filter.key
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {filter.label}
                <span className="ml-2 text-xs">
                  (
                  {filter.key === "all"
                    ? bookings.length
                    : filter.key === "upcoming"
                    ? bookings.filter(
                        (b) =>
                          new Date(b.startDate) > new Date() &&
                          (b.status === "pending" || b.status === "confirmed")
                      ).length
                    : bookings.filter((b) => b.status === filter.key).length}
                  )
                </span>
              </button>
            ))}
          </div>
        </motion.header>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardSpotlight>
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No Bookings Found
                </h3>
                <p className="text-slate-400 mb-6">
                  {activeFilter === "all"
                    ? "You haven't made any bookings yet"
                    : `No ${activeFilter} bookings`}
                </p>
                {activeFilter === "all" && (
                  <button
                    onClick={() => navigate("/book-vehicle")}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all font-semibold"
                  >
                    Book Your First Vehicle
                  </button>
                )}
              </div>
            </CardSpotlight>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CardSpotlight className="cursor-pointer h-full">
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {booking.vehicleName}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {booking.vehicleRegistration}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded text-xs font-medium text-white ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusIcon(booking.status)} {booking.status}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1">
                      <div>
                        <p className="text-xs text-slate-400">Start Date</p>
                        <p className="text-sm text-white">
                          {formatDate(booking.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">End Date</p>
                        <p className="text-sm text-white">
                          {formatDate(booking.endDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Purpose</p>
                        <p className="text-sm text-white truncate">
                          {booking.purpose}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">
                          Pickup Location
                        </p>
                        <p className="text-sm text-white truncate">
                          {booking.pickupLocation}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetailsModal(true);
                        }}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-all text-sm font-semibold"
                      >
                        View Details
                      </button>
                      {canCancelBooking(booking) && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all text-sm font-semibold"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </CardSpotlight>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default MyBookings;
