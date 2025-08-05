// components/Sidebar.jsx
import { NavLink, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const { pathname } = useLocation();

  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded hover:bg-green-200 ${
      isActive ? 'font-bold text-green-700 bg-green-100' : ''
    }`;

  // Menús por sección
  const tropaMenu = [
    { to: '/tropa', label: 'Ingreso Tropa' },
    { to: '/tropa/detalle/123', label: 'Detalle Tropa' },
    { to: '/decomisos', label: 'Decomisos' },
    { to: '/remanentes', label: 'Remanentes' },
  ];

  const adminMenu = [
    { to: '/admin/agregar-usuario', label: 'Agregar Usuario' },
    { to: '/admin/provincias', label: 'Provincias' },
    { to: '/admin/localidades', label: 'Localidades' },
    { to: '/admin/titulares', label: 'Titulares' },
  ];

  // Detectar sección actual
  let currentMenu = null;
  if (
    pathname.startsWith('/tropa') ||
    pathname.startsWith('/tropa/detalle') ||
    pathname.startsWith('/decomisos') ||
    pathname.startsWith('/remanentes')
  ) {
    currentMenu = tropaMenu;
  } else if (pathname.startsWith('/admin')) {
    currentMenu = adminMenu;
  }

  // No mostrar sidebar en /inicio ni si no hay menú
  if (pathname === '/inicio' || !currentMenu) return null;

  return (
    <aside className="w-64 bg-gray-100 h-full p-4 shadow-md">
      <h2 className="text-lg font-semibold mb-4">
        {pathname.startsWith('/admin')
          ? 'Gestión Administrativa'
          : 'Gestión de Faena'}
      </h2>
      <nav className="flex flex-col gap-2">
        {currentMenu.map(({ to, label }) => (
          <NavLink key={to} to={to} className={linkClass}>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
