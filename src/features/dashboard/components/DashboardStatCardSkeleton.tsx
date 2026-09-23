import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';

export interface DashboardStatCardSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  cardClassName?: string;
}

export function DashboardStatCardSkeleton({
  count,
  className,
  cardClassName,
  ...props
}: DashboardStatCardSkeletonProps) {
  if (count !== undefined && count > 1) {
    return (
      <DashboardStatCardsSkeleton
        count={count}
        className={className}
        cardClassName={cardClassName}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card p-5 space-y-4',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-4 w-14 rounded-md" />
      </div>
      <Skeleton className="h-3 w-20 rounded" />
      <Skeleton className="h-8 w-16 rounded" />
    </div>
  );
}

export interface DashboardStatCardsSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  cardClassName?: string;
}

export function DashboardStatCardsSkeleton({
  count = 4,
  className,
  cardClassName,
  ...props
}: DashboardStatCardsSkeletonProps) {
  return (
    <div
      className={cn(
        'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
      {...props}
    >
      {Array.from({ length: count }, (_, i) => (
        <DashboardStatCardSkeleton key={i} className={cardClassName} />
      ))}
    </div>
  );
}
