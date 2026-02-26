import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Particles from "../components/Particles";
import { CardSpotlight } from "../components/ui/CardEffects";
import { motion } from "framer-motion";
import Map from "../components/Map";
import { telemetryAPI } from "../services/api";

const DriverTelemetry = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [telemetryData, setTelemetryData] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [liveTracking, setLiveTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    fetchTelemetryData();
    loadSelectedVehicle();
  }, []);

  useEffect(() => {
    if (liveTracking) {
      const interval = setInterval(() => {
        updateLiveLocation();
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveTracking]);

  const loadSelectedVehicle = () => {
    const savedVehicle = localStorage.getItem("selectedVehicle");
    if (savedVehicle) {
      setSelectedVehicle(JSON.parse(savedVehicle));
    }
  };

  const fetchTelemetryData = async () => {
    try {
      setLoading(true);
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        if (userData.id) {
          const response = await telemetryAPI.getByDriver(userData.id);
          const data = response.data?.data || response.data || [];
          setTelemetryData(data);

          // Set current location from latest telemetry
          if (data.length > 0) {
            const latest = data[0];
            setCurrentLocation({
              lat: parseFloat(latest.latitude),
              lng: parseFloat(latest.longitude),
              speed: latest.speed,
              timestamp: latest.timestamp,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching telemetry:", error);
      setTelemetryData([]);
    } finally {
      setLoading(false);
    }
  };

  const updateLiveLocation = () => {
    if (navigator.geolocation && selectedVehicle) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, speed } = position.coords;

          const locationData = {
            vehicleId: selectedVehicle.id,
            driverId: currentUser.id,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            speed: speed ? speed.toString() : "0",
          };

          try {
            await telemetryAPI.updateLocation(locationData);
            setCurrentLocation({
              lat: latitude,
              lng: longitude,
              speed: speed || 0,
              timestamp: new Date(),
            });

            // Refresh telemetry data
            fetchTelemetryData();
          } catch (error) {
            console.error("Error updating location:", error);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleStartTracking = () => {
    if (!selectedVehicle) {
      alert("Please select a vehicle first from the dashboard!");
      return;
    }
    setLiveTracking(true);
    updateLiveLocation();
  };

  const handleStopTracking = () => {
    setLiveTracking(false);
  };

  if (loading) {
    return (
      <div className="landing-page bg-slate-950 min-h-screen">
        <Particles />
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-2xl">Loading telemetry data...</div>
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
              Live Telemetry
            </h1>
            <p className="text-slate-400">
              Track your location and vehicle metrics in real-time
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map View */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <CardSpotlight>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    Current Location
                  </h2>
                  <div className="flex items-center gap-2">
                    {liveTracking && (
                      <span className="flex items-center gap-2 text-green-400 text-sm">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        Live
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-96 bg-slate-800/50 rounded-lg overflow-hidden">
                  {currentLocation ? (
                    <Map
                      center={[currentLocation.lat, currentLocation.lng]}
                      zoom={15}
                      markers={[
                        {
                          position: [currentLocation.lat, currentLocation.lng],
                          popup: `Current Location\nSpeed: ${currentLocation.speed?.toFixed(
                            1
                          )} km/h`,
                        },
                      ]}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <div className="text-center">
                        <i className="fas fa-map-marked-alt text-6xl mb-4"></i>
                        <p>No location data available</p>
                        <p className="text-sm mt-2">
                          Start tracking to see your location
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-3">
                  {!liveTracking ? (
                    <button
                      onClick={handleStartTracking}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg transition-all font-semibold"
                    >
                      <i className="fas fa-play mr-2"></i>
                      Start Live Tracking
                    </button>
                  ) : (
                    <button
                      onClick={handleStopTracking}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg transition-all font-semibold"
                    >
                      <i className="fas fa-stop mr-2"></i>
                      Stop Tracking
                    </button>
                  )}
                  <button
                    onClick={fetchTelemetryData}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                  >
                    <i className="fas fa-sync-alt"></i>
                  </button>
                </div>
              </div>
            </CardSpotlight>
          </motion.div>

          {/* Stats Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Current Stats */}
            <CardSpotlight>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Current Stats
                </h3>
                <div className="space-y-4">
                  <div className="bg-slate-800/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <i className="fas fa-tachometer-alt text-blue-400 text-2xl"></i>
                        <div>
                          <p className="text-xs text-slate-400">Speed</p>
                          <p className="text-2xl font-bold text-white">
                            {currentLocation?.speed?.toFixed(1) || "0"} km/h
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <i className="fas fa-map-marker-alt text-red-400 text-2xl"></i>
                        <div>
                          <p className="text-xs text-slate-400">Position</p>
                          <p className="text-sm font-mono text-white">
                            {currentLocation
                              ? `${currentLocation.lat.toFixed(
                                  4
                                )}, ${currentLocation.lng.toFixed(4)}`
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedVehicle && (
                    <div className="bg-slate-800/30 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <i className="fas fa-car text-purple-400 text-2xl"></i>
                          <div>
                            <p className="text-xs text-slate-400">Vehicle</p>
                            <p className="text-sm font-semibold text-white">
                              {selectedVehicle.model}
                            </p>
                            <p className="text-xs text-slate-400">
                              {selectedVehicle.vin}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-800/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <i className="fas fa-clock text-yellow-400 text-2xl"></i>
                        <div>
                          <p className="text-xs text-slate-400">Last Updated</p>
                          <p className="text-sm text-white">
                            {currentLocation?.timestamp
                              ? new Date(
                                  currentLocation.timestamp
                                ).toLocaleTimeString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardSpotlight>

            {/* Tracking Info */}
            <CardSpotlight>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Tracking Info
                </h3>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-start gap-2">
                    <i className="fas fa-check text-green-400 mt-1"></i>
                    <p>Auto-updates every 30 seconds when tracking is active</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="fas fa-check text-green-400 mt-1"></i>
                    <p>High accuracy GPS with speed monitoring</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="fas fa-check text-green-400 mt-1"></i>
                    <p>Fleet manager can view your real-time location</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="fas fa-info-circle text-blue-400 mt-1"></i>
                    <p>Location data is used for route optimization</p>
                  </div>
                </div>
              </div>
            </CardSpotlight>
          </motion.div>
        </div>

        {/* Telemetry History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6"
        >
          <CardSpotlight>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Telemetry History
              </h2>

              {telemetryData.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <i className="fas fa-history text-6xl mb-4"></i>
                  <p>No telemetry history available</p>
                  <p className="text-sm mt-2">
                    Start tracking to build your history
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-slate-800/50 text-slate-400">
                      <tr>
                        <th className="px-6 py-3">Timestamp</th>
                        <th className="px-6 py-3">Vehicle</th>
                        <th className="px-6 py-3">Location</th>
                        <th className="px-6 py-3">Speed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {telemetryData.slice(0, 10).map((data, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-6 py-4 text-white">
                            {new Date(data.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            {data.vehicleId?.slice(-6) || "N/A"}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-300">
                            {data.latitude}, {data.longitude}
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            {data.speed ? `${data.speed} km/h` : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardSpotlight>
        </motion.div>
      </div>
    </div>
  );
};

export default DriverTelemetry;
