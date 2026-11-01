// GAGO CAMPAIGN OS — Anuncios (Creatives)
import { useState } from 'react';
import { useStore, generateId, now } from '../lib/store';
import type { Creative } from '../lib/types';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';

function emptyCreative(orgId: string, userId: string): Creative {
  return {
    id: generateId(),
    organizationId: orgId,
    campaignId: '',
    name: '',
    headline: '',
    body: '',
    cta: '',
    destinationUrl: '',
    language: 'es',
    imageRef: '',
    imageAlt: '',
    notes: '',
    evidenceIds: [],
    versionNumber: 1,
    status: 'active',
    createdAt: now(),
    updatedAt: now(),
    createdBy: userId
  };
}

export default function CreativesPage() {
  const { state, dispatch, addAuditEvent } = useStore();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Creative | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');

  const filtered = state.creatives.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.headline.toLowerCase().includes(search.toLowerCase())
  );

  const handleNew = () => {
    if (!state.user) return;
    setEditing(emptyCreative(state.organization.id, state.user.id));
    setShowForm(true);
    setFormError('');
  };

  const handleEdit = (c: Creative) => {
    setEditing({ ...c });
    setShowForm(true);
    setFormError('');
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.name.trim()) { setFormError('El nombre es obligatorio.'); return; }
    if (!editing.headline.trim()) { setFormError('El titular es obligatorio.'); return; }

    const updated = { ...editing, updatedAt: now() };
    const existing = state.creatives.find(c => c.id === updated.id);

    if (existing) {
      dispatch({ type: 'UPDATE_CREATIVE', payload: updated });
      addAuditEvent('Anuncio actualizado', 'creative', updated.id, updated.name);
    } else {
      dispatch({ type: 'ADD_CREATIVE', payload: updated });
      addAuditEvent('Anuncio creado', 'creative', updated.id, updated.name);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar este anuncio?')) return;
    dispatch({ type: 'DELETE_CREATIVE', payload: id });
    addAuditEvent('Anuncio eliminado', 'creative', id, '');
  };

  const getCampaignName = (campaignId: string) => {
    const c = state.campaigns.find(c => c.id === campaignId);
    return c ? c.name : 'Sin campaña';
  };

  if (showForm && editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            {state.creatives.find(c => c.id === editing.id) ? 'Editar anuncio' : 'Nuevo anuncio'}
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Nombre del anuncio" />
            </Field>
            <Field label="Campaña asociada">
              <select value={editing.campaignId} onChange={e => setEditing({ ...editing, campaignId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
                <option value="">— Seleccionar —</option>
                {state.campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Titular *">
            <input value={editing.headline} onChange={e => setEditing({ ...editing, headline: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Titular del anuncio" />
          </Field>

          <Field label="Cuerpo del anuncio">
            <textarea value={editing.body} onChange={e => setEditing({ ...editing, body: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" rows={3} placeholder="Texto principal del anuncio" />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Call to Action (CTA)">
              <input value={editing.cta} onChange={e => setEditing({ ...editing, cta: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Ej: Solicitar información" />
            </Field>
            <Field label="URL de destino">
              <input value={editing.destinationUrl} onChange={e => setEditing({ ...editing, destinationUrl: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="https://..." />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Referencia de imagen (URL)">
              <input value={editing.imageRef} onChange={e => setEditing({ ...editing, imageRef: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="https://..." />
            </Field>
            <Field label="Texto alternativo de imagen">
              <input value={editing.imageAlt} onChange={e => setEditing({ ...editing, imageAlt: e.target.value })}
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
          <h1 className="text-2xl font-bold text-slate-800">Anuncios</h1>
          <p className="text-sm text-slate-500">{filtered.length} anuncios registrados</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm w-48 outline-none focus:ring-2 focus:ring-green-500" placeholder="Buscar..." />
          </div>
          <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#172e4a]">
            <Plus size={16} /> Nuevo
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">No hay anuncios registrados.</p>
          <button onClick={handleNew} className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">
            Crear primer anuncio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-slate-800">{c.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(c)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">{c.headline}</p>
              {c.body && <p className="text-xs text-slate-500 mb-2 line-clamp-2">{c.body}</p>}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="px-2 py-0.5 bg-slate-100 rounded">{getCampaignName(c.campaignId)}</span>
                {c.cta && <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded">{c.cta}</span>}
                <span>v{c.versionNumber}</span>
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
