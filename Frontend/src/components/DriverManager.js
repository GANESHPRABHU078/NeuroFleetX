import React, { useState, useEffect } from "react";
import { driversAPI } from "../services/neurofleetx-api";

const DriverManager = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    license_number: "",
    phone: "",
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch all drivers
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await driversAPI.getAll();
      setDrivers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      alert("Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await driversAPI.update(editingId, formData);
        alert("Driver updated successfully!");
      } else {
        await driversAPI.create(formData);
        alert("Driver added successfully!");
      }
      setFormData({ name: "", license_number: "", phone: "" });
      setEditingId(null);
      fetchDrivers();
    } catch (error) {
      console.error("Error saving driver:", error);
      alert("Failed to save driver");
    }
  };

  // Handle edit
  const handleEdit = (driver) => {
    setFormData({
      name: driver.name,
      license_number: driver.license_number,
      phone: driver.phone,
    });
    setEditingId(driver.id);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      try {
        await driversAPI.delete(id);
        alert("Driver deleted successfully!");
        fetchDrivers();
      } catch (error) {
        console.error("Error deleting driver:", error);
        alert("Failed to delete driver");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Driver Management</h1>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Driver" : "Add New Driver"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                License Number
              </label>
              <input
                type="text"
                value={formData.license_number}
                onChange={(e) =>
                  setFormData({ ...formData, license_number: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingId ? "Update Driver" : "Add Driver"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: "", license_number: "", phone: "" });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Driver List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Driver List</h2>
        {loading ? (
          <p>Loading drivers...</p>
        ) : drivers.length === 0 ? (
          <p>No drivers found. Add your first driver above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">License Number</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Created At</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{driver.id}</td>
                    <td className="px-4 py-2">{driver.name}</td>
                    <td className="px-4 py-2">{driver.license_number}</td>
                    <td className="px-4 py-2">{driver.phone}</td>
                    <td className="px-4 py-2">
                      {new Date(driver.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEdit(driver)}
                        className="px-3 py-1 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(driver.id)}
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

export default DriverManager;
