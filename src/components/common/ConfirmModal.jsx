import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ message, onConfirm, onCancel, title = 'Confirm Action' }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <div style={{ width:40,height:40,borderRadius:'50%',background:'rgba(220,38,38,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
            <AlertTriangle size={20} color="#dc2626" />
          </div>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:400 }}>{title}</h3>
        </div>
        <p style={{ color:'var(--ink-soft)', marginBottom:24, fontSize:14, lineHeight:1.6 }}>{message}</p>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}