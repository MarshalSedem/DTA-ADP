/**
 * Farmer API — calls the AgriTrust backend (`/api/farmer/*`) and maps its responses to the
 * app's types in `@/types/farmer`. Audit events are written by the backend; the app never
 * writes audit logs itself (docs/features/farmer.md §9.2).
 */
import { api, apiUrl } from '@/services/api-client';
import { toUploadFile } from '@/services/upload-file';
import type {
  AdvisoryAnswer,
  AiRecommendation,
  ChatMessage,
  ConfidenceBand,
  Consents,
  CropType,
  DataInventoryItem,
  DiagnosisInput,
  DiagnosisRecord,
  District,
  FarmerProfile,
  MarketComparison,
  ModelInfo,
  ReviewCase,
  ReviewSource,
  ReviewStatus,
} from '@/types/farmer';

// ── API response shapes (backend/app/schemas.py) ─────────────────────────────────────────

export type ApiUser = {
  id: number;
  role: 'farmer' | 'extension' | 'admin' | 'auditor';
  full_name: string;
  first_name: string;
  display_name: string;
  phone: string | null;
  district: string | null;
};

type ApiDiagnosis = {
  id: number;
  crop_type: string;
  district: string;
  symptoms: string;
  training_consent: boolean;
  has_image: boolean;
  image_deleted_at: string | null;
  label: string;
  confidence: number;
  confidence_band: 'low' | 'moderate' | 'high';
  reasons: string[];
  limitations: string[];
  next_steps: string;
  model: string;
  created_at: string;
  case_id: string | null;
  reported_incorrect: boolean;
};

type ApiCase = {
  id: string;
  kind: 'diagnosis' | 'advice';
  status: 'pending' | 'needs_more_evidence' | 'confirmed' | 'rejected' | 'withdrawn';
  ai_result: string;
  question: string | null;
  created_at: string;
  diagnosis_id: number | null;
  advisory_id: number | null;
  assessments: {
    decision: 'confirm' | 'request_evidence' | 'reject';
    assessment_text: string;
    corrected_diagnosis: string | null;
  }[];
  evidence: { id: number; note: string; has_image: boolean; created_at: string }[];
};

type ApiAdvisory = AdvisoryAnswer & {
  id: number;
  question: string;
  created_at: string;
  case_id: string | null;
};

type ApiConsentState = { purpose: string; granted: boolean };

// ── Mappers ──────────────────────────────────────────────────────────────────────────────

const BAND: Record<ApiDiagnosis['confidence_band'], ConfidenceBand> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
};

const STATUS: Record<ApiCase['status'], ReviewStatus> = {
  pending: 'pending',
  needs_more_evidence: 'needsMoreEvidence',
  confirmed: 'confirmed',
  rejected: 'rejected',
  withdrawn: 'withdrawn',
};

