import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const customer = localStorage.getItem("customer");
    const customerToken = localStorage.getItem("customerToken");

    if (customerToken && customer) {
      const customerData = JSON.parse(customer);
      setCurrentUser(customerData);
      setUserRole("customer");
    } else if (token && user) {
      const userData = JSON.parse(user);
      setCurrentUser(userData);
      setUserRole(userData.role);
    }
    setLoading(false);
  }, []);

  const loginFleetManager = async (username, fleetId, password) => {
    try {
      const response = await authAPI.fleetLogin({
        username,
        fleetId,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data;

        // Store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setCurrentUser(user);
        setUserRole("fleet_manager");

        return { success: true };
      }
    } catch (error) {
      console.error("Fleet manager login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Invalid credentials",
      };
    }
  };

  const signupFleetManager = async (fleetManagerData) => {
    try {
      const response = await authAPI.fleetSignup(fleetManagerData);

      if (response.data.success) {
        return {
          success: true,
          message: "Signup successful! Please login.",
        };
      }
    } catch (error) {
      console.error("Fleet manager signup error:", error);

      return {
        success: false,
        message:
          error.response?.data?.message || "Signup failed. Please try again.",
      };
    }
  };

  const signupDriver = async (driverData) => {
    try {
      console.log("Signing up driver with data:", driverData);
      const response = await authAPI.driverSignup(driverData);
      console.log("Driver signup response:", response.data);

      if (response.data.success) {
        console.log(
          "Driver signup successful! User ID:",
          response.data.user?.id
        );
        console.log(
          "Driver entity created! Driver ID:",
          response.data.driver?.id
        );
        return {
          success: true,
          message: "Signup successful! Please login.",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Signup failed.",
        };
      }
    } catch (error) {
      console.error("Driver signup error:", error);
      console.error("Error response:", error.response?.data);

      return {
        success: false,
        message:
          error.response?.data?.message || "Signup failed. Please try again.",
      };
    }
  };

  const loginDriver = async (username, licenseNumber, password) => {
    try {
      const response = await authAPI.driverLogin({
        username,
        licenseNumber,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data;

        // Store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setCurrentUser(user);
        setUserRole("driver");

        return { success: true };
      }
    } catch (error) {
      console.error("Driver login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Invalid credentials",
      };
    }
  };

  const loginCustomer = async (credentials) => {
    try {
      const { customersAPI } = await import("../services/api");
      const response = await customersAPI.login(credentials);

      if (response.data.success) {
        const customerData = response.data.data;

        // Store customer data
        localStorage.setItem("customer", JSON.stringify(customerData));
        localStorage.setItem("customerToken", "customer_" + customerData.id);

        setCurrentUser(customerData);
        setUserRole("customer");

        return { success: true };
      }
    } catch (error) {
      console.error("Customer login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Invalid credentials",
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setUserRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("currentFleetManager");
    localStorage.removeItem("currentDriver");
    localStorage.removeItem("customer");
    localStorage.removeItem("customerToken");
  };

  const value = {
    currentUser,
    userRole,
    loading,
    loginFleetManager,
    signupFleetManager,
    signupDriver,
    loginDriver,
    loginCustomer,
    // Aliases for NeuroFleetX domain
    fleetLogin: loginFleetManager,
    fleetSignup: signupFleetManager,
    driverLogin: loginDriver,
    driverSignup: signupDriver,
    customerLogin: loginCustomer,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
