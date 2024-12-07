import { Auth } from "aws-amplify";
export const getAuthToken = async () => {
    const user = await Auth.currentAuthenticatedUser();
    return user.signInUserSession.accessToken.jwtToken;
}