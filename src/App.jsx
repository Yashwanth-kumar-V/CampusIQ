import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { ThemeProvider } from './components/ThemeContext';
import Navigation    from './components/Navigation';
import LandingPage   from './components/LandingPage';
import Login         from './components/Login';
import Signup        from './components/Signup';
import Dashboard     from './components/Dashboard';
import CampusMap     from './components/CampusMap';
import ServiceRequests from './components/ServiceRequests';
import AIChatbot     from './components/AIChatbot';
import Settings      from './components/Settings';

/* Routes where the shared nav should NOT appear */
const NO_NAV_ROUTES = ['/', '/login', '/signup'];

/* Redirect logged-in users away from auth pages */
const GuestOnly = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

/* Redirect guests away from protected pages */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
};

/* Loading spinner */
const Spinner = () => (
  <div style={{ minHeight: '100vh', background: '#05080f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: '32px', height: '32px', border: '3px solid rgba(91,95,240,0.25)', borderTopColor: '#5b5ff0', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
);

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;

  /* Hide the floating nav on landing / auth pages */
  const showNav = user && !NO_NAV_ROUTES.includes(location.pathname);

  return (
    <>
      {showNav && <Navigation />}

      <Routes>
        {/* ── Public / guest ── */}
        <Route
          path="/"
          element={
            user
              ? <Navigate to="/dashboard" replace />
              : <LandingPage />
          }
        />

        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />

        <Route
          path="/signup"
          element={
            <GuestOnly>
              <Signup />
            </GuestOnly>
          }
        />

        {/* ── Protected app shell ── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <main className="main-content">
                <div className="page-wrapper">
                  <Dashboard user={user} />
                </div>
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <main className="main-content">
                <div className="page-wrapper">
                  <CampusMap />
                </div>
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <main className="main-content">
                <div className="page-wrapper">
                  <ServiceRequests />
                </div>
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <main className="main-content">
                <div className="page-wrapper">
                  <AIChatbot />
                </div>
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <main className="main-content">
                <div className="page-wrapper">
                  <Settings user={user} />
                </div>
              </main>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;