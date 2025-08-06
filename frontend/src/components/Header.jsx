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

  // Detectar usuario logueado
  useEffect(() => {
    try {
      const userRaw = localStorage.getItem('user');
      setUser(JSON.parse(userRaw));
    } catch {
      setUser(null);
    }
  }, [location]);

  // Cerrar el dropdown si se hace clic fuera
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

  const isSuperAdmin = user?.rol === 'superadmin';
  const isAdmin = user?.rol === 'admin' || isSuperAdmin;

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

          {/* Mostrar Faena solo si es admin o superadmin */}
          {isAdmin && (
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

          {/* Mostrar Remanentes para admin y superadmin */}
          {isAdmin && (
            <li>
              <NavLink
                to="/remanentes"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md hover:bg-green-700 ${
                    isActive ? 'bg-green-800 font-semibold' : ''
                  }`
                }
              >
                Remanentes
              </NavLink>
            </li>
          )}

          {/* Dropdown admin: solo para superadmin */}
          {isSuperAdmin && (
            <li className="relative">
              <button
                onClick={() => setShowAdminMenu((prev) => !prev)}
                className="px-4 py-2 rounded-md font-bold hover:text-[#98bf11] hover:bg-green-700"
              >
                Admin ▾
              </button>
              {showAdminMenu && (
                <ul
                  className="absolute left-0 mt-1 w-48 bg-[#00902f] shadow-lg rounded-md z-50 text-white flex flex-col"
                  style={{
                    backgroundImage:
                      'linear-gradient(to bottom, #00902f, #62ab44)',
                  }}
                >
                  <li>
                    <NavLink
                      to="/admin/agregar-usuario"
                      className="block px-4 py-2 rounded-md hover:bg-[#008d36]"
                      onClick={() => setShowAdminMenu(false)}
                    >
                      Agregar Usuario
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/provincias"
                      className="block px-4 py-2 rounded-md hover:bg-[#008d36]"
                      onClick={() => setShowAdminMenu(false)}
                    >
                      Provincias
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/localidades"
                      className="block px-4 py-2 rounded-md hover:bg-[#008d36]"
                      onClick={() => setShowAdminMenu(false)}
                    >
                      Localidades
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/titulares"
                      className="block px-4 py-2 rounded-md hover:bg-[#008d36]"
                      onClick={() => setShowAdminMenu(false)}
                    >
                      Titulares
                    </NavLink>
                  </li>
                </ul>
              )}
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

        {/* 🛠️ El modal puede ser reemplazado por el formulario real */}
        <LoginModal
          isOpen={loginAbierto}
          onClose={() => setLoginAbierto(false)}
        />
      </nav>
    </header>
  );
}
