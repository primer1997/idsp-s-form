import { PDF_ROWS, rowTotals, type SFormReport } from '../data';

const blank = (n: number) => (n === 0 ? '' : String(n));

function splitDate(iso: string): { d: string; m: string; y: string } {
  const [y = '', m = '', d = ''] = (iso || '').split('-');
  return { d, m, y: y.slice(2) };
}

function DigitBoxes({ value, size = 2 }: { value: string; size?: number }) {
  const chars = (value || '').padStart(size, ' ').slice(-size).split('');
  return (
    <span className="sf-dboxes">
      {chars.map((ch, i) => (
        <span key={i} className="sf-dbox">{ch === ' ' ? '' : ch}</span>
      ))}
    </span>
  );
}

export function SFormPdf({ report }: { report: SFormReport }) {
  const from = splitDate(report.weekFrom);
  const to = splitDate(report.weekTo);
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  return (
    <div className="sform-page">
      <div className="sf-head">
        <div className="sf-title">Form S</div>
        <div className="sf-subtitle">Reporting Format for Syndromic Surveillance</div>
        <div className="sf-note">(To be filled by Health Worker, Village Volunteer, Non-formal Practitioners)</div>
      </div>
      <div className="sf-rule" />

      <div className="sf-meta">
        <span className="sf-meta-item">State<u className="sf-w" style={{ width: '26mm' }}>{report.state}</u></span>
        <span className="sf-meta-item">District<u className="sf-w" style={{ width: '30mm' }}>{report.district}</u></span>
        <span className="sf-meta-item">Block<u className="sf-w" style={{ width: '30mm' }}>{report.block}</u></span>
        <span className="sf-meta-item">Year<u className="sf-w" style={{ width: '16mm' }}>{report.year}</u></span>
      </div>

      <table className="sf-info">
        <tbody>
          <tr>
            <td style={{ width: '36%' }}>
              <div className="sf-lab">Name of the Health Worker/Volunteer/Practitioner</div>
              <div className="sf-val">{report.workerName}</div>
            </td>
            <td style={{ width: '30%' }}>
              <div className="sf-lab">Name of the Supervisor</div>
              <div className="sf-val">{report.supervisor}</div>
            </td>
            <td>
              <div className="sf-lab">Name of the Reporting Unit</div>
              <div className="sf-val">{report.reportingUnit}</div>
            </td>
          </tr>
          <tr>
            <td>
              <div className="sf-lab">ID No./Unique Identifier (To be filled by DSU)</div>
              <div className="sf-val">{report.idNo}</div>
            </td>
            <td colSpan={2}>
              <div className="sf-week">
                <div className="sf-week-lab">Reporting<br />week</div>
                <div className="sf-week-rows">
                  <div className="sf-week-row">
                    <span className="sf-fromto">From</span>
                    <DigitBoxes value={from.d} /><span className="sf-dmy">dd</span>
                    <DigitBoxes value={from.m} /><span className="sf-dmy">mm</span>
                    <DigitBoxes value={from.y} /><span className="sf-dmy">yy</span>
                  </div>
                  <div className="sf-week-row">
                    <span className="sf-fromto">To</span>
                    <DigitBoxes value={to.d} /><span className="sf-dmy">dd</span>
                    <DigitBoxes value={to.m} /><span className="sf-dmy">mm</span>
                    <DigitBoxes value={to.y} /><span className="sf-dmy">yy</span>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="sf-grid">
        <colgroup>
          <col style={{ width: '34%' }} />
          {Array.from({ length: 14 }).map((_, i) => (
            <col key={i} style={{ width: '4.714%' }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={4} className="sf-corner" />
            {['a','b','c','d','e','f','g','h','i','j','k','l','m','n'].map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
          <tr>
            <th colSpan={6}>Cases</th>
            <th rowSpan={3} className="sf-vhead">Total</th>
            <th colSpan={6}>Deaths</th>
            <th rowSpan={3} className="sf-vhead">Total</th>
          </tr>
          <tr>
            <th colSpan={3}>Male</th>
            <th colSpan={3}>Female</th>
            <th colSpan={3}>Male</th>
            <th colSpan={3}>Female</th>
          </tr>
          <tr>
            {['< 5 yr','> 5 yr','Total','< 5 yr','> 5 yr','Total',
              '< 5 yr','> 5 yr','Total','< 5 yr','> 5 yr','Total'].map((h, i) => (
              <th key={i} className="sf-age">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PDF_ROWS.map((row, idx) => {
            if (row.kind === 'section') {
              return (
                <tr key={idx} className="sf-section">
                  <td colSpan={15}>{row.label}</td>
                </tr>
              );
            }
            if (row.kind === 'sub') {
              return (
                <tr key={idx} className="sf-sub">
                  <td colSpan={15}>{row.label}</td>
                </tr>
              );
            }
            const vals = rowTotals(report.rows[row.id] ?? { c_m5:0,c_m5p:0,c_f5:0,c_f5p:0,d_m5:0,d_m5p:0,d_f5:0,d_f5p:0 });
            const labelParts = row.label.split('\n');
            return (
              <tr key={idx} className={row.centered ? 'sf-datarow sf-centered' : 'sf-datarow'}>
                <td className="sf-rowlab">
                  {labelParts.map((p, i) => (
                    <span key={i}>{p}{i < labelParts.length - 1 ? <br /> : null}</span>
                  ))}
                </td>
                {vals.map((v, i) => (
                  <td key={i} className="sf-cell">{blank(v)}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="sf-foot">
        <span>Date: {dateStr}</span>
        <span className="sf-sign">Signature</span>
      </div>
    </div>
  );
}
