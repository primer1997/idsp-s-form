import type { SFormReport } from '../data';
import { weekLabel } from '../lib/store';

interface Props {
  reports: SFormReport[];
  onEdit: (r: SFormReport) => void;
  onPdf: (r: SFormReport) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  busyId: string | null;
}

export function ReportList({ reports, onEdit, onPdf, onDelete, onNew, busyId }: Props) {
  if (reports.length === 0) {
    return (
      <div className="empty">
        <p>अजून एकही अहवाल जतन केलेला नाही.</p>
        <button className="btn primary" onClick={onNew}>नवीन S फॉर्म भरा</button>
      </div>
    );
  }
  return (
    <div className="list">
      {reports.map((r) => (
        <div className="report-row" key={r.id}>
          <div className="report-info">
            <div className="report-week">आठवडा: {weekLabel(r)}</div>
            <div className="report-sub">
              {r.reportingUnit || r.block || '—'}
              {' · '}
              {new Date(r.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
          <div className="report-actions">
            <button className="btn small primary" disabled={busyId === r.id} onClick={() => onPdf(r)}>
              {busyId === r.id ? '…' : 'PDF'}
            </button>
            <button className="btn small secondary" onClick={() => onEdit(r)}>बदला</button>
            <button
              className="btn small danger"
              onClick={() => { if (window.confirm('हा अहवाल कायमचा हटवायचा?')) onDelete(r.id); }}
            >
              हटवा
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
