import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/Appcontext';

export default function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner"/></div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
