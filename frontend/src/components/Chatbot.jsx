import { useState, useRef, useEffect } from 'react';

const SUGERENCIAS = [
  '¿Qué servicios ofrecéis?',
  '¿Hay disponibilidad esta semana?',
  '¿Cuánto cuesta el masaje relajante?',
  '¿Cuáles son vuestros horarios?',
];

export default function Chatbot() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy Seiku, tu asistente de Seijaku Balance 🌸 ¿En qué puedo ayudarte?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (abierto) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensajes, abierto]);

  async function enviarMensaje(texto) {
    const mensajeUsuario = texto || input.trim();
    if (!mensajeUsuario || loading) return;

    const nuevosMensajes = [
      ...mensajes,
      { role: 'user', content: mensajeUsuario }
    ];

    setMensajes(nuevosMensajes);
    setInput('');
    setLoading(true);

    try {
      const historial = nuevosMensajes
        .slice(1)
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }));

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const res = await fetch(`${API_URL}/chatbot/mensaje`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: mensajeUsuario,
          historial: historial.slice(0, -1)
        })
      });

      const data = await res.json();

      setMensajes(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.success
            ? data.respuesta
            : 'Lo siento, ha ocurrido un error. Por favor inténtalo de nuevo 🙏'
        }
      ]);
    } catch (error) {
      setMensajes(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, no puedo conectarme ahora mismo. Por favor inténtalo más tarde 🙏'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        className="chatbot-fab"
        onClick={() => setAbierto(!abierto)}
        title="Hablar con Kai"
      >
        {abierto ? '✕' : '🌸'}
      </button>

      {/* Ventana del chat */}
      {abierto && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header__info">
              <div className="chatbot-avatar">K</div>
              <div>
                <p className="chatbot-header__name">Seiku</p>
                <p className="chatbot-header__status">Asistente de Seijaku Balance</p>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setAbierto(false)}>✕</button>
          </div>

          {/* Mensajes */}
          <div className="chatbot-messages">
            {mensajes.map((msg, i) => (
              <div
                key={i}
                className={`chatbot-msg chatbot-msg--${msg.role}`}
              >
                <p>{msg.content}</p>
              </div>
            ))}

            {loading && (
              <div className="chatbot-msg chatbot-msg--assistant">
                <div className="chatbot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {/* Sugerencias solo al inicio */}
            {mensajes.length === 1 && !loading && (
              <div className="chatbot-sugerencias">
                {SUGERENCIAS.map((s, i) => (
                  <button
                    key={i}
                    className="chatbot-sugerencia"
                    onClick={() => enviarMensaje(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              type="text"
              className="chatbot-input"
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="chatbot-send"
              onClick={() => enviarMensaje()}
              disabled={loading || !input.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
