import { Auth } from 'aws-amplify';

export interface SignUpPayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export async function signUp(payload: SignUpPayload): Promise<unknown> {
    try {
        return await Auth.signUp({
            username: payload.email,
            password: payload.password,
            attributes: {
                email: payload.email,
                given_name: payload.firstName,
                family_name: payload.lastName,
            },
        });
    } catch (error) {
        const errorMessage = (error as Error).message || 'An unknown error occurred durring sign up';
        throw Error(errorMessage);
    }
}
