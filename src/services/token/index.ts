import AWSCognito from './AWSCognito';
import config from '../../config';

const container = {
  get AWSCognito() {
    return new AWSCognito(
      config.services.aws.cognito.region,
      config.services.aws.cognito.poolId,
      config.services.aws.cognito.clientId,
    );
  },
};

export default container;
