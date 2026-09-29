import { useEffect, useRef, useState } from 'react';
import { newReport, type SFormReport } from './data';
import { loadProfile, loadReports, saveProfile, saveReports } from './lib/store';
import { exportSFormPdf, pdfFilename } from './lib/pdf';
import { EntryForm } from './components/EntryForm';
import { ReportList } from './components/ReportList';
import { SFormPdf } from './components/SFormPdf';

type Tab = 'form' | 'list';

export default function App() {
  const [tab, setTab] = useState<Tab>('form');
  const [report, setReport] = useState<SFormReport>(() => newReport(loadProfile()));
  const [reports, setReports] = useState<SFormReport[]>(() => loadReports());
  const [busy, setBusy] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [printReport, setPrintReport] = useState<SFormReport | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2600);
  };

  useEffect(() => {
    if (printReport) {
      const t = window.setTimeout(async () => {
        try {
          const res = await exportSFormPdf(pdfFilename(printReport.weekFrom, printReport.weekTo));
          showToast(res === 'shared' ? 'PDF शेअर शीट उघडली' : 'PDF डाउनलोड झाले');
        } catch (e) {
          showToast('PDF बनवताना अडचण आली');
          console.error(e);
        } finally {
          setPrintReport(null);
          setBusy(null);
          setBusyId(null);
        }
      }, 350);
      return () => window.clearTimeout(t);
    }
  }, [printReport]);

  const persist = (list: SFormReport[]) => {
    setReports(list);
    saveReports(list);
  };

  const handleSave = () => {
    setBusy('save');
    window.setTimeout(() => {
      const updated = { ...report, updatedAt: Date.now() };
      const list = [updated, ...reports.filter((r) => r.id !== updated.id)];
      persist(list);
      saveProfile({
        state: updated.state, district: updated.district, block: updated.block,
        workerName: updated.workerName, supervisor: updated.supervisor,
        reportingUnit: updated.reportingUnit,
      });
      setReport(updated);
      setBusy(null);
      showToast('अहवाल जतन झाला');
    }, 60);
  };

  const handleExportCurrent = () => {
    setBusy('pdf');
    saveProfile({
      state: report.state, district: report.district, block: report.block,
      workerName: report.workerName, supervisor: report.supervisor,
      reportingUnit: report.reportingUnit,
    });
    setPrintReport({ ...report });
  };

  const handlePdfSaved = (r: SFormReport) => {
    setBusyId(r.id);
    setPrintReport({ ...r });
  };

  const handleEdit = (r: SFormReport) => {
    setReport({ ...r, rows: JSON.parse(JSON.stringify(r.rows)) });
    setTab('form');
    window.scrollTo(0, 0);
  };

  const handleDelete = (id: string) => {
    persist(reports.filter((r) => r.id !== id));
    showToast('अहवाल हटवला');
  };

  const handleNew = () => {
    setReport(newReport(loadProfile()));
    setTab('form');
    window.scrollTo(0, 0);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <div className="brand-title">IDSP S Form</div>
            <div className="brand-sub">Syndromic Surveillance</div>
          </div>
        </div>
        <nav className="tabs">
          <button className={tab === 'form' ? 'active' : ''} onClick={() => setTab('form')}>फॉर्म</button>
          <button className={tab === 'list' ? 'active' : ''} onClick={() => setTab('list')}>
            जतन केलेले {reports.length > 0 ? `(${reports.length})` : ''}
          </button>
        </nav>
      </header>

      <main>
        {tab === 'form' ? (
          <EntryForm report={report} onChange={setReport} onSave={handleSave}
            onExport={handleExportCurrent} busy={busy} />
        ) : (
          <ReportList reports={reports} onEdit={handleEdit} onPdf={handlePdfSaved}
            onDelete={handleDelete} onNew={handleNew} busyId={busyId} />
        )}
      </main>

      {tab === 'list' && (
        <button className="fab" onClick={handleNew} aria-label="नवीन फॉर्म">+</button>
      )}

      {toast && <div className="toast">{toast}</div>}

      {/* hidden printable replica — captured by html2canvas */}
      <div className="sform-print" aria-hidden="true">
        {printReport && <SFormPdf report={printReport} />}
      </div>
    </div>
  );
}
