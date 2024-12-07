import { Auth } from 'aws-amplify';

export interface ConfirmSignUpPayload {
    email: string;
    verificationCode: string;
}

export async function confirmSignUp(payload: ConfirmSignUpPayload): Promise<void> {
    try {
        await Auth.confirmSignUp(payload.email, payload.verificationCode);
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred durring sign up';
        throw Error(errorMessage);
    }
}
