import { useState } from 'react';
import { CreditCard, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Checker() {
  const navigate = useNavigate();
  const [bins, setBins] = useState('');
  const [month, setMonth] = useState('random');
  const [year, setYear] = useState('random');
  const [cvv, setCvv] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [cards, setCards] = useState([]);
  const [generatedCards, setGeneratedCards] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Detectar tipo de tarjeta por BIN
  const getCardType = (bin) => {
    const firstDigit = bin[0];
    const firstTwoDigits = bin.substring(0, 2);
    
    // American Express: empieza con 34 o 37
    if (firstTwoDigits === '34' || firstTwoDigits === '37') {
      return 'amex';
    }
    // Visa: empieza con 4
    if (firstDigit === '4') {
      return 'visa';
    }
    // Mastercard: empieza con 51-55 o 2221-2720
    if (parseInt(firstTwoDigits) >= 51 && parseInt(firstTwoDigits) <= 55) {
      return 'mastercard';
    }
    if (parseInt(bin.substring(0, 4)) >= 2221 && parseInt(bin.substring(0, 4)) <= 2720) {
      return 'mastercard';
    }
    
    // Por defecto, asumir Visa/Mastercard (CVV de 3 dígitos)
    return 'other';
  };

  // Algoritmo de Luhn para validar tarjetas
  const luhnCheck = (cardNumber) => {
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  // Generar dígito de control (último dígito)
  const generateCheckDigit = (cardNumber) => {
    let sum = 0;
    let isEven = true;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit;
  };

  // Generar tarjeta desde BIN
  const generateCardFromBIN = (bin) => {
    const cardType = getCardType(bin);
    const cardLength = cardType === 'amex' ? 15 : 16;
    
    // Rellenar con dígitos aleatorios hasta tener cardLength-1 dígitos
    let cardNumber = bin;
    while (cardNumber.length < cardLength - 1) {
      cardNumber += Math.floor(Math.random() * 10);
    }
    
    // Agregar dígito de control
    const checkDigit = generateCheckDigit(cardNumber);
    cardNumber += checkDigit;
    
    return cardNumber;
  };

  // Generar mes aleatorio
  const getRandomMonth = () => {
    return String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  };

  // Generar año aleatorio
  const getRandomYear = () => {
    const years = [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032];
    return years[Math.floor(Math.random() * years.length)];
  };

  // Generar CVV según tipo de tarjeta
  const getRandomCVV = (bin) => {
    const cardType = getCardType(bin);
    const length = cardType === 'amex' ? 4 : 3;
    return String(Math.floor(Math.random() * Math.pow(10, length))).padStart(length, '0');
  };

  // Validar CVV
  const validateCVV = (cvvInput) => {
    if (!cvvInput) return true; // CVV vacío es válido (se genera random)
    return cvvInput.length === 3 || cvvInput.length === 4;
  };

  // Generar tarjetas
  const handleGenerate = () => {
    // Validaciones
    if (!bins.trim()) {
      setMessage({ text: '❌ Debes ingresar al menos un BIN', type: 'error' });
      return;
    }

    if (cvv && !validateCVV(cvv)) {
      setMessage({ text: '❌ El CVV debe tener 3 o 4 dígitos', type: 'error' });
      return;
    }

    if (quantity < 1 || quantity > 130) {
      setMessage({ text: '❌ La cantidad debe estar entre 1 y 130', type: 'error' });
      return;
    }

    // Procesar BINs
    const binList = bins.split(';').map(b => b.trim()).filter(b => b.length >= 6 && b.length <= 16);

    if (binList.length === 0) {
      setMessage({ text: '❌ Debes ingresar BINs válidos (6-16 dígitos)', type: 'error' });
      return;
    }

    // Generar tarjetas
    const newCards = [];
    for (let i = 0; i < quantity; i++) {
      const randomBin = binList[Math.floor(Math.random() * binList.length)];
      const cardNumber = generateCardFromBIN(randomBin);
      
      const cardMonth = month === 'random' ? getRandomMonth() : month;
      const cardYear = year === 'random' ? getRandomYear() : year;
      
      // Si el usuario especificó CVV, usarlo; si no, generar según tipo de tarjeta
      const cardCVV = cvv || getRandomCVV(randomBin);

      const card = `${cardNumber}|${cardMonth}|${cardYear}|${cardCVV}`;
      newCards.push(card);
    }

    setMessage({ text: `✅ ${newCards.length} tarjetas generadas exitosamente`, type: 'success' });
    setGeneratedCards(newCards);
  };

  // Agregar tarjetas generadas al textarea
  const handleAdd = () => {
    if (generatedCards.length === 0) {
      setMessage({ text: '❌ Primero debes generar tarjetas', type: 'error' });
      return;
    }

    // Calcular cuántas caben (máximo 130)
    const availableSpace = 130 - cards.length;
    
    if (availableSpace <= 0) {
      setMessage({ text: '❌ Ya tienes 130 tarjetas (máximo alcanzado)', type: 'error' });
      return;
    }

    const cardsToAdd = generatedCards.slice(0, availableSpace);
    const remaining = generatedCards.length - cardsToAdd.length;

    setCards(prevCards => [...prevCards, ...cardsToAdd]);
    
    if (remaining > 0) {
      setMessage({ 
        text: `⚠️ Se agregaron ${cardsToAdd.length} tarjetas. ${remaining} no cupieron (máximo 130)`, 
        type: 'info' 
      });
    } else {
      setMessage({ text: `✅ ${cardsToAdd.length} tarjetas agregadas`, type: 'success' });
    }
    
    setGeneratedCards([]);
  };

  // Limpiar todo
  const handleClear = () => {
    setCards([]);
    setGeneratedCards([]);
    setMessage({ text: 'ℹ️ Todas las tarjetas fueron eliminadas', type: 'info' });
  };

  // Contar tarjetas únicas
  const uniqueCards = [...new Set(cards)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-gray-900 to-black text-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <CreditCard size={36} className="text-purple-400" />
            Panel de Control
          </h1>
          <div></div>
        </div>

        {/* Advertencia */}
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-2xl p-6 mb-8">
          <p className="text-yellow-200 text-center leading-relaxed">
            🏢 <strong>Amazon Business:</strong> Requiere dirección registrada en New York en tu cuenta Amazon.
          </p>
          <p className="text-yellow-200 text-center mt-3 leading-relaxed">
            😴 ¿Cansado de sacar cookies? Compra Cookies USA y Business con: <a href="https://t.me/soyjemoox" target="_blank" rel="noopener" className="text-yellow-100 underline">@soyjemoox</a>
          </p>
          <p className="text-yellow-200 text-center mt-3 leading-relaxed">
            💎 Compra VIP con <a href="https://t.me/soyjemoox" target="_blank" rel="noopener" className="text-yellow-100 underline">@soyjemoox</a> 🎁 5 Cookies de REGALO por renovar/primera compra
          </p>
        </div>

        {/* Mensaje de estado */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl text-center font-medium border ${
            message.type === 'success' ? 'bg-green-900/50 text-green-300 border-green-800' :
            message.type === 'error' ? 'bg-red-900/50 text-red-300 border-red-800' :
            'bg-blue-900/50 text-blue-300 border-blue-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel izquierdo - Generador */}
          <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-purple-400">Generador Automático de Tarjetas</h2>

            {/* BINs */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">BINs</label>
              <input
                type="text"
                placeholder="401288"
                value={bins}
                onChange={(e) => {
                  // Solo permitir números, punto y coma, y espacios
                  const value = e.target.value.replace(/[^0-9;]/g, '');
                  // Validar cada BIN individualmente
                  const binList = value.split(';');
                  const validBins = binList.map(bin => {
                    // Máximo 16 dígitos por BIN
                    return bin.slice(0, 16);
                  }).join(';');
                  setBins(validBins);
                }}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-gray-100"
              />
            </div>

            {/* Mes */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">Mes</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-gray-100"
              >
                <option value="random">Random</option>
                <option value="01">01 - Enero</option>
                <option value="02">02 - Febrero</option>
                <option value="03">03 - Marzo</option>
                <option value="04">04 - Abril</option>
                <option value="05">05 - Mayo</option>
                <option value="06">06 - Junio</option>
                <option value="07">07 - Julio</option>
                <option value="08">08 - Agosto</option>
                <option value="09">09 - Septiembre</option>
                <option value="10">10 - Octubre</option>
                <option value="11">11 - Noviembre</option>
                <option value="12">12 - Diciembre</option>
              </select>
            </div>

            {/* Año */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">Año</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-gray-100"
              >
                <option value="random">Random</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
                <option value="2029">2029</option>
                <option value="2030">2030</option>
                <option value="2031">2031</option>
                <option value="2032">2032</option>
              </select>
            </div>

            {/* CVV */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">CVV</label>
              <input
                type="text"
                placeholder="123"
                value={cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 4) setCvv(value);
                }}
                maxLength={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-gray-100"
              />
            </div>

            {/* Cantidad */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-2 text-gray-300">Cantidad</label>
              <input
                type="number"
                min="1"
                max="130"
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(130, Math.max(1, value)));
                }}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Máximo: 130 tarjetas</p>
            </div>

            {/* Botones separados */}
            <div className="space-y-3">
              <button
                onClick={handleGenerate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                <CreditCard size={20} />
                Generar
              </button>
              
              <button
                onClick={handleAdd}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Agregar al Panel
              </button>
              
              <button
                onClick={handleClear}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                <Trash2 size={20} />
                Eliminar Todo
              </button>
            </div>

            {/* Preview de tarjetas generadas */}
            {generatedCards.length > 0 && (
              <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <p className="text-sm text-gray-400 mb-2">✅ {generatedCards.length} tarjetas listas para agregar</p>
                <p className="text-xs text-gray-500">Click en "Agregar al Panel" para añadirlas</p>
              </div>
            )}
          </div>

          {/* Panel derecho - Tarjetas */}
          <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-400">Tarjetas en Panel</h2>
              <p className="text-gray-400">
                {cards.length} / 130 ({uniqueCards.length} únicas)
              </p>
            </div>

            <textarea
              value={cards.join('\n')}
              readOnly
              placeholder="Las tarjetas agregadas aparecerán aquí (máximo 130)..."
              className="w-full h-[600px] px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-gray-100 font-mono text-sm resize-none"
            />

            {cards.length > 0 && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(cards.join('\n'));
                  setMessage({ text: '📋 Tarjetas copiadas al portapapeles', type: 'success' });
                }}
                className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition"
              >
                📋 Copiar todas
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
