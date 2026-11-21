/** Saves a CSV in the browser (exports, hub sign-ups). */
export function downloadCsv(filename: string, csv: string): void {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const toCsv = (rows: Array<Array<string | number>>) => rows.map((cells) => cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
