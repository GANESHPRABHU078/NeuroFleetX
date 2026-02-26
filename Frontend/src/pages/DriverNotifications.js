import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import { CardSpotlight } from "../components/ui/CardEffects";
import { motion } from "framer-motion";
import axios from "axios";
import baseUrl from "../services/api-backend-switch";

const DriverNotifications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [notifications] = useState([
    {
      id: 1,
      type: "route",
      title: "New Route Assigned",
      message: "You have been assigned a new route for today",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      icon: "fa-route",
      color: "text-blue-400",
    },
    {
      id: 2,
      type: "alert",
      title: "Maintenance Required",
      message: "Your vehicle requires scheduled maintenance",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: false,
      icon: "fa-wrench",
      color: "text-orange-400",
    },
    {
      id: 3,
      type: "info",
      title: "Profile Updated",
      message: "Your profile information has been successfully updated",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      icon: "fa-user",
      color: "text-green-400",
    },
    {
      id: 4,
      type: "route",
      title: "Route Completed",
      message: "You have successfully completed your assigned route",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true,
      icon: "fa-check-circle",
      color: "text-green-400",
    },
  ]);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        if (userData.id) {
          const response = await axios.get(
            `${baseUrl}/api/notifications/preferences/${userData.id}`
          );
          const prefs = response.data?.data;
          if (prefs) {
            setPreferences({
              emailNotifications: prefs.emailNotifications || false,
              smsNotifications: prefs.smsNotifications || false,
              pushNotifications: prefs.pushNotifications || false,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        await axios.post(`${baseUrl}/api/notifications/preferences`, {
          userId: userData.id,
          ...preferences,
        });

        setMessage({
          type: "success",
          text: "Notification preferences saved successfully!",
        });

        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 3000);
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      setMessage({
        type: "error",
        text: "Failed to save preferences. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
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
              Notifications
            </h1>
            <p className="text-slate-400">
              Manage your notifications and preferences
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            <CardSpotlight>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Recent Notifications
                  </h2>
                  <span className="px-3 py-1 bg-purple-600/30 text-purple-400 rounded-full text-sm">
                    {notifications.filter((n) => !n.read).length} unread
                  </span>
                </div>

                <div className="space-y-3">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`p-4 rounded-lg border transition-all hover:border-purple-500/50 cursor-pointer ${
                        notification.read
                          ? "bg-slate-800/30 border-slate-700"
                          : "bg-slate-800/50 border-purple-500/30"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`text-2xl ${notification.color} flex-shrink-0`}
                        >
                          <i className={`fas ${notification.icon}`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-white font-semibold">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2"></span>
                            )}
                          </div>
                          <p className="text-slate-400 text-sm mb-2">
                            {notification.message}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {getTimeAgo(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {notifications.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <i className="fas fa-bell-slash text-6xl mb-4"></i>
                    <p>No notifications yet</p>
                    <p className="text-sm mt-2">
                      You'll be notified about important updates here
                    </p>
                  </div>
                )}
              </div>
            </CardSpotlight>
          </motion.div>

          {/* Notification Preferences */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <CardSpotlight>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Preferences
                </h2>

                <div className="space-y-4">
                  {/* Email Notifications */}
                  <div className="bg-slate-800/30 p-4 rounded-lg">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <i className="fas fa-envelope text-blue-400 text-xl"></i>
                        <div>
                          <p className="text-white font-medium">
                            Email Notifications
                          </p>
                          <p className="text-xs text-slate-400">
                            Receive updates via email
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={() =>
                          handlePreferenceChange("emailNotifications")
                        }
                        className="w-5 h-5 cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* SMS Notifications */}
                  <div className="bg-slate-800/30 p-4 rounded-lg">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <i className="fas fa-sms text-green-400 text-xl"></i>
                        <div>
                          <p className="text-white font-medium">
                            SMS Notifications
                          </p>
                          <p className="text-xs text-slate-400">
                            Receive updates via SMS
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.smsNotifications}
                        onChange={() =>
                          handlePreferenceChange("smsNotifications")
                        }
                        className="w-5 h-5 cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* Push Notifications */}
                  <div className="bg-slate-800/30 p-4 rounded-lg">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <i className="fas fa-bell text-purple-400 text-xl"></i>
                        <div>
                          <p className="text-white font-medium">
                            Push Notifications
                          </p>
                          <p className="text-xs text-slate-400">
                            Receive browser notifications
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.pushNotifications}
                        onChange={() =>
                          handlePreferenceChange("pushNotifications")
                        }
                        className="w-5 h-5 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </CardSpotlight>

            {/* Quick Stats */}
            <CardSpotlight>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Notification Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <span className="text-slate-400">Total</span>
                    <span className="text-white font-bold">
                      {notifications.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <span className="text-slate-400">Unread</span>
                    <span className="text-purple-400 font-bold">
                      {notifications.filter((n) => !n.read).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <span className="text-slate-400">Today</span>
                    <span className="text-white font-bold">
                      {
                        notifications.filter((n) => {
                          const today = new Date();
                          const notifDate = new Date(n.timestamp);
                          return (
                            today.toDateString() === notifDate.toDateString()
                          );
                        }).length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </CardSpotlight>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DriverNotifications;
