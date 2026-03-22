// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// --- Pages & Layouts ---
import AuthPage from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";
import GenrePreferencesPage from "./pages/GenrePreferencesPage"; // Make sure the filename matches your actual file
import HomeScanner from "./pages/HomeScanner";
import MainLayout from "./layouts/MainLayout";
import ScanResults from "./pages/ScanResults";
import Library from "./pages/Library";
import Profile from "./pages/Profile";

// --- 1. Route Guards ---

// For pages like Login/Register: If already logged in, send them where they belong.
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // Or a subtle loading spinner

  if (user) {
    return user.onboardingDone ? (
      <Navigate to="/home" replace />
    ) : (
      <Navigate to="/onboarding/genres" replace />
    );
  }
  return children;
};

// For Onboarding: Must be logged in, but must NOT have finished onboarding.
const OnboardingGuard = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;
  if (user.onboardingDone) return <Navigate to="/home" replace />;

  return children;
};

// For Main App (Home, Library, etc.): Must be logged in AND finished onboarding.
const MainAppGuard = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;
  if (!user.onboardingDone) return <Navigate to="/onboarding/genres" replace />;

  return children;
};

// --- 2. App Routing ---
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />

          {/* Onboarding Route (No Bottom Nav) */}
          <Route
            path="/onboarding/genres"
            element={
              <OnboardingGuard>
                <GenrePreferencesPage />
              </OnboardingGuard>
            }
          />

          {/* Core App Routes (Wrapped in MainAppGuard AND MainLayout) */}
          <Route
            element={
              <MainAppGuard>
                <MainLayout />
              </MainAppGuard>
            }
          >
            <Route path="/home" element={<HomeScanner />} />
            <Route path="/library" element={<Library />} />
            <Route path="/profile" element={<Profile />} />

            {/* The Scan Results page */}
            <Route path="/scan/:scanId" element={<ScanResults />} />
          </Route>

          {/* Default Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
