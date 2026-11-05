/**
 * DEMO farmer API — same functions as `farmer-api.ts`, answered from built-in sample data
 * (the original AgriTrust prototype) with changes kept in memory for the session.
 * Used only in demo mode (see `demo-mode.ts`); nothing is sent anywhere.
 */
import type * as RealApi from '@/services/farmer-api';
import type {
  AdvisoryAnswer,
  ChatMessage,
  Consents,
  DiagnosisRecord,
  DiagnosisResult,
  FarmerProfile,
  ReviewCase,
} from '@/types/farmer';

export const DEMO_PROFILE: FarmerProfile = {
  id: 'demo-farmer',
  name: 'Ama K.',
  firstName: 'Ama',
  phone: '0244000001',
  district: 'Ho West',
};

const DIAGNOSIS_RESULT: DiagnosisResult = {
  label: 'Possible fall armyworm damage',
  diseaseId: 'fall-armyworm',
  confidence: 72,
  confidenceBand: 'Moderate',
  reasons: [
    'Irregular feeding damage matches known maize-leaf patterns.',
    'The selected crop is maize.',
    'Similar cases have been reported in the selected district.',
    'Your description mentions leaf and whorl damage.',
  ],
  limitations: [
    'The image was not physically inspected by an agronomist.',
    'Lighting and camera quality can affect the result.',
    'This model does not replace professional diagnosis.',
  ],
  nextSteps:
    'Inspect additional plants, capture a clearer close-up if possible, and request extension-officer confirmation before applying treatment.',
  modelVersion: 'CropVision v1.3',
};

const ADVISORY_ANSWER: AdvisoryAnswer = {
  advice: 'Consider delaying maize planting for about five days.',
  why: 'Low rainfall is forecast, the Ho West maize calendar supports a later window, and the soil condition you previously recorded is dry.',
  uncertainty:
    'Weather forecasts can change. Request an extension officer review before making a high-cost decision.',
};

// ── In-memory demo state (reset when the app restarts) ───────────────────────

let consents: Consents = {
  extensionOfficerSharing: true,
  modelImprovement: false,
  districtAnalytics: false,
  marketing: false,
};

let diagnoses: DiagnosisRecord[] = [
  {
    id: 'demo-diag-014',
    createdAt: '2026-11-02T09:30:00Z',
    cropType: 'Maize',
    district: 'Ho West',
    symptoms: 'Holes in leaves and damaged maize whorl',
    trainingConsent: false,
    imageUri: null,
    imageDeleted: false,
    result: DIAGNOSIS_RESULT,
    reviewCaseId: 'AGR-2026-014',
    reportedIncorrect: false,
  },
];

let reviewCases: ReviewCase[] = [
  {
    id: 'AGR-2026-014',
    summary: 'Possible fall armyworm',
    status: 'pending',
    createdAt: '2026-11-02T09:35:00Z',
    source: { type: 'diagnosis', diagnosisId: 'demo-diag-014' },
    evidence: [],
  },
  {
    id: 'AGR-2026-011',
    summary: 'Possible fall armyworm',
    status: 'confirmed',
    createdAt: '2026-10-20T14:10:00Z',
    source: { type: 'diagnosis', diagnosisId: 'demo-diag-011' },
    officerAdvice:
      'The symptoms are consistent with fall armyworm, but the farmer should inspect the whorl and provide a close-up image before treatment.',
    evidence: [],
  },
];

let chatMessages: ChatMessage[] = [];
let accountDeletionPending = false;
let caseSequence = 15;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function nextCaseId() {
  const caseId = `AGR-${new Date().getFullYear()}-${String(caseSequence).padStart(3, '0')}`;
  caseSequence += 1;
  return caseId;
}

function findDiagnosis(diagnosisId: string) {
  const record = diagnoses.find((d) => d.id === diagnosisId);
  if (!record) throw new Error('Diagnosis not found');
  return record;
}

// ── API (same signatures as farmer-api.ts) ───────────────────────────────────

type FarmerApi = Pick<
  typeof RealApi,
  | 'loadFarmerSnapshot'
  | 'fetchReviewCases'
  | 'submitDiagnosis'
  | 'reportIncorrectResult'
  | 'deleteDiagnosisImage'
  | 'requestReview'
  | 'submitEvidence'
  | 'askAdviser'
  | 'saveConsents'
  | 'requestAccountDeletion'
  | 'fetchDataExport'
>;

