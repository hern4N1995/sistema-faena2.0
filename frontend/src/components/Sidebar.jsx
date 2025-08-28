import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }
  if (!user) return null;

  const rol = String(user.rol);

  const menuConfig = [
    {
      prefix: '/faena',
      title: 'Gestión de Faena',
      roles: ['1', '2', '3'],
      menu: [
        { to: '/faena', label: 'Titular Faena' },
        { to: '/faena/detalle', label: 'Detalle Faena' },
        { to: '/faena/remanente', label: 'Remanente' },
      ],
    },
    {
      prefix: '/tropa',
      title: 'Gestión de Tropa',
      roles: ['1', '2', '3'],
      menu: [
        { to: '/tropa', label: 'Ingreso Tropa' },
        /* { to: '/tropa/detalle/123', label: 'Detalle Tropa' }, */
      ],
    },
    {
      prefix: '/decomisos',
      title: 'Gestión de Decomisos',
      roles: ['1'],
      menu: [{ to: '/decomisos', label: 'Decomisos' }],
    },
    {
      prefix: '/remanentes',
      title: 'Gestión de Remanentes',
      roles: ['1', '2', '3'],
      menu: [{ to: '/remanentes', label: 'Remanentes' }],
    },
    {
      prefix: '/admin',
      title: 'Gestión Administrativa',
      roles: ['1', '2'],
      menu: [
        { to: '/admin/usuarios', label: 'Usuarios' },
        { to: '/admin/provincias', label: 'Provincias' },
        { to: '/admin/departamentos', label: 'Departamentos' },
        { to: '/admin/titulares', label: 'Titulares' },
        { to: '/admin/plantas', label: 'Plantas' },
        { to: '/admin/productores', label: 'Productores' },
      ],
    },
  ];

  const match = menuConfig.find(
    ({ prefix, roles }) => pathname.startsWith(prefix) && roles.includes(rol)
  );
  if (!match) return null;

  const { title, menu: currentMenu } = match;

  const linkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-xl transition-all duration-200 ` +
    (isActive
      ? 'bg-white/20 text-white font-semibold shadow-lg'
      : 'text-white/80 hover:bg-white/10 hover:text-white');

  return (
    <>
      {/* Botón móvil moderno */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-24 left-4 z-50 bg-primary/90 backdrop-blur text-white p-3 rounded-full shadow-xl"
      >
        {open ? <HiX size={22} /> : <HiMenu size={22} />}
      </button>

      {/* Sidebar móvil con animación */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-primary to-secondary flex flex-col shadow-2xl"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-white/90 mb-6 tracking-tight">
                {title}
              </h2>
              <nav className="space-y-2">
                {currentMenu.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === match.prefix}
                    className={linkClass}
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar desktop que llega hasta el footer */}
      <aside className="hidden lg:flex flex-col w-72 bg-gradient-to-b from-primary to-secondary min-h-screen p-6 shadow-xl">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white/90 mb-6">{title}</h2>
          <nav className="space-y-2">
            {currentMenu.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === match.prefix}
                className={linkClass}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
