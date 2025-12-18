import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();  // Esto es lo que hace que salte de página

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    telegramId: ''
  });

  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password' || name === 'confirmPassword') {
      const pass = name === 'password' ? value : formData.password;
      const confirm = name === 'confirmPassword' ? value : formData.confirmPassword;
      setPasswordMatch(pass === confirm && pass !== '');

      if (name === 'password') {
        if (value.length === 0) {
          setPasswordStrength('');
        } else if (value.length < 6) {
          setPasswordStrength('Débil: Mínimo 6 caracteres');
        } else if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
          setPasswordStrength('Media: Necesita al menos 1 letra y 1 número');
        } else {
          setPasswordStrength('Fuerte');
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordStrength !== 'Fuerte') {
      setMessage({ text: 'La contraseña debe ser Fuerte para continuar.', type: 'error' });
      return;
    }

    if (!passwordMatch) {
      setMessage({ text: 'Las contraseñas no coinciden.', type: 'error' });
      return;
    }

    setMessage({ text: 'Procesando registro...', type: 'info' });

    try {
      const res = await fetch('https://jem-box-backend.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ text: data.message || '¡Registro exitoso! Redirigiendo al login...', type: 'success' });

        // Espera exactamente 2 segundos y salta al login
        setTimeout(() => {
          navigate('/');  // Te envía directo a "/"
        }, 2000);

        // Limpia formulario
        setFormData({ username: '', email: '', password: '', confirmPassword: '', telegramId: '' });
      } else {
        setMessage({ text: data.error || 'Error en el registro. Verifica los datos.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Error de conexión. Intenta más tarde o contacta a @soyjemoox', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-gray-900 to-black flex items-center justify-center px-6 py-12">
      <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-3xl p-10 max-w-lg w-full shadow-2xl">
        <h2 className="text-4xl font-extrabold text-center mb-2">Crear Cuenta</h2>
        <p className="text-center text-gray-400 mb-8">Únete a Jem Box - Plataforma Profesional</p>

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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Usuario</label>
            <input type="text" name="username" required minLength="4" maxLength="20" pattern="^[a-zA-Z][a-zA-Z0-9]{3,19}$" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500" placeholder="Ej: soyjemoox" value={formData.username} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" name="email" required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500" placeholder="tu@email.com" value={formData.email} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <input type="password" name="password" required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500" value={formData.password} onChange={handleChange} />
            <p className={`text-sm mt-1 ${passwordStrength === 'Fuerte' ? 'text-green-400' : passwordStrength ? 'text-red-400' : 'text-gray-500'}`}>{passwordStrength || 'Mínimo 6 caracteres, 1 letra y 1 número'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirmar Contraseña</label>
            <input type="password" name="confirmPassword" required className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500" value={formData.confirmPassword} onChange={handleChange} />
            {!passwordMatch && formData.confirmPassword && (<p className="text-sm text-red-400 mt-1">Las contraseñas no coinciden</p>)}
          </div>

          <div className="bg-red-900/50 border border-red-800 rounded-xl p-4 text-sm">
            <p className="font-bold text-red-300 mb-2">🚨 REQUISITO OBLIGATORIO</p>
            <p>Debes estar suscrito al canal oficial:</p>
            <a href="https://t.me/+tUVZlnD4M5tjZjgx" target="_blank" rel="noopener" className="font-bold text-white underline">Únete aquí → Jem Box Updates</a>
            <p className="mt-2">Además, obtén tu ID Telegram con:</p>
            <p className="font-bold text-white">@userinfofastbot</p>
            <p className="text-xs mt-2">📋 Pasos: Únete al canal → Escribe /start al bot → Copia tu ID</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ID Telegram (OBLIGATORIO)</label>
            <input type="text" name="telegramId" required pattern="^\d{8,}$" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500" placeholder="Ej: 123456789" value={formData.telegramId} onChange={handleChange} />
            <p className="text-xs text-gray-500 mt-1">Solo números (ej: 123456789)</p>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition shadow-lg">
            Crear Cuenta
          </button>
        </form>

        <p className="text-center mt-8 text-gray-400">
          ¿Ya tienes cuenta? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">Iniciar Sesión</Link>
        </p>
      </div>
    </div>
  );
}