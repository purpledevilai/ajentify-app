import { makeAutoObservable } from 'mobx';
import { fetchAuthSession, signOut as awsSignOut } from "aws-amplify/auth";
import { signIn } from '@/api/auth/signIn'; 
import { signOut } from '@/api/auth/signOut';
import { updateUser } from '@/api/user/updateUser';
import { forgotPassword } from '@/api/auth/forgotPassword';
import { resetPassword } from '@/api/auth/resetPassword';
import { deleteUser } from '@/api/user/deleteUser';
import { User } from '@/types/user';
import { getUser } from '@/api/user/getUser';

interface AuthStoreOptions {
    resetAll?: () => void;
}

export class AuthStore {
    email = '';
    password = '';
    signInLoading = false;
    signInError = '';
    isDeterminingAuth = true;
    signedIn = false;
    loggingOut = false;
    user: User | undefined = undefined;
    userLoading = false;

    // Forgot Password State
    forgotPasswordLoading = false;
    forgotPasswordStep: 'email' | 'code' | 'completed' = 'email';
    forgotPasswordError = '';
    resetPasswordCode = '';
    newPassword = '';

    private readonly resetAllCallback: (() => void) | undefined;

    constructor(options: AuthStoreOptions = {}) {
        this.resetAllCallback = options.resetAll;
        makeAutoObservable(this);
    }

    reset = () => {
        this.email = '';
        this.password = '';
        this.signInLoading = false;
        this.signInError = '';
        this.user = undefined;
        this.userLoading = false;
        this.forgotPasswordLoading = false;
        this.forgotPasswordStep = 'email';
        this.forgotPasswordError = '';
        this.resetPasswordCode = '';
        this.newPassword = '';
    }

    setField(field: 'email' | 'password' | 'resetPasswordCode' | 'newPassword', value: string) {
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

    forceRefreshAccessToken = async (): Promise<string | undefined> => {
        try {
            const session = await fetchAuthSession({ forceRefresh: true });
            return session.tokens?.accessToken.toString();
        } catch {
            return undefined;
        }
    };

    handleAuthFailure = async (): Promise<void> => {
        if (this.loggingOut) return;
        this.loggingOut = true;
        try {
            await awsSignOut();
            this.resetAllCallback?.();
            this.signedIn = false;
            document.cookie = 'aj_signed_in=; Path=/; Max-Age=0';
            window.location.assign('/signin');
        } finally {
            this.loggingOut = false;
        }
    };

    checkAuth = async () => {
        this.isDeterminingAuth = true;
        try {
            const session = await fetchAuthSession();
            const token = session.tokens?.accessToken.toString();
            if (!token) {
                this.signedIn = false;
                return;
            }
            try {
                const user = await getUser();
                this.user = user;
                this.signedIn = true;
            } catch {
                this.signedIn = false;
            }
        } catch {
            this.signedIn = false;
        } finally {
            this.isDeterminingAuth = false;
        }
    }

    async submitSignIn(): Promise<void> {
        this.signInLoading = true;
        this.signInError = '';
        this.signedIn = false;

        try {
            await signIn({ email: this.email, password: this.password });
            document.cookie = 'aj_signed_in=1; Path=/; SameSite=Lax';
        } catch (error) {
            this.signInError = (error as Error).message || 'Failed to sign in. Please try again.';
        } finally {
            this.signInLoading = false;
        }
    }

    async signOut(): Promise<void> {
        try {
            await signOut();
            document.cookie = 'aj_signed_in=; Path=/; Max-Age=0';
            this.resetAllCallback?.();
            this.reset();
            this.signedIn = false;
        } catch (error) {
            console.error('Failed to sign out', error);
        } 
    }

    async loadUser(): Promise<void> {
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

    async submitForgotPassword(): Promise<void> {
        this.forgotPasswordLoading = true;
        this.forgotPasswordError = '';

        try {
            await forgotPassword(this.email);
            this.forgotPasswordStep = 'code';
        } catch (error) {
            this.forgotPasswordError = (error as Error).message || 'Failed to send reset code.';
        } finally {
            this.forgotPasswordLoading = false;
        }
    }

    async submitResetPassword(): Promise<void> {
        this.forgotPasswordLoading = true;
        this.forgotPasswordError = '';

        try {
            await resetPassword({
                email: this.email,
                code: this.resetPasswordCode,
                newPassword: this.newPassword,
            });
            this.forgotPasswordStep = 'completed';
        } catch (error) {
            this.forgotPasswordError = (error as Error).message || 'Failed to reset password.';
        } finally {
            this.forgotPasswordLoading = false;
        }
    }

    resetForgotPasswordFlow() {
        this.forgotPasswordStep = 'email';
        this.resetPasswordCode = '';
        this.newPassword = '';
        this.forgotPasswordError = '';
    }

    async updateUserDetails(updatedUser: User): Promise<void> {
        if (!this.user) {
            console.error('User not loaded');
            return;
        }
        try {
            await updateUser({
                first_name: updatedUser.first_name,
                last_name: updatedUser.last_name,
            });
    
            // Update local user state
            this.user.first_name = updatedUser.first_name;
            this.user.last_name = updatedUser.last_name;
        } catch (error) {
            console.error('Failed to update user:', error);
            throw error;
        }
    }

    async deleteAccount(): Promise<void> {
        if (!this.user) {
            console.error('User not loaded');
            return;
        }
        try {
            await deleteUser();
            await this.signOut();
        } catch (error) {
            console.error('Failed to delete account:', error);
            throw error;
        }
    }
}
