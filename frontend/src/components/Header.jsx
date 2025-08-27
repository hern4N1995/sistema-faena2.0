import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { HiBars3, HiXMark } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import LoginModal from './LoginModal';

export default function Header() {
  const [loginAbierto, setLoginAbierto] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/inicio');
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
                  className="ml-4 px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition"
                >
                  Iniciar Sesión
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 rounded-lg bg-red-500/80 text-white text-sm font-medium hover:bg-red-600 transition"
                >
                  Cerrar Sesión
                </button>
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
