import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import ClaimDetails from "./pages/ClaimDetails";
import Timeline from "./pages/Timeline";
import Compliance from "./pages/Compliance";
import Decision from "./pages/Decision";
import Reports from "./pages/Reports";

function App() {
  return (
    <Routes>
      {/* AUTH */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* DASHBOARD */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* CLAIM FLOW */}
      <Route path="/upload" element={<Upload />} />
      <Route
        path="/claim-details"
        element={<ClaimDetails />}
      />
      <Route
        path="/timeline"
        element={<Timeline />}
      />
      <Route
        path="/compliance"
        element={<Compliance />}
      />
      <Route
        path="/decision"
        element={<Decision />}
      />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
}

export default App;