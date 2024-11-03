import AWSCognitoRefreshToken from './AWSCognitoRefreshToken';
import services from '../../services';

const container = {
  get AWSCognitoRefreshToken() {
    return new AWSCognitoRefreshToken(
      services.IAM,
    );
  },
};

export default container;
