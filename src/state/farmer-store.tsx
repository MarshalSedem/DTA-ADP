/**
 * App-wide farmer state, loaded from the AgriTrust API after sign-in. Screens read and change
 * data only through here, so every screen stays in sync (e.g. requesting a review on a
 * diagnosis updates the Home "pending review" count and the Human Review list).
 *
 * All reads and writes go through `@/services/farmer-api`. The provider renders its children
 * only once the first load has finished, so screens can rely on the data being present.
 */
import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';

import { errorMessage } from '@/services/api-client';
// Real API, or built-in sample data in demo mode (development builds only).
import * as api from '@/services/farmer-data';
import { useSession } from '@/state/session';
import type {
  AccountDeletionStatus,
  AiRecommendation,
  ChatMessage,
  Consents,
  DataInventoryItem,
  DiagnosisInput,
  DiagnosisRecord,
  FarmerProfile,
  MarketComparison,
  ModelInfo,
  ReviewCase,
  ReviewSource,
} from '@/types/farmer';

type FarmerState = {
  profile: FarmerProfile;
  activeFarmRecords: number;
  modelInfo: ModelInfo;
  latestRecommendation: AiRecommendation | null;
  marketComparison: MarketComparison | null;
  dataInventory: DataInventoryItem[];

  /** Re-fetch everything (pull to refresh) — picks up officer decisions. */
  refresh: () => Promise<void>;
  refreshing: boolean;

  // Consent
  consents: Consents;
  saveConsents: (next: Consents) => Promise<void>;

  // Diagnosis
  diagnoses: DiagnosisRecord[];
  submitDiagnosis: (input: DiagnosisInput) => Promise<string>;
  deleteDiagnosisImage: (diagnosisId: string) => Promise<void>;
  reportIncorrectResult: (diagnosisId: string, comment: string) => Promise<void>;

  // Human review
  reviewCases: ReviewCase[];
  /** Cases still waiting on an extension officer or on the farmer. */
  pendingReviewCount: number;
  /**
   * Create a review case. Callers must make sure extension-officer sharing is
   * on first (the backend enforces it too).
   */
  requestReview: (source: ReviewSource, summary: string) => Promise<string>;
  submitEvidence: (
    caseId: string,
    evidence: { note: string; imageUri: string | null },
  ) => Promise<void>;

  // AI adviser
  chatMessages: ChatMessage[];
  adviserBusy: boolean;
  askAdviser: (question: string) => Promise<void>;

  // Account
  accountDeletion: AccountDeletionStatus;
  requestAccountDeletion: () => Promise<void>;
  buildDataExport: () => Promise<object>;
};

const FarmerContext = createContext<FarmerState | null>(null);

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: api.FarmerSnapshot };

type FarmerProviderProps = {
  children: ReactNode;
  /** Shown while the first load is in progress, or when it failed (with a retry). */
  renderGate: (state: { error: string | null; retry: () => void }) => ReactNode;
};

