import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import config from '../config';

export default () => {
  return {
    get cognito(): CognitoIdentityProviderClient {
      return new CognitoIdentityProviderClient({
        region: config.services.aws.cognito.region,
        credentials: {
          accessKeyId: config.services.aws.cognito.accessKeyId,
          secretAccessKey: config.services.aws.cognito.secretAccessKey,
        },
      });
    }
  };
}
