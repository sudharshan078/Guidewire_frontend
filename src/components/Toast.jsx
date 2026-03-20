const ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

export default function Toast({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`} onClick={() => onRemove(t.id)}>
          <span className="toast-icon">{ICONS[t.type] || 'ℹ️'}</span>
          <span className="toast-text">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
