import BookingForm from '../components/Bookingform';
import Toast from '../components/Toast';
import Chatbot from '../components/Chatbot';
import { useToast } from '../hooks/useToast';
import fondo from '../assets/fondo.jpg';

export default function ClientePage() {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <main className="page-client">
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="hero">
        <h2 className="hero__title">Reserva tu sesión</h2>
        <p className="hero__subtitle">
          Encuentra tu equilibrio. Elige el servicio, la fecha y la hora que mejor se adapten a ti.
        </p>
      </div>
      <section className="booking-section">
        <div className="booking-card">
          <div className="booking-card__header">
            <div className="booking-card__line" />
            <h3>Nueva Reserva</h3>
            <div className="booking-card__line" />
          </div>
          <BookingForm
            onSuccess={(msg, type = 'success') => addToast(msg, type)}
          />
        </div>
      </section>
      <Chatbot />
    </main>
  );
}
