import { useNotification } from '../context/Appcontext';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export default function NotificationToast() {
  const { notifications, remove } = useNotification();

  const icons = {
    success: <CheckCircle size={17} />,
    error: <XCircle size={17} />,
    info: <Info size={17} />,
  };

  return (
    <div className="toast-container">
      {notifications.map(n => (
        <div key={n.id} className={`toast toast-${n.type}`}>
          {icons[n.type]}
          <span style={{ flex: 1 }}>{n.message}</span>
          <button onClick={() => remove(n.id)} style={{ background:'none',border:'none',color:'inherit',cursor:'pointer',padding:'2px' }}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
