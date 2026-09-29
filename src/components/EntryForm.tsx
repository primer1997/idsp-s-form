import { ENTRY_SECTIONS, type CellVals, type SFormReport } from '../data';

interface Props {
  report: SFormReport;
  onChange: (r: SFormReport) => void;
  onSave: () => void;
  onExport: () => void;
  busy: string | null;
}

function Num({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <label className="num">
      <span>{label}</span>
      <input
        type="number" min={0} inputMode="numeric"
        value={value === 0 ? '' : value}
        placeholder="0"
        onChange={(e) => {
          const v = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
          onChange(v);
        }}
      />
    </label>
  );
}

const FIELDS: { key: keyof CellVals; label: string }[] = [
  { key: 'c_m5', label: 'पु <५' },
  { key: 'c_m5p', label: 'पु >५' },
  { key: 'c_f5', label: 'स्त्री <५' },
  { key: 'c_f5p', label: 'स्त्री >५' },
];
const DFIELDS: { key: keyof CellVals; label: string }[] = [
  { key: 'd_m5', label: 'पु <५' },
  { key: 'd_m5p', label: 'पु >५' },
  { key: 'd_f5', label: 'स्त्री <५' },
  { key: 'd_f5p', label: 'स्त्री >५' },
];

export function EntryForm({ report, onChange, onSave, onExport, busy }: Props) {
  const set = (patch: Partial<SFormReport>) => onChange({ ...report, ...patch });
  const setCell = (id: string, key: keyof CellVals, v: number) =>
    onChange({ ...report, rows: { ...report.rows, [id]: { ...report.rows[id], [key]: v } } });

  const total = (id: string, keys: (keyof CellVals)[]) =>
    keys.reduce((s, k) => s + (report.rows[id]?.[k] ?? 0), 0);

  return (
    <div className="entry">
      <section className="card">
        <h2>अहवालाची माहिती</h2>
        <div className="grid2">
          <label>State<input value={report.state} onChange={(e) => set({ state: e.target.value })} placeholder="Maharashtra" /></label>
          <label>District<input value={report.district} onChange={(e) => set({ district: e.target.value })} /></label>
          <label>Block<input value={report.block} onChange={(e) => set({ block: e.target.value })} /></label>
          <label>Year<input value={report.year} onChange={(e) => set({ year: e.target.value })} inputMode="numeric" /></label>
        </div>
        <label className="full">आरोग्य कर्मचाऱ्याचे नाव<input value={report.workerName} onChange={(e) => set({ workerName: e.target.value })} /></label>
        <div className="grid2">
          <label>पर्यवेक्षकाचे नाव<input value={report.supervisor} onChange={(e) => set({ supervisor: e.target.value })} /></label>
          <label>रिपोर्टिंग युनिट<input value={report.reportingUnit} onChange={(e) => set({ reportingUnit: e.target.value })} /></label>
        </div>
        <label className="full">ID No. / Unique Identifier<input value={report.idNo} onChange={(e) => set({ idNo: e.target.value })} placeholder="DSU भरेल" /></label>
        <div className="grid2">
          <label>आठवडा: पासून<input type="date" value={report.weekFrom} onChange={(e) => set({ weekFrom: e.target.value })} /></label>
          <label>आठवडा: पर्यंत<input type="date" value={report.weekTo} onChange={(e) => set({ weekTo: e.target.value })} /></label>
        </div>
        <p className="hint">हे माहिती एकदा भरली की पुढच्या आठवड्यात आपोआप भरलेली येईल.</p>
      </section>

      {ENTRY_SECTIONS.map((sec) => (
        <section className="card" key={sec.heading}>
          <h2>{sec.heading}</h2>
          {sec.rows.map((row) => {
            const cTot = total(row.id, ['c_m5', 'c_m5p', 'c_f5', 'c_f5p']);
            const dTot = total(row.id, ['d_m5', 'd_m5p', 'd_f5', 'd_f5p']);
            return (
              <div className="syndrome" key={row.id}>
                <div className="syndrome-name">{row.label}</div>
                <div className="io-group">
                  <div className="io-title">रुग्ण (Cases) <b>{cTot > 0 ? `= ${cTot}` : ''}</b></div>
                  <div className="io-grid">
                    {FIELDS.map((f) => (
                      <Num key={f.key} label={f.label} value={report.rows[row.id]?.[f.key] ?? 0}
                        onChange={(v) => setCell(row.id, f.key, v)} />
                    ))}
                  </div>
                </div>
                <div className="io-group deaths">
                  <div className="io-title">मृत्यू (Deaths) <b>{dTot > 0 ? `= ${dTot}` : ''}</b></div>
                  <div className="io-grid">
                    {DFIELDS.map((f) => (
                      <Num key={f.key} label={f.label} value={report.rows[row.id]?.[f.key] ?? 0}
                        onChange={(v) => setCell(row.id, f.key, v)} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      ))}

      <div className="stickybar">
        <button className="btn secondary" onClick={onSave} disabled={!!busy}>
          {busy === 'save' ? 'जतन होत आहे…' : 'जतन करा'}
        </button>
        <button className="btn primary" onClick={onExport} disabled={!!busy}>
          {busy === 'pdf' ? 'PDF बनत आहे…' : 'PDF एक्सपोर्ट'}
        </button>
      </div>
    </div>
  );
}
