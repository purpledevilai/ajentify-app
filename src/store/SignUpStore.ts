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

class SignUpStore {
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
    showAlertFlag = false;
    alertTitle = '';
    alertMessage = '';
    alertActions: { label: string; handler?: () => void }[] = [];

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
        this.showAlertFlag = false;
        this.alertTitle = '';
        this.alertMessage = '';
        this.alertActions = [];
    }

    setField(field: keyof SignUpStoreSetFields, value: string) {
        this[field] = value;
    }

    showAlert(title: string, message: string, actions: { label: string; handler?: () => void }[]) {
        this.alertTitle = title;
        this.alertMessage = message;
        this.alertActions = actions;
        this.showAlertFlag = true;
    }

    clearAlert() {
        this.showAlertFlag = false;
        this.alertTitle = '';
        this.alertMessage = '';
        this.alertActions = [];
    }

    async submitSignUp() {
        if (this.password !== this.confirmPassword) {
            this.showAlert('Passwords Do Not Match', 'Please ensure the passwords match', [{ label: 'Ok' }]);
            return;
        }
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
            this.showAlert('Sign Up Failed', (error as Error).message, [{ label: 'Ok' }]);
        } finally {
            this.signUpLoading = false;
        }
    }

    async confirmSignInCode() {
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

            // Create User
            await createUser();

            this.step = 'createOrganization';
        } catch (error) {
            this.showAlert('Verification Failed', (error as Error).message, [{ label: 'Ok' }]);
        } finally {
            this.confirmSignInLoading = false;
        }
    }

    async createOrganization() {
        this.createOrgLoading = true;
        try {
            const payload: CreateOrganizationPayload = {
                name: this.organizationName
            };
            await createOrganization(payload);
            this.step = 'success';
        } catch (error) {
            this.showAlert('Organization Creation Failed', (error as Error).message, [{ label: 'Ok' }]);
        } finally {
            this.createOrgLoading = false;
        }
    }
}

export const signUpStore = new SignUpStore();
