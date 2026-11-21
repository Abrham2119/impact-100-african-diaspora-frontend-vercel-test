/** Saves a file in the browser. */
export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Saves a CSV in the browser (exports, hub sign-ups, registers). */
export function downloadCsv(filename: string, csv: string): void {
  downloadBlob(filename, new Blob([csv], { type: 'text/csv;charset=utf-8' }));
}

export const toCsv = (rows: Array<Array<string | number>>) => rows.map((cells) => cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
