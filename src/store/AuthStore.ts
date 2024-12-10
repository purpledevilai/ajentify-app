import { makeAutoObservable } from 'mobx';
import { fetchAuthSession } from "aws-amplify/auth";
import { signIn } from '@/api/auth/signIn'; 
import { signOut } from '@/api/auth/signOut';
import { User } from '@/types/user';
import { getUser } from '@/api/user/getUser';


class AuthStore {
    email = '';
    password = '';
    signInLoading = false;
    signInError = '';
    signedIn = false;
    user: User | undefined = undefined;
    userLoading = false;

    constructor() {
        makeAutoObservable(this);
    }

    setField(field: 'email' | 'password', value: string) {
        this[field] = value;
    }

    getAccessToken = async (): Promise<string | undefined> => {
        try {
            const session = await fetchAuthSession();
            const accessToken = session.tokens?.accessToken.toString();
            return accessToken;
        } catch (error) {
            console.error('Failed to get auth token', error);
            return undefined;
        }
    }

    checkAuth = async () => {
        const token = await this.getAccessToken();
        this.signedIn = token !== undefined;
    }

    async submitSignIn(): Promise<void> {
        this.signInLoading = true;
        this.signInError = '';
        this.signedIn = false;

        try {
            await signIn({ email: this.email, password: this.password });
            this.signedIn = true;
        } catch (error) {
            this.signInError = (error as Error).message || 'Failed to sign in. Please try again.';
        } finally {
            this.signInLoading = false;
        }
    }

    async signOut(): Promise<void> {
        try {
            await signOut();
            this.signedIn = false;
        } catch (error) {
            console.error('Failed to sign out', error);
        } 
    }

    async loadUser(force: boolean = false): Promise<void> {
        if (!this.signedIn) {
            this.user = undefined;
            return;
        }

        if (!force && this.user) {
            return;
        }

        this.userLoading = true;
        try {
            this.user = await getUser();
        } catch (error) {
            console.error('Failed to load user', error);
            this.user = undefined;
        } finally {
            this.userLoading = false;
        }
    }
}

export const authStore = new AuthStore();
