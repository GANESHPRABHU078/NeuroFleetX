import React, { useState, useEffect } from "react";
import { vehiclesAPI } from "../services/neurofleetx-api";

const VehicleManager = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    vin: "",
    model: "",
    status: "Active",
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch all vehicles
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehiclesAPI.getAll();
      setVehicles(response.data.data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      alert("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await vehiclesAPI.update(editingId, formData);
        alert("Vehicle updated successfully!");
      } else {
        await vehiclesAPI.create(formData);
        alert("Vehicle added successfully!");
      }
      setFormData({ vin: "", model: "", status: "Active" });
      setEditingId(null);
      fetchVehicles();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      alert("Failed to save vehicle");
    }
  };

  // Handle edit
  const handleEdit = (vehicle) => {
    setFormData({
      vin: vehicle.vin,
      model: vehicle.model,
      status: vehicle.status,
    });
    setEditingId(vehicle.id);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await vehiclesAPI.delete(id);
        alert("Vehicle deleted successfully!");
        fetchVehicles();
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        alert("Failed to delete vehicle");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Vehicle Management</h1>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Vehicle" : "Add New Vehicle"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">VIN</label>
              <input
                type="text"
                value={formData.vin}
                onChange={(e) =>
                  setFormData({ ...formData, vin: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingId ? "Update Vehicle" : "Add Vehicle"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ vin: "", model: "", status: "Active" });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Vehicle List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Vehicle List</h2>
        {loading ? (
          <p>Loading vehicles...</p>
        ) : vehicles.length === 0 ? (
          <p>No vehicles found. Add your first vehicle above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">VIN</th>
                  <th className="px-4 py-2 text-left">Model</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Created At</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{vehicle.id}</td>
                    <td className="px-4 py-2">{vehicle.vin}</td>
                    <td className="px-4 py-2">{vehicle.model}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          vehicle.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : vehicle.status === "Inactive"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(vehicle.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="px-3 py-1 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
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

export default VehicleManager;
