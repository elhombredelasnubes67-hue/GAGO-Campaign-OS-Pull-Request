// GAGO CAMPAIGN OS — Revisiones
import { useState } from 'react';
import { useStore, generateId, now } from '../lib/store';
import type { ReviewRequest, Campaign } from '../lib/types';
import { Plus, ClipboardCheck, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ReviewsPage() {
  const { state, dispatch, addAuditEvent } = useStore();
  const [showNewReview, setShowNewReview] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');

  const pendingReviews = state.reviewRequests.filter(r => r.status === 'pending');
  const resolvedReviews = state.reviewRequests.filter(r => r.status !== 'pending');

  const handleRequestReview = () => {
    if (!state.user || !selectedCampaign) return;
    const campaign = state.campaigns.find(c => c.id === selectedCampaign);
    if (!campaign) return;

    const review: ReviewRequest = {
      id: generateId(),
      organizationId: state.organization.id,
      campaignId: selectedCampaign,
      snapshotHash: Math.random().toString(36).slice(2),
      snapshotData: { campaign: campaign.name, version: campaign.version },
      status: 'pending',
      requestedBy: state.user.id,
      requestedAt: now(),
      version: campaign.version
    };

    dispatch({ type: 'ADD_REVIEW_REQUEST', payload: review });
    dispatch({
      type: 'UPDATE_CAMPAIGN',
      payload: { ...campaign, internalStatus: 'in_review', updatedAt: now() }
    });
    addAuditEvent('Revisión solicitada', 'review', review.id, campaign.name);
    setShowNewReview(false);
    setSelectedCampaign('');
  };

  const handleDecision = (reviewId: string, decision: 'approved' | 'changes_requested' | 'rejected', comment: string) => {
    if (!state.user) return;
    const review = state.reviewRequests.find(r => r.id === reviewId);
    if (!review) return;

    dispatch({
      type: 'ADD_REVIEW_DECISION',
      payload: {
        id: generateId(),
        reviewRequestId: reviewId,
        decision,
        comment,
        decidedBy: state.user.id,
        decidedAt: now()
      }
    });

    dispatch({
      type: 'UPDATE_REVIEW_REQUEST',
      payload: { ...review, status: decision }
    });

    const campaign = state.campaigns.find(c => c.id === review.campaignId);
    if (campaign) {
      const newStatus = decision === 'approved' ? 'approved' : decision === 'changes_requested' ? 'changes_requested' : 'draft';
      dispatch({
        type: 'UPDATE_CAMPAIGN',
        payload: { ...campaign, internalStatus: newStatus as Campaign['internalStatus'], updatedAt: now() }
      });
    }

    addAuditEvent(`Revisión ${decision === 'approved' ? 'aprobada' : decision === 'changes_requested' ? 'cambios solicitados' : 'rechazada'}`, 'review', reviewId, comment);
  };

  const getCampaignName = (campaignId: string) => {
    const c = state.campaigns.find(c => c.id === campaignId);
    return c ? c.name : 'Campaña desconocida';
  };

  const campaignsForReview = state.campaigns.filter(c => c.internalStatus === 'draft' || c.internalStatus === 'changes_requested');

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Revisiones</h1>
          <p className="text-sm text-slate-500">{pendingReviews.length} pendientes · {resolvedReviews.length} resueltas</p>
        </div>
        <button
          onClick={() => setShowNewReview(!showNewReview)}
          disabled={campaignsForReview.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#172e4a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> Solicitar revisión
        </button>
      </div>

      {showNewReview && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Solicitar revisión de campaña</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">Campaña</label>
              <select value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500">
                <option value="">— Seleccionar campaña —</option>
                {campaignsForReview.map(c => (
                  <option key={c.id} value={c.id}>{c.name} (v{c.version})</option>
                ))}
              </select>
            </div>
            <button onClick={handleRequestReview} disabled={!selectedCampaign}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50">
              Enviar
            </button>
            <button onClick={() => setShowNewReview(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">
              Cancelar
            </button>
          </div>
          {campaignsForReview.length === 0 && (
            <p className="text-xs text-slate-400 mt-2">No hay campañas en estado de borrador o cambios solicitados.</p>
          )}
        </div>
      )}

      {/* Pending reviews */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
          <Clock size={16} /> Pendientes ({pendingReviews.length})
        </h2>
        {pendingReviews.length === 0 ? (
          <p className="text-sm text-slate-400 bg-white rounded-xl border border-slate-200 p-5">No hay revisiones pendientes.</p>
        ) : (
          <div className="space-y-3">
            {pendingReviews.map(r => (
              <ReviewCard key={r.id} review={r} campaignName={getCampaignName(r.campaignId)} onDecision={handleDecision} />
            ))}
          </div>
        )}
      </div>

      {/* Resolved reviews */}
      <div>
        <h2 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
          <CheckCircle size={16} /> Historial ({resolvedReviews.length})
        </h2>
        {resolvedReviews.length === 0 ? (
          <p className="text-sm text-slate-400 bg-white rounded-xl border border-slate-200 p-5">Sin historial de revisiones.</p>
        ) : (
          <div className="space-y-3">
            {resolvedReviews.map(r => {
              const decision = state.reviewDecisions.find(d => d.reviewRequestId === r.id);
              return (
                <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{getCampaignName(r.campaignId)}</p>
                      <p className="text-xs text-slate-400">Solicitada: {new Date(r.requestedAt).toLocaleString('es-ES')}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.status === 'approved' ? 'bg-green-100 text-green-700' :
                      r.status === 'changes_requested' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {r.status === 'approved' ? 'Aprobada' : r.status === 'changes_requested' ? 'Cambios solicitados' : 'Rechazada'}
                    </span>
                  </div>
                  {decision && decision.comment && (
                    <p className="text-sm text-slate-600 mt-2 italic">"{decision.comment}"</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ review, campaignName, onDecision }: {
  review: ReviewRequest;
  campaignName: string;
  onDecision: (id: string, decision: 'approved' | 'changes_requested' | 'rejected', comment: string) => void;
}) {
  const [comment, setComment] = useState('');

  return (
    <div className="bg-white rounded-xl border border-amber-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={18} className="text-amber-500" />
          <p className="font-medium text-slate-800">{campaignName}</p>
          <span className="text-xs text-slate-400">v{review.version}</span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          Pendiente
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-3">
        Solicitada: {new Date(review.requestedAt).toLocaleString('es-ES')}
      </p>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <input
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Comentario de revisión (opcional)"
          />
        </div>
        <button onClick={() => onDecision(review.id, 'approved', comment)}
          className="px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 flex items-center gap-1">
          <CheckCircle size={14} /> Aprobar
        </button>
        <button onClick={() => onDecision(review.id, 'changes_requested', comment)}
          className="px-3 py-2 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 flex items-center gap-1">
          Cambios
        </button>
        <button onClick={() => onDecision(review.id, 'rejected', comment)}
          className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 flex items-center gap-1">
          <XCircle size={14} /> Rechazar
        </button>
      </div>
    </div>
  );
}
