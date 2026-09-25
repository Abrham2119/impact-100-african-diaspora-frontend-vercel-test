import { useState } from "react";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import {
  DashboardStatCard,
  DashboardLoadingSkeleton,
  DashboardErrorView,
  DashboardEmptyView,
} from "@/features/dashboard/components";
import {
  BranchIcon,
  ChairIcon,
  StaffIcon,
  ServiceKitIcon,
  MoreVerticalIcon,
  TrendingUpIcon,
  PlusIcon,
} from "@/features/dashboard/components/DashboardIcon";
import type { BranchStatus as BranchStatusType } from "@/domain/entities/dashboard.types";

type ViewMode = "live" | "loading" | "error" | "empty";

export function DashboardPage() {
  const dashboard = useDashboard();
  const [viewMode, setViewMode] = useState<ViewMode>("live");

  return (
    <div className="dash-container">
      
      <div className="dash-state-bar">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Dashboard Preview:
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("live")}
            className={`dash-state-btn ${
              viewMode === "live"
                ? "dash-state-btn-active text-emerald-600"
                : "dash-state-btn-inactive"
            }`}
          >
            ● Live Data
          </button>

          <button
            type="button"
            onClick={() => setViewMode("loading")}
            className={`dash-state-btn ${
              viewMode === "loading"
                ? "dash-state-btn-active text-amber-600"
                : "dash-state-btn-inactive"
            }`}
          >
            Loading State
          </button>

          <button
            type="button"
            onClick={() => setViewMode("error")}
            className={`dash-state-btn ${
              viewMode === "error"
                ? "dash-state-btn-active text-red-600"
                : "dash-state-btn-inactive"
            }`}
          >
            Error State
          </button>

          <button
            type="button"
            onClick={() => setViewMode("empty")}
            className={`dash-state-btn ${
              viewMode === "empty"
                ? "dash-state-btn-active text-blue-600"
                : "dash-state-btn-inactive"
            }`}
          >
            Empty State
          </button>
        </div>
      </div>

    
      {viewMode === "loading" ||
      (viewMode === "live" && dashboard.isLoading) ? (
        <DashboardLoadingSkeleton />
      ) : viewMode === "error" || (viewMode === "live" && dashboard.isError) ? (
        <DashboardErrorView
          onRetry={() => {
            setViewMode("live");
            dashboard.refetch();
          }}
        />
      ) : viewMode === "empty" ||
        (viewMode === "live" &&
          (!dashboard.data ||
            dashboard.data.branchPerformance.length === 0)) ? (
        <DashboardEmptyView onAction={() => setViewMode("live")} />
      ) : dashboard.data ? (
        <DashboardContent data={dashboard.data} />
      ) : null}
    </div>
  );
}

