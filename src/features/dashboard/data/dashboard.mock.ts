import type { DashboardData } from '@/domain/entities/dashboard.types';

export const DASHBOARD_MOCK_DATA: DashboardData = {
  stats: {
    totalBranches: 3,
    totalDentists: 24,
    treatmentChairs: 12,
    services: 45,
  },
  operations: {
    chairUtilizationPercent: 85,
    activeTreatmentPatientsPerHour: 84,
    staffOnline: 12,
  },

  branchPerformance: [
    {
      id: 'central-branch',
      name: 'Central Branch',
      staffCount: 12,
      chairs: 6,
      capacityPercent: 92,
      status: 'PEAK_FLOW',
    },

    {
      id: 'northside-clinic',
      name: 'Northside Clinic',
      staffCount: 8,
      chairs: 4,
      capacityPercent: 68,
      status: 'OPTIMAL',
    },

    {
      id: 'east-coast-dental',
      name: 'East Coast Dental',
      staffCount: 4,
      chairs: 2,
      capacityPercent: 40,
      status: 'AVAILABLE',
    },
  ],

  topServices: [
    {
      id: 'cleaning-hygiene',
      name: 'Cleaning & Hygiene',
      percentage: 42,
    },

    {
      id: 'orthodontics',
      name: 'Orthodontics',
      percentage: 28,
    },

    {
      id: 'oral-surgery',
      name: 'Oral Surgery',
      percentage: 15,
    },
  ],
};