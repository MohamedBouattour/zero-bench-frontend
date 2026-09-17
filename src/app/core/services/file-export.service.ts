import { DOCUMENT, Injectable, inject } from '@angular/core';
import { injectIsBrowser } from '../utils/platform.util';

export type CsvRow = Record<string, string | number | null | undefined>;

@Injectable({
  providedIn: 'root',
})
export class FileExportService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = injectIsBrowser();

  /** Builds an RFC 4180 CSV (UTF-8 BOM for Excel) and triggers a browser download. */
  downloadCsv(filename: string, rows: readonly CsvRow[]): void {
    if (!this.isBrowser || rows.length === 0) return;

    const headers = Object.keys(rows[0]);
    const escape = (value: CsvRow[string]): string => {
      const text = String(value ?? '');
      return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const csv = [
      headers.map(escape).join(','),
      ...rows.map((row) => headers.map((header) => escape(row[header])).join(',')),
    ].join('\n');

    const url = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }));
    const link = this.document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url));
  }

  async copyToClipboard(text: string): Promise<boolean> {
    if (!this.isBrowser || !navigator.clipboard) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
}
