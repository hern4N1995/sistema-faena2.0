export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Iniciar Sesión</h2>
        <input
          type="text"
          placeholder="Usuario"
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full mb-3 p-2 border rounded"
        />
        <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Entrar
        </button>
      </form>
    </div>
  );
}

const handleSubmit = async (e) => {
  e.preventDefault();

  // Simular un usuario con rol "admin"
  const fakeUser = {
    id: 1,
    email,
    rol: 'admin',
  };

  const fakeToken = 'admin-token-123';

  // Guardar en localStorage como si fuera una sesión real
  localStorage.setItem('token', fakeToken);
  localStorage.setItem('user', JSON.stringify(fakeUser));

  navigate('/dashboard');
};
