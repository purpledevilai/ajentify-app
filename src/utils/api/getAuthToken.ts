import { fetchAuthSession } from "aws-amplify/auth";
export const getAuthToken = async (): Promise<string> => {
    try {
        const session = await fetchAuthSession();
        const authToken = session.tokens?.accessToken.toString();
        if (authToken) {
            return authToken;
        } else {
            throw new Error('Failed to get auth token');
        }
    } catch (error) {
        console.error('Failed to get auth token', error);
        throw new Error('Failed to get auth token');
    }
}