import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import { CardSpotlight } from "../components/ui/CardEffects";
import { motion } from "framer-motion";
import { driversAPI } from "../services/api";

const DriverProfile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [profileData, setProfileData] = useState({
    id: "",
    name: "",
    username: "",
    email: "",
    phone: "",
    licenseNumber: "",
    status: "active",
    rating: 5.0,
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        if (userData.id) {
          const response = await driversAPI.getById(userData.id);
          const driverData = response.data?.data || response.data;
          setProfileData({
            id: driverData.id || "",
            name: driverData.name || "",
            username: driverData.username || "",
            email: driverData.email || "",
            phone: driverData.phone || "",
            licenseNumber: driverData.licenseNumber || "",
            status: driverData.status || "active",
            rating: driverData.rating || 5.0,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({
        type: "error",
        text: "Failed to load profile data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await driversAPI.update(profileData.id, profileData);

      // Update local storage
      const updatedUser = {
        ...currentUser,
        ...profileData,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });

      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="landing-page bg-slate-950 min-h-screen">
        <Particles />
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-2xl">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page bg-slate-950 min-h-screen">
      <Particles />
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text mb-2">
              Driver Profile
            </h1>
            <p className="text-slate-400">Manage your personal information</p>
          </div>
          <button
            onClick={() => navigate("/driver-dashboard")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
        </motion.header>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-600/20 border border-green-600 text-green-400"
                : "bg-red-600/20 border border-red-600 text-red-400"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CardSpotlight>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                      required
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={profileData.username}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                      required
                    />
                  </div>

                  {/* License Number */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      License Number
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={profileData.licenseNumber}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      License number cannot be changed
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Status
                    </label>
                    <div className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          profileData.status === "active"
                            ? "bg-green-600/30 text-green-400"
                            : "bg-gray-600/30 text-gray-400"
                        }`}
                      >
                        {profileData.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Driver Rating */}
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Driver Rating
                      </h3>
                      <p className="text-sm text-slate-400">
                        Based on your performance and customer feedback
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-yellow-400">
                        {profileData.rating.toFixed(1)}
                      </span>
                      <span className="text-2xl text-yellow-400">★</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/driver-dashboard")}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </CardSpotlight>
        </motion.div>
      </div>
    </div>
  );
};

export default DriverProfile;
