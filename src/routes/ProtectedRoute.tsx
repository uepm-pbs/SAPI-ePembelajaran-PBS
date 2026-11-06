import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-appbg">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-navy-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-navy-800 font-semibold">Memuatkan SAPIe...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-white rounded-xl shadow-card border border-rose-200">
        <h3 className="text-base font-bold text-rose-700">Akses Tidak Dibenarkan (403)</h3>
        <p className="text-xs text-gray-600 mt-2">
          Peranan anda ({role}) tidak mempunyai kebenaran untuk mengakses modul ini mengikut dasar keselamatan institusi.
        </p>
        <div className="mt-4">
          <Link to="/dashboard" className="btn-primary text-xs inline-block">
            Kembali ke Dashboard Utama
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
