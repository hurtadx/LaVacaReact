
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../../Services/authService.jsx';
import DashboardSkeleton from '../SkeletonLoading/DashboardSkeleton';

export const PrivateRoute = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, error } = await getCurrentUser();
        setAuthenticated(!!user && !error);
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <DashboardSkeleton message="Verificando sesión..." />;
  }

  return authenticated ? 
    <Outlet /> : 
    <Navigate to="/" state={{ from: location }} replace />;
};


export const PublicRoute = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, error } = await getCurrentUser();
        setAuthenticated(!!user && !error);
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return null; 
  }


  return authenticated ? 
    <Navigate to="/dashboard" state={{ from: location }} replace /> : 
    <Outlet />;
};