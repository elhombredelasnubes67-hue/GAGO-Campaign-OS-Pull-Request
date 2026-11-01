// GAGO CAMPAIGN OS — Resultados y métricas
import { useStore } from '../lib/store';
import { BarChart3, TrendingUp, DollarSign, Eye, MousePointer } from 'lucide-react';

export default function ResultsPage() {
  const { state } = useStore();

  // Calculate aggregated metrics per campaign
  const campaignMetrics = state.campaigns.map(campaign => {
    const rows = state.metricRows.filter(r => r.campaignId === campaign.id);
    const totalSpend = rows.reduce((s, r) => s + r.spendMinorUnits, 0);
    const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0);
    const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
    const totalConversions = rows.reduce((s, r) => s + r.conversions, 0);
    const totalRevenue = rows.reduce((s, r) => s + r.revenueMinorUnits, 0);

    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
    const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
    const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

    return {
      campaign,
      rows: rows.length,
      totalSpend,
      totalImpressions,
      totalClicks,
      totalConversions,
      totalRevenue,
      ctr,
      cpc,
      cpm,
      cpa,
      roas
    };
  });

  const totals = {
    spend: campaignMetrics.reduce((s, m) => s + m.totalSpend, 0),
    impressions: campaignMetrics.reduce((s, m) => s + m.totalImpressions, 0),
    clicks: campaignMetrics.reduce((s, m) => s + m.totalClicks, 0),
    conversions: campaignMetrics.reduce((s, m) => s + m.totalConversions, 0),
    revenue: campaignMetrics.reduce((s, m) => s + m.totalRevenue, 0),
  };
  totals.spend; // suppress unused warning
  const overallCTR = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const overallROAS = totals.spend > 0 ? totals.revenue / totals.spend : 0;

  const hasData = state.metricRows.length > 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Resultados</h1>
        <p className="text-slate-500 text-sm mt-1">
          Métricas calculadas — {state.metricRows.length} filas de datos importadas
        </p>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BarChart3 size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">Sin datos de resultados</h3>
          <p className="text-sm text-slate-500 mb-4">
            Importa un archivo CSV con resultados reales de tus campañas para ver métricas como CTR, CPC, CPM, CPA y ROAS.
          </p>
          <p className="text-xs text-slate-400">
            Ve a "Importar / Exportar" para cargar datos.
          </p>
        </div>
      ) : (
        <>
          {/* Global metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              icon={<Eye size={20} className="text-blue-500" />}
              label="Impresiones totales"
              value={totals.impressions.toLocaleString('es-ES')}
            />
            <MetricCard
              icon={<MousePointer size={20} className="text-green-500" />}
              label="CTR global"
              value={`${overallCTR.toFixed(2)}%`}
            />
            <MetricCard
              icon={<DollarSign size={20} className="text-amber-500" />}
              label="Gasto total"
              value={(totals.spend / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            />
            <MetricCard
              icon={<TrendingUp size={20} className="text-purple-500" />}
              label="ROAS global"
              value={`${overallROAS.toFixed(2)}x`}
            />
          </div>

          {/* Per-campaign table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700">Métricas por campaña</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Campaña</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Impresiones</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Clics</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">CTR</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Gasto</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">CPC</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">CPM</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Conv.</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">CPA</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campaignMetrics.filter(m => m.rows > 0).map(m => (
                    <tr key={m.campaign.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{m.campaign.name}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{m.totalImpressions.toLocaleString('es-ES')}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{m.totalClicks.toLocaleString('es-ES')}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{m.ctr.toFixed(2)}%</td>
                      <td className="px-4 py-3 text-right text-slate-600">{(m.totalSpend / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{(m.cpc / 100).toFixed(2)} €</td>
                      <td className="px-4 py-3 text-right text-slate-600">{(m.cpm / 100).toFixed(2)} €</td>
                      <td className="px-4 py-3 text-right text-slate-600">{m.totalConversions.toLocaleString('es-ES')}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{(m.cpa / 100).toFixed(2)} €</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-medium ${m.roas >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                          {m.roas.toFixed(2)}x
                        </span>
                      </td>
                    </tr>
                  ))}
                  {campaignMetrics.filter(m => m.rows > 0).length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                        No hay métricas calculadas para ninguna campaña.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value }: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
