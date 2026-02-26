import React, { createContext, useState, useContext, useEffect } from "react";
import { vehiclesAPI, driversAPI } from "../services/api";

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (token) {
        console.log("Loading NeuroFleetX data...");
        const [vehiclesRes, driversRes] = await Promise.all([
          vehiclesAPI.getAll().catch(() => ({ data: { data: [] } })),
          driversAPI.getAll().catch(() => ({ data: { data: [] } })),
        ]);

        setVehicles(vehiclesRes.data.data || []);
        setDrivers(driversRes.data.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      loadData();
    }
  }, []);

  const addVehicle = async (vehicle) => {
    try {
      await vehiclesAPI.create(vehicle);
      await loadData();
    } catch (error) {
      console.error("Error adding vehicle:", error);
      throw error;
    }
  };

  const updateVehicle = async (id, data) => {
    try {
      await vehiclesAPI.update(id, data);
      await loadData();
    } catch (error) {
      console.error("Error updating vehicle:", error);
      throw error;
    }
  };

  const deleteVehicle = async (id) => {
    try {
      await vehiclesAPI.delete(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      throw error;
    }
  };

  const addDriver = async (driver) => {
    try {
      await driversAPI.create(driver);
      await loadData();
    } catch (error) {
      console.error("Error adding driver:", error);
      throw error;
    }
  };

  const updateDriver = async (id, data) => {
    try {
      await driversAPI.update(id, data);
      await loadData();
    } catch (error) {
      console.error("Error updating driver:", error);
      throw error;
    }
  };

  const deleteDriver = async (id) => {
    try {
      await driversAPI.delete(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting driver:", error);
      throw error;
    }
  };

  const value = {
    vehicles,
    drivers,
    loading,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addDriver,
    updateDriver,
    deleteDriver,
    loadData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
