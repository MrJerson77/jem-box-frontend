import { useState, useEffect } from 'react';
import { ShoppingCart, Clock, CheckCircle, XCircle, LogOut, Shield, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export default function Admin() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [accountData, setAccountData] = useState({ email: '', password: '' });
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all

  const userRole = getCookie('userRole') || 'user';
  const username = getCookie('currentUsername') || 'Admin';

  useEffect(() => {
    if (userRole !== 'admin' && userRole !== 'seller') {
      alert('No tienes permisos para acceder a esta página');
      navigate('/index');
    }
  }, [userRole, navigate]);

  useEffect(() => {
    loadPurchases();
  }, []);

  const handleLogout = () => {
    deleteCookie('isLoggedIn');
    deleteCookie('currentUsername');
    deleteCookie('hasSeenWelcomeModal');
    deleteCookie('userRole');
    navigate('/');
  };

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://jem-box-backend.onrender.com/api/purchases');
      const data = await response.json();
      
      if (data.success) {
        setPurchases(data.purchases);
      }
    } catch (error) {
      console.error('Error cargando compras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (purchaseId) => {
    if (!accountData.email || !accountData.password) {
      alert('Por favor ingresa email y contraseña de la cuenta');
      return;
    }

    try {
      const response = await fetch('https://jem-box-backend.onrender.com/api/purchase/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseId,
          accountEmail: accountData.email,
          accountPassword: accountData.password,
          approvedBy: username
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Compra aprobada exitosamente');
        setSelectedPurchase(null);
        setAccountData({ email: '', password: '' });
        loadPurchases();
      } else {
        alert('Error al aprobar la compra');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al aprobar la compra');
    }
  };

  const handleReject = async (purchaseId) => {
    if (!rejectionReason.trim()) {
      alert('Por favor ingresa el motivo del rechazo');
      return;
    }

    try {
      const response = await fetch('https://jem-box-backend.onrender.com/api/purchase/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseId,
          reason: rejectionReason,
          rejectedBy: username
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('❌ Compra rechazada');
        setSelectedPurchase(null);
        setRejectionReason('');
        loadPurchases();
      } else {
        alert('Error al rechazar la compra');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al rechazar la compra');
    }
  };

  const filteredPurchases = purchases.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-gray-900 to-black flex items-center justify-center">
        <p className="text-gray-400 text-xl">Cargando compras...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-gray-900 to-black text-gray-100">
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-xl z-40 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-purple-400">Panel {userRole === 'admin' ? 'Admin' : 'Seller'}</h1>
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <Shield size={16} />
              {username} ({userRole})
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadPurchases}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition"
            >
              <RefreshCw size={18} />
              Actualizar
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

      <div className="pt-24 px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Filtros */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-3 rounded-xl font-medium transition ${
                filter === 'pending' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Pendientes ({purchases.filter(p => p.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-6 py-3 rounded-xl font-medium transition ${
                filter === 'approved' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Aprobadas ({purchases.filter(p => p.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-6 py-3 rounded-xl font-medium transition ${
                filter === 'rejected' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Rechazadas ({purchases.filter(p => p.status === 'rejected').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-xl font-medium transition ${
                filter === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Todas ({purchases.length})
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-2">Gestión de Compras</h2>
            <p className="text-gray-400">Mostrando: {filter === 'all' ? 'Todas' : filter === 'pending' ? 'Pendientes' : filter === 'approved' ? 'Aprobadas' : 'Rechazadas'}</p>
          </div>
          
          <div className="grid gap-6">
            {filteredPurchases.length === 0 ? (
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
                <ShoppingCart size={64} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-xl">No hay compras en esta categoría</p>
              </div>
            ) : (
              filteredPurchases.map((purchase) => (
                <div key={purchase.id} className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-100 mb-2">
                        #{purchase.id} - {purchase.service} - {purchase.plan}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-gray-400">👤 Usuario: <span className="text-gray-200">{purchase.username}</span></p>
                        <p className="text-gray-400">⏱️ Duración: <span className="text-gray-200">{purchase.duration}</span></p>
                        <p className="text-gray-400">💰 Precio: <span className="text-gray-200">{purchase.price}</span></p>
                        <p className="text-gray-400">🌍 País: <span className="text-gray-200">{purchase.country}</span></p>
                        <p className="text-gray-400">💳 Método: <span className="text-gray-200">{purchase.payment_method}</span></p>
                        <p className="text-gray-400 text-sm">📅 {new Date(purchase.created_at).toLocaleString('es-CO')}</p>
                      </div>
                    </div>
                    {purchase.status === 'pending' && <Clock size={32} className="text-yellow-400" />}
                    {purchase.status === 'approved' && <CheckCircle size={32} className="text-green-400" />}
                    {purchase.status === 'rejected' && <XCircle size={32} className="text-red-400" />}
                  </div>

                  {/* Captura */}
                  {purchase.screenshot_url && (
                    <div className="mb-4">
                      <p className="text-gray-300 font-medium mb-2">📸 Captura de Pago:</p>
                      <img 
                        src={`data:image/jpeg;base64,${purchase.screenshot_url}`}
                        alt="Comprobante" 
                        className="max-w-md w-full rounded-xl border border-gray-700"
                      />
                    </div>
                  )}

                  {/* Acciones para compras pendientes */}
                  {purchase.status === 'pending' && (
                    selectedPurchase === purchase.id ? (
                      <div className="bg-gray-800/50 rounded-xl p-4 mt-4">
                        <div className="mb-4">
                          <p className="text-gray-300 font-medium mb-3">✅ Aprobar compra:</p>
                          <input
                            type="email"
                            placeholder="Email de la cuenta"
                            value={accountData.email}
                            onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 mb-3"
                          />
                          <input
                            type="text"
                            placeholder="Contraseña de la cuenta"
                            value={accountData.password}
                            onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 mb-4"
                          />
                        </div>

                        <div className="mb-4 border-t border-gray-700 pt-4">
                          <p className="text-gray-300 font-medium mb-3">❌ O rechazar compra:</p>
                          <textarea
                            placeholder="Motivo del rechazo"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 mb-3"
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(purchase.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={20} />
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleReject(purchase.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                          >
                            <XCircle size={20} />
                            Rechazar
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPurchase(null);
                              setAccountData({ email: '', password: '' });
                              setRejectionReason('');
                            }}
                            className="px-4 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedPurchase(purchase.id)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition mt-4"
                      >
                        Procesar Compra
                      </button>
                    )
                  )}

                  {/* Info de compras procesadas */}
                  {purchase.status === 'approved' && (
                    <div className="bg-green-900/20 border border-green-800 rounded-xl p-4 mt-4">
                      <p className="text-green-300 font-medium mb-2">✅ Aprobada por: {purchase.approved_by}</p>
                      <p className="text-gray-400">Email: {purchase.account_email}</p>
                      <p className="text-gray-400">Contraseña: {purchase.account_password}</p>
                    </div>
                  )}

                  {purchase.status === 'rejected' && (
                    <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mt-4">
                      <p className="text-red-300 font-medium mb-2">❌ Rechazada por: {purchase.rejected_by}</p>
                      <p className="text-gray-400">Motivo: {purchase.rejection_reason}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}