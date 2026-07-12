import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import RolesPermissions from "./pages/RolesPermissions";
import AuditLogs from "./pages/auditlogs";
import ProtectedRoute from "./routes/ProtectedRoute";

import { ToastContainer } from "react-toastify";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/roles-permissions"
          element={
            <ProtectedRoute>
              <RolesPermissions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/auditlogs"
          element={
            <ProtectedRoute>
              <AuditLogs />
            </ProtectedRoute>
          }
        />

      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
      />

    </BrowserRouter>
  );
}

export default App;