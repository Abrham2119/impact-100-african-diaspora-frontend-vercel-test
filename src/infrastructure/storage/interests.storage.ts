// The interests a visitor picked on the grants map (an African hub and a portfolio), kept "for this
// visit, until you join" (grants.dc.html): sessionStorage. Signed-in members save them to their
// profile instead (`PATCH /me/interests`, Step 15). Read by /volunteer ("Matches your interests").
const KEY = 'ix_interests';

export interface VisitInterests {
  hub?: string;
  portfolio?: string;
}

export const interestsStorage = {
  read: (): VisitInterests => {
    try {
      const parsed: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? '{}');
      if (typeof parsed !== 'object' || parsed === null) return {};
      const { hub, portfolio } = parsed as Record<string, unknown>;
      return { ...(typeof hub === 'string' ? { hub } : {}), ...(typeof portfolio === 'string' ? { portfolio } : {}) };
    } catch {
      return {};
    }
  },
  save: (interests: VisitInterests): void => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(interests));
    } catch {
      // storage unavailable: interests last for this page only
    }
  },
};
