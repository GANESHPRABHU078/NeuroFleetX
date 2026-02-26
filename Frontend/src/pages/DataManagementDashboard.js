import React, { useState } from "react";
import VehicleManager from "../components/VehicleManager";
import DriverManager from "../components/DriverManager";
import TelemetryManager from "../components/TelemetryManager";

const DataManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState("vehicles");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">NeuroFleetX - Data Management</h1>
        <p className="text-sm">
          Manage your fleet vehicles, drivers, and telemetry data
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-4 p-4">
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "vehicles"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🚗 Vehicles
            </button>
            <button
              onClick={() => setActiveTab("drivers")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "drivers"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              👤 Drivers
            </button>
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "telemetry"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📊 Telemetry
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-6">
        {activeTab === "vehicles" && <VehicleManager />}
        {activeTab === "drivers" && <DriverManager />}
        {activeTab === "telemetry" && <TelemetryManager />}
      </div>
    </div>
  );
};

export default DataManagementDashboard;
