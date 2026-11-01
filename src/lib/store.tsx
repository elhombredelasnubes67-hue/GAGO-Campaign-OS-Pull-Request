// GAGO CAMPAIGN OS — Store de estado
import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import type {
  AppState, User, Product, Campaign, Creative, CreativeVersion,
  Evidence, ReviewRequest, ReviewDecision, MetricImport, MetricRow,
  AuditEvent, Organization
} from './types';

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function now(): string {
  return new Date().toISOString();
}

const defaultOrg: Organization = {
  id: 'org-default',
  name: 'GAGO Campaign OS',
  timezone: 'Europe/Madrid',
  createdAt: now()
};

const initialState: AppState = {
  user: null,
  organization: defaultOrg,
  products: [],
  campaigns: [],
  creatives: [],
  creativeVersions: [],
  evidence: [],
  reviewRequests: [],
  reviewDecisions: [],
  metricImports: [],
  metricRows: [],
  auditEvents: [],
  demoMode: true
};

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_CAMPAIGN'; payload: Campaign }
  | { type: 'UPDATE_CAMPAIGN'; payload: Campaign }
  | { type: 'DELETE_CAMPAIGN'; payload: string }
  | { type: 'ADD_CREATIVE'; payload: Creative }
  | { type: 'UPDATE_CREATIVE'; payload: Creative }
  | { type: 'ADD_CREATIVE_VERSION'; payload: CreativeVersion }
  | { type: 'DELETE_CREATIVE'; payload: string }
  | { type: 'ADD_EVIDENCE'; payload: Evidence }
  | { type: 'UPDATE_EVIDENCE'; payload: Evidence }
  | { type: 'DELETE_EVIDENCE'; payload: string }
  | { type: 'ADD_REVIEW_REQUEST'; payload: ReviewRequest }
  | { type: 'UPDATE_REVIEW_REQUEST'; payload: ReviewRequest }
  | { type: 'ADD_REVIEW_DECISION'; payload: ReviewDecision }
  | { type: 'ADD_METRIC_IMPORT'; payload: MetricImport }
  | { type: 'ADD_METRIC_ROWS'; payload: MetricRow[] }
  | { type: 'ADD_AUDIT_EVENT'; payload: AuditEvent }
  | { type: 'LOAD_DEMO_DATA' };

