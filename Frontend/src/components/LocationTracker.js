import React, { useState, useEffect, useRef } from "react";
import { telemetryAPI, driversAPI } from "../services/api";

const LocationTracker = ({
  driverId,
  vehicleId,
  updateInterval = 30000,
  enabled = true,
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const watchIdRef = useRef(null);
  const updateTimerRef = useRef(null);

  // Get current position and send to server
  const sendLocationUpdate = React.useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const speed = position.coords.speed
            ? Math.abs(position.coords.speed * 3.6)
            : 0; // Convert m/s to km/h

          const locationData = {
            driverId: driverId,
            vehicleId: vehicleId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            speed: speed,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          };

          setLocationInfo({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            speed: locationData.speed,
            accuracy: position.coords.accuracy,
          });

          // Send to telemetry server
          await telemetryAPI.updateLocation(locationData);

          // Also update driver's live location in the database
          if (driverId) {
            await driversAPI.updateLocation(driverId, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              speed: speed,
              gpsEnabled: true,
            });
          }

          setLastUpdate(new Date());
          setError(null);
          console.log("📍 Location updated:", locationData);
        } catch (err) {
          console.error("Failed to send location update:", err);
          setError("Failed to send location update");
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError(`Location error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  }, [driverId, vehicleId]);

  // Start tracking
  useEffect(() => {
    if (enabled && driverId) {
      setIsTracking(true);

      // Send immediate update
      sendLocationUpdate();

      // Set up periodic updates
      updateTimerRef.current = setInterval(() => {
        sendLocationUpdate();
      }, updateInterval);

      // Watch position for real-time updates
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            setLocationInfo({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              speed: position.coords.speed
                ? Math.abs(position.coords.speed * 3.6)
                : 0,
              accuracy: position.coords.accuracy,
            });
          },
          (err) => {
            console.error("Watch position error:", err);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 5000,
          }
        );
      }
    }

    // Cleanup
    return () => {
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
      }
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      setIsTracking(false);
    };
  }, [enabled, driverId, vehicleId, updateInterval, sendLocationUpdate]);

  // Manual update button
  const handleManualUpdate = () => {
    sendLocationUpdate();
  };

  if (!enabled) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        padding: "15px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(139, 92, 246, 0.3)",
        minWidth: "280px",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: isTracking ? "#4CAF50" : "#9E9E9E",
            animation: isTracking ? "pulse 2s infinite" : "none",
          }}
        />
        <h4
          style={{
            margin: 0,
            color: "#fff",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          GPS Tracking
        </h4>
      </div>

      {locationInfo && (
        <div
          style={{ fontSize: "13px", color: "#cbd5e1", marginBottom: "10px" }}
        >
          <div style={{ marginBottom: "5px" }}>
            <strong>📍 Location:</strong> {locationInfo.lat.toFixed(6)},{" "}
            {locationInfo.lng.toFixed(6)}
          </div>
          <div style={{ marginBottom: "5px" }}>
            <strong>⚡ Speed:</strong> {locationInfo.speed.toFixed(1)} km/h
          </div>
          <div>
            <strong>🎯 Accuracy:</strong> ±{Math.round(locationInfo.accuracy)}m
          </div>
        </div>
      )}

      {lastUpdate && (
        <div
          style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "10px" }}
        >
          Last update: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      {error && (
        <div
          style={{
            fontSize: "12px",
            color: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            padding: "8px",
            borderRadius: "6px",
            marginBottom: "10px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <button
        onClick={handleManualUpdate}
        style={{
          width: "100%",
          padding: "8px",
          backgroundColor: "#8b5cf6",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "500",
          transition: "background-color 0.2s",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#7c3aed")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#8b5cf6")}
      >
        🔄 Update Now
      </button>

      <div
        style={{
          fontSize: "11px",
          color: "#64748b",
          marginTop: "8px",
          textAlign: "center",
        }}
      >
        Auto-updates every {updateInterval / 1000}s
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
            }
            50% {
              opacity: 0.8;
              box-shadow: 0 0 0 6px rgba(76, 175, 80, 0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default LocationTracker;
