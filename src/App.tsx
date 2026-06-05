import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { SystemAlert } from "./types";
import { useAppDispatch, useAppSelector } from "./hooks/useAppDispatch";
import { loginSuccess, logout } from "./store/authSlice";
import { useMarkAlertRead } from "./hooks/useApi";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AlertsDrawer from "./components/AlertsDrawer";
import Login from "./components/Login";
import NNListPage from "./pages/NNListPage";
import NNAdmissionPage from "./pages/NNAdmissionPage";
import NNDetailPage from "./pages/NNDetailPage";

export default function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const markAlertMutation = useMarkAlertRead();

  const alerts: SystemAlert[] = [];

  const [showAlertsDrawer, setShowAlertsDrawer] = useState(false);

  const handleMarkAllRead = () => markAlertMutation.mutate("all");
  const handleDismissAlert = (alertId: string) => markAlertMutation.mutate(alertId);

  if (!currentUser) {
    return <Login onLoginSuccess={(user) => { if (user) dispatch(loginSuccess(user)); }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none antialiased">
      <Header
        alerts={alerts}
        onAlertClick={() => setShowAlertsDrawer((prev) => !prev)}
        onMarkAllRead={handleMarkAllRead}
        currentUser={currentUser}
        onLogout={() => dispatch(logout())}
      />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-grow flex flex-col gap-6">
        <Routes>
          <Route path="/" element={<NNListPage />} />
          <Route path="/admision" element={<NNAdmissionPage />} />
          <Route path="/nn/:id" element={<NNDetailPage />} />
        </Routes>
      </main>

      {showAlertsDrawer && (
        <AlertsDrawer
          alerts={alerts}
          onClose={() => setShowAlertsDrawer(false)}
          onMarkAllRead={handleMarkAllRead}
          onDismiss={handleDismissAlert}
          onViewDetail={(nnId) => { navigate(`/nn/${nnId}`); setShowAlertsDrawer(false); }}
        />
      )}

      <Footer />
    </div>
  );
}
