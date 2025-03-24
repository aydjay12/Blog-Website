import React from "react";
import Home from "../pages/Home";
import Blogs from "../pages/Blogs";
import Single from "../pages/Single";
import Write from "../pages/Write";
import Settings from "../pages/Settings";
import Login from "../pages/Login";
import Register from "../pages/Register";
import About from "../pages/About";
import Contact from "../pages/Contact";
import NotFound from "../pages/NotFound";
import { Routes, Route, useLocation, useNavigationType, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ResetPassword from "../pages/ResetPassword";
import OTPVerification from "../pages/OTPVerification";
import NewPassword from "../pages/NewPassword";
import Search from "../pages/Search";
import Edit from "../pages/Edit";
import Privacy from "../pages/Privacy";
import TermsOfService from "../pages/Terms";
import Favourites from "../pages/Favourites";
import Author from "../pages/Author";
import { useAuthStore } from "../store/useAuthStore";
import Loading from "../components/loading/Loading";

// Protected route component for authenticated users
const ProtectedRoute = ({ children, redirectTo = "/login" }) => {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

// Blogger role protected route
const BloggerRoute = ({ children, redirectTo = "/" }) => {
  const { isAuthenticated, user, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return <Loading />;
  }

  if (!isAuthenticated || user?.role !== "blogger") {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

// Redirect if authenticated
const AuthRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  const lastVisitedPage = localStorage.getItem("lastVisitedPage") || "/";

  if (isAuthenticated) {
    return <Navigate to={lastVisitedPage} replace />;
  }

  return children;
};

// Scroll to top on navigation
function ScrollToTopOnMount() {
  const navigationType = useNavigationType();

  React.useLayoutEffect(() => {
    if (navigationType === "PUSH") {
      window.scrollTo(0, 0);
    }
  }, [navigationType]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <ScrollToTopOnMount />
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/about" element={<About />} />
        <Route path="/post/:slug" element={<Single />} /> {/* Updated route */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/search" element={<Search />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/author/:authorName" element={<Author />} />

        {/* Auth routes */}
        <Route
          path="/register"
          element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          }
        />
        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthRoute>
              <ResetPassword />
            </AuthRoute>
          }
        />
        <Route
          path="/new-password"
          element={
            <AuthRoute>
              <NewPassword />
            </AuthRoute>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <AuthRoute>
              <OTPVerification />
            </AuthRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/favourites"
          element={
            <ProtectedRoute>
              <Favourites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Blogger routes */}
        <Route
          path="/write"
          element={
            <BloggerRoute>
              <Write />
            </BloggerRoute>
          }
        />
        <Route
          path="/edit/:slug"
          element={
            <BloggerRoute>
              <Edit />
            </BloggerRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;