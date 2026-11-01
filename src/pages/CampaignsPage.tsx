// GAGO CAMPAIGN OS — Campañas
import { useState } from 'react';
import { useStore, generateId, now } from '../lib/store';
import type { Campaign } from '../lib/types';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';

function emptyCampaign(orgId: string, userId: string): Campaign {
  return {
    id: generateId(),
    organizationId: orgId,
    productId: '',
    name: '',
    objective: 'leads',
    description: '',
    targetAudience: '',
    channel: 'other',
    territories: '',
    language: 'es',
    startDate: '',
    endDate: '',
    timezone: 'Europe/Madrid',
    budgetMinorUnits: 0,
    currency: 'EUR',
    responsible: '',
    notes: '',
    internalStatus: 'draft',
    externalStatus: 'not_registered',
    externalStatusDeclaredBy: null,
    externalStatusDeclaredAt: null,
    version: 1,
    createdAt: now(),
    updatedAt: now(),
    createdBy: userId
  };
}

const objectiveLabels: Record<string, string> = {
  visibility: 'Visibilidad',
  traffic: 'Tráfico',
  leads: 'Leads',
  sales: 'Ventas',
  other: 'Otro'
};

const internalStatusLabels: Record<string, string> = {
  draft: 'Borrador',
  in_review: 'En revisión',
  changes_requested: 'Cambios solicitados',
  approved: 'Aprobada',
  archived: 'Archivada'
};

const internalStatusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  in_review: 'bg-blue-100 text-blue-700',
  changes_requested: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-600'
};

export default function CampaignsPage() {
  const { state, dispatch, addAuditEvent } = useStore();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');

  const filtered = state.campaigns.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.targetAudience.toLowerCase().includes(search.toLowerCase())
  );

  const handleNew = () => {
    if (!state.user) return;
    setEditing(emptyCampaign(state.organization.id, state.user.id));
    setShowForm(true);
    setFormError('');
  };

  const handleEdit = (c: Campaign) => {
    setEditing({ ...c });
    setShowForm(true);
    setFormError('');
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.name.trim()) { setFormError('El nombre es obligatorio.'); return; }

    const updated = { ...editing, updatedAt: now(), version: editing.version + 1 };
    const existing = state.campaigns.find(c => c.id === updated.id);

    if (existing) {
      dispatch({ type: 'UPDATE_CAMPAIGN', payload: updated });
      addAuditEvent('Campaña actualizada', 'campaign', updated.id, updated.name);
    } else {
      dispatch({ type: 'ADD_CAMPAIGN', payload: updated });
      addAuditEvent('Campaña creada', 'campaign', updated.id, updated.name);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar esta campaña?')) return;
    dispatch({ type: 'DELETE_CAMPAIGN', payload: id });
    addAuditEvent('Campaña eliminada', 'campaign', id, '');
  };

  const getProductName = (productId: string) => {
    const p = state.products.find(p => p.id === productId);
    return p ? p.name : 'Sin producto';
  };

  if (showForm && editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            {state.campaigns.find(c => c.id === editing.id) ? 'Editar campaña' : 'Nueva campaña'}
          </h1>
          <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{formError}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre *">
              <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Nombre de la campaña" />
            </Field>
            <Field label="Producto asociado">
              <select value={editing.productId} onChange={e => setEditing({ ...editing, productId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                <option value="">— Seleccionar —</option>
                {state.products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Descripción">
            <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" rows={2} />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Objetivo">
              <select value={editing.objective} onChange={e => setEditing({ ...editing, objective: e.target.value as Campaign['objective'] })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                {Object.entries(objectiveLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Canal">
              <select value={editing.channel} onChange={e => setEditing({ ...editing, channel: e.target.value as Campaign['channel'] })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                <option value="other">Otro</option>
                <option value="chatgpt_ads">ChatGPT Ads</option>
                <option value="undetermined">Sin determinar</option>
              </select>
            </Field>
            <Field label="Idioma">
              <input value={editing.language} onChange={e => setEditing({ ...editing, language: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="es" />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Territorios">
              <input value={editing.territories} onChange={e => setEditing({ ...editing, territories: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="España" />
            </Field>
            <Field label="Fecha inicio">
              <input type="date" value={editing.startDate} onChange={e => setEditing({ ...editing, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
            </Field>
            <Field label="Fecha fin">
              <input type="date" value={editing.endDate} onChange={e => setEditing({ ...editing, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Presupuesto (céntimos)">
              <input type="number" min="0" value={editing.budgetMinorUnits || ''}
                onChange={e => setEditing({ ...editing, budgetMinorUnits: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
            </Field>
            <Field label="Moneda">
              <select value={editing.currency} onChange={e => setEditing({ ...editing, currency: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </Field>
            <Field label="Responsable">
              <input value={editing.responsible} onChange={e => setEditing({ ...editing, responsible: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Estado interno">
              <select value={editing.internalStatus} onChange={e => setEditing({ ...editing, internalStatus: e.target.value as Campaign['internalStatus'] })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                {Object.entries(internalStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Público destinatario">
              <input value={editing.targetAudience} onChange={e => setEditing({ ...editing, targetAudience: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
            </Field>
          </div>

          <Field label="Notas">
            <textarea value={editing.notes} onChange={e => setEditing({ ...editing, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" rows={2} />
          </Field>

          <div className="flex gap-3 pt-4">
            <button onClick={handleSave} className="px-5 py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#172e4a]">
              Guardar
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campañas</h1>
          <p className="text-sm text-slate-500">{filtered.length} campañas registradas</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm w-48 outline-none focus:ring-2 focus:ring-green-500" placeholder="Buscar..." />
          </div>
          <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#172e4a]">
            <Plus size={16} /> Nueva
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">No hay campañas registradas.</p>
          <button onClick={handleNew} className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">
            Crear primera campaña
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Producto</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Objetivo</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Presupuesto</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                    <td className="px-4 py-3 text-slate-600">{getProductName(c.productId)}</td>
                    <td className="px-4 py-3 text-slate-600">{objectiveLabels[c.objective] || c.objective}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {(c.budgetMinorUnits / 100).toLocaleString('es-ES', { style: 'currency', currency: c.currency })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${internalStatusColors[c.internalStatus] || 'bg-slate-100 text-slate-600'}`}>
                        {internalStatusLabels[c.internalStatus] || c.internalStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleEdit(c)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500" title="Editar">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded text-red-400 ml-1" title="Eliminar">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
