import { MantineProvider } from "@mantine/core";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import AnimatedRoutes from "./components/AnimatedRoutes";
import { useEffect, useState } from "react";
import { useAuthStore } from "./store/useAuthStore";
import Loading from "./components/loading/Loading";

const AppContent = () => {
  const location = useLocation();
  const { checkAuth, isCheckingAuth } = useAuthStore();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const authRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-otp",
    "/new-password",
  ];

  const protectedRoutes = [
    "/favourites",
    "/settings",
    "/write",
    "/edit/:postId",
  ];

  const isAuthRoute = authRoutes.includes(location.pathname);
  const isProtectedRoute = protectedRoutes.some((route) =>
    location.pathname.startsWith(route.split(":")[0])
  );

  // Check authentication status on mount only if not already checked
  useEffect(() => {
    const verifyAuth = async () => {
      if (isAuthChecked) return; // Skip if already checked
      
      // Set a timeout to prevent indefinite waiting (reduced from 10s to 6s)
      const timeoutId = setTimeout(() => {
        setIsAuthChecked(true);
        setIsInitialLoading(false);
      }, 6000); // 6 second timeout

      try {
        await checkAuth();
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          // Don't wait for profile fetch - do it in background
          useAuthStore.getState().getProfile().catch(console.error);
        }
      } catch (error) {
        console.log("Initial auth check failed:", error);
      } finally {
        clearTimeout(timeoutId);
        setIsAuthChecked(true);
        setIsInitialLoading(false);
      }
    };
    verifyAuth();
  }, [checkAuth]);

  // Track the last visited non-auth page
  useEffect(() => {
    if (!isAuthRoute && isAuthChecked) {
      localStorage.setItem("lastVisitedPage", location.pathname);
    }
  }, [location.pathname, isAuthRoute, isAuthChecked]);

  // Show loading during initial auth check
  if (isInitialLoading) {
    return <Loading />;
  }

  // Show loading only for protected routes during checkAuth
  if (isCheckingAuth && isProtectedRoute) {
    return <Loading />;
  }

  return (
    <div className="App">
      {!isAuthRoute && <Navbar />}
      <AnimatedRoutes />
      {!isAuthRoute && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <MantineProvider>
      <Router>
        <AppContent />
      </Router>
    </MantineProvider>
  );
};

export default App;
