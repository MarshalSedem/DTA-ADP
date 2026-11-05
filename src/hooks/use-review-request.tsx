import { useState } from 'react';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useToast } from '@/components/ui/toast';
import { errorMessage } from '@/services/api-client';
import { useFarmer } from '@/state/farmer-store';
import type { ReviewSource } from '@/types/farmer';

type PendingRequest = { source: ReviewSource; summary: string };

/**
 * Send a case to an extension officer, respecting the farmer's
 * "Extension officer sharing" consent. If sharing is off, a sheet asks the
 * farmer before turning it on. Render `sheet` somewhere in the screen.
 */
export function useReviewRequest() {
  const { consents, saveConsents, requestReview } = useFarmer();
  const toast = useToast();
  const [pending, setPending] = useState<PendingRequest | null>(null);
  const [busy, setBusy] = useState(false);

  const send = async ({ source, summary }: PendingRequest) => {
    setBusy(true);
    try {
      await requestReview(source, summary);
      toast('Review request sent');
    } catch (error) {
      toast(errorMessage(error, 'Could not send the request. Please try again.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const request = (source: ReviewSource, summary: string) => {
    if (!consents.extensionOfficerSharing) {
      setPending({ source, summary });
      return;
    }
    void send({ source, summary });
  };

  const enableSharingAndSend = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      await saveConsents({ ...consents, extensionOfficerSharing: true });
    } catch {
      setBusy(false);
      toast('Could not update your sharing setting. Please try again.', 'error');
      return;
    }
    await send(pending);
    setPending(null);
  };

  const sheet = (
    <BottomSheet
      visible={!!pending}
      onClose={() => setPending(null)}
      title="Share this case with an extension officer?"
      description="Extension officer sharing is turned off. Turning it on lets an officer see only the cases you choose to share, such as the crop photo, crop type, district and symptoms. You can turn it off again in My Data & Privacy."
      confirmLabel="Turn on and send"
      confirmLoading={busy}
      onConfirm={enableSharingAndSend}
    />
  );

  return { request, busy, sheet };
}
