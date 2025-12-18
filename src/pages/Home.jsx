import { ChevronRight, AlertTriangle, LogOut, X, Bot, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PurchaseModal from '../components/PurchaseModal';

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

// Función para establecer cookies
const setCookie = (name, value, days) => {
  const expires = days ? `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}` : '';
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
};

// Función para eliminar cookies
const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Datos de los servicios
const services = [
  {
    id: 'netflix',
    name: 'Netflix',
    color: 'from-red-800 to-red-950',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    plans: [
      { title: 'Básico', duration: '1 Mes', price: '10.000 COP', desc: '1 pantalla simultánea · Calidad SD · Sin anuncios', limitedStock: false },
      { title: 'Estándar', duration: '1 Mes', price: '15.000 COP', limitedStock: true, desc: '2 pantallas simultáneas · Full HD · Ideal para parejas' },
      { title: 'Premium', duration: '1 Mes', price: '20.000 COP', desc: '4 pantallas simultáneas · 4K + HDR · Perfecto para familias', limitedStock: false },
    ],
  },
  {
    id: 'disney',
    name: 'Disney+',
    color: 'from-blue-800 to-blue-950',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
    plans: [
      { title: 'Mensual', duration: '1 Mes', price: '18.000 COP', desc: 'Todo Disney, Marvel, Star Wars, Pixar y National Geographic', limitedStock: false },
      { title: 'Anual', duration: '12 Meses', price: '180.000 COP', limitedStock: true, desc: 'Acceso completo todo el año · ¡Ahorras 2 meses!' },
    ],
  },
  {
    id: 'spotify',
    name: 'Spotify',
    color: 'from-green-800 to-green-950',
    logo: 'https://download.logo.wine/logo/Spotify/Spotify-Logo.wine.png',
    plans: [
      { title: 'Individual', duration: '1 Mes', price: '12.000 COP', desc: 'Música sin anuncios · Descargas ilimitadas · Modo offline', limitedStock: false },
      { title: 'Individual', duration: '3 Meses', price: '32.000 COP', limitedStock: true, desc: '3 meses de Premium · Ahorra comprando en pack' },
      { title: 'Familiar', duration: '1 Mes', price: '18.000 COP', desc: 'Hasta 6 cuentas Premium · Control parental incluido', limitedStock: false },
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: 'from-red-900 to-black',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_(2017).svg',
    plans: [
      { title: 'Individual', duration: '1 Mes', price: '15.000 COP', desc: 'Sin anuncios · Reproducción en segundo plano · Descargas', limitedStock: false },
      { title: 'Individual', duration: '3 Meses', price: '40.000 COP', limitedStock: true, desc: '3 meses sin anuncios · Mejor precio por pack' },
      { title: 'Familiar', duration: '1 Mes', price: '22.000 COP', desc: 'Hasta 5 miembros · YouTube Music incluido', limitedStock: false },
    ],
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Obtener username de las cookies
  const username = getCookie('currentUsername') || 'Usuario';

  // Verificar si debe mostrarse el modal de bienvenida
  useEffect(() => {
    const hasSeenWelcome = getCookie('hasSeenWelcomeModal');
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
    }
  }, []);

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
    setCookie('hasSeenWelcomeModal', 'true', 1);
  };

  const handleActivateBot = () => {
    window.open('https://t.me/JemBoxbot', '_blank');
    closeWelcomeModal();
  };

  const handleLogout = () => {
    deleteCookie('isLoggedIn');
    deleteCookie('currentUsername');
    deleteCookie('hasSeenWelcomeModal');
    navigate('/');
  };

  const handleBuyClick = (plan) => {
    setSelectedPlan(plan);
    setShowPurchaseModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-gray-900 to-black text-gray-100">
      {/* Modal de Bienvenida */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <button
              onClick={closeWelcomeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition"
            >
              <X size={24} />
            </button>

            <div className="text-center">
              <div className="bg-purple-600/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot size={40} className="text-purple-400" />
              </div>

              <h3 className="text-3xl font-bold mb-4 text-gray-100">
                ¡Bienvenido, {username}! 🎉
              </h3>

              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                ¡Recuerda activar nuestro bot de Telegram para acceder a:
              </p>

              <div className="bg-gray-800/50 rounded-2xl p-6 mb-8 text-left space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-purple-400 text-xl">🎁</span>
                  <p className="text-gray-300">Ofertas exclusivas y descuentos especiales</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-400 text-xl">🔔</span>
                  <p className="text-gray-300">Notificaciones instantáneas de nuevos productos</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-400 text-xl">📦</span>
                  <p className="text-gray-300">Recibe tus productos directamente por el bot</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-400 text-xl">💬</span>
                  <p className="text-gray-300">Soporte rápido y personalizado</p>
                </div>
              </div>

              <button
                onClick={handleActivateBot}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition shadow-lg mb-3"
              >
                Activar Bot de Telegram
              </button>

              <button
                onClick={closeWelcomeModal}
                className="w-full text-gray-400 hover:text-gray-200 font-medium py-3 transition"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Compra */}
      {showPurchaseModal && (
        <PurchaseModal
          serviceName={selectedService.name}
          plan={selectedPlan}
          onClose={() => setShowPurchaseModal(false)}
        />
      )}

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-xl z-40 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <p className="text-base text-gray-400">
            Bienvenid@, <span className="text-purple-400 font-medium">{username}</span>
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/compras')}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-xl transition shadow-lg"
            >
              <ShoppingCart size={20} />
              Mis Compras
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-xl transition shadow-lg"
            >
              <LogOut size={20} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-24"></div>

      {/* Hero */}
      <section className="text-center py-24 px-6">
        <h2 className="text-5xl md:text-7xl font-extrabold mb-8 text-gray-100">
          Accede a tus plataformas <br />
          <span className="text-gray-400">al instante</span>
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Planes premium · Entrega inmediata · Precios imbatibles
        </p>
      </section>

      {/* Grid de servicios */}
      {!selectedService ? (
        <section className="max-w-7xl mx-auto px-6 pb-32">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service)}
                className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-12 hover:border-gray-600 hover:bg-gray-800/60 transition-all duration-700 hover:-translate-y-4 hover:shadow-2xl hover:shadow-gray-900"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-700`}></div>
                <img 
                  src={service.logo} 
                  alt={service.name} 
                  className="h-32 mx-auto mb-8 drop-shadow-2xl filter brightness-110" 
                />
                <h3 className="text-3xl font-bold text-gray-100 mb-4">{service.name}</h3>
                <p className="text-gray-400 flex items-center justify-center gap-2 transition group-hover:text-gray-200">
                  Ver planes <ChevronRight size={24} className="group-hover:translate-x-2 transition" />
                </p>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="max-w-7xl mx-auto px-6 pb-32">
          <button
            onClick={() => setSelectedService(null)}
            className="mb-12 text-gray-400 hover:text-gray-200 flex items-center gap-2 text-lg transition"
          >
            ← Volver
          </button>

          <h2 className="text-5xl font-extrabold text-center mb-16 text-gray-100">
            Planes de {selectedService.name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {selectedService.plans.map((plan, i) => (
              <div
                key={i}
                className="relative bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-3xl p-10 transition-all duration-500 hover:border-gray-600 hover:bg-gray-800/80 hover:-translate-y-3 hover:shadow-xl"
              >
                {plan.limitedStock && (
                  <div className="absolute top-4 right-4 bg-red-900/80 text-red-200 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Stock limitado
                  </div>
                )}

                <h3 className="text-3xl font-bold mb-3 text-gray-100">{plan.title}</h3>
                <p className="text-xl text-gray-400 mb-6">{plan.duration}</p>
                <p className="text-5xl font-extrabold mb-10 text-gray-100">{plan.price}</p>
                <p className="text-lg text-gray-300 mb-12 leading-relaxed">{plan.desc}</p>

                <button
                  onClick={() => handleBuyClick(plan)}
                  className="w-full bg-gray-200 text-black py-5 rounded-2xl font-bold text-lg hover:bg-gray-300 transition shadow-lg"
                >
                  Comprar Ahora
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}