import { makeAutoObservable } from 'mobx';
import { signIn } from '@/api/auth/signIn'; // Replace with your actual API call

class SignInStore {
    email = '';
    password = '';
    signInLoading = false;
    errorMessage = '';
    succesfullySignedIn = false;

    constructor() {
        makeAutoObservable(this);
    }

    setField(field: 'email' | 'password', value: string) {
        this[field] = value;
    }

    async submitSignIn() {
        this.signInLoading = true;
        this.errorMessage = '';

        try {
            const response = await signIn({ email: this.email, password: this.password });
            this.succesfullySignedIn = true;
        } catch (error: any) {
            this.errorMessage = error.message || 'Failed to sign in. Please try again.';
        } finally {
            this.signInLoading = false;
        }
    }
}

export const signInStore = new SignInStore();
