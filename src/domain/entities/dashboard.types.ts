export type BranchStatus =
  | 'PEAK_FLOW'
  | 'OPTIMAL'
  | 'AVAILABLE';

export interface DashboardStats {
  totalBranches: number;
  totalDentists: number;
  treatmentChairs: number;
  services: number;
}

export interface DashboardOperations {
  chairUtilizationPercent: number;
  activeTreatmentPatientsPerHour: number;
  staffOnline: number;
}

export interface BranchPerformance {
  id: string;
  name: string;
  staffCount: number;
  chairs: number;
  capacityPercent: number;
  status: BranchStatus;
}

export interface TopService {
  id: string;
  name: string;
  percentage: number;
}

export interface DashboardData {
  stats: DashboardStats;
  operations: DashboardOperations;
  branchPerformance: BranchPerformance[];
  topServices: TopService[];
}