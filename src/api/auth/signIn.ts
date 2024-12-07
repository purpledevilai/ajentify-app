import { Auth } from 'aws-amplify';

export interface SignInPayload {
    email: string;
    password: string;
}

export async function signIn(payload: SignInPayload): Promise<void> {
    try {
        await Auth.signIn(payload.email, payload.password);
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred durring sign up';
        throw Error(errorMessage);
    }
}
