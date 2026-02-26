import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { ThemeProvider } from "./context/ThemeContext";

// Pages
import Landing from "./pages/Landing";
import FleetManagerSignup from "./pages/FleetManagerSignup";
import FleetManagerLogin from "./pages/FleetManagerLogin";
import DriverLogin from "./pages/DriverLogin";
import DriverSignup from "./pages/DriverSignup";
import FleetDashboard from "./pages/FleetDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import DriverProfile from "./pages/DriverProfile";
import DriverRoutes from "./pages/DriverRoutes";
import DriverTelemetry from "./pages/DriverTelemetry";
import DriverNotifications from "./pages/DriverNotifications";
import DataManagementDashboard from "./pages/DataManagementDashboard";
import VehicleBooking from "./pages/VehicleBooking";
import MyBookings from "./pages/MyBookings";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerSignup from "./pages/CustomerSignup";
import CustomerDashboard from "./pages/CustomerDashboard";
import RouteAssignment from "./pages/RouteAssignment";
import RouteManagement from "./pages/RouteManagement";

// Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />

              {/* NeuroFleetX routes */}
              <Route path="/fleet-login" element={<FleetManagerLogin />} />
              <Route path="/fleet-signup" element={<FleetManagerSignup />} />
              <Route path="/driver-login" element={<DriverLogin />} />
              <Route path="/driver-signup" element={<DriverSignup />} />

              {/* Customer Auth Routes */}
              <Route path="/customer-login" element={<CustomerLogin />} />
              <Route path="/customer-signup" element={<CustomerSignup />} />

              <Route
                path="/fleet-dashboard"
                element={
                  <ProtectedRoute role="fleet_manager">
                    <FleetDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/route-assignment"
                element={
                  <ProtectedRoute role="fleet_manager">
                    <RouteAssignment />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/route-management"
                element={
                  <ProtectedRoute role="fleet_manager">
                    <RouteManagement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/driver-dashboard"
                element={
                  <ProtectedRoute role="driver">
                    <DriverDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/driver-profile"
                element={
                  <ProtectedRoute role="driver">
                    <DriverProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/driver-routes"
                element={
                  <ProtectedRoute role="driver">
                    <DriverRoutes />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/driver-telemetry"
                element={
                  <ProtectedRoute role="driver">
                    <DriverTelemetry />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/driver-notifications"
                element={
                  <ProtectedRoute role="driver">
                    <DriverNotifications />
                  </ProtectedRoute>
                }
              />

              {/* Customer Dashboard */}
              <Route
                path="/customer-dashboard"
                element={
                  <ProtectedRoute role="customer">
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Vehicle Booking Routes - For Customers */}
              <Route
                path="/book-vehicle"
                element={
                  <ProtectedRoute role="customer">
                    <VehicleBooking />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute role="customer">
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              {/* Public Data Management Dashboard */}
              <Route
                path="/data-management"
                element={<DataManagementDashboard />}
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
