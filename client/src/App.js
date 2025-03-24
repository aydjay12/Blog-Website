import { MantineProvider } from "@mantine/core";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import AnimatedRoutes from "./components/AnimatedRoutes";
import { useEffect, useState } from "react"; // Added useState
import { useAuthStore } from "./store/useAuthStore";
import Loading from "./components/loading/Loading";

const AppContent = () => {
  const location = useLocation();
  const { checkAuth, isCheckingAuth } = useAuthStore();
  const [isAuthChecked, setIsAuthChecked] = useState(false); // Track when auth check is done

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

  // Check authentication status on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await checkAuth(); // Check if user is authenticated
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          await useAuthStore.getState().getProfile(); // Fetch profile if authenticated
        }
      } catch (error) {
        console.log("Initial auth check or profile fetch failed:", error);
      } finally {
        setIsAuthChecked(true);
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

  // If still checking auth, don't render anything yet (no flash)
  if (!isAuthChecked) {
    return null; // Brief delay without a loading state for public routes
  }

  // Show loading only for protected routes during checkAuth (shouldn't happen post-initial check)
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