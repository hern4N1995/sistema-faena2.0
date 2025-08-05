// src/components/PrivateRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'

export default function PrivateRoute({ children }) {
  const userRaw = localStorage.getItem('user')

  // Si no hay datos, redirige al login
  if (!userRaw) return <Navigate to="/login" replace />

  let user
  try {
    user = JSON.parse(userRaw)
  } catch (e) {
    return <Navigate to="/login" replace />
  }

  if (user?.rol === 'admin') {
    return children
  } else {
    return <Navigate to="/login" replace />
  }
}
