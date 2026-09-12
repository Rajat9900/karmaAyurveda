'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';
import { bulkImportBlogsAction, BulkBlogRow, BulkImportResult } from '@/app/actions/blogActions';

interface FieldDef {
  key: keyof BulkBlogRow;
  label: string;
  required?: boolean;
  aliases: string[];
}

const FIELDS: FieldDef[] = [
  { key: 'title', label: 'Blog Title', required: true, aliases: ['title', 'blogtitle', 'name', 'heading'] },
  { key: 'slug', label: 'URL Slug', aliases: ['slug', 'url', 'urlslug', 'permalink'] },
  { key: 'excerpt', label: 'Brief Excerpt', aliases: ['excerpt', 'summary', 'shortdescription', 'shortdesc'] },
  { key: 'content', label: 'Body Content', aliases: ['content', 'body', 'description', 'blogcontent'] },
  { key: 'author', label: 'Author Name', aliases: ['author', 'authorname', 'writer'] },
  { key: 'date', label: 'Blog Date', aliases: ['date', 'blogdate', 'publishdate', 'publisheddate'] },
  { key: 'image', label: 'Featured Image URL', aliases: ['image', 'imageurl', 'featuredimage', 'thumbnail'] },
  { key: 'category', label: 'Category', aliases: ['category', 'categoryname'] },
  { key: 'tags', label: 'Tags (comma-separated)', aliases: ['tags', 'tag', 'tagnames'] },
  { key: 'meta_title', label: 'Meta Title', aliases: ['metatitle', 'seotitle'] },
  { key: 'meta_keywords', label: 'Meta Keywords', aliases: ['metakeywords', 'seokeywords', 'keywords'] },
  { key: 'meta_des', label: 'Meta Description', aliases: ['metadescription', 'metades', 'seodescription'] },
  { key: 'head_script', label: 'Blog Head Script', aliases: ['headscript', 'blogheadscript'] },
  { key: 'footer_script', label: 'Blog Footer Script', aliases: ['footerscript', 'blogfooterscript'] },
  { key: 'status', label: 'Active/Inactive', aliases: ['status', 'activeinactive', 'active'] }
];

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export default function BulkBlogUploadClient() {
  const router = useRouter();

  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({}); // fieldKey -> header name ('' = not mapped)
  const [parseError, setParseError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  // Rows are sent in small batches rather than the whole file in one request, since a single
  // large request/response for a big CSV can get truncated in transit (e.g. mid-JSON parse errors).
  const BATCH_SIZE = 50;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setResult(null);
    setFileName(file.name);

    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });

      if (!data || data.length === 0) {
        setParseError('The file appears to be empty.');
        return;
      }

      const detectedHeaders = (data[0] as string[]).map(h => String(h || '').trim());
      const dataRows = (data.slice(1) as string[][]).filter(r => r.some(cell => String(cell || '').trim() !== ''));

      setHeaders(detectedHeaders);
      setRows(dataRows);

      // Auto-guess mapping based on header name aliases
      const guessedMapping: Record<string, string> = {};
      FIELDS.forEach(field => {
        const match = detectedHeaders.find(h => {
          const normalizedHeader = normalize(h);
          return field.aliases.some(alias => normalize(alias) === normalizedHeader);
        });
        guessedMapping[field.key] = match || '';
      });
      setMapping(guessedMapping);
    } catch (err) {
      console.error(err);
      setParseError('Failed to parse this file. Please make sure it is a valid CSV or Excel (.xlsx) file.');
    }
  };

  const handleMappingChange = (fieldKey: string, headerName: string) => {
    setMapping(prev => ({ ...prev, [fieldKey]: headerName }));
  };

  const buildMappedRows = (): BulkBlogRow[] => {
    return rows.map(row => {
      const mapped: BulkBlogRow = {};
      FIELDS.forEach(field => {
        const headerName = mapping[field.key];
        if (!headerName) return;
        const colIndex = headers.indexOf(headerName);
        if (colIndex === -1) return;
        const value = row[colIndex];
        if (value !== undefined && value !== null) {
          (mapped as any)[field.key] = String(value);
        }
      });
      return mapped;
    });
  };

  const handleImport = async () => {
    if (!mapping.title) {
      setParseError('You must map the "Blog Title" field before importing.');
      return;
    }

    setSubmitting(true);
    setParseError(null);
    setResult(null);

    const mappedRows = buildMappedRows();
    const aggregate: BulkImportResult = { success: true, created: 0, skipped: 0, errors: [] };
    setProgress({ done: 0, total: mappedRows.length });

    try {
      for (let start = 0; start < mappedRows.length; start += BATCH_SIZE) {
        const batch = mappedRows.slice(start, start + BATCH_SIZE);
        const batchResult = await bulkImportBlogsAction(batch, start);
        aggregate.created += batchResult.created;
        aggregate.skipped += batchResult.skipped;
        aggregate.errors.push(...batchResult.errors);
        if (!batchResult.success) aggregate.success = false;
        setProgress({ done: Math.min(start + BATCH_SIZE, mappedRows.length), total: mappedRows.length });
      }
      setResult(aggregate);
      if (aggregate.success && aggregate.created > 0) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setParseError('An unexpected error occurred during import.');
    } finally {
      setSubmitting(false);
      setProgress(null);
    }
  };

  const previewRows = rows.slice(0, 5);

  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8 space-y-6">

      {/* Breadcrumbs */}
      <div className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-2 uppercase">
        <Link href="/admin/dashboard" className="hover:text-slate-650">Dashboard</Link>
        <span className="text-slate-300">/</span>
        <Link href="/admin/blogs" className="hover:text-slate-650">Blogs</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">Bulk Upload</span>
      </div>

      {/* Page Title & Cancel Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/10">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Bulk Upload Blogs</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Import multiple blog posts at once from a CSV or Excel file</p>
          </div>
        </div>

        <Link
          href="/admin/blogs"
          className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </Link>
      </div>

      {/* Step 1: File Upload */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-6 space-y-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Step 1 — Choose File</span>

        {parseError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs font-bold text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            {parseError}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-1 flex-grow">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-xs text-slate-500
                file:mr-4 file:py-1.5 file:px-4
                file:rounded-xl file:border-0
                file:text-[11px] file:font-black
                file:bg-emerald-50 file:text-emerald-700
                hover:file:bg-emerald-100
                cursor-pointer"
            />
            <span className="text-[9px] font-bold text-slate-450 block">
              Accepts .csv, .xlsx, or .xls. The first row must contain column headers.
            </span>
          </div>
        </div>

        {fileName && rows.length > 0 && (
          <p className="text-xs font-bold text-emerald-700">
            Loaded "{fileName}" — {rows.length} row{rows.length === 1 ? '' : 's'} detected with {headers.length} columns.
          </p>
        )}
      </div>

      {/* Step 2: Column Mapping */}
      {headers.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-6 space-y-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Step 2 — Link Excel Columns to Blog Fields</span>
          <p className="text-[10px] font-medium text-slate-400 -mt-2">
            We've auto-matched columns where possible. Review and adjust before importing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FIELDS.map(field => (
              <div key={field.key} className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                  {field.label}{field.required && '*'}
                </label>
                <select
                  value={mapping[field.key] || ''}
                  onChange={(e) => handleMappingChange(field.key, e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs bg-white font-semibold text-slate-800"
                >
                  <option value="">-- Not Mapped --</option>
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {previewRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-6 space-y-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Step 3 — Preview (first {previewRows.length} rows)</span>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-600">
              <thead className="bg-[#fcfdfe] border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <tr>
                  {FIELDS.filter(f => mapping[f.key]).map(f => (
                    <th key={f.key} className="py-3 px-4">{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-600">
                {buildMappedRows().slice(0, 5).map((row, idx) => (
                  <tr key={idx}>
                    {FIELDS.filter(f => mapping[f.key]).map(f => (
                      <td key={f.key} className="py-3 px-4 max-w-[220px] truncate" title={(row as any)[f.key] || ''}>
                        {(row as any)[f.key] || <span className="text-slate-300 italic">empty</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleImport}
              disabled={submitting}
              className="px-6 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-60 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {progress ? `Importing... ${progress.done}/${progress.total}` : 'Importing...'}
                </>
              ) : (
                <>
                  Import {rows.length} Blog{rows.length === 1 ? '' : 's'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Import Results */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span className="text-sm font-black text-slate-900">
              Import complete — {result.created} created, {result.skipped} skipped.
            </span>
          </div>

          {result.errors.length > 0 && (
            <div className="max-h-56 overflow-y-auto border border-slate-100 rounded-xl">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-[#fcfdfe] border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4 w-20">Row</th>
                    <th className="py-2.5 px-4">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-semibold text-slate-600">
                  {result.errors.map((e, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-4">{e.row}</td>
                      <td className="py-2 px-4">{e.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Link
              href="/admin/blogs"
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold transition-all"
            >
              Go to Blogs List
            </Link>
          </div>
        </div>
      )}

    </main>
  );
}
