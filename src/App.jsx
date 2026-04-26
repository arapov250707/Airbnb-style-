import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ThemeProvider, NotificationProvider } from './context/AppContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import NotificationToast from './components/NotificationToast';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import PropertyCreatePage from './pages/PropertyCreatePage';
import PropertyEditPage from './pages/PropertyEditPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/admin/AdminPage';
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public layout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/properties" element={<PropertiesPage />} />
                <Route path="/properties/:id" element={<PropertyDetailPage />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/properties/create" element={<PropertyCreatePage />} />
                  <Route path="/properties/:id/edit" element={<PropertyEditPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
              </Route>

              {/* Admin layout */}
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/admin/properties" element={<AdminPropertiesPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/bookings" element={<AdminBookingsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <NotificationToast />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}