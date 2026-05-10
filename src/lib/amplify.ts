import { Amplify } from 'aws-amplify';

let configured = false;

export function configureAmplify(): void {
  if (configured) return;
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID ?? '',
        userPoolClientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID ?? '',
      },
    },
  });
  configured = true;
}
