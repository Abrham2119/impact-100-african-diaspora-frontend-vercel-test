import { useQuery } from '@tanstack/react-query';

import { dashboardService } from '../api/dashboardService';

export const DASHBOARD_QUERY_KEY = [
  'dashboard',
  'overview',
] as const;

export function useDashboard() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: dashboardService.getOverview,
    staleTime: 60_000,
  });
}