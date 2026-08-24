import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute } from './auth/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import Directory from './pages/Directory';
import Impersonate from './pages/Impersonate';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

/**
 * /login is public. Everything else is behind ProtectedRoute, which bounces
 * unauthenticated visitors to /login. The redirect stashes the intended path
 * in navigation state so /login can send them back after signing in. Layout
 * is the shared shell for both auth and app pages.
 *
 * There is no /activate: sign-in is passwordless and creates the GoTrue user
 * on first successful verify, so first-time and returning flows are identical.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="login" element={<Login />} />
        {/* Officer view-as-sponsor entry point. Public — the token is the
            auth; if it is missing or spent the page bounces to /login. */}
        <Route path="impersonate" element={<Impersonate />} />

        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="invoices"
          element={
            <ProtectedRoute>
              <Invoices />
            </ProtectedRoute>
          }
        />
        <Route
          path="invoices/:id"
          element={
            <ProtectedRoute>
              <InvoiceDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="directory"
          element={
            <ProtectedRoute>
              <Directory />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
