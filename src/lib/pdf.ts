import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Renders the hidden .sform-print element -> 1-page A4 PDF (10mm margins),
// then shares via the OS share sheet (WhatsApp etc.) or downloads.
export async function exportSFormPdf(filename: string): Promise<'shared' | 'downloaded'> {
  const el = document.querySelector('.sform-print') as HTMLElement | null;
  if (!el) throw new Error('Print element not found');

  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  const img = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const w = 190;
  const h = (canvas.height / canvas.width) * w;
  pdf.addImage(img, 'PNG', 10, 10, w, Math.min(h, 277));

  const blob: Blob = pdf.output('blob');
  const file = new File([blob], filename, { type: 'application/pdf' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: 'IDSP S Form' });
    return 'shared';
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return 'downloaded';
}

export function pdfFilename(weekFrom: string, weekTo: string): string {
  const s = (d: string) => (d || '').split('-').reverse().join('-');
  return `IDSP-S-Form_${s(weekFrom)}_to_${s(weekTo)}.pdf`;
}
