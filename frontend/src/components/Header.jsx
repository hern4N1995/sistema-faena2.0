import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { HiBars3, HiXMark } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import LoginModal from './LoginModal';

export default function Header() {
  const [loginAbierto, setLoginAbierto] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [perfilOpen, setPerfilOpen] = useState(false);
  const perfilRef = useRef(null);

  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem('user')));
    } catch {
      setUser(null);
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (perfilRef.current && !perfilRef.current.contains(e.target)) {
        setPerfilOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setPerfilOpen(false); // ✅ cerrar menú de perfil
    navigate('/inicio');
  };

  const handleVerPerfil = () => {
    setPerfilOpen(false); // ✅ cerrar menú de perfil
    navigate('/perfil');
  };

  const rol = user?.rol;
  const isAdmin = rol === 1 || rol === 2;
  const isUsuario = rol === 3;

  const navLinks = [
    { to: '/inicio', label: 'Inicio', show: true },
    { to: '/tropa', label: 'Tropa', show: isAdmin || isUsuario },
    { to: '/faena', label: 'Faena', show: isAdmin || isUsuario },
    { to: '/decomisos', label: 'Decomisos', show: rol === 1 },
    { to: '/admin/usuarios', label: 'Admin', show: isAdmin },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-gradient-to-r from-primary to-secondary shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src="/png/cteslogo.png" alt="ctes" className="h-12" />
              <span className="text-white font-bold text-2xl tracking-tight">
                SIFADECO
              </span>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center space-x-4">
              {navLinks
                .filter((l) => l.show)
                .map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ` +
                      (isActive
                        ? 'bg-white/20 text-white shadow-md'
                        : 'text-white/80 hover:bg-white/10 hover:text-white')
                    }
                  >
                    {label}
                  </NavLink>
                ))}

              {!user ? (
                <button
                  onClick={() => setLoginAbierto(true)}
                  className="ml-4 px-4 py-2 rounded-lg bg-white/0 text-white text-sm font-medium hover:bg-white/20 transition"
                >
                  Iniciar Sesión
                </button>
              ) : (
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-sm font-medium text-white">
                    Bienvenido, {user.nombre}
                  </span>

                  <div ref={perfilRef} className="relative">
                    <button
                      onClick={() => setPerfilOpen((prev) => !prev)}
                      className="flex items-center gap-1 px-2 py-2 bg-white/0 text-white rounded-full hover:bg-white/10 transition"
                    >
                      <img
                        src="/png/profile.png"
                        alt="Perfil"
                        className="w-6 h-6 rounded-full"
                      />
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {perfilOpen && (
                      <div
                        className="absolute right-0 mt-2 w-44 text-white rounded-lg shadow-lg z-50 overflow-hidden"
                        style={{ backgroundColor: '#5ba943' }}
                      >
                        <button
                          onClick={handleVerPerfil}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-white/10"
                        >
                          Ver perfil
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-red-600"
                        >
                          Cerrar sesión
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-white p-2"
              >
                {menuOpen ? <HiXMark size={26} /> : <HiBars3 size={26} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-gradient-to-b from-primary to-secondary overflow-hidden shadow-lg"
          >
            <nav className="flex flex-col items-center space-y-4 py-6">
              {navLinks
                .filter((l) => l.show)
                .map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className="text-white/80 hover:text-white text-lg font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </NavLink>
                ))}

              {!user ? (
                <button
                  onClick={() => {
                    setLoginAbierto(true);
                    setMenuOpen(false);
                  }}
                  className="text-white/80 hover:text-white text-lg font-medium"
                >
                  Iniciar Sesión
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="text-red-300 hover:text-red-200 text-lg font-medium"
                >
                  Cerrar Sesión
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginModal
        isOpen={loginAbierto}
        onClose={() => setLoginAbierto(false)}
      />
    </>
  );
}
