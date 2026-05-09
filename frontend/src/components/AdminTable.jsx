import { api } from '../services/api';

function esMenos48h(fecha, hora) {
  const fechaStr = typeof fecha === 'string'
    ? fecha.split('T')[0]
    : fecha.toISOString().split('T')[0];
  const fechaCita = new Date(`${fechaStr}T${hora}`);
  const horasRestantes = (fechaCita - new Date()) / (1000 * 60 * 60);
  return horasRestantes < 48;
}

function formatFecha(fecha) {
  const f = typeof fecha === 'string'
    ? fecha.split('T')[0]
    : fecha.toISOString().split('T')[0];
  return new Date(f + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

export default function AdminTable({ reservas, loading, onCancelar }) {
  if (loading) {
    return (
      <div className="table-loading">
        <div className="spinner spinner--large" />
        <p>Cargando citas...</p>
      </div>
    );
  }

  if (!reservas || reservas.length === 0) {
    return (
      <div className="table-empty">
        <span className="table-empty__icon">🌸</span>
        <p>No hay citas confirmadas.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Email</th>
            <th>Servicio</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map(reserva => {
            const bloqueado = esMenos48h(reserva.fecha_reserva, reserva.hora_reserva);
            return (
              <tr key={reserva.idReservas} className={bloqueado ? 'row--warning' : ''}>
                <td className="td--id">{reserva.idReservas}</td>
                <td><strong>{reserva.Nombre}</strong></td>
                <td className="td--email">{reserva.email}</td>
                <td><span className="badge">{reserva.Servicio}</span></td>
                <td>{formatFecha(reserva.fecha_reserva)}</td>
                <td>{String(reserva.hora_reserva).substring(0, 5)}</td>
                <td>
                  <div className="action-cell">
                    <button
                      className="btn-cancel"
                      disabled={bloqueado}
                      onClick={() => !bloqueado && onCancelar(reserva.idReservas, reserva.Nombre)}
                      title={bloqueado ? '⚠️ No se puede cancelar con menos de 48h' : 'Cancelar esta cita'}
                    >
                      {bloqueado ? '🔒 Bloqueado' : 'Cancelar'}
                    </button>
                    {bloqueado && (
                      <span className="warning-hint">menos de 48h</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
