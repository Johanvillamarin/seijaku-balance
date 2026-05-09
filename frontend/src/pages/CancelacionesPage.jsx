import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function CancelacionPage() {
  const [params] = useSearchParams();
  const estado = params.get('estado');
  const nombre = params.get('nombre');

  const contenido = {
    ok: {
      icono: '✅',
      titulo: `Reserva cancelada`,
      mensaje: `${nombre ? `Hola ${nombre}, tu` : 'Tu'} reserva ha sido cancelada correctamente. Te hemos enviado un email de confirmación.`,
      color: '#2c4a3e'
    },
    expirado: {
      icono: '🔒',
      titulo: 'Enlace expirado',
      mensaje: 'No es posible cancelar esta reserva porque faltan menos de 48 horas para la cita. Por favor contacta con nosotros directamente.',
      color: '#c77c2a'
    },
    no_encontrada: {
      icono: '❓',
      titulo: 'Reserva no encontrada',
      mensaje: 'No hemos encontrado ninguna reserva activa con este enlace. Es posible que ya haya sido cancelada.',
      color: '#6b6b6b'
    }
  };

  const info = contenido[estado] || contenido.no_encontrada;

  return (
    <main className="page-login">
      <div className="login-card" style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '3rem' }}>{info.icono}</span>
        <h2 style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: '1.6rem',
          fontWeight: 400,
          color: info.color,
          margin: '16px 0 8px'
        }}>
          {info.titulo}
        </h2>
        <p style={{ color: '#6b6b6b', lineHeight: 1.7, marginBottom: '32px' }}>
          {info.mensaje}
        </p>
        <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '12px 32px' }}>
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}