/**
 * Farmer-side domain types (see docs/features/farmer.md §10).
 * These are the contracts the backend API should satisfy.
 */

export type District = 'Ho West' | 'Kpando' | 'Hohoe' | 'Afadzato South';

export type CropType = 'Maize' | 'Rice' | 'Tomato' | 'Cassava' | 'Cocoa';

export type FarmerProfile = {
  id: string;
  /** Full display name, e.g. "Ama K." */
  name: string;
  /** First name used in greetings, e.g. "Ama". */
  firstName: string;
  /** Used for login and account recovery. */
  phone: string;
  district: District;
};

/** Editable consent purposes. "core" service processing is essential and always on. */
export type ConsentPurpose =
  | 'extensionOfficerSharing'
  | 'modelImprovement'
  | 'districtAnalytics'
  | 'marketing';

export type Consents = Record<ConsentPurpose, boolean>;

// ── AI crop diagnosis ────────────────────────────────────────────────────────

export type ConfidenceBand = 'Low' | 'Moderate' | 'High';

export type DiagnosisInput = {
  cropType: CropType;
  district: District;
  symptoms: string;
  /** Local URI of the selected photo (upload is the backend's job). */
  imageUri: string;
  /** Required — the image may be used to provide this diagnosis. */
  diagnosisConsent: true;
  /** Optional — an anonymised copy may be used to improve the model. */
  trainingConsent: boolean;
};

export type DiagnosisResult = {
  label: string;
  /** 0–100 */
  confidence: number;
  confidenceBand: ConfidenceBand;
  reasons: string[];
  limitations: string[];
  nextSteps: string;
  modelVersion: string;
};

export type DiagnosisRecord = {
  id: string;
  createdAt: string;
  cropType: CropType;
  district: District;
  symptoms: string;
  trainingConsent: boolean;
  /** null once the farmer deletes it (or it expires after 90 days). */
  imageUri: string | null;
  imageDeleted: boolean;
  result: DiagnosisResult;
  reviewCaseId?: string;
  reportedIncorrect: boolean;
};

/** Model metadata the farmer UI needs (from the admin model card). */
export type ModelInfo = {
  name: string;
  version: string;
  supportedCrops: CropType[];
};

// ── Human review ─────────────────────────────────────────────────────────────

/** `withdrawn`: closed because the farmer's account was deleted before review finished. */
export type ReviewStatus = 'pending' | 'needsMoreEvidence' | 'confirmed' | 'rejected' | 'withdrawn';

export type ReviewSource =
  | { type: 'diagnosis'; diagnosisId: string }
  | { type: 'advice'; messageId: string };

export type ReviewEvidence = {
  id: string;
  createdAt: string;
  note: string;
  imageUri: string | null;
};

export type ReviewCase = {
  /** Format: AGR-<year>-<sequence>, e.g. "AGR-2026-014". */
  id: string;
  summary: string;
  status: ReviewStatus;
  createdAt: string;
  source: ReviewSource;
  /** The officer's human-reviewed advice (confirmed) or reason (rejected). */
  officerAdvice?: string;
  /** What the officer asked for when status is needsMoreEvidence. */
  officerRequest?: string;
  evidence: ReviewEvidence[];
};

// ── AI adviser ───────────────────────────────────────────────────────────────

/** Every AI answer keeps this three-part structure. */
export type AdvisoryAnswer = {
  advice: string;
  why: string;
  uncertainty: string;
};

export type ChatMessage =
  | { id: string; role: 'user'; text: string; createdAt: string }
  | {
      id: string;
      role: 'assistant';
      answer: AdvisoryAnswer;
      createdAt: string;
      reviewCaseId?: string;
    };

export type AiRecommendation = {
  id: string;
  /** Short topic label, e.g. "Maize planting window". */
  topic: string;
} & AdvisoryAnswer;

// ── Market ───────────────────────────────────────────────────────────────────

export type DemandLevel = 'Low' | 'Medium' | 'High';

export type MarketPrice = {
  market: string;
  pricePer100kg: number;
  transportCost: number;
  verifiedDemand: DemandLevel;
};

/** Transparent market recommendation for one crop (docs/features/farmer.md §6). */
export type MarketComparison = {
  crop: CropType;
  currency: 'GHS';
  prices: MarketPrice[];
  recommendedMarket: string;
  reason: string;
  disclaimer: string;
  updatedAt: string;
};

// ── Privacy ──────────────────────────────────────────────────────────────────

export type DataInventoryItem = {
  data: string;
  purpose: string;
  sharedWith: string;
  retention: string;
};

export type AccountDeletionStatus = 'none' | 'pending';
