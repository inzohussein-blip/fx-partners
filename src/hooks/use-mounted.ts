import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * true on the client after hydration, false during SSR — without the
 * `useState(false)` + `useEffect(() => setMounted(true))` pattern, which
 * costs an extra render and is flagged by React's set-state-in-effect rule.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
