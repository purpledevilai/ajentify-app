import { Auth } from "aws-amplify";
export const getAuthToken = async (): Promise<string> => {
    const user = await Auth.currentAuthenticatedUser();
    return user.signInUserSession.accessToken.jwtToken;
}