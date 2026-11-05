import { Badge, type BadgeTone } from '@/components/ui/badge';
import type { IconName } from '@/components/ui/icon';
import type { ReviewStatus } from '@/types/farmer';

export const REVIEW_STATUS: Record<
  ReviewStatus,
  { label: string; tone: BadgeTone; icon: IconName }
> = {
  pending: { label: 'Pending review', tone: 'blue', icon: 'clock' },
  needsMoreEvidence: { label: 'Needs more evidence', tone: 'dark', icon: 'warning' },
  confirmed: { label: 'Confirmed', tone: 'mint', icon: 'check' },
  rejected: { label: 'AI result rejected', tone: 'gray', icon: 'close' },
  withdrawn: { label: 'Withdrawn', tone: 'gray', icon: 'close' },
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const { label, tone, icon } = REVIEW_STATUS[status];
  return <Badge label={label} tone={tone} icon={icon} />;
}
