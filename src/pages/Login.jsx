import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Funciones para manejar cookies
const setCookie = (name, value, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
};

const deleteAllCookies = () => {
  ['savedUsername', 'savedPassword', 'savedTelegramId', 'isLoggedIn', 'currentUsername', 'userRole'].forEach(name => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  });
};

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    telegramId: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [hasSavedData, setHasSavedData] = useState(false);

  // Cargar datos guardados automáticamente al abrir la página
  useEffect(() => {
    const savedUsername = getCookie('savedUsername');
    const savedPassword = getCookie('savedPassword');
    const savedTelegramId = getCookie('savedTelegramId');

    if (savedUsername && savedTelegramId) {
      setFormData({
        username: savedUsername,
        password: savedPassword || '',
        telegramId: savedTelegramId
      });
      setHasSavedData(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClearData = () => {
    deleteAllCookies();
    setFormData({ username: '', password: '', telegramId: '' });
    setHasSavedData(false);
    setMessage({ text: 'Datos eliminados. Puedes iniciar con otra cuenta.', type: 'success' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: 'Verificando credenciales...', type: 'info' });

    try {
      const res = await fetch('https://jem-box-backend.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ text: data.message || '¡Login exitoso! Redirigiendo...', type: 'success' });

        // Guardar sesión con cookies
        setCookie('isLoggedIn', 'true', 30);
        setCookie('currentUsername', formData.username, 30);
        setCookie('userRole', data.role, 30); // ✅ Guardar el rol del usuario

        // Guardar los tres datos automáticamente para la próxima vez
        setCookie('savedUsername', formData.username, 365);
        setCookie('savedPassword', formData.password, 365);
        setCookie('savedTelegramId', formData.telegramId, 365);

        // ✅ Redirigir según el rol
        setTimeout(() => {
          if (data.role === 'admin' || data.role === 'seller') {
            navigate('/admin');
          } else {
            navigate('/index');
          }
        }, 2000);
      } else {
        setMessage({ text: data.error || 'Error en el login. Verifica tus datos.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error de conexión al servidor.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-gray-900 to-black flex items-center justify-center px-6 py-12">
      <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-3xl p-10 max-w-lg w-full shadow-2xl text-center">
        <h2 className="text-4xl font-extrabold mb-2">Acceso Seguro</h2>
        <p className="text-xl text-gray-400 mb-8">Plataforma Profesional Jem Box</p>

        {/* Mensaje bonito */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl text-center font-medium border ${
            message.type === 'success' ? 'bg-green-900/50 text-green-300 border-green-800' :
            message.type === 'error' ? 'bg-red-900/50 text-red-300 border-red-800' :
            'bg-blue-900/50 text-blue-300 border-blue-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Recuadro de datos guardados */}
        {hasSavedData && (
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-800 rounded-xl p-6 mb-6 text-left">
            <p className="text-2xl font-bold text-white mb-2">¡De nuevo por acá! 🎉</p>
            <p className="text-lg text-white mb-3">¡Qué chimba! Ya tienes tus datos listos 🚀</p>
            <p className="text-white mb-1">Usuario: <span className="font-bold">{formData.username}</span></p>
            <p className="text-white mb-4">Telegram: <span className="font-bold">{formData.telegramId}</span></p>
            <button
              onClick={handleClearData}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition"
            >
              Cambiar cuenta
            </button>
          </div>
        )}

        {/* Mensaje de requisitos */}
        <div className="bg-red-900/50 border border-red-800 rounded-xl p-5 mb-8 text-left text-sm">
          <p className="font-bold text-red-300 mb-2">🚨 REQUISITO OBLIGATORIO: Estar en el canal oficial</p>
          <p className="text-white mb-3">SIN EXCEPCIÓN: Debes ser miembro del canal oficial para acceder</p>
          <p className="mb-3">
            📢 ÚNETE AQUÍ: {' '}
            <a href="https://t.me/+tUVZlnD4M5tjZjgx" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline font-bold">
              Jem Box Updates
            </a>
          </p>
          <p className="text-gray-300">
            SISTEMA ANTI-BYPASS: Se verifica tu membresía en tiempo real
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            required
            className="w-full px-5 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-lg"
            value={formData.username}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            className="w-full px-5 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-lg"
            value={formData.password}
            onChange={handleChange}
          />
          <input
            type="text"
            name="telegramId"
            placeholder="ID Telegram (obligatorio)"
            required
            pattern="\d{8,}"
            className="w-full px-5 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-lg"
            value={formData.telegramId}
            onChange={handleChange}
          />

          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-5 rounded-2xl font-bold text-xl hover:from-purple-700 hover:to-pink-700 transition shadow-lg">
            Iniciar Sesión
          </button>
        </form>

        <p className="mt-8 text-sm text-gray-500">
          ¿Olvidaste la contraseña?<br />
          Solicita restablecimiento a{' '}
          <a href="https://t.me/soyjemoox" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">
            @soyjemoox
          </a>
        </p>

        <p className="mt-6 text-sm text-gray-400">
          Jem Box recordará tu usuario e ID de Telegram de forma segura en la primera sesión.
        </p>

        <p className="mt-10 text-gray-400">
          ¿No tienes cuenta? <Link to="/register" className="text-purple-400 hover:text-purple-300 font-bold">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}