import { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// A detail page names its own last breadcrumb once its data loads (admin_person: "People › Amara
// Mensah"). The shell shows the route param until then. The label is tied to the path it was set on.
export interface ShellCrumbLabel {
  path: string;
  label: string;
}
export const ShellCrumbContext = createContext<(value: ShellCrumbLabel | null) => void>(() => undefined);

export function useShellCrumb(label: string | null | undefined): void {
  const set = useContext(ShellCrumbContext);
  const { pathname } = useLocation();
  useEffect(() => {
    if (!label) return undefined;
    set({ path: pathname, label });
    return () => set(null);
  }, [label, pathname, set]);
}
