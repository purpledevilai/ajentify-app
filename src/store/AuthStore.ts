import { makeAutoObservable } from 'mobx';
import { fetchAuthSession } from "aws-amplify/auth";
import { signIn } from '@/api/auth/signIn'; 
import { signOut } from '@/api/auth/signOut';
import { updateUser } from '@/api/user/updateUser';
import { forgotPassword } from '@/api/auth/forgotPassword';
import { resetPassword } from '@/api/auth/resetPassword';
import { deleteUser } from '@/api/user/deleteUser';
import { User } from '@/types/user';
import { getUser } from '@/api/user/getUser';
import { agentsStore } from './AgentsStore';
import { agentBuilderStore } from './AgentBuilderStore';
import { chatPageBuilderStore } from './ChatPageBuilderStore';
import { chatPagesStore } from './ChatPagesStore';
import { chatPageStore } from './ChatPageStore';


class AuthStore {
    email = '';
    password = '';
    signInLoading = false;
    signInError = '';
    isDeterminingAuth = true;
    signedIn = false;
    user: User | undefined = undefined;
    userLoading = false;

    // Forgot Password State
    forgotPasswordLoading = false;
    forgotPasswordStep: 'email' | 'code' | 'completed' = 'email';
    forgotPasswordError = '';
    resetPasswordCode = '';
    newPassword = '';

    constructor() {
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

    checkAuth = async () => {
        this.isDeterminingAuth = true;
        const token = await this.getAccessToken();
        console.log('Token:', token);
        this.signedIn = token !== undefined;
        this.isDeterminingAuth = false;
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
            agentBuilderStore.reset();
            agentsStore.reset();
            chatPageBuilderStore.reset();
            chatPagesStore.reset();
            chatPageStore.reset();
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

export const authStore = new AuthStore();