function loadDemoData(): Partial<AppState> {
  const products: Product[] = [
    {
      id: 'prod-1',
      organizationId: 'org-default',
      name: 'Consultoría de Campañas Digitales',
      type: 'service',
      description: 'Servicio integral de planificación y ejecución de campañas publicitarias con metodología estructurada.',
      targetAudience: 'PYMES y profesionales independientes',
      problemSolved: 'Dificultad para organizar campañas con evidencias verificables',
      valueProposition: 'Metodología estructurada con trazabilidad completa',
      destinationUrl: 'https://example.com/consultoria',
      priceMinorUnits: 150000,
      currency: 'EUR',
      responsible: 'Prof. Manuel GAGO FERNÁNDEZ',
      status: 'active',
      tags: ['consultoría', 'campañas', 'digital'],
      evidenceIds: [],
      createdAt: now(),
      updatedAt: now(),
      createdBy: 'user-admin-1'
    },
    {
      id: 'prod-2',
      organizationId: 'org-default',
      name: 'Auditoría de Publicidad Digital',
      type: 'service',
      description: 'Revisión exhaustiva de campañas activas para detectar ineficiencias y oportunidades de mejora.',
      targetAudience: 'Departamentos de marketing de empresas medianas',
      problemSolved: 'Falta de visibilidad sobre el rendimiento real de las campañas',
      valueProposition: 'Informes detallados con recomendaciones accionables',
      destinationUrl: 'https://example.com/auditoria',
      priceMinorUnits: 80000,
      currency: 'EUR',
      responsible: 'Prof. Manuel GAGO FERNÁNDEZ',
      status: 'active',
      tags: ['auditoría', 'publicidad', 'análisis'],
      evidenceIds: [],
      createdAt: now(),
      updatedAt: now(),
      createdBy: 'user-admin-1'
    }
  ];

  const campaigns: Campaign[] = [
    {
      id: 'camp-1',
      organizationId: 'org-default',
      productId: 'prod-1',
      name: 'Campaña lanzamiento Q1 2026',
      objective: 'leads',
      description: 'Campaña para captar solicitudes de información sobre el servicio de consultoría.',
      targetAudience: 'Directores de marketing de PYMES',
      channel: 'other',
      territories: 'España',
      language: 'es',
      startDate: '2026-01-15',
      endDate: '2026-03-31',
      timezone: 'Europe/Madrid',
      budgetMinorUnits: 500000,
      currency: 'EUR',
      responsible: 'Prof. Manuel GAGO FERNÁNDEZ',
      notes: 'DEMOSTRACIÓN — Datos sintéticos',
      internalStatus: 'draft',
      externalStatus: 'not_registered',
      externalStatusDeclaredBy: null,
      externalStatusDeclaredAt: null,
      version: 1,
      createdAt: now(),
      updatedAt: now(),
      createdBy: 'user-admin-1'
    },
    {
      id: 'camp-2',
      organizationId: 'org-default',
      productId: 'prod-2',
      name: 'Promoción auditoría primavera',
      objective: 'sales',
      description: 'Campaña estacional para impulsar contrataciones de auditoría en primavera.',
      targetAudience: 'Responsables de marketing con presupuestos >10k/mes',
      channel: 'other',
      territories: 'España, Portugal',
      language: 'es',
      startDate: '2026-03-01',
      endDate: '2026-05-31',
      timezone: 'Europe/Madrid',
      budgetMinorUnits: 300000,
      currency: 'EUR',
      responsible: 'Prof. Manuel GAGO FERNÁNDEZ',
      notes: '',
      internalStatus: 'approved',
      externalStatus: 'ready_to_transfer',
      externalStatusDeclaredBy: 'user-admin-1',
      externalStatusDeclaredAt: now(),
      version: 2,
      createdAt: now(),
      updatedAt: now(),
      createdBy: 'user-admin-1'
    }
  ];

  const evidence: Evidence[] = [
    {
      id: 'ev-1',
      organizationId: 'org-default',
      title: 'Estudio de eficacia publicitaria 2025',
      claim: 'Las campañas con evidencias documentadas obtienen un 34% más de conversiones',
      sourceType: 'study',
      reference: 'https://example.com/study-2025',
      date: '2025-06-15',
      excerpt: 'Análisis de 500 campañas en el mercado ibérico durante 2025...',
      responsible: 'Prof. Manuel GAGO FERNÁNDEZ',
      status: 'reviewed',
      limitations: 'Muestra limitada al mercado ibérico',
      expiryDate: '2027-06-15',
      linkedProducts: ['prod-1'],
      linkedCampaigns: ['camp-1'],
      linkedCreatives: [],
      createdAt: now(),
      updatedAt: now(),
      createdBy: 'user-admin-1'
    }
  ];

  return { products, campaigns, evidence };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter(p => p.id !== action.payload) };
    case 'ADD_CAMPAIGN':
      return { ...state, campaigns: [...state.campaigns, action.payload] };
    case 'UPDATE_CAMPAIGN':
      return { ...state, campaigns: state.campaigns.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CAMPAIGN':
      return { ...state, campaigns: state.campaigns.filter(c => c.id !== action.payload) };
    case 'ADD_CREATIVE':
      return { ...state, creatives: [...state.creatives, action.payload] };
    case 'UPDATE_CREATIVE':
      return { ...state, creatives: state.creatives.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'ADD_CREATIVE_VERSION':
      return { ...state, creativeVersions: [...state.creativeVersions, action.payload] };
    case 'DELETE_CREATIVE':
      return { ...state, creatives: state.creatives.filter(c => c.id !== action.payload) };
    case 'ADD_EVIDENCE':
      return { ...state, evidence: [...state.evidence, action.payload] };
    case 'UPDATE_EVIDENCE':
      return { ...state, evidence: state.evidence.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_EVIDENCE':
      return { ...state, evidence: state.evidence.filter(e => e.id !== action.payload) };
    case 'ADD_REVIEW_REQUEST':
      return { ...state, reviewRequests: [...state.reviewRequests, action.payload] };
    case 'UPDATE_REVIEW_REQUEST':
      return { ...state, reviewRequests: state.reviewRequests.map(r => r.id === action.payload.id ? action.payload : r) };
    case 'ADD_REVIEW_DECISION':
      return { ...state, reviewDecisions: [...state.reviewDecisions, action.payload] };
    case 'ADD_METRIC_IMPORT':
      return { ...state, metricImports: [...state.metricImports, action.payload] };
    case 'ADD_METRIC_ROWS':
      return { ...state, metricRows: [...state.metricRows, ...action.payload] };
    case 'ADD_AUDIT_EVENT':
      return { ...state, auditEvents: [...state.auditEvents, action.payload] };
    case 'LOAD_DEMO_DATA':
      return { ...state, ...loadDemoData() };
    default:
      return state;
  }
}

interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addAuditEvent: (action: string, resourceType: string, resourceId: string, details: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addAuditEvent = useCallback((action: string, resourceType: string, resourceId: string, details: string) => {
    if (!state.user) return;
    const event: AuditEvent = {
      id: generateId(),
      organizationId: state.organization.id,
      actorId: state.user.id,
      actorName: state.user.name,
      action,
      resourceType,
      resourceId,
      details,
      createdAt: now()
    };
    dispatch({ type: 'ADD_AUDIT_EVENT', payload: event });
  }, [state.user, state.organization.id]);

  return (
    <StoreContext.Provider value={{ state, dispatch, addAuditEvent }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider');
  return ctx;
}

export { generateId, now };
