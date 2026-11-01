// GAGO CAMPAIGN OS — Importar / Exportar
import { useState, useRef } from 'react';
import { useStore, generateId, now } from '../lib/store';
import type { MetricRow } from '../lib/types';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export default function ImportExportPage() {
  const { state, dispatch, addAuditEvent } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<{ accepted: number; rejected: number; errors: string[] } | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'html'>('json');

    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const user = state.user;
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) {
        setImportResult({ accepted: 0, rejected: 0, errors: ['Archivo vacío o sin datos.'] });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const accepted: MetricRow[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        try {
          const row: MetricRow = {
            id: generateId(),
            importId: '',
            organizationId: state.organization.id,
            campaignId: cols[headers.indexOf('campaign_id')] || '',
            campaignReference: cols[headers.indexOf('campaign_reference')] || '',
            date: cols[headers.indexOf('date')] || '',
            currency: cols[headers.indexOf('currency')] || 'EUR',
            spendMinorUnits: parseInt(cols[headers.indexOf('spend')] || '0'),
            impressions: parseInt(cols[headers.indexOf('impressions')] || '0'),
            clicks: parseInt(cols[headers.indexOf('clicks')] || '0'),
            conversions: parseInt(cols[headers.indexOf('conversions')] || '0'),
            revenueMinorUnits: parseInt(cols[headers.indexOf('revenue')] || '0'),
            source: file.name
          };
          if (row.campaignId || row.campaignReference) {
            accepted.push(row);
          } else {
            errors.push(`Fila ${i + 1}: campaign_id o campaign_reference requerido`);
          }
        } catch {
          errors.push(`Fila ${i + 1}: error de formato`);
        }
      }

      const importId = generateId();
      accepted.forEach(r => r.importId = importId);

      dispatch({
        type: 'ADD_METRIC_IMPORT',
        payload: {
          id: importId,
          organizationId: state.organization.id,
          fileName: file.name,
          fileHash: Math.random().toString(36).slice(2),
          source: 'csv_import',
          importedBy: user.id,
          importedAt: now(),
          rowsAccepted: accepted.length,
          rowsRejected: errors.length,
          errors,
          formatVersion: '1.0'
        }
      });

      if (accepted.length > 0) {
        dispatch({ type: 'ADD_METRIC_ROWS', payload: accepted });
      }

      addAuditEvent('Métricas importadas', 'metric_import', importId, `${accepted.length} filas de ${file.name}`);
      setImportResult({ accepted: accepted.length, rejected: errors.length, errors });
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExport = () => {
    let content: string;
    let mimeType: string;
    let extension: string;

    const exportData = {
      organization: state.organization,
      products: state.products,
      campaigns: state.campaigns,
      creatives: state.creatives,
      evidence: state.evidence,
      exportedAt: now()
    };

    switch (exportFormat) {
      case 'json':
        content = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
        extension = 'json';
        break;
      case 'csv':
        const rows = [
          ['Tipo', 'ID', 'Nombre', 'Estado', 'Fecha creación'],
          ...state.products.map(p => ['Producto', p.id, p.name, p.status, p.createdAt]),
          ...state.campaigns.map(c => ['Campaña', c.id, c.name, c.internalStatus, c.createdAt]),
          ...state.creatives.map(cr => ['Anuncio', cr.id, cr.name, cr.status, cr.createdAt]),
        ];
        content = rows.map(r => r.join(',')).join('\n');
        mimeType = 'text/csv';
        extension = 'csv';
        break;
      case 'html':
        content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>GAGO Campaign OS - Export</title>
<style>body{font-family:system-ui;max-width:900px;margin:40px auto;padding:0 20px}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}h1{color:#1e3a5f}h2{color:#333;margin-top:30px}</style>
</head><body>
<h1>GAGO CAMPAIGN OS — Exportación</h1>
<p>Generado: ${new Date().toLocaleString('es-ES')}</p>
<h2>Productos (${state.products.length})</h2>
<table><tr><th>Nombre</th><th>Tipo</th><th>Estado</th><th>Precio</th></tr>
${state.products.map(p => `<tr><td>${p.name}</td><td>${p.type}</td><td>${p.status}</td><td>${p.priceMinorUnits ? (p.priceMinorUnits / 100).toFixed(2) + ' ' + p.currency : '—'}</td></tr>`).join('')}
</table>
<h2>Campañas (${state.campaigns.length})</h2>
<table><tr><th>Nombre</th><th>Objetivo</th><th>Presupuesto</th><th>Estado</th></tr>
${state.campaigns.map(c => `<tr><td>${c.name}</td><td>${c.objective}</td><td>${(c.budgetMinorUnits / 100).toFixed(2)} ${c.currency}</td><td>${c.internalStatus}</td></tr>`).join('')}
</table>
</body></html>`;
        mimeType = 'text/html';
        extension = 'html';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gago-campaign-os-export.${extension}`;
    a.click();
    URL.revokeObjectURL(url);

    addAuditEvent('Datos exportados', 'export', '', `Formato: ${exportFormat}`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Importar / Exportar</h1>
        <p className="text-slate-500 text-sm mt-1">Gestiona los datos de tu organización</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-800">Importar resultados</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Importa un archivo CSV con métricas de campañas. Columnas esperadas:
          </p>
          <div className="bg-slate-50 rounded-lg p-3 mb-4 text-xs font-mono text-slate-600">
            campaign_id, date, currency, spend, impressions, clicks, conversions, revenue
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
            id="csv-import"
          />
          <label
            htmlFor="csv-import"
            className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-green-400 hover:text-green-600 cursor-pointer transition-colors"
          >
            <FileText size={16} />
            Seleccionar archivo CSV
          </label>

          {importResult && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${importResult.rejected === 0 ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
              <div className="flex items-center gap-2">
                {importResult.rejected === 0 ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span>{importResult.accepted} filas importadas{importResult.rejected > 0 && `, ${importResult.rejected} rechazadas`}</span>
              </div>
              {importResult.errors.length > 0 && (
                <ul className="mt-2 text-xs list-disc list-inside">
                  {importResult.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                  {importResult.errors.length > 5 && <li>...y {importResult.errors.length - 5} más</li>}
                </ul>
              )}
            </div>
          )}

          {/* Import history */}
          {state.metricImports.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-slate-500 mb-2">Historial de importaciones</h3>
              <div className="space-y-2">
                {state.metricImports.slice(-3).reverse().map(imp => (
                  <div key={imp.id} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded">
                    <span className="text-slate-600">{imp.fileName}</span>
                    <span className="text-slate-400">{imp.rowsAccepted} filas · {new Date(imp.importedAt).toLocaleDateString('es-ES')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Export section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Download size={20} className="text-green-500" />
            <h2 className="text-lg font-semibold text-slate-800">Exportar expedientes</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Exporta todos los datos de tu organización en el formato que prefieras.
          </p>

          <div className="flex gap-2 mb-4">
            {(['json', 'csv', 'html'] as const).map(fmt => (
              <button
                key={fmt}
                onClick={() => setExportFormat(fmt)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  exportFormat === fmt
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 w-full py-3 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors justify-center"
          >
            <Download size={16} />
            Exportar como {exportFormat.toUpperCase()}
          </button>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h3 className="text-xs font-semibold text-slate-500 mb-2">Contenido del expediente</h3>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• {state.products.length} productos/servicios</li>
              <li>• {state.campaigns.length} campañas</li>
              <li>• {state.creatives.length} anuncios</li>
              <li>• {state.evidence.length} evidencias</li>
              <li>• {state.reviewRequests.length} solicitudes de revisión</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
