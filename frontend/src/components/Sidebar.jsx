import { NavLink, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const { pathname } = useLocation();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }

  if (!user) return null;

  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded hover:bg-green-200 ${
      isActive ? 'font-bold text-green-700 bg-green-100' : ''
    }`;

  // Menús agrupados por prefijo de ruta
  const menuConfig = [
    {
      prefix: '/tropa',
      title: 'Gestión de Tropa',
      menu: [
        { to: '/tropa', label: 'Ingreso Tropa' },
        { to: '/tropa/detalle/123', label: 'Detalle Tropa' },
      ],
    },
    {
      prefix: '/decomisos',
      title: 'Gestión de Decomisos',
      menu: [{ to: '/decomisos', label: 'Decomisos' }],
    },
    {
      prefix: '/remanentes',
      title: 'Gestión de Remanentes',
      menu: [{ to: '/remanentes', label: 'Remanentes' }],
    },
    {
      prefix: '/admin',
      title: 'Gestión Administrativa',
      menu: [
        { to: '/admin/agregar-usuario', label: 'Agregar Usuario' },
        { to: '/admin/provincias', label: 'Provincias' },
        { to: '/admin/localidades', label: 'Localidades' },
        { to: '/admin/titulares', label: 'Titulares' },
      ],
    },
  ];

  // Buscar coincidencia por prefijo de ruta
  const match = menuConfig.find(({ prefix }) => pathname.startsWith(prefix));
  if (!match) return null;

  const { title, menu: currentMenu } = match;

  return (
    <aside className="w-64 bg-gray-100 h-full p-4 shadow-md">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
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
