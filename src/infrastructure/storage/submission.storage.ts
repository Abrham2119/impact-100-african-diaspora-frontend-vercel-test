// The last submission of a public form, for its thanks page ("$100 · monthly · Diaspora Engagement ·
// Kenya", "Sent to 2 teams"). sessionStorage: it survives a reload of the thanks page, ends with the
// tab, and never leaves the browser. Values are display-ready strings only (no personal data).
const PREFIX = 'ix_submission:';

export type SubmissionSummary = Record<string, string>;

export const submissionStorage = {
  save: (key: string, summary: SubmissionSummary): void => {
    try {
      sessionStorage.setItem(PREFIX + key, JSON.stringify(summary));
    } catch {
      // storage unavailable (private mode): the thanks page simply omits the summary
    }
  },
  read: (key: string): SubmissionSummary | null => {
    try {
      const raw = sessionStorage.getItem(PREFIX + key);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) return null;
      const out: SubmissionSummary = {};
      for (const [k, v] of Object.entries(parsed)) if (typeof v === 'string') out[k] = v;
      return out;
    } catch {
      return null;
    }
  },
};
