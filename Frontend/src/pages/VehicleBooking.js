import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import { CardSpotlight } from "../components/ui/CardEffects";
import { motion } from "framer-motion";
import { vehiclesAPI, bookingsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const VehicleBooking = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  const [bookingData, setBookingData] = useState({
    startDate: "",
    endDate: "",
    purpose: "",
    pickupLocation: "",
    dropoffLocation: "",
    contactNumber: "",
    notes: "",
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehiclesAPI.getAll();
      const vehiclesData = response.data?.data || response.data || [];
      setVehicles(vehiclesData);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowBookingForm(true);
    setAvailabilityMessage("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const checkAvailability = async () => {
    if (!bookingData.startDate || !bookingData.endDate) {
      setAvailabilityMessage("⚠️ Please select start and end dates");
      return;
    }

    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(bookingData.endDate);

    // Validate dates
    if (startDate >= endDate) {
      setAvailabilityMessage("⚠️ End date must be after start date");
      return;
    }

    if (startDate < new Date()) {
      setAvailabilityMessage("⚠️ Start date cannot be in the past");
      return;
    }

    try {
      setCheckingAvailability(true);
      setAvailabilityMessage("");

      const response = await bookingsAPI.checkAvailability({
        vehicleId: selectedVehicle.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      if (response.data.success && response.data.available) {
        setAvailabilityMessage(
          response.data.message || "✓ Vehicle is available for selected dates"
        );
      } else {
        setAvailabilityMessage(
          response.data.message ||
            "✗ Vehicle is not available for selected dates"
        );
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Error checking availability. Please try again.";
      setAvailabilityMessage("❌ " + errorMsg);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedVehicle) {
      alert("Please select a vehicle");
      return;
    }

    if (!currentUser) {
      alert("Please login to book a vehicle");
      navigate("/customer-login");
      return;
    }

    // Validate dates before submitting
    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(bookingData.endDate);

    if (startDate >= endDate) {
      alert("End date must be after start date");
      return;
    }

    if (startDate < new Date()) {
      alert("Start date cannot be in the past");
      return;
    }

    try {
      const booking = {
        userId: currentUser.id,
        userName: currentUser.name || currentUser.username,
        vehicleId: selectedVehicle.id,
        vehicleName: selectedVehicle.name || selectedVehicle.model,
        vehicleRegistration: selectedVehicle.registrationNumber,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        purpose: bookingData.purpose,
        pickupLocation: bookingData.pickupLocation,
        dropoffLocation: bookingData.dropoffLocation,
        contactNumber: bookingData.contactNumber,
        notes: bookingData.notes,
      };

      const response = await bookingsAPI.create(booking);

      if (response.data.success) {
        alert("✓ Booking created successfully!");
        navigate("/my-bookings");
      } else {
        alert(response.data.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create booking. Please try again.";
      alert("❌ " + errorMessage);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-600";
      case "maintenance":
        return "bg-yellow-600";
      case "in_use":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="landing-page bg-slate-950 min-h-screen">
        <Particles />
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-2xl">Loading vehicles...</div>
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
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text mb-2">
            Book a Vehicle
          </h1>
          <p className="text-slate-400">
            Select a vehicle and choose your booking dates
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vehicle Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Available Vehicles
            </h2>
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
              {vehicles.length === 0 ? (
                <CardSpotlight>
                  <div className="p-6 text-center">
                    <p className="text-slate-400">No vehicles available</p>
                  </div>
                </CardSpotlight>
              ) : (
                vehicles.map((vehicle) => (
                  <CardSpotlight
                    key={vehicle.id}
                    className={`transition-all ${
                      selectedVehicle?.id === vehicle.id
                        ? "ring-2 ring-purple-500"
                        : ""
                    }`}
                  >
                    <div
                      className="p-6 cursor-pointer"
                      onClick={() => handleVehicleSelect(vehicle)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            {vehicle.name || vehicle.model}
                          </h3>
                          <p className="text-sm text-slate-400">
                            {vehicle.registrationNumber}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded text-xs font-medium text-white ${getStatusColor(
                            vehicle.status
                          )}`}
                        >
                          {vehicle.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Type</p>
                          <p className="text-white">{vehicle.type || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Capacity</p>
                          <p className="text-white">
                            {vehicle.capacity || "N/A"} seats
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Fuel Type</p>
                          <p className="text-white">
                            {vehicle.fuelType || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Year</p>
                          <p className="text-white">{vehicle.year || "N/A"}</p>
                        </div>
                      </div>

                      {vehicle.status === "available" && (
                        <button
                          type="button"
                          className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all font-semibold"
                        >
                          Select Vehicle
                        </button>
                      )}
                    </div>
                  </CardSpotlight>
                ))
              )}
            </div>
          </motion.div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Booking Details
            </h2>
            {!showBookingForm ? (
              <CardSpotlight>
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">🚗</div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Select a Vehicle
                  </h3>
                  <p className="text-slate-400">
                    Choose a vehicle from the list to start booking
                  </p>
                </div>
              </CardSpotlight>
            ) : (
              <CardSpotlight>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="bg-slate-800/50 p-4 rounded-lg mb-6">
                    <h4 className="text-white font-semibold mb-2">
                      Selected Vehicle
                    </h4>
                    <p className="text-slate-300">
                      {selectedVehicle.name || selectedVehicle.model}
                    </p>
                    <p className="text-sm text-slate-400">
                      {selectedVehicle.registrationNumber}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Start Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="startDate"
                        value={bookingData.startDate}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        End Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="endDate"
                        value={bookingData.endDate}
                        onChange={handleInputChange}
                        required
                        min={
                          bookingData.startDate ||
                          new Date().toISOString().slice(0, 16)
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={checkAvailability}
                    disabled={checkingAvailability}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all font-semibold disabled:opacity-50"
                  >
                    {checkingAvailability
                      ? "Checking..."
                      : "Check Availability"}
                  </button>

                  {availabilityMessage && (
                    <div
                      className={`p-3 rounded-lg text-sm ${
                        availabilityMessage.includes("✓")
                          ? "bg-green-600/20 text-green-400"
                          : "bg-red-600/20 text-red-400"
                      }`}
                    >
                      {availabilityMessage}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Purpose *
                    </label>
                    <input
                      type="text"
                      name="purpose"
                      value={bookingData.purpose}
                      onChange={handleInputChange}
                      required
                      placeholder="Business trip, delivery, etc."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Pickup Location *
                    </label>
                    <input
                      type="text"
                      name="pickupLocation"
                      value={bookingData.pickupLocation}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter pickup address"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Dropoff Location
                    </label>
                    <input
                      type="text"
                      name="dropoffLocation"
                      value={bookingData.dropoffLocation}
                      onChange={handleInputChange}
                      placeholder="Enter dropoff address"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={bookingData.contactNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="Your contact number"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={bookingData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Any special requirements or notes"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBookingForm(false);
                        setSelectedVehicle(null);
                        setBookingData({
                          startDate: "",
                          endDate: "",
                          purpose: "",
                          pickupLocation: "",
                          dropoffLocation: "",
                          contactNumber: "",
                          notes: "",
                        });
                        setAvailabilityMessage("");
                      }}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg transition-all font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-lg transition-all font-semibold"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </form>
              </CardSpotlight>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VehicleBooking;
