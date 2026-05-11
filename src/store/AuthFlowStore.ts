/**
 * Two AuthStore instances coexist by design. This one drives the signin/signup
 * forms in the (auth)/ route group. The dashboard's RootStore holds a separate
 * AuthStore instance that drives the mid-session interceptor and the signed-in
 * user surface. They share state via Amplify's session store and the aj_signed_in
 * cookie — not via a shared JS object. See the Architecture model in
 * Prompts/plans/10-frontend-foundations.md for full rationale.
 */
import { AuthStore } from './AuthStore';
import { SignUpStore } from './SignUpStore';

export class AuthFlowStore {
    auth: AuthStore;
    signUp: SignUpStore;

    constructor() {
        // The auth-flow's auth resets only itself on sign-out — there are no other
        // stores on this side to reset.
        this.auth = new AuthStore({ resetAll: () => this.auth.reset() });
        this.signUp = new SignUpStore();
    }
}
