import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Purchases from './pages/Purchases';
import Checker from './pages/Checker';

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

// Función simple para verificar si hay sesión (usando cookies)
const isAuthenticated = () => {
  return getCookie('isLoggedIn') === 'true';
};

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Cambiar /index a /home */}
        <Route 
          path="/index" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/checker" 
          element={
            <ProtectedRoute>
              <Checker />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/compras" 
          element={
            <ProtectedRoute>
              <Purchases />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
