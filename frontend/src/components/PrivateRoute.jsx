/* // src/components/PrivateRoute.jsx
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
 */
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) return <Navigate to="/" />;
  if (allowedRoles && !allowedRoles.includes(user.rol))
    return <Navigate to="/" />;

  return children;
}
