import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { BranchIcon, PlusIcon } from './DashboardIcon';

export interface DashboardEmptyViewProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onAction?: () => void;
  onAddBranch?: () => void;
  actionText?: string;
  icon?: ReactNode;
  actionIcon?: ReactNode;
  showIcon?: boolean;
}

export function DashboardEmptyView({
  title = 'No branches or operational data yet',
  description = 'Welcome to your Super Admin portal. Start by creating your first clinic branch to begin tracking operations, staffing, and patient throughput.',
  onAction,
  onAddBranch,
  actionText = 'Create First Branch',
  icon,
  actionIcon,
  showIcon = true,
  className,
  children,
  ...props
}: DashboardEmptyViewProps) {
  const handleAction = onAction ?? onAddBranch;

  return (
    <div className={cn('dash-empty-card', className)} {...props}>
      {showIcon && (
        <div className="dash-empty-icon-box">
          {icon ?? <BranchIcon className="h-7 w-7 text-[#10b981]" />}
        </div>
      )}

      <h2 className="dash-state-heading">{title}</h2>
      {description && <p className="dash-state-text">{description}</p>}

      {(handleAction || children) && (
        <div className="mt-6 flex items-center justify-center gap-3">
          {handleAction && (
            <button
              type="button"
              onClick={handleAction}
              className="dash-btn-primary"
            >
              {actionIcon ?? <PlusIcon className="h-4 w-4" />}
              <span>{actionText}</span>
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

// Semantic alias
export const DashboardEmptyState = DashboardEmptyView;
