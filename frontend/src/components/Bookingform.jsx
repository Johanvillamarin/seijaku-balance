import { useState, useEffect } from 'react';
import { api } from '../services/api';

function generarHorarios() {
const horas = [];
for (let h = 9; h <= 19; h++) {
    horas.push(`${String(h).padStart(2, '0')}:00`);
}
return horas;
}

function getFechaMinima() {
const manana = new Date();
manana.setDate(manana.getDate() + 1);
return manana.toISOString().split('T')[0];
}

export default function BookingForm({ onSuccess }) {
const [servicios, setServicios] = useState([]);
const [formData, setFormData] = useState({
    Nombre: '',
    email: '',
    Servicio: '',
    fecha_reserva: '',
    hora_reserva: '',
});
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);

useEffect(() => {
    api.obtenerServicios()
    .then(res => setServicios(res.data))
    .catch(() => setServicios([]));
}, []);

function validar() {
    const newErrors = {};
    if (!formData.Nombre.trim()) newErrors.Nombre = 'El nombre es obligatorio.';
    if (!formData.email.trim()) {
    newErrors.email = 'El email es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = 'Introduce un email válido.';
    }
    if (!formData.Servicio) newErrors.Servicio = 'Selecciona un servicio.';
    if (!formData.fecha_reserva) newErrors.fecha_reserva = 'Selecciona una fecha.';
    if (!formData.hora_reserva) newErrors.hora_reserva = 'Selecciona una hora.';
    return newErrors;
}

function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
}

async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validar();
    if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
    }

    setLoading(true);
    try {
    await api.crearReserva(formData);
    onSuccess('¡Reserva confirmada! Te hemos enviado un email de confirmación.');
    setFormData({ Nombre: '', email: '', Servicio: '', fecha_reserva: '', hora_reserva: '' });
    } catch (error) {
    onSuccess(error.message, 'error');
    } finally {
    setLoading(false);
    }
}

const horarios = generarHorarios();
const fechaMin = getFechaMinima();

return (
    <form className="booking-form" onSubmit={handleSubmit} noValidate>
    <div className="form-grid">
        <div className="form-group">
        <label className="form-label" htmlFor="Nombre">Nombre completo</label>
        <input
            id="Nombre"
            name="Nombre"
            type="text"
            className={`form-input ${errors.Nombre ? 'form-input--error' : ''}`}
            value={formData.Nombre}
            onChange={handleChange}
            placeholder="Tu nombre"
          />
          {errors.Nombre && <span className="form-error">{errors.Nombre}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className={`form-input ${errors.email ? 'form-input--error' : ''}`}
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@email.com"
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group form-group--full">
          <label className="form-label" htmlFor="Servicio">Servicio</label>
          <select
            id="Servicio"
            name="Servicio"
            className={`form-input form-select ${errors.Servicio ? 'form-input--error' : ''}`}
            value={formData.Servicio}
            onChange={handleChange}
          >
            <option value="">Selecciona un servicio...</option>
            {servicios.map(s => (
              <option key={s.idServicio} value={s.nombre}>
                {s.nombre} — {s.duracion_minutos}min · {s.precio}€
              </option>
            ))}
          </select>
          {errors.Servicio && <span className="form-error">{errors.Servicio}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="fecha_reserva">Fecha</label>
          <input
            id="fecha_reserva"
            name="fecha_reserva"
            type="date"
            className={`form-input ${errors.fecha_reserva ? 'form-input--error' : ''}`}
            value={formData.fecha_reserva}
            onChange={handleChange}
            min={fechaMin}
          />
          {errors.fecha_reserva && <span className="form-error">{errors.fecha_reserva}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="hora_reserva">Hora</label>
          <select
            id="hora_reserva"
            name="hora_reserva"
            className={`form-input form-select ${errors.hora_reserva ? 'form-input--error' : ''}`}
            value={formData.hora_reserva}
            onChange={handleChange}
          >
            <option value="">Selecciona una hora...</option>
            {horarios.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          {errors.hora_reserva && <span className="form-error">{errors.hora_reserva}</span>}
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? (
          <span className="btn-loading">
            <span className="spinner" /> Procesando...
          </span>
        ) : (
          'Confirmar Reserva'
        )}
      </button>
    </form>
  );
}
