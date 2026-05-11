'use client';
import { bindApiClientAuth } from '@/api/client';
import { useStores } from '@/store/StoreContext';

// Render-time binding — synchronous, not in useEffect.
// IMPORTANT: Do NOT move the bindApiClientAuth call into a useEffect.
// If binding happens in an effect, the first request from <DashboardBoot>
// (which also runs in an effect) may fire before the bindings are set,
// resulting in a 401 with no Authorization header on first paint.
export function ApiClientBinder({ children }: { children: React.ReactNode }) {
    const { auth } = useStores();
    bindApiClientAuth({
        getAccessToken: () => auth.getAccessToken(),
        forceRefreshAccessToken: () => auth.forceRefreshAccessToken(),
        handleAuthFailure: () => auth.handleAuthFailure(),
    });
    return <>{children}</>;
}