export function FarmerProvider({ children, renderGate }: FarmerProviderProps) {
  const { profile } = useSession();
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [refreshing, setRefreshing] = useState(false);
  const [adviserBusy, setAdviserBusy] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const data = await api.loadFarmerSnapshot();
      setLoad({ status: 'ready', data });
    } catch (error) {
      setLoad((prev) =>
        // Keep showing data we already have if a background refresh fails.
        prev.status === 'ready'
          ? prev
          : { status: 'error', message: errorMessage(error, 'Could not load your farm data.') },
      );
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  if (load.status !== 'ready' || !profile) {
    return renderGate({
      error: load.status === 'error' ? load.message : null,
      retry: () => {
        setLoad({ status: 'loading' });
        fetchAll().catch(() => {});
      },
    });
  }

  const data = load.data;
  const updateWith = (fn: (d: api.FarmerSnapshot) => Partial<api.FarmerSnapshot>) =>
    setLoad((prev) =>
      prev.status === 'ready' ? { ...prev, data: { ...prev.data, ...fn(prev.data) } } : prev,
    );
  const update = (patch: Partial<api.FarmerSnapshot>) => updateWith(() => patch);

  const replaceDiagnosis = (record: DiagnosisRecord) =>
    updateWith((d) => ({ diagnoses: d.diagnoses.map((x) => (x.id === record.id ? record : x)) }));
  const upsertCase = (c: ReviewCase) =>
    updateWith((d) => ({
      reviewCases: d.reviewCases.some((x) => x.id === c.id)
        ? d.reviewCases.map((x) => (x.id === c.id ? c : x))
        : [c, ...d.reviewCases],
    }));

  const value: FarmerState = {
    profile,
    activeFarmRecords: data.activeFarmRecords,
    modelInfo: data.modelInfo,
    latestRecommendation: data.latestRecommendation,
    marketComparison: data.marketComparison,
    dataInventory: data.dataInventory,

    refreshing,
    refresh: async () => {
      setRefreshing(true);
      try {
        await fetchAll();
      } finally {
        setRefreshing(false);
      }
    },

    consents: data.consents,
    saveConsents: async (next) => {
      update({ consents: await api.saveConsents(next) });
    },

    diagnoses: data.diagnoses,
    submitDiagnosis: async (input) => {
      const record = await api.submitDiagnosis(input);
      updateWith((d) => ({ diagnoses: [record, ...d.diagnoses] }));
      // In districts with restricted high-risk advice the API opens a review case itself.
      if (record.reviewCaseId) update({ reviewCases: await api.fetchReviewCases() });
      return record.id;
    },
    deleteDiagnosisImage: async (diagnosisId) => {
      replaceDiagnosis(await api.deleteDiagnosisImage(diagnosisId));
    },
    reportIncorrectResult: async (diagnosisId, comment) => {
      await api.reportIncorrectResult(diagnosisId, comment);
      updateWith((d) => ({
        diagnoses: d.diagnoses.map((x) =>
          x.id === diagnosisId ? { ...x, reportedIncorrect: true } : x,
        ),
      }));
    },

    reviewCases: data.reviewCases,
    pendingReviewCount: data.reviewCases.filter(
      (c) => c.status === 'pending' || c.status === 'needsMoreEvidence',
    ).length,
    requestReview: async (source) => {
      const reviewCase = await api.requestReview(source);
      upsertCase(reviewCase);
      updateWith((d) =>
        source.type === 'diagnosis'
          ? {
              diagnoses: d.diagnoses.map((x) =>
                x.id === source.diagnosisId ? { ...x, reviewCaseId: reviewCase.id } : x,
              ),
            }
          : {
              chatMessages: d.chatMessages.map((m) =>
                m.id === source.messageId && m.role === 'assistant'
                  ? { ...m, reviewCaseId: reviewCase.id }
                  : m,
              ),
            },
      );
      return reviewCase.id;
    },
    submitEvidence: async (caseId, evidence) => {
      upsertCase(await api.submitEvidence(caseId, evidence));
    },

    chatMessages: data.chatMessages,
    adviserBusy,
    askAdviser: async (question) => {
      // Show the question straight away; it's replaced by the saved exchange on success.
      const pendingId = `pending-${Date.now()}`;
      updateWith((d) => ({
        chatMessages: [
          ...d.chatMessages,
          { id: pendingId, role: 'user', text: question, createdAt: new Date().toISOString() },
        ],
      }));
      setAdviserBusy(true);
      try {
        const exchange = await api.askAdviser(question);
        updateWith((d) => ({
          chatMessages: [...d.chatMessages.filter((m) => m.id !== pendingId), ...exchange],
        }));
      } catch (error) {
        updateWith((d) => ({ chatMessages: d.chatMessages.filter((m) => m.id !== pendingId) }));
        throw error;
      } finally {
        setAdviserBusy(false);
      }
    },

    accountDeletion: data.accountDeletionPending ? 'pending' : 'none',
    requestAccountDeletion: async () => {
      await api.requestAccountDeletion();
      update({ accountDeletionPending: true });
    },
    buildDataExport: () => api.fetchDataExport(),
  };

  return <FarmerContext value={value}>{children}</FarmerContext>;
}

export function useFarmer() {
  const ctx = use(FarmerContext);
  if (!ctx) throw new Error('useFarmer must be used inside <FarmerProvider>');
  return ctx;
}
