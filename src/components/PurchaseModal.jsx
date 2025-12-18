import { useState } from 'react';
import { Upload, Clock, ShoppingCart } from 'lucide-react';

export default function PurchaseModal({ serviceName, plan, onClose }) {
  const [country, setCountry] = useState('colombia');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [status, setStatus] = useState('selecting'); // selecting, processing

  const paymentInfo = {
    colombia: {
      nequi: '3022407069',
      daviplata: '3022407069',
    },
    mundial: {
      binance: 'fabiianm745@gmail.com',
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
    }
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

  const handleSubmit = async () => {
    if (!screenshot || !paymentMethod) {
      alert('Por favor completa todos los campos');
      return;
    }

    const username = getCookie('currentUsername') || 'Usuario';
    
    // Crear FormData para enviar la imagen
    const formData = new FormData();
    formData.append('screenshot', screenshot);
    formData.append('username', username);
    formData.append('service', serviceName);
    formData.append('plan', plan.title);
    formData.append('duration', plan.duration);
    formData.append('price', plan.price);
    formData.append('country', country);
    formData.append('paymentMethod', paymentMethod);

    try {
      const response = await fetch('https://jem-box-backend.onrender.com/api/purchase', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setStatus('processing');
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        alert(data.error || 'Error al procesar la compra');
      }
    } catch (error) {
      console.error('Error al enviar compra:', error);
      alert('Error al procesar la compra. Intenta nuevamente.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-3xl p-8 max-w-lg w-full">
        {status === 'processing' ? (
          <div className="text-center py-8">
            <Clock size={64} className="text-yellow-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-2xl font-bold text-gray-100 mb-2">En Proceso de Verificación</h3>
            <p className="text-gray-400">Un administrador verificará tu pago pronto</p>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-gray-100 mb-6">Completar Compra</h3>
            
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
              <p className="text-gray-300"><strong>Servicio:</strong> {serviceName}</p>
              <p className="text-gray-300"><strong>Plan:</strong> {plan.title} ({plan.duration})</p>
              <p className="text-gray-300"><strong>Precio:</strong> {plan.price}</p>
            </div>

            <label className="block mb-4">
              <span className="text-gray-300 font-medium mb-2 block">País</span>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setPaymentMethod('');
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100"
              >
                <option value="colombia">🇨🇴 Colombia</option>
                <option value="mundial">🌎 Resto del Mundo</option>
              </select>
            </label>

            <label className="block mb-4">
              <span className="text-gray-300 font-medium mb-2 block">Método de Pago</span>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100"
              >
                <option value="">Selecciona un método</option>
                {country === 'colombia' ? (
                  <>
                    <option value="nequi">Nequi</option>
                    <option value="daviplata">Daviplata</option>
                  </>
                ) : (
                  <option value="binance">Binance</option>
                )}
              </select>
            </label>

            {paymentMethod && (
              <div className="bg-purple-900/20 border border-purple-700 rounded-xl p-4 mb-6">
                <p className="text-purple-300 font-medium mb-2">📱 Información de Pago:</p>
                {country === 'colombia' ? (
                  <p className="text-gray-100 text-lg font-bold">
                    {paymentMethod === 'nequi' ? 'Nequi' : 'Daviplata'}: {paymentInfo.colombia[paymentMethod]}
                  </p>
                ) : (
                  <p className="text-gray-100 text-lg font-bold">
                    Binance: {paymentInfo.mundial.binance}
                  </p>
                )}
              </div>
            )}

            <label className="block mb-6">
              <span className="text-gray-300 font-medium mb-2 block">Captura del Pago</span>
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-purple-500 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label htmlFor="screenshot-upload" className="cursor-pointer">
                  <Upload size={48} className="text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">
                    {screenshot ? screenshot.name : 'Haz clic para subir la captura'}
                  </p>
                </label>
              </div>
            </label>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-100 py-3 rounded-xl font-medium transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition"
              >
                Enviar Compra
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}