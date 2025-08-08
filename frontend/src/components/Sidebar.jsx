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

  const rol = user.rol;
  const isSuperAdmin = rol === 1;
  const isSupervisor = rol === 2;
  const isUsuario = rol === 3;
  const isAdmin = isSuperAdmin || isSupervisor;

  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded hover:bg-green-200 ${
      isActive ? 'font-bold text-green-700 bg-green-100' : ''
    }`;

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
        { to: '/tropa/detalle/123', label: 'Detalle Tropa' },
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
      roles: ['1'],
      menu: [
        { to: '/admin/usuarios', label: 'Usuarios' },
        { to: '/admin/provincias', label: 'Provincias' },
        { to: '/admin/localidades', label: 'Localidades' },
        { to: '/admin/titulares', label: 'Titulares' },
      ],
    },
  ];

  // Buscar coincidencia por prefijo y rol
  const match = menuConfig.find(
    ({ prefix, roles }) =>
      pathname.startsWith(prefix) && roles.includes(String(rol))
  );

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
