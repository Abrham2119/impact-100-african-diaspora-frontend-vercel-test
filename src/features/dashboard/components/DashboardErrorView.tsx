import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { AlertCircleIcon, RefreshCwIcon } from "./DashboardIcon";

export interface DashboardErrorViewProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryText?: string;
  icon?: ReactNode;
  showIcon?: boolean;
}

export function DashboardErrorView({
  title = "Unable to load Super Admin dashboard",
  description = "We encountered an error fetching real-time clinic operations. Please verify your connection or try again.",
  onRetry,
  retryText = "Try Again",
  icon,
  showIcon = true,
  className,
  children,
  ...props
}: DashboardErrorViewProps) {
  return (
    <div className={cn("dash-error-card", className)} {...props}>
      {showIcon && (
        <div className="dash-error-icon-box">
          {icon ?? (
            <AlertCircleIcon className="h-7 w-7 text-red-600 dark:text-red-400" />
          )}
        </div>
      )}

      <h2 className="dash-state-heading">{title}</h2>
      {description && <p className="dash-state-text">{description}</p>}

      {(onRetry || children) && (
        <div className="mt-6 flex items-center justify-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="dash-btn-primary"
            >
              <RefreshCwIcon className="h-4 w-4" />
              <span>{retryText}</span>
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

export const DashboardErrorState = DashboardErrorView;
