import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { charterRepository } from '../api/charterRepository';
import { auditRepository, exportsRepository } from '../api/exportsRepository';
import { adminOverviewRepository } from '../api/overviewRepository';
import { paymentsRepository } from '../api/paymentsRepository';
import { peopleRepository } from '../api/peopleRepository';

// Admin console hooks (FE-9). One query per screen and one mutation per action (ARCHITECTURE §5.2).
// Keys include the signed-in user; an admin write also refreshes the portal's membership,
// governance and settings data, since they share the same records.
const KEY = ['admin'] as const;

function useAdminQuery<T>(name: string, fn: () => Promise<T>, enabled = true) {
  const userId = useAuthStore((s) => s.session?.id);
  return useQuery({ queryKey: [...KEY, name, userId], queryFn: fn, enabled: enabled && userId !== undefined });
}

function useAdminMutation<V, R>(fn: (value: V) => Promise<R>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: KEY }),
        queryClient.invalidateQueries({ queryKey: ['membership'] }),
        queryClient.invalidateQueries({ queryKey: ['governance'] }),
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
      ]),
  });
}

// Overview
export const useChapterDashboard = () => useAdminQuery('dashboard', adminOverviewRepository.dashboard);
export const useFinanceSummary = () => useAdminQuery('finance', adminOverviewRepository.finance);
export const useHubDashboard = (hubKey: string | null) => useAdminQuery(`hub:${hubKey}`, () => adminOverviewRepository.hub(hubKey ?? ''), hubKey !== null);
export const useExports = () => useAdminQuery('exports', exportsRepository.list);
export const useCreateExport = () => useAdminMutation(exportsRepository.create);
// People
export const usePeople = () => useAdminQuery('people', peopleRepository.list);
export const usePerson = (id: string | undefined) => useAdminQuery(`person:${id}`, () => peopleRepository.person(id ?? ''), id !== undefined);
export const useRoles = () => useAdminQuery('roles', peopleRepository.roles);
export const usePermissionMatrix = () => useAdminQuery('matrix', peopleRepository.matrix);
export const useAddPerson = () => useAdminMutation(peopleRepository.addPerson);
export const useGrantRole = () => useAdminMutation(peopleRepository.grantRole);
export const useRevokeRole = () => useAdminMutation(peopleRepository.revokeRole);
export const useSetAccess = () => useAdminMutation(peopleRepository.setAccess);
export const useUpdateMatrix = () => useAdminMutation(peopleRepository.updateMatrix);
// Charter rules
export const useAdminCampaigns = () => useAdminQuery('campaigns', charterRepository.campaigns);
export const useCreateCampaign = () => useAdminMutation(charterRepository.createCampaign);
export const useCharterSettings = () => useAdminQuery('settings', charterRepository.settings);
export const useProposeSettings = () => useAdminMutation(charterRepository.proposeSettings);
export const useApprovals = () => useAdminQuery('approvals', charterRepository.approvals);
export const useApproveChange = () => useAdminMutation(charterRepository.approve);
export const useRejectChange = () => useAdminMutation(charterRepository.reject);
export const useSettingsHistory = () => useAdminQuery('history', charterRepository.history);
// Payments
export const useLedger = () => useAdminQuery('ledger', paymentsRepository.ledger);
export const useRecordOffline = () => useAdminMutation(paymentsRepository.recordOffline);
export const useFinanceFlags = () => useAdminQuery('flags', paymentsRepository.flags);
export const useResolveFlag = () => useAdminMutation(paymentsRepository.resolveFlag);
export const useReconciliation = () => useAdminQuery('reconciliation', paymentsRepository.reconciliation);
export const useRunReconciliation = () => useAdminMutation(paymentsRepository.runReconciliation);
// Audit (screens in FE-10)
export const useAuditLog = () => useAdminQuery('audit', auditRepository.list);
export const useAuditEntry = (id: string | undefined) => useAdminQuery(`audit:${id}`, () => auditRepository.entry(id ?? ''), id !== undefined);
