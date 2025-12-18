import { Navigate } from 'react-router-dom';

// Función para leer cookies
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

export default function ProtectedRoute({ children }) {
  const isLoggedIn = getCookie('isLoggedIn');
  const currentUsername = getCookie('currentUsername');

  // Si no hay sesión activa, redirigir al login
  if (!isLoggedIn || !currentUsername) {
    return <Navigate to="/" replace />;
  }

  // Si hay sesión, mostrar el contenido
  return children;
}
