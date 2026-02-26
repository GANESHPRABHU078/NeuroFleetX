import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import { CardSpotlight } from "../components/ui/CardEffects";
import { motion } from "framer-motion";
import { bookingsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    upcoming: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate("/customer-login");
      return;
    }

    setCustomer(currentUser);
    fetchBookingData(currentUser.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchBookingData = async (customerId) => {
    try {
      console.log("Fetching bookings for customer ID:", customerId);
      const response = await bookingsAPI.getByUser(customerId);
      console.log("Booking response:", response);

      const bookings = response.data?.data || response.data || [];
      console.log("Parsed bookings:", bookings);

      // Calculate stats
      const now = new Date();
      const stats = {
        total: bookings.length,
        active: bookings.filter((b) => b.status === "active").length,
        completed: bookings.filter((b) => b.status === "completed").length,
        upcoming: bookings.filter(
          (b) =>
            new Date(b.startDate) > now &&
            (b.status === "pending" || b.status === "confirmed")
        ).length,
      };

      setBookingStats(stats);

      // Get recent bookings (last 5)
      const sorted = bookings
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentBookings(sorted);
      console.log("Recent bookings set:", sorted);
    } catch (error) {
      console.error("Error fetching booking data:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/customer-login");
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
      <Navbar showLinks={false} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text mb-2">
              Welcome back, {customer?.name}!
            </h1>
            <p className="text-slate-400">
              Manage your vehicle bookings and reservations
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all font-semibold"
          >
            Logout
          </button>
        </motion.header>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/book-vehicle")}
              className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 hover:from-pink-600/30 hover:to-pink-800/30 border border-pink-500/30 rounded-lg p-6 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl group-hover:scale-110 transition-transform">
                  🚗
                </div>
                <div>
                  <div className="text-white font-semibold text-lg">
                    Book a Vehicle
                  </div>
                  <div className="text-slate-400 text-sm">
                    Reserve a vehicle for your trip
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/my-bookings")}
              className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 hover:from-purple-600/30 hover:to-purple-800/30 border border-purple-500/30 rounded-lg p-6 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl group-hover:scale-110 transition-transform">
                  📋
                </div>
                <div>
                  <div className="text-white font-semibold text-lg">
                    My Bookings
                  </div>
                  <div className="text-slate-400 text-sm">
                    View and manage your bookings
                  </div>
                </div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            Booking Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CardSpotlight>
              <div className="p-6 text-center">
                <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text mb-2">
                  {bookingStats.total}
                </div>
                <div className="text-slate-400 text-sm">Total Bookings</div>
              </div>
            </CardSpotlight>

            <CardSpotlight>
              <div className="p-6 text-center">
                <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text mb-2">
                  {bookingStats.active}
                </div>
                <div className="text-slate-400 text-sm">Active</div>
              </div>
            </CardSpotlight>

            <CardSpotlight>
              <div className="p-6 text-center">
                <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text mb-2">
                  {bookingStats.upcoming}
                </div>
                <div className="text-slate-400 text-sm">Upcoming</div>
              </div>
            </CardSpotlight>

            <CardSpotlight>
              <div className="p-6 text-center">
                <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text mb-2">
                  {bookingStats.completed}
                </div>
                <div className="text-slate-400 text-sm">Completed</div>
              </div>
            </CardSpotlight>
          </div>
        </motion.div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              Recent Bookings
            </h2>
            <button
              onClick={() => navigate("/my-bookings")}
              className="text-pink-400 hover:text-pink-300 text-sm font-semibold transition"
            >
              View All →
            </button>
          </div>

          {recentBookings.length === 0 ? (
            <CardSpotlight>
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No Bookings Yet
                </h3>
                <p className="text-slate-400 mb-6">
                  Start by booking your first vehicle
                </p>
                <button
                  onClick={() => navigate("/book-vehicle")}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all font-semibold"
                >
                  Book a Vehicle
                </button>
              </div>
            </CardSpotlight>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <CardSpotlight>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
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
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Start Date</p>
                          <p className="text-white">
                            {formatDate(booking.startDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">End Date</p>
                          <p className="text-white">
                            {formatDate(booking.endDate)}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-400">Purpose</p>
                          <p className="text-white">{booking.purpose}</p>
                        </div>
                      </div>
                    </div>
                  </CardSpotlight>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
