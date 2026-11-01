// GAGO CAMPAIGN OS — Evidencias
import { useState } from 'react';
import { useStore, generateId, now } from '../lib/store';
import type { Evidence } from '../lib/types';
import { Plus, Search, Edit2, Trash2, X, Shield } from 'lucide-react';

function emptyEvidence(orgId: string, userId: string): Evidence {
  return {
    id: generateId(),
    organizationId: orgId,
    title: '',
    claim: '',
    sourceType: 'study',
    reference: '',
    date: '',
    excerpt: '',
    responsible: '',
    status: 'pending',
    limitations: '',
    expiryDate: null,
    linkedProducts: [],
    linkedCampaigns: [],
    linkedCreatives: [],
    createdAt: now(),
    updatedAt: now(),
    createdBy: userId
  };
}

const sourceTypeLabels: Record<string, string> = {
  study: 'Estudio',
  testimonial: 'Testimonio',
  data: 'Datos',
  certification: 'Certificación',
  other: 'Otro'
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  reviewed: 'Revisada',
  rejected: 'Rechazada',
  expired: 'Caducada'
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  reviewed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-slate-100 text-slate-600'
};

export default function EvidencePage() {
  const { state, dispatch, addAuditEvent } = useStore();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Evidence | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');

  const filtered = state.evidence.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.claim.toLowerCase().includes(search.toLowerCase())
  );

  const handleNew = () => {
    if (!state.user) return;
    setEditing(emptyEvidence(state.organization.id, state.user.id));
    setShowForm(true);
    setFormError('');
  };

  const handleEdit = (e: Evidence) => {
    setEditing({ ...e });
    setShowForm(true);
    setFormError('');
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.title.trim()) { setFormError('El título es obligatorio.'); return; }
    if (!editing.claim.trim()) { setFormError('La afirmación es obligatoria.'); return; }

    const updated = { ...editing, updatedAt: now() };
    const existing = state.evidence.find(e => e.id === updated.id);

    if (existing) {
      dispatch({ type: 'UPDATE_EVIDENCE', payload: updated });
      addAuditEvent('Evidencia actualizada', 'evidence', updated.id, updated.title);
    } else {
      dispatch({ type: 'ADD_EVIDENCE', payload: updated });
      addAuditEvent('Evidencia creada', 'evidence', updated.id, updated.title);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar esta evidencia?')) return;
    dispatch({ type: 'DELETE_EVIDENCE', payload: id });
    addAuditEvent('Evidencia eliminada', 'evidence', id, '');
  };

  if (showForm && editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            {state.evidence.find(e => e.id === editing.id) ? 'Editar evidencia' : 'Nueva evidencia'}
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
            <Field label="Título *">
              <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Título de la evidencia" />
            </Field>
            <Field label="Tipo de fuente">
              <select value={editing.sourceType} onChange={e => setEditing({ ...editing, sourceType: e.target.value as Evidence['sourceType'] })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                {Object.entries(sourceTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Afirmación comercial *">
            <textarea value={editing.claim} onChange={e => setEditing({ ...editing, claim: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" rows={2} placeholder="¿Qué afirmación respalda esta evidencia?" />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Referencia (URL o cita)">
              <input value={editing.reference} onChange={e => setEditing({ ...editing, reference: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="URL o referencia bibliográfica" />
            </Field>
            <Field label="Fecha">
              <input type="date" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
            </Field>
          </div>

          <Field label="Extracto">
            <textarea value={editing.excerpt} onChange={e => setEditing({ ...editing, excerpt: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" rows={2} placeholder="Extracto relevante de la fuente" />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Responsable">
              <input value={editing.responsible} onChange={e => setEditing({ ...editing, responsible: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
            </Field>
            <Field label="Estado">
              <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value as Evidence['status'] })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Limitaciones">
              <textarea value={editing.limitations} onChange={e => setEditing({ ...editing, limitations: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" rows={2} placeholder="Limitaciones conocidas" />
            </Field>
            <Field label="Fecha de caducidad">
              <input type="date" value={editing.expiryDate || ''} onChange={e => setEditing({ ...editing, expiryDate: e.target.value || null })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
            </Field>
          </div>

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
          <h1 className="text-2xl font-bold text-slate-800">Evidencias</h1>
          <p className="text-sm text-slate-500">{filtered.length} evidencias registradas</p>
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
          <Shield size={40} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No hay evidencias registradas.</p>
          <p className="text-sm text-slate-400 mt-2">Las evidencias respaldan las afirmaciones comerciales de tus anuncios.</p>
          <button onClick={handleNew} className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">
            Crear primera evidencia
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(e => (
            <div key={e.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-slate-800">{e.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[e.status]}`}>
                      {statusLabels[e.status]}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                      {sourceTypeLabels[e.sourceType]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">{e.claim}</p>
                  {e.excerpt && <p className="text-xs text-slate-400 line-clamp-2">{e.excerpt}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    {e.reference && <span>📎 {e.reference}</span>}
                    {e.date && <span>📅 {e.date}</span>}
                    {e.expiryDate && <span>⏰ Caduca: {e.expiryDate}</span>}
                  </div>
                </div>
                <div className="flex gap-1 ml-4">
                  <button onClick={() => handleEdit(e)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(e.id)} className="p-1.5 hover:bg-red-50 rounded text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