const truncate = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1)}…` : s);

export function toProfile(user: ApiUser): FarmerProfile {
  return {
    id: String(user.id),
    name: user.display_name,
    firstName: user.first_name,
    phone: user.phone ?? '',
    district: (user.district ?? 'Ho West') as District,
  };
}

function toDiagnosis(d: ApiDiagnosis): DiagnosisRecord {
  return {
    id: String(d.id),
    createdAt: d.created_at,
    cropType: d.crop_type as CropType,
    district: d.district as District,
    symptoms: d.symptoms,
    trainingConsent: d.training_consent,
    imageUri: d.has_image ? apiUrl(`/farmer/diagnoses/${d.id}/image`) : null,
    imageDeleted: d.image_deleted_at !== null,
    result: {
      label: d.label,
      confidence: d.confidence,
      confidenceBand: BAND[d.confidence_band],
      reasons: d.reasons,
      limitations: d.limitations,
      nextSteps: d.next_steps,
      modelVersion: d.model,
    },
    reviewCaseId: d.case_id ?? undefined,
    reportedIncorrect: d.reported_incorrect,
  };
}

function toReviewCase(c: ApiCase): ReviewCase {
  const newestFirst = [...c.assessments].reverse();
  const verdict = newestFirst.find((a) => a.decision !== 'request_evidence');
  const request = newestFirst.find((a) => a.decision === 'request_evidence');
  return {
    id: c.id,
    summary:
      c.kind === 'advice'
        ? `AI advice: "${truncate(c.question ?? c.ai_result, 60)}"`
        : c.ai_result.replace(/ damage$/, ''),
    status: STATUS[c.status],
    createdAt: c.created_at,
    source:
      c.kind === 'advice'
        ? { type: 'advice', messageId: String(c.advisory_id ?? '') }
        : { type: 'diagnosis', diagnosisId: String(c.diagnosis_id ?? '') },
    officerAdvice: verdict
      ? [verdict.corrected_diagnosis, verdict.assessment_text].filter(Boolean).join('. ')
      : undefined,
    officerRequest: request?.assessment_text,
    evidence: c.evidence.map((e) => ({
      id: String(e.id),
      createdAt: e.created_at,
      note: e.note,
      imageUri: e.has_image ? apiUrl(`/farmer/cases/${c.id}/evidence/${e.id}/image`) : null,
    })),
  };
}

/** Each adviser exchange becomes the farmer's question plus the AI answer. */
function toChatMessages(a: ApiAdvisory): ChatMessage[] {
  return [
    { id: `q-${a.id}`, role: 'user', text: a.question, createdAt: a.created_at },
    {
      id: String(a.id),
      role: 'assistant',
      answer: { advice: a.advice, why: a.why, uncertainty: a.uncertainty },
      createdAt: a.created_at,
      reviewCaseId: a.case_id ?? undefined,
    },
  ];
}

function toConsents(states: ApiConsentState[]): Consents {
  const granted = (purpose: string) => states.find((s) => s.purpose === purpose)?.granted ?? false;
  return {
    extensionOfficerSharing: granted('extensionOfficerSharing'),
    modelImprovement: granted('modelImprovement'),
    districtAnalytics: granted('districtAnalytics'),
    marketing: granted('marketing'),
  };
}

// ── Session ──────────────────────────────────────────────────────────────────────────────

export const signIn = (phone: string, password: string) =>
  api.post<{ access_token: string; user: ApiUser }>('/auth/login', { login: phone, password });

export const fetchMe = () => api.get<ApiUser>('/auth/me');

// ── Initial load ─────────────────────────────────────────────────────────────────────────

export type FarmerSnapshot = {
  activeFarmRecords: number;
  modelInfo: ModelInfo;
  consents: Consents;
  diagnoses: DiagnosisRecord[];
  reviewCases: ReviewCase[];
  chatMessages: ChatMessage[];
  latestRecommendation: AiRecommendation | null;
  marketComparison: MarketComparison | null;
  dataInventory: DataInventoryItem[];
  accountDeletionPending: boolean;
};

/** Everything the farmer screens show, fetched in parallel. */
export async function loadFarmerSnapshot(): Promise<FarmerSnapshot> {
  const [dashboard, card, consentStates, diagnoses, cases, advisory, market, reference, deletions] =
    await Promise.all([
      api.get<{ active_farm_records: number }>('/farmer/dashboard'),
      api.get<{ model_name: string; version: string; supported_crops: string[] }>(
        '/model-cards/current',
      ),
      api.get<ApiConsentState[]>('/farmer/consents'),
      api.get<ApiDiagnosis[]>('/farmer/diagnoses'),
      api.get<ApiCase[]>('/farmer/cases'),
      api.get<ApiAdvisory[]>('/farmer/advisory'),
      fetchMarket('Maize'),
      api.get<{
        data_inventory: { data: string; purpose: string; shared_with: string; retention: string }[];
      }>('/reference'),
      api.get<{ type: string; status: string }[]>('/farmer/deletion-requests'),
    ]);

  const latest = advisory.at(-1);
  return {
    activeFarmRecords: dashboard.active_farm_records,
    modelInfo: {
      name: card.model_name,
      version: `v${card.version}`,
      supportedCrops: card.supported_crops as CropType[],
    },
    consents: toConsents(consentStates),
    diagnoses: diagnoses.map(toDiagnosis),
    reviewCases: cases.map(toReviewCase),
    chatMessages: advisory.flatMap(toChatMessages),
    latestRecommendation: latest
      ? {
          id: String(latest.id),
          topic: latest.question,
          advice: latest.advice,
          why: latest.why,
          uncertainty: latest.uncertainty,
        }
      : null,
    marketComparison: market,
    dataInventory: reference.data_inventory.map((i) => ({
      data: i.data,
      purpose: i.purpose,
      sharedWith: i.shared_with,
      retention: i.retention,
    })),
    accountDeletionPending: deletions.some((d) => d.type === 'account' && d.status === 'pending'),
  };
}

export const fetchReviewCases = async () =>
  (await api.get<ApiCase[]>('/farmer/cases')).map(toReviewCase);

async function fetchMarket(crop: CropType): Promise<MarketComparison | null> {
  const m = await api.get<{
    crop: string;
    rows: {
      market: string;
      price_per_100kg: number;
      transport_cost: number;
      verified_demand: 'Low' | 'Medium' | 'High';
    }[];
    recommendation: string | null;
    reason: string | null;
    disclaimer: string;
    last_updated: string | null;
  }>(`/farmer/market?crop=${encodeURIComponent(crop)}`);
  if (!m.rows.length || !m.recommendation) return null;
  return {
    crop: m.crop as CropType,
    currency: 'GHS',
    prices: m.rows.map((r) => ({
      market: r.market,
      pricePer100kg: r.price_per_100kg,
      transportCost: r.transport_cost,
      verifiedDemand: r.verified_demand,
    })),
    recommendedMarket: m.recommendation,
    reason: m.reason ?? '',
    disclaimer: m.disclaimer,
    updatedAt: m.last_updated ?? new Date().toISOString(),
  };
}

// ── Diagnosis ────────────────────────────────────────────────────────────────────────────

/**
 * Upload the photo and run the AI diagnosis.
 * Audit: `FARMER | Submitted crop image for purpose-limited AI diagnosis`
 */
export async function submitDiagnosis(input: DiagnosisInput): Promise<DiagnosisRecord> {
  const form = new FormData();
  form.append('crop_type', input.cropType);
  form.append('district', input.district);
  form.append('symptoms', input.symptoms);
  form.append('diagnosis_consent', String(input.diagnosisConsent));
  form.append('training_consent', String(input.trainingConsent));
  form.append('image', await toUploadFile(input.imageUri));
  return toDiagnosis(await api.post<ApiDiagnosis>('/farmer/diagnoses', form));
}

/** Audit: `FARMER | Reported potentially incorrect AI result <case or diagnosis>` */
export async function reportIncorrectResult(diagnosisId: string, comment: string) {
  await api.post(`/farmer/diagnoses/${diagnosisId}/report`, { description: comment });
}

/** Permanently deletes the photo. Audit: `FARMER | Deleted uploaded crop image for …` */
export async function deleteDiagnosisImage(diagnosisId: string): Promise<DiagnosisRecord> {
  return toDiagnosis(await api.delete<ApiDiagnosis>(`/farmer/diagnoses/${diagnosisId}/image`));
}

// ── Human review ─────────────────────────────────────────────────────────────────────────

/**
 * Create a review case for a diagnosis or an AI answer. The backend refuses when
 * "extension officer sharing" is off.
 * Audit: `FARMER | Requested extension-officer review for <caseId>`
 */
export async function requestReview(source: ReviewSource): Promise<ReviewCase> {
  const path =
    source.type === 'diagnosis'
      ? `/farmer/diagnoses/${source.diagnosisId}/review-request`
      : `/farmer/advisory/${source.messageId}/review-request`;
  return toReviewCase(await api.post<ApiCase>(path));
}

/** Send extra evidence after an officer asks for it; the case returns to pending. */
export async function submitEvidence(
  caseId: string,
  evidence: { note: string; imageUri: string | null },
): Promise<ReviewCase> {
  const form = new FormData();
  form.append('note', evidence.note);
  if (evidence.imageUri) form.append('image', await toUploadFile(evidence.imageUri));
  return toReviewCase(await api.post<ApiCase>(`/farmer/cases/${caseId}/evidence`, form));
}

// ── AI adviser ───────────────────────────────────────────────────────────────────────────

/**
 * Ask the explainable AI adviser. Answers always have Advice / Why / Uncertainty.
 * Audit: `FARMER | Requested explainable AI advisory response`
 */
export async function askAdviser(question: string): Promise<ChatMessage[]> {
  return toChatMessages(await api.post<ApiAdvisory>('/farmer/advisory', { question }));
}

// ── Privacy ──────────────────────────────────────────────────────────────────────────────

/** Saves a new consent version. Audit: `FARMER | Updated granular consent preferences` */
export async function saveConsents(consents: Consents): Promise<Consents> {
  return toConsents(await api.put<ApiConsentState[]>('/farmer/consents', consents));
}

/** Audit: `FARMER | Submitted account deletion request` */
export async function requestAccountDeletion() {
  await api.post('/farmer/deletion-request', { confirm: true });
}

/** The full personal-data export. Audit: `FARMER | Downloaded personal data export` */
export const fetchDataExport = () => api.get<object>('/farmer/export');
