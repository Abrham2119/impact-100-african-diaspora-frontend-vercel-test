import { Skeleton } from '@/components/ui/Skeleton';
import { DashboardStatCardsSkeleton } from './DashboardStatCardSkeleton';
import { cn } from '@/lib/utils/cn';

export interface DashboardLoadingSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  showHeader?: boolean;
  statCardsCount?: number;
}

export function DashboardLoadingSkeleton({
  showHeader = true,
  statCardsCount = 4,
  className,
  ...props
}: DashboardLoadingSkeletonProps) {
  return (
    <div
      className={cn('space-y-6 animate-pulse', className)}
      aria-label="Loading dashboard..."
      {...props}
    >
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56 rounded-lg" />
            <Skeleton className="h-4 w-80 rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>
      )}

      <DashboardStatCardsSkeleton count={statCardsCount} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.75fr)_minmax(320px,1fr)]">
        <Skeleton className="h-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card p-6" />
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card p-6" />
          <Skeleton className="h-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card p-6" />
        </div>
      </div>
    </div>
  );
}

export const DashboardLoadingState = DashboardLoadingSkeleton;
