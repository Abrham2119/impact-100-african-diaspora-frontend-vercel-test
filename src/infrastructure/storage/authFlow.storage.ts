// The in-between state of a passwordless sign-in, for this tab only (sessionStorage): the two-step
// challenge token (between the login link and the code) and the email the link went to (shown on
// check_email's demo inbox). Never the session itself — that is the auth store.
const KEY = 'ix_auth_flow';

interface AuthFlowState {
  challengeToken?: string;
  next?: string;
  email?: string;
}

const read = (): AuthFlowState => {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as AuthFlowState;
  } catch {
    return {};
  }
};
const write = (state: AuthFlowState) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage unavailable: the flow restarts from sign-in
  }
};

export const authFlowStorage = {
  read,
  setChallenge: (challengeToken: string, next?: string) => write({ ...read(), challengeToken, next }),
  clearChallenge: () => write({ ...read(), challengeToken: undefined, next: undefined }),
  setEmail: (email: string) => write({ ...read(), email }),
};
