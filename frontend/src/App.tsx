import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "./theme";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Navbar from "./components/Navbar";
import PlatformsPage from "./pages/PlatformsPage";
import TransferWizard from "./pages/TransferWizard";
import AccountPage from "./pages/AccountPage";
import { getUser } from "./services/authService";
import { useAuth } from "./services/AuthContext";
import { ProtectedRoute } from "./services/ProtectedRoute";
import LoadingScreen from "./pages/LoadingScreen";
import CheckTransferPage from "./pages/CheckTransferPage";
import SuccessScreen from "./pages/SuccessScreen";
import AdminPage from "./pages/AdminPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SetNewPasswordPage from "./pages/SetNewPasswordPage"

function App() {
  const { loggedIn, setLoggedIn } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    const theme = localStorage.getItem("theme");
    return theme === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const checkLogin = async () => {
      let logged = true;
      try {
        await getUser();
      } catch (e) {
        logged = false
      }
      setLoggedIn(logged);
    };
    checkLogin();
  }, []);


  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/acasa" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/platforme" element={<PlatformsPage />} />
          <Route path="/transfera" element=
            {<ProtectedRoute isAuthenticated={loggedIn}>
              <TransferWizard />
            </ProtectedRoute>} />
          <Route path="/contul meu" element=
            {<ProtectedRoute isAuthenticated={loggedIn}>
              <AccountPage />
            </ProtectedRoute>} />
          <Route path="/loading" element={<LoadingScreen />} />
          <Route path="/checkout" element=
            {<ProtectedRoute isAuthenticated={loggedIn}>
              <CheckTransferPage />
            </ProtectedRoute>} />
          <Route path="/success" element=
            {<ProtectedRoute isAuthenticated={loggedIn}>
              <SuccessScreen />
            </ProtectedRoute>} />
          <Route path="/admin dashboard" element={<AdminPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/new-password/:token" element={<SetNewPasswordPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
