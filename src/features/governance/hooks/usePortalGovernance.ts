import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { governanceRepository } from '../api/governanceRepository';

// Portal governance hooks. Keys include the signed-in user (the demo switcher changes people);
// every write invalidates the governance cache so all screens (and the shell counts) update.
const KEY = ['governance', 'portal'] as const;

function useMe() {
  return useAuthStore((s) => s.session?.id);
}

function useGovQuery<T>(name: string, fn: () => Promise<T>, enabled = true) {
  const userId = useMe();
  return useQuery({ queryKey: [...KEY, name, userId], queryFn: fn, enabled: enabled && userId !== undefined });
}

function useGovMutation<V, R>(fn: (value: V) => Promise<R>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }) });
}

export const useBallot = () => useGovQuery('ballot', governanceRepository.ballot);
export const useProposal = (id: string | undefined) => useGovQuery(`proposal:${id}`, () => governanceRepository.proposal(id ?? ''), id !== undefined);
export const useParticipation = (proposalId: string | undefined) =>
  useGovQuery(`participation:${proposalId}`, () => governanceRepository.participation(proposalId ?? ''), proposalId !== undefined);
export const useComments = (targetId: string | undefined) => useGovQuery(`comments:${targetId}`, () => governanceRepository.comments(targetId ?? ''), targetId !== undefined);
export const useDecisions = () => useGovQuery('decisions', governanceRepository.decisions);
export const useAmendments = () => useGovQuery('amendments', governanceRepository.amendments);
export const useCharterSections = () => useGovQuery('charterSections', governanceRepository.charterSections);
export const useAmendment = (id: string | undefined) => useGovQuery(`amendment:${id}`, () => governanceRepository.amendment(id ?? ''), id !== undefined);
export const useResults = () => useGovQuery('results', governanceRepository.results);
export const useResult = (id: string | undefined) => useGovQuery(`result:${id}`, () => governanceRepository.result(id ?? ''), id !== undefined);
export const useNominations = () => useGovQuery('nominations', governanceRepository.nominations);
export const useSignature = () => useGovQuery('signature', governanceRepository.signature);
export const useReviews = () => useGovQuery('reviews', governanceRepository.reviews);

export const useCastVote = () => useGovMutation(governanceRepository.castVote);
export const usePostComment = () => useGovMutation(governanceRepository.postComment);
export const useVoteDecision = () => useGovMutation(governanceRepository.voteDecision);
export const useProposeAmendment = () => useGovMutation(governanceRepository.proposeAmendment);
export const useSubmitNomination = () => useGovMutation(governanceRepository.submitNomination);
export const useSignCharter = () => useGovMutation(governanceRepository.signCharter);
export const useSaveReview = () => useGovMutation(governanceRepository.saveReview);
export const useRecuse = () => useGovMutation(governanceRepository.recuse);