function DashboardContent({
  data,
}: {
  data: NonNullable<ReturnType<typeof useDashboard>["data"]>;
}) {
  const { stats, operations, branchPerformance, topServices } = data;

  return (
    <div className="space-y-6">
      <header className="dash-header">
        <div>
          <h1 className="dash-title">Clinic Overview</h1>
          <p className="dash-subtitle">
            Real-time status of BrightSmile network operations.
          </p>
        </div>

        <div className="dash-actions-row">
          <button type="button" className="dash-btn-primary">
            <PlusIcon />
            <span>Add Dentist</span>
          </button>

          <button type="button" className="dash-btn-outline">
            <BranchIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Add Branch</span>
          </button>

          <button type="button" className="dash-btn-outline">
            <ServiceKitIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Add Service</span>
          </button>

          <button type="button" className="dash-btn-outline">
            <ChairIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Add Chair</span>
          </button>
        </div>
      </header>

      <section aria-label="Clinic statistics" className="dash-stats-grid">
        {/* Total Dentists */}
        <DashboardStatCard
          label="Total Dentists"
          value={stats.totalDentists}
          hint={
            <span className="flex items-center gap-1">
              +2 this mo <TrendingUpIcon />
            </span>
          }
          icon={<StaffIcon />}
          iconClassName="dash-icon-green"
          hintClassName="dash-stat-badge-green"
        />

        {/* Branches */}
        <DashboardStatCard
          label="Branches"
          value={stats.totalBranches}
          hint="Active"
          icon={<BranchIcon />}
          iconClassName="dash-icon-green"
          hintClassName="dash-stat-badge-gray"
        />

        {/* Treatment Chairs */}
        <DashboardStatCard
          label="Treatment Chairs"
          value={stats.treatmentChairs}
          hint={`${operations.chairUtilizationPercent}% Utilized`}
          icon={<ChairIcon />}
          iconClassName="dash-icon-slate"
          hintClassName="dash-stat-badge-green"
        />

        {/* Services */}
        <DashboardStatCard
          label="Services"
          value={stats.services}
          hint="Catalogue"
          icon={<ServiceKitIcon />}
          iconClassName="dash-icon-red"
          hintClassName="dash-stat-badge-gray"
        />
      </section>

      <div className="dash-main-grid">
        <div className="dash-table-card">
          <div>
            <div className="dash-table-header">
              <div>
                <h2 className="dash-card-title">Branch Performance</h2>
                <p className="dash-subtitle">
                  Current staffing, chair capacity and operational status.
                </p>
              </div>

              <button type="button" className="dash-filter-pill">
                <span>Last 30 Days</span>
                <MoreVerticalIcon />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th className="dash-th">Branch Name</th>
                    <th className="dash-th">Dentists</th>
                    <th className="dash-th">Chairs</th>
                    <th className="dash-th">Capacity</th>
                    <th className="dash-th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {branchPerformance.map((branch) => (
                    <tr
                      key={branch.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="dash-td">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {branch.name}
                        </span>
                      </td>

                      <td className="dash-td font-medium text-slate-600 dark:text-slate-300">
                        {branch.staffCount}
                      </td>

                      <td className="dash-td font-medium text-slate-600 dark:text-slate-300">
                        {branch.chairs}
                      </td>

                      <td className="dash-td">
                        <div className="flex items-center gap-3">
                          <div className="dash-progress-track">
                            <div
                              className="dash-progress-fill-emerald"
                              style={{ width: `${branch.capacityPercent}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {branch.capacityPercent}%
                          </span>
                        </div>
                      </td>

                      <td className="dash-td">
                        <BranchStatusBadge status={branch.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dash-table-footer">
            <button type="button" className="dash-footer-link">
              View Detailed Analytics
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="dash-active-card">
            <div className="relative z-10">
              <h2 className="dash-active-title">Active Treatment</h2>
              <p className="dash-active-desc">
                Current patient throughput across all locations.
              </p>

              <div className="dash-throughput-row">
                <span className="dash-throughput-number">
                  {operations.activeTreatmentPatientsPerHour}
                </span>
                <span className="dash-throughput-unit">pts / hr</span>
              </div>

              <div className="dash-staff-row">
                <div className="dash-avatar-group">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80"
                    alt="Doctor"
                    className="dash-avatar"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80"
                    alt="Dentist"
                    className="dash-avatar"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1594824813576-a496b83f08c3?w=100&auto=format&fit=crop&q=80"
                    alt="Dental Specialist"
                    className="dash-avatar"
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  +{operations.staffOnline} staff online
                </span>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-500 dark:text-slate-400">
                    Chair utilization
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {operations.chairUtilizationPercent}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="dash-progress-fill-emerald transition-all"
                    style={{ width: `${operations.chairUtilizationPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="dash-services-card">
            <h2 className="dash-services-title">Top Services</h2>

            <div className="mt-5 space-y-4">
              {topServices.map((service, index) => {
                const barClass =
                  index === 0
                    ? "dash-progress-fill-emerald"
                    : index === 1
                      ? "dash-progress-fill-mint"
                      : "dash-progress-fill-coral";

                return (
                  <div key={service.id}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {service.name}
                      </span>
                      <span className="font-bold text-slate-600 dark:text-slate-400">
                        {service.percentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${barClass} transition-all`}
                        style={{ width: `${service.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button type="button" className="dash-btn-catalogue">
              Manage Catalogue
            </button>
          </div>
        </div>
      </div>

      <section aria-label="Practice Scaling" className="dash-promo-card">
        <div>
          <h2 className="dash-promo-title">Scale your Practice</h2>
          <p className="dash-promo-desc">
            DentalFlow's automated patient lifecycle management can increase
            throughput by up to 30%. Ready to open a new branch?
          </p>
        </div>

        <button type="button" className="dash-promo-btn">
          Scale Operations
        </button>
      </section>
    </div>
  );
}

function BranchStatusBadge({ status }: { status: BranchStatusType }) {
  switch (status) {
    case "PEAK_FLOW":
      return <span className="dash-badge-peak">Peak Flow</span>;
    case "OPTIMAL":
      return <span className="dash-badge-optimal">Optimal</span>;
    case "AVAILABLE":
      return <span className="dash-badge-available">Available</span>;
    default:
      return <span className="dash-badge-optimal">{status}</span>;
  }
}

