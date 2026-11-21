import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { charterRepository } from '../api/charterRepository';
import { engagementAdminRepository } from '../api/engagementAdminRepository';
import { adminGovernanceRepository as gov } from '../api/governanceAdminRepository';
import { systemRepository } from '../api/systemRepository';
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
        queryClient.invalidateQueries({ queryKey: ['engagement'] }),
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
// Governance (FE-10)
export const useAdminBallots = () => useAdminQuery('ballots', gov.ballots);
export const useOpenBallot = () => useAdminMutation(gov.openBallot);
export const useEditBallotWindow = () => useAdminMutation(gov.editWindow);
export const useAdminProposal = (id: string | null) => useAdminQuery(`proposal:${id}`, () => gov.proposal(id ?? ''), id !== null);
export const useSaveProposal = () => useAdminMutation(gov.saveProposal);
export const useAdminDecisions = () => useAdminQuery('decisions', gov.decisions);
export const useCreateDecision = () => useAdminMutation(gov.createDecision);
export const usePlaceOnBallot = () => useAdminMutation(gov.placeOnBallot);
export const usePublications = () => useAdminQuery('publications', gov.publications);
export const usePublishResult = () => useAdminMutation(gov.publish);
export const useAddNotice = () => useAdminMutation(gov.addNotice);
export const useNominationQueue = () => useAdminQuery('nominations', gov.nominations);
export const useSetNominationStatus = () => useAdminMutation(gov.setNominationStatus);
export const useConvertNomination = () => useAdminMutation(gov.convertNomination);
export const useSignatureRegister = () => useAdminQuery('signatures', gov.signatures);
export const useExportSignatures = () => useAdminMutation(gov.exportSignatures);
export const useRubric = () => useAdminQuery('rubric', gov.rubric);
export const useSaveRubric = () => useAdminMutation(gov.saveRubric);
export const useReviewBoard = () => useAdminQuery('board', gov.board);
export const useReviewerPool = () => useAdminQuery('reviewers', gov.reviewers);
export const useAssignReviewer = () => useAdminMutation(gov.assignReviewer);
export const useMoveToBallot = () => useAdminMutation(gov.moveToBallot);
// Engagement (FE-10)
export const useVolunteerSignups = () => useAdminQuery('signups', engagementAdminRepository.signups);
export const useExportSignups = () => useAdminMutation(engagementAdminRepository.exportSignups);
export const useSubmissions = () => useAdminQuery('submissions', engagementAdminRepository.submissions);
export const useApproveStory = () => useAdminMutation(engagementAdminRepository.approveStory);
export const useRoutingRules = () => useAdminQuery('routing', engagementAdminRepository.rules);
export const useSaveRoutingRule = () => useAdminMutation(engagementAdminRepository.saveRule);
// System (FE-10)
export const useEmailTemplates = () => useAdminQuery('templates', systemRepository.templates);
export const useSaveTemplate = () => useAdminMutation(systemRepository.saveTemplate);
export const useSendTestEmail = () => useAdminMutation(systemRepository.sendTest);
export const useDeliveries = () => useAdminQuery('deliveries', systemRepository.deliveries);
export const useAuditLog = () => useAdminQuery('audit', auditRepository.list);
export const useAuditEntry = (id: string | undefined) => useAdminQuery(`audit:${id}`, () => auditRepository.entry(id ?? ''), id !== undefined);
export const useAuditChain = () => useAdminQuery('audit:chain', auditRepository.verifyChain);
export const useExportAudit = () => useAdminMutation(auditRepository.exportCsv);
