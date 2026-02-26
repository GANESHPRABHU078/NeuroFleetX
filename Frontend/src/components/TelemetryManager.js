import React, { useState, useEffect } from "react";
import {
  telemetryAPI,
  vehiclesAPI,
  driversAPI,
} from "../services/neurofleetx-api";

const TelemetryManager = () => {
  const [telemetryData, setTelemetryData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    vehicle_id: "",
    driver_id: "",
    latitude: "",
    longitude: "",
    speed: "",
  });

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [telemetryRes, vehiclesRes, driversRes] = await Promise.all([
        telemetryAPI.getAll(),
        vehiclesAPI.getAll(),
        driversAPI.getAll(),
      ]);
      setTelemetryData(telemetryRes.data.data || []);
      setVehicles(vehiclesRes.data.data || []);
      setDrivers(driversRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await telemetryAPI.create(formData);
      alert("Telemetry data added successfully!");
      setFormData({
        vehicle_id: "",
        driver_id: "",
        latitude: "",
        longitude: "",
        speed: "",
      });
      fetchData();
    } catch (error) {
      console.error("Error saving telemetry:", error);
      alert("Failed to save telemetry data");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this telemetry record?")
    ) {
      try {
        await telemetryAPI.delete(id);
        alert("Telemetry deleted successfully!");
        fetchData();
      } catch (error) {
        console.error("Error deleting telemetry:", error);
        alert("Failed to delete telemetry");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Telemetry Management</h1>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Telemetry Data</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vehicle</label>
              <select
                value={formData.vehicle_id}
                onChange={(e) =>
                  setFormData({ ...formData, vehicle_id: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.model} ({vehicle.vin})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Driver</label>
              <select
                value={formData.driver_id}
                onChange={(e) =>
                  setFormData({ ...formData, driver_id: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <input
                type="number"
                step="0.0000001"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder="37.7749295"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.0000001"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder="-122.4194155"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Speed (km/h)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.speed}
                onChange={(e) =>
                  setFormData({ ...formData, speed: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder="45.50"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Telemetry Data
          </button>
        </form>
      </div>

      {/* Telemetry List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Telemetry Records</h2>
        {loading ? (
          <p>Loading telemetry data...</p>
        ) : telemetryData.length === 0 ? (
          <p>No telemetry records found. Add your first record above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Vehicle</th>
                  <th className="px-4 py-2 text-left">Driver</th>
                  <th className="px-4 py-2 text-left">Latitude</th>
                  <th className="px-4 py-2 text-left">Longitude</th>
                  <th className="px-4 py-2 text-left">Speed</th>
                  <th className="px-4 py-2 text-left">Recorded At</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {telemetryData.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{record.id}</td>
                    <td className="px-4 py-2">
                      {record.vehicle_model || "N/A"}
                    </td>
                    <td className="px-4 py-2">{record.driver_name || "N/A"}</td>
                    <td className="px-4 py-2">{record.latitude}</td>
                    <td className="px-4 py-2">{record.longitude}</td>
                    <td className="px-4 py-2">{record.speed} km/h</td>
                    <td className="px-4 py-2">
                      {new Date(record.recorded_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelemetryManager;
