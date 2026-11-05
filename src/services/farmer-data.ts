/**
 * The farmer data source the app uses: the real AgriTrust API, or the built-in demo data in
 * demo mode (development builds only — see `demo-mode.ts`). Same functions either way.
 */
import * as realApi from '@/services/farmer-api';
import { DEMO_MODE } from '@/services/demo-mode';
import { demoFarmerApi } from '@/services/farmer-api-demo';

export type { FarmerSnapshot } from '@/services/farmer-api';

const source = DEMO_MODE ? demoFarmerApi : realApi;

export const loadFarmerSnapshot = source.loadFarmerSnapshot;
export const fetchReviewCases = source.fetchReviewCases;
export const submitDiagnosis = source.submitDiagnosis;
export const reportIncorrectResult = source.reportIncorrectResult;
export const deleteDiagnosisImage = source.deleteDiagnosisImage;
export const requestReview = source.requestReview;
export const submitEvidence = source.submitEvidence;
export const askAdviser = source.askAdviser;
export const saveConsents = source.saveConsents;
export const requestAccountDeletion = source.requestAccountDeletion;
export const fetchDataExport = source.fetchDataExport;
