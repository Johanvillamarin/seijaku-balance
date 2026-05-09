const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(endpoint, options = {}) {
const url = `${BASE_URL}${endpoint}`;
const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
};

const response = await fetch(url, config);
const data = await response.json();

if (!response.ok) {
    throw new Error(data.message || `Error ${response.status}`);
}

return data;
}

export const api = {
obtenerReservas: () => request('/reservas'),
obtenerServicios: () => request('/reservas/servicios'),
crearReserva: (datos) => request('/reservas', { method: 'POST', body: JSON.stringify(datos) }),
cancelarReserva: (id) => request(`/reservas/${id}`, { method: 'DELETE' }),
};
