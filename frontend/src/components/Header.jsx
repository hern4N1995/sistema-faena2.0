import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import LoginModal from './LoginModal';

const navItems = ['Inicio', 'Faena', 'Decomisos', 'Remanentes'];

export default function Header() {
  const [showFaenaMenu, setShowFaenaMenu] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginAbierto, setLoginAbierto] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setIsAdmin(user?.rol === 'admin');
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowFaenaMenu(false);
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

  return (
    <header
      className="header py-2 px-4"
      style={{
        backgroundImage: 'linear-gradient(to bottom, #00902f, #62ab44)',
      }}
    >
      <nav className="nav flex items-center justify-between">
        <div className="flex items-center">
          <img src="/png/cteslogo.png" alt="ctes" className="h-20 w-auto" />
          <span className="text-white font-bold text-xl ml-4 font-roboto">
            SIFADECO
          </span>
        </div>
        <ul className="flex gap-4 text-white items-center" ref={menuRef}>
          {navItems.map((item) =>
            item === 'Faena' ? (
              <li key={item} className="relative">
                <button
                  onClick={() => navigate('/tropa')}
                  className="px-4 py-2 rounded-md font-bold hover:text-[#98bf11] hover:bg-green-700 focus:outline-none"
                >
                  Tropa
                </button>
              </li>
            ) : (
              <li key={item}>
                <NavLink
                  to={`/${item.toLowerCase()}`}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md hover:bg-green-700 ${
                      isActive ? 'bg-green-800 font-semibold' : ''
                    }`
                  }
                >
                  {item}
                </NavLink>
              </li>
            )
          )}

          {!isAdmin && (
            <li>
              <button
                onClick={() => setLoginAbierto(true)}
                className="px-4 py-2 font-bold rounded-md hover:bg-green-700 hover:text[#98bf11]"
              >
                Iniciar Sesión
              </button>
            </li>
          )}

          {isAdmin && (
            <li className="relative">
              <button
                onClick={() => setShowAdminMenu((prev) => !prev)}
                className="px-4 py-2 rounded-md font-bold hover:text-white focus:outline-none hover:text-[#98bf11] hover:bg-green-700"
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
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-md hover:bg-[#008d36] ${
                          isActive ? 'font-bold bg-[#008d36]' : ''
                        }`
                      }
                      onClick={() => setShowAdminMenu(false)}
                    >
                      Agregar Usuario
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/admin/provincias"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-md hover:bg-[#008d36] ${
                          isActive ? 'font-bold bg-[#008d36]' : ''
                        }`
                      }
                      onClick={() => setShowAdminMenu(false)}
                    >
                      Provincias
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/localidades"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-md hover:bg-[#008d36] ${
                          isActive ? 'font-bold bg-[#008d36]' : ''
                        }`
                      }
                      onClick={() => setShowAdminMenu(false)}
                    >
                      Localidades
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/admin/titulares"
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-md hover:bg-[#008d36] ${
                          isActive ? 'font-bold bg-[#008d36]' : ''
                        }`
                      }
                      onClick={() => setShowAdminMenu(false)}
                    >
                      Titulares
                    </NavLink>
                  </li>

                  {/* Podés agregar más vistas admin acá */}
                </ul>
              )}
            </li>
          )}

          {isAdmin && (
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
