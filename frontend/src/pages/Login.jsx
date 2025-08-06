export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Iniciar Sesión</h2>

        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setContraseña(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        {error && (
          <div className="text-red-600 text-sm mb-3">{error}</div>
        )}

        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
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
