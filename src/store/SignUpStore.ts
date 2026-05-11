import { makeAutoObservable } from 'mobx';
import { signUp, SignUpPayload } from '@/api/auth/signUp';
import { confirmSignUp, ConfirmSignUpPayload } from '@/api/auth/confirmSignUp';
import { signIn, SignInPayload } from '@/api/auth/signIn';
import { createUser } from '@/api/user/createUser';
import { createOrganization, CreateOrganizationPayload } from '@/api/organization/createOrganization';

interface SignUpStoreSetFields {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    confirmCode: string;
    organizationName: string;
}

export class SignUpStore {
    // User Details
    firstName: string = '';
    lastName: string = '';
    email: string = '';
    password: string = '';
    confirmCode: string = '';
    confirmPassword: string = '';

    // Organization Details
    organizationName: string = '';

    // UI State
    step: 'userDetails' | 'verification' | 'createOrganization' | 'success' = 'userDetails';
    signUpLoading = false;
    confirmSignInLoading = false;
    createOrgLoading = false;

    // Per-action error fields
    signUpError: string | null = null;
    confirmSignUpError: string | null = null;
    createOrgError: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    reset() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.password = '';
        this.confirmCode = '';
        this.confirmPassword = '';
        this.organizationName = '';
        this.step = 'userDetails';
        this.signUpLoading = false;
        this.confirmSignInLoading = false;
        this.createOrgLoading = false;
        this.signUpError = null;
        this.confirmSignUpError = null;
        this.createOrgError = null;
    }

    setField(field: keyof SignUpStoreSetFields, value: string) {
        this[field] = value;
    }

    async submitSignUp() {
        if (this.password !== this.confirmPassword) {
            this.signUpError = 'Passwords do not match. Please ensure the passwords match.';
            return;
        }
        this.signUpError = null;
        this.signUpLoading = true;
        try {
            const payload: SignUpPayload = {
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                password: this.password,
            };
            await signUp(payload);
            this.step = 'verification';
        } catch (error) {
            this.signUpError = (error as Error).message;
        } finally {
            this.signUpLoading = false;
        }
    }

    async confirmSignInCode() {
        this.confirmSignUpError = null;
        this.confirmSignInLoading = true;
        try {
            // Confirm
            const confirmSignUpPayload: ConfirmSignUpPayload = {
                email: this.email,
                verificationCode: this.confirmCode
            };
            await confirmSignUp(confirmSignUpPayload);

            // Sign In
            const signInPayload: SignInPayload = {
                email: this.email,
                password: this.password
            };
            await signIn(signInPayload);
            document.cookie = 'aj_signed_in=1; Path=/; SameSite=Lax';

            // Create User
            await createUser();

            this.step = 'createOrganization';
        } catch (error) {
            this.confirmSignUpError = (error as Error).message;
        } finally {
            this.confirmSignInLoading = false;
        }
    }

    async createOrganization() {
        this.createOrgError = null;
        this.createOrgLoading = true;
        try {
            const payload: CreateOrganizationPayload = {
                name: this.organizationName
            };
            await createOrganization(payload);
            this.step = 'success';
        } catch (error) {
            this.createOrgError = (error as Error).message;
        } finally {
            this.createOrgLoading = false;
        }
    }
}

