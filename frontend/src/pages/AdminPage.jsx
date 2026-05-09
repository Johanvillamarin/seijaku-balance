import { useState, useEffect, useCallback } from 'react';
import AdminTable from '../components/AdminTable';
import Toast from '../components/Toast';
import LoginPage from './LoginPage';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';

export default function AdminPage() {
const [autenticado, setAutenticado] = useState(
    sessionStorage.getItem('seijaku_admin') === 'true'
);
const [reservas, setReservas] = useState([]);
const [loading, setLoading] = useState(true);
const { toasts, addToast, removeToast } = useToast();

const cargarReservas = useCallback(async () => {
    setLoading(true);
    try {
    const res = await api.obtenerReservas();
    setReservas(res.data);
    } catch (error) {
    addToast('Error al cargar las citas: ' + error.message, 'error');
    } finally {
    setLoading(false);
    }
}, []);

useEffect(() => {
    if (autenticado) cargarReservas();
}, [autenticado, cargarReservas]);

async function handleCancelar(id, nombre) {
    const confirmar = window.confirm(
    `¿Seguro que quieres cancelar la cita de ${nombre}?\nSe enviará un email de cancelación.`
    );
    if (!confirmar) return;

    try {
    await api.cancelarReserva(id);
    addToast(`Cita de ${nombre} cancelada correctamente.`, 'success');
    cargarReservas();
    } catch (error) {
    addToast(error.message, 'error');
    }
}

function handleLogout() {
    sessionStorage.removeItem('seijaku_admin');
    setAutenticado(false);
}

if (!autenticado) {
    return <LoginPage onLogin={() => setAutenticado(true)} />;
}

return (
    <main className="page-admin">
    <Toast toasts={toasts} removeToast={removeToast} />
    <div className="admin-header">
        <div>
        <h2 className="admin-title">Panel de Control</h2>
        <p className="admin-subtitle">Gestión de citas · Seijaku Balance</p>
        </div>
        <div className="admin-stats">
        <div className="stat-card">
            <span className="stat-number">{reservas.length}</span>
            <span className="stat-label">Citas activas</span>
        </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn-refresh" onClick={cargarReservas}>
            ↻ Actualizar
        </button>
        <button className="btn-logout" onClick={handleLogout}>
            Cerrar sesión
        </button>
        </div>
    </div>
    <AdminTable
        reservas={reservas}
        loading={loading}
        onCancelar={handleCancelar}
    />
    </main>
);
}
