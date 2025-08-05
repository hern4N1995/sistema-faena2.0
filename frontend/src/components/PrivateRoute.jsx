// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const userRaw = localStorage.getItem('user');

  if (!userRaw) return <Navigate to="/login" replace />;

  let user;
  try {
    user = JSON.parse(userRaw);
  } catch (e) {
    return <Navigate to="/login" replace />;
  }

  // Permitir acceso si el rol es válido
  if (user?.rol === 'admin' || user?.rol === 'usuario') {
    return children;
  }

  return <Navigate to="/login" replace />;
}
