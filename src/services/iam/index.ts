import AWSCognito from './Cognito';
import config from '../../config';
import services from '../';

const container = {
  get AWSCognito(): Services.IAM {
    return new AWSCognito(
      services.AWS.cognito,
      services.Token,
      config.services.aws.cognito.clientId,
      config.services.aws.cognito.clientSecret,
    );
  },
};

export default container;
