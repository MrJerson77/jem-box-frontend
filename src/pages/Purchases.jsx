import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Clock, CheckCircle, XCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

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

export default function Purchases() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState({});

  const username = getCookie('currentUsername');

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }
    loadPurchases();
  }, [username]);

  const loadPurchases = async () => {
    try {
      const response = await fetch(`https://jem-box-backend.onrender.com/api/purchases/${username}`);
      const data = await response.json();
      
      if (data.success) {
        setPurchases(data.purchases);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error cargando compras:', error);
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 bg-yellow-900/30 text-yellow-300 px-4 py-2 rounded-full border border-yellow-700">
            <Clock size={20} />
            <span className="font-medium">En Proceso</span>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-2 bg-green-900/30 text-green-300 px-4 py-2 rounded-full border border-green-700">
            <CheckCircle size={20} />
            <span className="font-medium">Aprobada</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 bg-red-900/30 text-red-300 px-4 py-2 rounded-full border border-red-700">
            <XCircle size={20} />
            <span className="font-medium">Rechazada</span>
          </div>
        );
      default:
        return null;
    }
  };

  const handleCancelPurchase = async (purchaseId) => {
    if (!confirm('¿Estás seguro de cancelar esta compra? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`https://jem-box-backend.onrender.com/api/purchase/${purchaseId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Compra cancelada exitosamente');
        loadPurchases();
      } else {
        alert('Error al cancelar la compra');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cancelar la compra');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-gray-900 to-black flex items-center justify-center">
        <p className="text-gray-400 text-xl">Cargando tus compras...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-gray-900 to-black text-gray-100 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/index')}
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-gray-200 transition"
        >
          <ArrowLeft size={20} />
          Volver al inicio
        </button>

        <div className="flex items-center gap-4 mb-12">
          <ShoppingBag size={40} className="text-purple-400" />
          <div>
            <h1 className="text-4xl font-bold text-gray-100">Mis Compras</h1>
            <p className="text-gray-400">Historial de compras de {username}</p>
          </div>
        </div>

        {purchases.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
            <ShoppingBag size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl mb-2">No tienes compras aún</p>
            <p className="text-gray-500">¡Empieza a comprar ahora!</p>
            <button
              onClick={() => navigate('/index')}
              className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium transition"
            >
              Ver servicios
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-100 mb-2">
                      {purchase.service} - {purchase.plan}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Comprado el {new Date(purchase.created_at).toLocaleString('es-CO')}
                    </p>
                  </div>
                  {getStatusBadge(purchase.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">Duración</p>
                    <p className="text-gray-200 font-medium">{purchase.duration}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Precio</p>
                    <p className="text-gray-200 font-medium">{purchase.price}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">País</p>
                    <p className="text-gray-200 font-medium">{purchase.country}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Método de pago</p>
                    <p className="text-gray-200 font-medium">{purchase.payment_method}</p>
                  </div>
                </div>

                {/* Detalles según estado */}
                {purchase.status === 'approved' && (
                  <div className="bg-green-900/20 border border-green-800 rounded-xl p-4 mt-4">
                    <p className="text-green-300 font-bold mb-3">🎉 ¡Compra Aprobada!</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-gray-400 text-sm">📧 Correo de la cuenta:</p>
                        <p className="text-gray-100 font-mono bg-gray-800 px-3 py-2 rounded">{purchase.account_email}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">🔑 Contraseña:</p>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-100 font-mono bg-gray-800 px-3 py-2 rounded flex-1">
                            {showPassword[purchase.id] ? purchase.account_password : '••••••••'}
                          </p>
                          <button
                            onClick={() => togglePasswordVisibility(purchase.id)}
                            className="bg-gray-700 hover:bg-gray-600 p-2 rounded transition"
                          >
                            {showPassword[purchase.id] ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">⏱️ Duración del servicio:</p>
                        <p className="text-gray-100">{purchase.duration}</p>
                      </div>
                      {purchase.approved_by && (
                        <p className="text-gray-500 text-sm mt-2">Aprobado por: {purchase.approved_by}</p>
                      )}
                    </div>
                  </div>
                )}

                {purchase.status === 'rejected' && (
                  <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mt-4">
                    <p className="text-red-300 font-bold mb-2">❌ Compra Rechazada</p>
                    <p className="text-gray-300">
                      <strong>Motivo:</strong> {purchase.rejection_reason || 'No especificado'}
                    </p>
                    {purchase.rejected_by && (
                      <p className="text-gray-500 text-sm mt-2">Rechazado por: {purchase.rejected_by}</p>
                    )}
                  </div>
                )}

                {purchase.status === 'pending' && (
                  <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4 mt-4">
                    <p className="text-yellow-300 font-medium">⏳ Tu compra está siendo verificada</p>
                    <p className="text-gray-400 text-sm mt-1">Recibirás una notificación cuando sea procesada</p>
                    <button
                      onClick={() => handleCancelPurchase(purchase.id)}
                      className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition"
                    >
                      Cancelar Compra
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}