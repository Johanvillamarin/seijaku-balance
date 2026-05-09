export default function Toast({ toasts, removeToast }) {
    if (!toasts || toasts.length === 0) return null;

    return (
    <div className="toast-container">
        {toasts.map(toast => (
        <div
            key={toast.id}
            className={`toast toast--${toast.type}`}
            onClick={() => removeToast(toast.id)}
        >
            <span className="toast__icon">
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
            </span>
            <p className="toast__message">{toast.message}</p>
        </div>
        ))}
    </div>
    );
}