export const demoFarmerApi: FarmerApi = {
  async loadFarmerSnapshot() {
    await delay(300);
    return {
      activeFarmRecords: 2,
      modelInfo: { name: 'CropVision', version: 'v1.3', supportedCrops: ['Maize', 'Tomato', 'Rice'] },
      consents,
      diagnoses,
      reviewCases,
      chatMessages,
      latestRecommendation: {
        id: 'demo-rec-001',
        topic: 'Maize planting window',
        advice: 'Delay planting for approximately five days because low rainfall is forecast.',
        why: ADVISORY_ANSWER.why,
        uncertainty: ADVISORY_ANSWER.uncertainty,
      },
      marketComparison: {
        crop: 'Maize',
        currency: 'GHS',
        prices: [
          { market: 'Ho Central', pricePer100kg: 420, transportCost: 35, verifiedDemand: 'Medium' },
          { market: 'Kpando', pricePer100kg: 455, transportCost: 42, verifiedDemand: 'High' },
          { market: 'Hohoe', pricePer100kg: 470, transportCost: 68, verifiedDemand: 'High' },
        ],
        recommendedMarket: 'Kpando',
        reason:
          'Suggested because the net estimated return is strongest after transport, buyer demand is high, and verified buyers completed recent transactions.',
        disclaimer: 'Prices can change. The platform does not guarantee sale or payment.',
        updatedAt: now(),
      },
      dataInventory: [
        { data: 'Phone number', purpose: 'Login and account recovery', sharedWith: 'No third party', retention: 'Until account deletion' },
        { data: 'Crop images', purpose: 'Diagnosis', sharedWith: 'Extension officer only when requested', retention: '90 days unless deleted earlier' },
        { data: 'District', purpose: 'Localised recommendations', sharedWith: 'Aggregated analytics if consented', retention: 'While account is active' },
        { data: 'AI interaction logs', purpose: 'Safety, traceability and complaints', sharedWith: 'Authorised auditors', retention: '12 months' },
      ],
      accountDeletionPending,
    };
  },

  async fetchReviewCases() {
    return reviewCases;
  },

  async submitDiagnosis(input) {
    await delay(1500);
    const record: DiagnosisRecord = {
      id: id('demo-diag'),
      createdAt: now(),
      cropType: input.cropType,
      district: input.district,
      symptoms: input.symptoms,
      trainingConsent: input.trainingConsent,
      imageUri: input.imageUri,
      imageDeleted: false,
      result: DIAGNOSIS_RESULT,
      reportedIncorrect: false,
    };
    diagnoses = [record, ...diagnoses];
    return record;
  },

  async reportIncorrectResult(diagnosisId) {
    await delay(500);
    diagnoses = diagnoses.map((d) => (d.id === diagnosisId ? { ...d, reportedIncorrect: true } : d));
  },

  async deleteDiagnosisImage(diagnosisId) {
    await delay(500);
    const updated = { ...findDiagnosis(diagnosisId), imageUri: null, imageDeleted: true };
    diagnoses = diagnoses.map((d) => (d.id === diagnosisId ? updated : d));
    return updated;
  },

  async requestReview(source) {
    await delay(700);
    const summary =
      source.type === 'diagnosis'
        ? findDiagnosis(source.diagnosisId).result.label.replace(/ damage$/, '')
        : 'AI adviser answer';
    const reviewCase: ReviewCase = {
      id: nextCaseId(),
      summary,
      status: 'pending',
      createdAt: now(),
      source,
      evidence: [],
    };
    reviewCases = [reviewCase, ...reviewCases];
    if (source.type === 'diagnosis') {
      diagnoses = diagnoses.map((d) =>
        d.id === source.diagnosisId ? { ...d, reviewCaseId: reviewCase.id } : d,
      );
    }
    return reviewCase;
  },

  async submitEvidence(caseId, evidence) {
    await delay(800);
    let updated: ReviewCase | undefined;
    reviewCases = reviewCases.map((c) => {
      if (c.id !== caseId) return c;
      updated = {
        ...c,
        status: 'pending',
        evidence: [...c.evidence, { id: id('demo-ev'), createdAt: now(), ...evidence }],
      };
      return updated;
    });
    if (!updated) throw new Error('Case not found');
    return updated;
  },

  async askAdviser(question) {
    await delay(1100);
    const exchange: ChatMessage[] = [
      { id: id('demo-q'), role: 'user', text: question, createdAt: now() },
      { id: id('demo-a'), role: 'assistant', answer: ADVISORY_ANSWER, createdAt: now() },
    ];
    chatMessages = [...chatMessages, ...exchange];
    return exchange;
  },

  async saveConsents(next) {
    await delay(500);
    consents = next;
    return consents;
  },

  async requestAccountDeletion() {
    await delay(600);
    accountDeletionPending = true;
  },

  async fetchDataExport() {
    await delay(400);
    return {
      demoMode: true,
      exportedAt: now(),
      profile: DEMO_PROFILE,
      consents,
      diagnoses,
      reviewCases,
      adviserMessages: chatMessages,
    };
  },
};
