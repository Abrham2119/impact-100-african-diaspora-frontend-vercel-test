import type { ReactNode } from 'react';

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  hint?: ReactNode;
  hintClassName?: string;
  icon: ReactNode;
  iconClassName?: string;
}

export function DashboardStatCard({
  label,
  value,
  hint,
  hintClassName = 'dash-stat-badge-green',
  icon,
  iconClassName = 'dash-icon-green',
}: DashboardStatCardProps) {
  return (
    <div className="dash-stat-card">
      <div className="dash-stat-top">
        <div className={`dash-stat-icon-wrapper ${iconClassName}`}>
         {icon}
        </div>

        {hint && (
          <span className={hintClassName}>
          {hint}
          </span>
        )}
      </div>

      <p className="dash-stat-label">
        {label}
      </p>

      <p className="dash-stat-value">
        {value}
      </p>
    </div>
  );
}

export {
  DashboardStatCardSkeleton,
  DashboardStatCardsSkeleton,
  type DashboardStatCardSkeletonProps,
  type DashboardStatCardsSkeletonProps,
} from './DashboardStatCardSkeleton';