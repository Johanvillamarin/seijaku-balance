import { useState } from 'react';

const ADMIN_EMAIL = 'admin@seijakubalance.com';
const ADMIN_PASSWORD = 'seijaku2024';

export default function LoginPage({ onLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (
        formData.email === ADMIN_EMAIL &&
        formData.password === ADMIN_PASSWORD
      ) {
        sessionStorage.setItem('seijaku_admin', 'true');
        onLogin();
      } else {
        setError('Correo o contraseña incorrectos.');
      }
      setLoading(false);
    }, 600);
  }

  return (
    <main className="page-login">
      <div className="login-card">
        <div className="login-card__header">
          <span className="login-kanji">静寂</span>
          <h2 className="login-title">Panel de Administración</h2>
          <p className="login-subtitle">Acceso restringido · Seijaku Balance</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@seijakubalance.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label" htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error">
              <span>✕</span> {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" /> Verificando...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
