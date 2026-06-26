import { Routes, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./hooks/useAppDispatch";
import { loginSuccess, logout } from "./store/authSlice";
import { useLogout } from "./hooks/useApi";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./components/Login";
import NNListPage from "./pages/NNListPage";
import NNAdmissionPage from "./pages/NNAdmissionPage";
import NNDetailPage from "./pages/NNDetailPage";

export default function App() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => dispatch(logout()),
    });
  };

  if (!currentUser) {
    return <Login onLoginSuccess={(user) => { if (user) dispatch(loginSuccess(user)); }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans select-none antialiased">
      <Header currentUser={currentUser} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 grow flex flex-col gap-6">
        <Routes>
          <Route path="/" element={<NNListPage />} />
          <Route path="/admision" element={<NNAdmissionPage />} />
          <Route path="/nn/:id" element={<NNDetailPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
