// A one-page text PDF (PDF 1.4, Helvetica), written by hand so a confirmation can be saved without a
// PDF library — e.g. a charter signature from the signature register. Latin-1 text only.
const escape = (text: string) =>
  text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\xff]/g, '?')
    .replace(/([\\()])/g, '\\$1');

/** Builds the PDF: a title, then one line per entry. */
export function textPdf(title: string, lines: string[]): Blob {
  const content = [
    'BT',
    '/F1 18 Tf',
    '72 760 Td',
    `(${escape(title)}) Tj`,
    '/F1 11 Tf',
    '0 -32 Td',
    ...lines.flatMap((line) => [`(${escape(line)}) Tj`, '0 -18 Td']),
    'ET',
  ].join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ];
  let body = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((object, i) => {
    offsets.push(body.length);
    body += `${i + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const bytes = Uint8Array.from(body, (ch) => ch.charCodeAt(0) & 0xff);
  return new Blob([bytes], { type: 'application/pdf' });
}

