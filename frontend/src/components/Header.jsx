import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import LoginModal from './LoginModal';

export default function Header() {
  const [loginAbierto, setLoginAbierto] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
  try {
    const userRaw = localStorage.getItem('user');
    const parsedUser = JSON.parse(userRaw);
    console.log('Usuario logueado:', parsedUser);
    setUser(parsedUser);
  } catch {
    setUser(null);
  }
}, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowAdminMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/inicio');
  };

  const rol = user?.rol;
  const isSuperAdmin = rol === 1;
  const isSupervisor = rol === 2;
  const isUsuario = rol === 3;
  const isAdmin = isSuperAdmin || isSupervisor;

  return (
    <header
      className="py-2 px-4"
      style={{
        backgroundImage: 'linear-gradient(to bottom, #00902f, #62ab44)',
      }}
    >
      <nav className="flex items-center justify-between">
        <div className="flex items-center">
          <img src="/png/cteslogo.png" alt="ctes" className="h-20 w-auto" />
          <span className="text-white font-bold text-xl ml-4 font-roboto">
            SIFADECO
          </span>
        </div>

        <ul className="flex gap-4 text-white items-center" ref={menuRef}>
          {/* Siempre mostrar Inicio */}
          <li>
            <NavLink
              to="/inicio"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md hover:bg-green-700 ${
                  isActive ? 'bg-green-800 font-semibold' : ''
                }`
              }
            >
              Inicio
            </NavLink>
          </li>

          {/* Mostrar Tropa para todos los roles */}
          {(isAdmin || isUsuario) && (
            <li>
              <NavLink
                to="/tropa"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md hover:bg-green-700 ${
                    isActive ? 'bg-green-800 font-semibold' : ''
                  }`
                }
              >
                Tropa
              </NavLink>
            </li>
          )}

          {/* Mostrar Faena para todos los roles */}
          {(isAdmin || isUsuario) && (
            <li>
              <NavLink
                to="/faena"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md hover:bg-green-700 ${
                    isActive ? 'bg-green-800 font-semibold' : ''
                  }`
                }
              >
                Faena
              </NavLink>
            </li>
          )}

          {/* Mostrar Decomisos solo si es superadmin */}
          {isSuperAdmin && (
            <li>
              <NavLink
                to="/decomisos"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md hover:bg-green-700 ${
                    isActive ? 'bg-green-800 font-semibold' : ''
                  }`
                }
              >
                Decomisos
              </NavLink>
            </li>
          )}

          {/* Admin solo para superadmin */}
          {isSuperAdmin && (
            <li>
              <NavLink
                to="/admin/usuarios"
                className="px-4 py-2 rounded-md font-bold hover:text-[#98bf11] hover:bg-green-700"
              >
                Admin
              </NavLink>
            </li>
          )}

          {/* Mostrar login si no está logueado */}
          {!user && (
            <li>
              <button
                onClick={() => setLoginAbierto(true)}
                className="px-4 py-2 font-bold rounded-md hover:bg-green-700"
              >
                Iniciar Sesión
              </button>
            </li>
          )}

          {/* Logout si está logueado */}
          {user && (
            <li>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
              >
                Cerrar sesión
              </button>
            </li>
          )}
        </ul>

        <LoginModal
          isOpen={loginAbierto}
          onClose={() => setLoginAbierto(false)}
        />
      </nav>
    </header>
  );
}
