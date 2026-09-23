import type { DashboardData } from '@/domain/entities/dashboard.types';
import { DASHBOARD_MOCK_DATA } from '../data/dashboard.mock';

export const dashboardService = {
  async getOverview(): Promise<DashboardData> {
   
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });

    return DASHBOARD_MOCK_DATA;
  },
};