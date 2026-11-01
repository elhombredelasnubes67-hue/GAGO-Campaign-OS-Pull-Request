// GAGO CAMPAIGN OS — Configuración
import { useStore } from '../lib/store';
import { Settings, Info, Database, Globe, Users } from 'lucide-react';

export default function SettingsPage() {
  const { state } = useStore();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Configuración</h1>
        <p className="text-slate-500 text-sm mt-1">Información del sistema y la organización</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-800">Organización</h2>
          </div>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">Nombre</dt>
              <dd className="text-sm font-medium text-slate-800">{state.organization.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">ID</dt>
              <dd className="text-sm font-mono text-slate-600">{state.organization.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">Zona horaria</dt>
              <dd className="text-sm text-slate-800">{state.organization.timezone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">Creada</dt>
              <dd className="text-sm text-slate-800">{new Date(state.organization.createdAt).toLocaleDateString('es-ES')}</dd>
            </div>
          </dl>
        </div>

        {/* User info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users size={20} className="text-green-500" />
            <h2 className="text-lg font-semibold text-slate-800">Sesión actual</h2>
          </div>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">Nombre</dt>
              <dd className="text-sm font-medium text-slate-800">{state.user?.name || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">Correo</dt>
              <dd className="text-sm text-slate-800">{state.user?.email || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">Rol</dt>
              <dd className="text-sm text-slate-800 capitalize">{state.user?.role || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">Modo</dt>
              <dd className="text-sm">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${state.demoMode ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {state.demoMode ? 'Demostración' : 'Producción'}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* System info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings size={20} className="text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Sistema</h2>
          </div>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">Versión</dt>
              <dd className="text-sm font-mono text-slate-800">1.0.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">Frontend</dt>
              <dd className="text-sm text-slate-800">React + Vite + TypeScript</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">Backend</dt>
              <dd className="text-sm text-slate-800">Go (Vercel Serverless)</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">Base de datos</dt>
              <dd className="text-sm text-slate-800">PostgreSQL (Neon)</dd>
            </div>
          </dl>
        </div>

        {/* Data summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database size={20} className="text-purple-500" />
            <h2 className="text-lg font-semibold text-slate-800">Resumen de datos</h2>
          </div>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">Productos</dt>
              <dd className="text-sm font-medium text-slate-800">{state.products.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">Campañas</dt>
              <dd className="text-sm font-medium text-slate-800">{state.campaigns.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">Anuncios</dt>
              <dd className="text-sm font-medium text-slate-800">{state.creatives.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">Evidencias</dt>
              <dd className="text-sm font-medium text-slate-800">{state.evidence.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">Revisiones</dt>
              <dd className="text-sm font-medium text-slate-800">{state.reviewRequests.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-slate-500">Eventos de auditoría</dt>
              <dd className="text-sm font-medium text-slate-800">{state.auditEvents.length}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Info note */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">Modo demostración</h3>
            <p className="text-xs text-blue-600">
              Esta aplicación funciona en modo demostración con datos en memoria. Para persistencia completa,
              configure la variable <code className="bg-blue-100 px-1 rounded">DATABASE_URL</code> y despliegue
              con el backend Go en Vercel. Consulte la documentación en <code className="bg-blue-100 px-1 rounded">docs/</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
